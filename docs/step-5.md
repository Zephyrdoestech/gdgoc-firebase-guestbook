# Step 5: Publish with Firebase Hosting

**Time:** about 7 minutes

## Goal

Create an optimized production build of your guestbook and deploy it to a public Firebase Hosting URL (`https://<your-project-id>.web.app`).

---

## Part A: Install and sign in to the Firebase CLI

Open a **new terminal** in your project folder (or press **`Ctrl+C`** in your Vite terminal if you are done with local dev).

Install the Firebase CLI globally once:

```sh
npm install -g firebase-tools
```

Then sign in with the Google account that owns your Firebase project:

```sh
firebase login
```

A browser tab opens to sign in. Once it says **Success**, return to your terminal.

> **Windows PowerShell note:**
> - If `firebase login` fails with **`firebase.ps1 cannot be loaded because running scripts is disabled on this system`**, do **one** of these:
>   1. Run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once in PowerShell, then re-run `firebase login`; **OR**
>   2. Switch to **Command Prompt (CMD)** instead of PowerShell; **OR**
>   3. Run commands with `npx firebase-tools` instead of `firebase` (e.g., `npx firebase-tools login`).
> - If your terminal says **`firebase` is not recognized** right after installing, close and reopen the terminal and try again.

---

## Part B: Initialize Firebase Hosting

From the project root folder, run:

```sh
firebase init hosting
```

Use the **Up / Down arrow keys** and **Enter** to answer the prompts in order:

1. **Are you ready to proceed?** → type `Y` and press Enter.
2. **Please select an option:** → choose **Use an existing project**.
3. **Select a default Firebase project:** → pick the Firebase project you created in Step 1.
4. **What do you want to use as your public directory?** → type **`dist`** and press Enter *(do **not** accept the default `public`! Vite outputs the built site into `dist`)*.
5. **Configure as a single-page app (rewrite all urls to /index.html)?** → type **`N`** (No — this guestbook has only one page and no client-side routes).
6. **Set up automatic builds and deploys with GitHub?** → type **`N`** (No).
7. If asked whether to overwrite `index.html` or `404.html` → type **`N`** (No).

---

## Part C: Verify `firebase.json`

Open the `firebase.json` file that was created in the project root. Check that `"public"` is set to **`"dist"`**:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ]
  }
}
```

*(Optional: you can also add `"cleanUrls": true` inside `"hosting"` to match the `main` branch.)*

> **Critical check:** Never set `"public"` to `"public"`, `"src"`, or `"."` — it **must** be `"dist"`.

---

## Part D: Build and deploy

Make sure your local **`.env`** has the correct values for this Firebase project — `npm run build` bakes your `.env` values into the production bundle inside `dist/`.

Run:

```sh
npm run build
firebase deploy --only hosting
```

- `npm run build` creates the production files inside `dist/`.
- `firebase deploy --only hosting` uploads `dist/` to Firebase Hosting without overwriting the Firestore rules you published in Step 4.

When deployment finishes, Firebase prints a **Hosting URL** (usually `https://<your-project-id>.web.app`). Open that URL in your browser!

---

## Checkpoint

1. `npm run build` finishes without errors and creates a `dist/` folder.
2. `firebase deploy --only hosting` prints **`Deploy complete!`** and a **Hosting URL**.
3. Opening the Hosting URL shows your styled **Campus Guestbook** (not Firebase's default welcome page).
4. Signing in with Google, posting a note, seeing it update, and deleting your own note all work on the live URL.

### If something goes wrong

- **Live site shows Firebase's "Welcome / Firebase Hosting Setup Complete" page:**
  `"public"` in `firebase.json` was probably set to `"public"` instead of `"dist"`, or `npm run build` was skipped. Set `"public": "dist"` in `firebase.json`, run `npm run build`, and run `firebase deploy --only hosting` again.
- **`auth/unauthorized-domain` on the deployed site:**
  Firebase usually authorizes `<project-id>.web.app` and `<project-id>.firebaseapp.com` automatically. If not, open **Firebase Console → Build → Authentication → Settings → Authorized domains** and add the exact hostname from your Hosting URL.
- **Fixed `.env` after deploying, but the live site still has the old config:**
  `npm run build` embeds `.env` at build time. Run `npm run build` again, then `firebase deploy --only hosting`.

---

### Publishing future updates

Any time you change code or `.env`, run these two commands again:

```sh
npm run build
firebase deploy --only hosting
```

Congratulations — your Campus Guestbook is live! Check off your progress in [CHECKLIST.md](../CHECKLIST.md).
