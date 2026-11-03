# Adding the inventory to the EHC website

Copy everything in this folder into the root of the `Electronics_Hobby_Club` repo, keeping the paths,
then commit. Files that already exist (`Navbar.tsx`, `.gitignore`) are complete replacements.

## Deploy

```
npm install
npm install -g firebase-tools     # once per machine
firebase login
firebase deploy                    # runs `npm run build`, then uploads the site and the database rules
```

The whole club site goes live at `https://ehc-inventory.web.app`, with the inventory at `/inventory/`.

## What changed and why

| File | Change |
|---|---|
| `src/components/Navbar.tsx` | Adds an **Inventory** link. It's a plain `<a>`, not a router `<Link>`, because the inventory is its own page; a router link would land on the 404 route. |
| `public/inventory/index.html` | The inventory app, with the Firebase config filled in. Vite copies `public/` into `dist/` untouched, so no build step touches it. |
| `firebase.json` | Serves `dist/`; sends unknown paths to `index.html` so `/team` etc. work on refresh; builds before every deploy; tells browsers not to cache the inventory page so updates show up immediately. |
| `.firebaserc` | Points the CLI at the `ehc-inventory` Firebase project. |
| `firestore.rules` | Database rules, including the new `users`, `locations` and `locationPhotos` collections. |
| `.gitignore` | Ignores the `.firebase/` cache folder the CLI creates. |
| `chat-proxy/` | The Cloudflare Worker for the request assistant. Holds the Groq key; see `chat-proxy/README.md`. |

## Turning on the AI assistant (optional, after the site is live)

The assistant works without this, using basic matching. To use gpt-oss-120b, follow
`chat-proxy/README.md`: create a Groq key and a free Cloudflare account with the club email,
deploy the Worker, then paste its address into `chatEndpoint` in `public/inventory/index.html`
and run `firebase deploy` again.

## Things to know

- **Deploy the rules, not just the page.** Registration, locations and editing your own pending request all
  depend on the new `firestore.rules`; until they're live those fail with "Permission denied".
  `firebase deploy` does both.
- **Local testing:** `npm run dev`, then open `http://localhost:8080/inventory/index.html` (the full file name;
  the dev server may route the bare folder to the React app).
- **Updating the inventory later:** replace `public/inventory/index.html` and run `firebase deploy`.
- **The repo is public, so the Firebase web config is too.** That's how Firebase web apps work; the rules are the
  protection. GitHub may still email a "Google API key exposed" alert. Restrict the key instead of deleting it:
  Google Cloud console, APIs & Services, Credentials, the browser key, Website restrictions:
  `https://ehc-inventory.web.app/*`, `https://ehc-inventory.firebaseapp.com/*`, `http://localhost:*/*`.
- **A nicer address** than `ehc-inventory.web.app` needs either a custom domain (Hosting, Add custom domain, then add
  it under Authentication, Settings, Authorized domains) or a second Hosting site with a better name.
