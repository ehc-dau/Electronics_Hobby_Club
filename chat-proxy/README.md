# Chat proxy (Cloudflare Worker)

Holds the Groq API key so it never appears in the website, checks that the caller is signed in
with a verified @dau.ac.in Google account, and asks `openai/gpt-oss-120b` to turn a chat message
into a request draft. It never writes to the database; the person confirms every draft in the app.

## Set up once (as the club account)

1. Groq key: sign in at console.groq.com, API Keys, Create. Copy it; you won't see it again.
2. Cloudflare: create a free account with the club email. No card needed.
3. From this folder:
   ```
   npm install
   npx wrangler login
   npx wrangler secret put GROQ_API_KEY      # paste the key when asked
   npx wrangler deploy
   ```
   It prints an address like `https://ehc-chat.<something>.workers.dev`.
4. In `public/inventory/index.html`, set `chatEndpoint: 'https://ehc-chat.<something>.workers.dev/chat'`
   and run `firebase deploy` from the repo root.

`npm test` runs offline checks (token verification, prompt limits, CORS, rate limiting). No key needed.

## Things to know

- **Free limits are shared by the whole club.** Groq's free tier for gpt-oss-120b allows roughly
  1,000 requests and 200,000 tokens a day, 30 requests and 8,000 tokens a minute. When it runs out,
  the app falls back to basic matching on its own and says so. Check current numbers at
  console.groq.com/settings/limits.
- **A custom domain or new site address** must be added to `ALLOWED_ORIGINS` in `wrangler.toml`,
  then `npx wrangler deploy` again, or the browser will block the call.
- **If the key leaks**, revoke it in the Groq console, create a new one, and run
  `npx wrangler secret put GROQ_API_KEY` again. Never put it in any file in this repo.
- The per-person limit (15 messages per 5 minutes) is best-effort: it lives in the Worker's memory
  and resets when Cloudflare restarts it.
