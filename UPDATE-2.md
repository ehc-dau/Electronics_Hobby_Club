# Update 2: the new website and the Website dashboard

## What changed

- **New website** in the logo's black and green, with the same pages as before: Home, Events, Projects,
  Team, Gallery. Everything on it comes from the database, so nobody edits code to change it.
- **No more Three.js background.** The site's JavaScript dropped from about 236 KB to about 98 KB
  (compressed), and pages other than Home load only when opened.
- **Website section in the dashboard** (`/inventory/` → Website, core team only):
  - **Publish / hide** switch, plus a **preview link** to check the site while it's hidden.
  - **Team**: add people one at a time or paste a list, upload photos (cropped square automatically),
    reorder with arrows, hide or delete.
  - **Projects**: photo, summary, description, tags, link; tick **On the home page** for your best three.
  - **Gallery**: pick many photos at once; they're resized on your device before upload. Add captions, hide or delete.
  - **Text and links**: home-page headline, about paragraph, contact email, Instagram, LinkedIn, GitHub.
- **Events** you create for check-in show on the website automatically when marked *Show on the club website*.
- The website stays **hidden** after this update until someone presses **Publish website**.

## Apply it

From the repo folder (the one with `package.json`), after unzipping this update somewhere else:

```powershell
Copy-Item -Path "<where you unzipped>\ehc-update-2\*" -Destination . -Recurse -Force
npm install
npm run build
```

`npm install` matters: the website now uses the Firebase SDK and no longer uses Three.js, and
`package-lock.json` changed with it. The build must finish without errors.

### Remove the old site's files

They're no longer used, and the old photos alone are about 12 MB. **Upload the photos you want to keep
first** (see "Fill in the content"); they stay in git history either way.

```powershell
git rm -r src/components src/hooks src/lib src/assets src/pages/Index.tsx src/App.css src/index.css public/team public/image public/soon public/placeholder.svg
```

### Deploy

```powershell
firebase deploy --only firestore      # rules and the two new database indexes
git add -A
git commit -m "Update 2: new website, Website dashboard"
git push origin main                  # deploys the site if the GitHub workflow is set up
```

Without the workflow, run `firebase deploy --only hosting` instead of relying on the push.
The indexes take a few minutes to build; the site works meanwhile, just with an extra-careful fallback query.

## Fill in the content

1. Open `/inventory/` → **Website** → **Team** → **Add several**, and paste:
   ```
   Shyam Bhuva, Convenor
   Vyom Patel, Deputy Convenor
   Jeet Patel, Core member
   Rucheer Patel, Core member
   Rushiraj Khediya, Core member
   Aum Bavarva, Core member
   Preet Patel, Extended core member
   Het Sachani, Extended core member
   ```
2. **Photos**: Shyam, Vyom, Jeet, Preet and Aum already have photos in the repo's `public/team/images/`
   folder (`SHYAM_BHUVA.jpg`, `vyom.jpg`, `jeet.jpg`, `preet.jpeg`, `Aum_Bavarva.jpg`). Open each person →
   Edit → Photo. Add Het, Rucheer and Rushiraj when you have theirs; until then their initials show.
3. **Gallery** → **Add photos** → select the photos from `public/image/` you want to keep (all at once is fine).
4. **Projects** → add the club's builds, tick **On the home page** for three.
5. **Text and links** → add Instagram and LinkedIn.
6. **Get preview link** → check every page on a phone and a laptop.
7. **Publish website**.

## Check it worked

1. Before publishing, `https://ehc-inventory.web.app/` shows "New site coming soon"; the preview link shows the site.
2. `/inventory/` works as before, including check-in links.
3. After publishing, the site appears for everyone within a few seconds (no redeploy).
