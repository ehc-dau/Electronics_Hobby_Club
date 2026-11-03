// EHC request assistant: Cloudflare Worker
//
// Why this exists: the Groq API key can't live in the web page (anyone could copy it from the
// page source and spend the club's quota). This Worker keeps the key as a secret, checks the
// caller is signed in with a verified @dau.ac.in Google account, and asks gpt-oss-120b to turn
// the chat into a structured draft.
//
// It never writes to the database. The page shows the draft, the person confirms it, and
// Firestore's rules decide what is allowed, exactly as if they had used the form.
//
// Secrets / vars (see wrangler.toml and README.md):
//   GROQ_API_KEY         secret, set with `npx wrangler secret put GROQ_API_KEY`
//   FIREBASE_PROJECT_ID  e.g. "ehc-inventory"
//   ALLOWED_ORIGINS      comma-separated site origins allowed to call this Worker
//   ALLOWED_DOMAINS      comma-separated email domains, e.g. "dau.ac.in"
//   MODEL                optional, defaults to openai/gpt-oss-120b

const DEFAULT_MODEL = 'openai/gpt-oss-120b';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

// Limits on what the page may send, so one request can't burn the shared free quota.
const MAX_HISTORY = 12;
const MAX_MESSAGE_CHARS = 800;
const MAX_CATALOG = 150;
const MAX_OPEN_REQUESTS = 10;

// Best-effort per-person limit. It lives in this Worker instance's memory, so it resets when
// Cloudflare recycles the instance and isn't shared between instances. Groq's own limits are
// the real ceiling; this just stops one person from hammering it.
const PER_USER = { max: 15, windowMs: 5 * 60 * 1000 };
const buckets = new Map();

// Strict mode on Groq: every field required, nullable where optional, no extra properties.
export const SCHEMA = {
  type: 'object',
  properties: {
    reply: { type: 'string' },
    action: { type: 'string', enum: ['chat', 'draft_new', 'edit_existing', 'cancel_existing', 'show_status'] },
    target_request: { type: ['string', 'null'] },
    request_type: { type: 'string', enum: ['component', 'help', 'guidance', 'none'] },
    title: { type: ['string', 'null'] },
    message: { type: ['string', 'null'] },
    needed_by: { type: ['string', 'null'] },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: { part: { type: 'string' }, qty: { type: 'integer' } },
        required: ['part', 'qty'],
        additionalProperties: false,
      },
    },
  },
  required: ['reply', 'action', 'target_request', 'request_type', 'title', 'message', 'needed_by', 'items'],
  additionalProperties: false,
};

export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '';
    const allowed = list(env.ALLOWED_ORIGINS);
    const cors = {
      'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : allowed[0] || '',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Access-Control-Max-Age': '86400',
      Vary: 'Origin',
    };
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    const path = new URL(req.url).pathname;
    if (req.method === 'GET' && path === '/') return json({ ok: true, service: 'ehc-chat' }, 200, cors);
    if (req.method !== 'POST' || path !== '/chat') return json({ error: 'not_found' }, 404, cors);
    if (!allowed.includes(origin)) return json({ error: 'origin_not_allowed' }, 403, cors);
    if (!env.GROQ_API_KEY) return json({ error: 'not_configured' }, 500, cors);

    let user;
    try {
      user = await verifyFirebaseToken((req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, ''), env);
    } catch (e) {
      return json({ error: 'unauthorized', detail: e.message }, 401, cors);
    }
    if (!allow(user.email)) return json({ error: 'slow_down' }, 429, cors);

    let messages;
    try {
      messages = buildMessages(await req.json());
    } catch (e) {
      return json({ error: 'bad_request', detail: e.message }, 400, cors);
    }

    const groq = await fetch(GROQ_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: env.MODEL || DEFAULT_MODEL,
        messages,
        temperature: 0.2,
        reasoning_effort: 'low',
        max_completion_tokens: 1200,
        response_format: { type: 'json_schema', json_schema: { name: 'ehc_request_intent', strict: true, schema: SCHEMA } },
      }),
    });
    if (groq.status === 429) return json({ error: 'busy', retryAfter: groq.headers.get('retry-after') }, 429, cors);
    if (!groq.ok) return json({ error: 'model_error', status: groq.status, detail: (await groq.text()).slice(0, 300) }, 502, cors);
    const data = await groq.json();
    let result;
    try {
      result = JSON.parse(data.choices[0].message.content);
    } catch {
      return json({ error: 'bad_model_output' }, 502, cors);
    }
    return json({ result, usage: data.usage || null }, 200, cors);
  },
};

/* ---------- prompt ---------- */
const clip = (v, n) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, n);

export function buildMessages(body) {
  if (!body || typeof body !== 'object') throw new Error('body must be a JSON object');
  const history = (Array.isArray(body.messages) ? body.messages : [])
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-MAX_HISTORY)
    .map(m => ({ role: m.role, content: clip(m.content, MAX_MESSAGE_CHARS) }));
  if (!history.length || history[history.length - 1].role !== 'user') throw new Error('last message must be from the user');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(body.today || '')) throw new Error('today must be YYYY-MM-DD');

  const catalog = (Array.isArray(body.catalog) ? body.catalog : []).slice(0, MAX_CATALOG)
    .map(c => `- ${clip(c.name, 80)} | ${Number.isInteger(c.available) ? c.available : 0} available`).join('\n') || '(no parts listed)';
  const open = (Array.isArray(body.openRequests) ? body.openRequests : []).slice(0, MAX_OPEN_REQUESTS)
    .map(r => `- #${clip(r.id, 8)} | ${clip(r.status, 30)} | ${clip(r.type, 12)} | "${clip(r.title, 80)}"${r.neededBy ? ` | needed by ${clip(r.neededBy, 10)}` : ''} | items: ${(Array.isArray(r.items) ? r.items : []).slice(0, 20).map(i => `${Number(i.qty) || 0} x ${clip(i.name, 60)}`).join(', ') || 'none'}`)
    .join('\n') || '(none)';
  const d = body.draft && typeof body.draft === 'object' ? body.draft : null;
  const draft = d
    ? `kind=${d.kind === 'edit' ? 'edit' : 'new'}${d.target ? ` of #${clip(d.target, 8)}` : ''}, type=${clip(d.type, 12)}, title="${clip(d.title, 120)}", needed_by=${clip(d.neededBy, 10) || 'none'}, items: ${(Array.isArray(d.items) ? d.items : []).slice(0, 30).map(i => `${Number(i.qty) || 0} x ${clip(i.name, 60)}`).join(', ') || 'none'}`
    : '(none)';

  const system = `You are the request assistant for the Electronics Hobby Club (EHC) at DAU. You turn what a member types into a structured draft. You never submit anything: the app shows the draft and the member confirms it. Respond only with JSON matching the schema.

Today is ${clip(body.weekday, 12)} ${body.today}. The member is ${clip(body.name, 60) || 'a club member'}.

Parts in the club inventory (name | available now):
${catalog}

The member's open requests:
${open}

Draft currently on screen:
${draft}

Rules:
- action "draft_new": the member wants to borrow parts (request_type "component"), get help with something broken or confusing ("help"), or get advice or mentoring ("guidance"). If a draft is on screen and they are adjusting it ("make it 4", "add a breadboard", "drop the servo"), return the same kind of action with the FULL updated draft, not just the change. If the draft on screen is kind=edit, return "edit_existing" with its target.
- action "edit_existing": they want to change one of their open requests whose status is Pending. target_request is its ID without "#". Return the full updated items, title, message and needed_by.
- action "cancel_existing": they want to cancel a Pending request. target_request is its ID.
- action "show_status": they ask about their requests. Summarise briefly in reply using the list above.
- action "chat": anything else. Keep it to one or two sentences. If it isn't about EHC parts, help or guidance, say you only handle EHC requests.
- items: part names copied exactly from the inventory list. Never invent a part. If they ask for something that isn't listed, leave it out and say so in reply, naming the closest listed parts if any. If a word could mean several listed parts (e.g. "arduino" when both Uno and Nano exist), use the word they typed as the part and the app will ask them to pick.
- qty: whole numbers from 1 to 99. "a couple" or "a pair" means 2. No number means 1. Requests may exceed what's available; mention it in reply rather than changing the number.
- title: what the parts or help are for, at most 60 characters, in the member's words. If they haven't said, set title to null and ask in reply.
- message: extra details they gave (team, duration, what they tried). null if none.
- needed_by: YYYY-MM-DD worked out from phrases like "by Friday" or "tomorrow" relative to today; null if not mentioned.
- request_type: "none" when action is chat, show_status or cancel_existing.
- reply: plain text, one or two short sentences, no markdown, no lists. Never claim anything was submitted or saved.`;

  return [{ role: 'system', content: system }, ...history];
}

/* ---------- Firebase ID token check ---------- */
let jwks = { keys: null, until: 0 };
async function googleKeys() {
  if (jwks.keys && Date.now() < jwks.until) return jwks.keys;
  const res = await fetch(JWKS_URL, { cf: { cacheTtl: 3600 } });
  if (!res.ok) throw new Error('could not fetch Google signing keys');
  const maxAge = Number(((res.headers.get('cache-control') || '').match(/max-age=(\d+)/) || [])[1] || 3600);
  jwks = { keys: (await res.json()).keys, until: Date.now() + maxAge * 1000 };
  return jwks.keys;
}
const b64url = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), c => c.charCodeAt(0));
const b64json = s => JSON.parse(new TextDecoder().decode(b64url(s)));

export async function verifyFirebaseToken(token, env, keysFn = googleKeys) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) throw new Error('missing token');
  const header = b64json(parts[0]);
  const claims = b64json(parts[1]);
  if (header.alg !== 'RS256' || !header.kid) throw new Error('unexpected token type');
  const jwk = (await keysFn()).find(k => k.kid === header.kid);
  if (!jwk) throw new Error('unknown signing key');
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64url(parts[2]), new TextEncoder().encode(`${parts[0]}.${parts[1]}`));
  if (!ok) throw new Error('bad signature');

  const now = Math.floor(Date.now() / 1000);
  const project = env.FIREBASE_PROJECT_ID;
  if (claims.aud !== project || claims.iss !== `https://securetoken.google.com/${project}`) throw new Error('token is for another project');
  if (!(claims.exp > now) || !(claims.iat <= now + 60) || !claims.sub) throw new Error('token expired or not yet valid');
  const email = String(claims.email || '').toLowerCase();
  const domains = list(env.ALLOWED_DOMAINS || 'dau.ac.in');
  if (claims.email_verified !== true || !domains.some(d => email.endsWith('@' + d))) throw new Error('not a college account');
  return { email, uid: claims.sub };
}

/* ---------- helpers ---------- */
function allow(email) {
  const now = Date.now();
  const hits = (buckets.get(email) || []).filter(t => now - t < PER_USER.windowMs);
  if (hits.length >= PER_USER.max) { buckets.set(email, hits); return false; }
  hits.push(now);
  buckets.set(email, hits);
  if (buckets.size > 5000) buckets.clear();
  return true;
}
function list(v) { return String(v || '').split(',').map(s => s.trim()).filter(Boolean); }
function json(obj, status, headers) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json', ...headers } });
}
