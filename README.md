# Campus Guestbook

A beginner-friendly guestbook built live during **Beyond the Search Bar: Getting Started with Google Technologies**, a 30-minute GDGoC CIT-U webinar. The app uses Vite, vanilla JavaScript, Firebase Authentication, Cloud Firestore, and Firebase Hosting.

## What you will build

Sign in with Google, post a short note, watch notes update live across browsers, protect the database with Firestore Security Rules, and deploy to Firebase Hosting.

## Prerequisites

- **Node.js LTS** and **npm** ([nodejs.org](https://nodejs.org/))
- **Git**
- A **Google account** (free Firebase Spark plan is enough)
- **VS Code** (or any code editor)

---

## Option 1: Follow the live workshop step by step (recommended)

Switch to the `starter` branch first — it has the styled UI and TODO placeholders:

```sh
git switch starter
```

Then follow the five detailed guides in order. Each guide includes exact Firebase Console clicks, Find & Replace code instructions, collapsible full-file snapshots, checkpoints, and troubleshooting:

1. **[Step 1: Setup](docs/step-1.md)** (`step-1-setup`) — create your Firebase project, fill in `.env`, initialize Firebase, and start Vite.
2. **[Step 2: Authentication](docs/step-2.md)** (`step-2-auth`) — enable Google sign-in, connect sign-in/sign-out, and toggle views.
3. **[Step 3: Firestore](docs/step-3.md)** (`step-3-firestore`) — create Cloud Firestore, listen for live notes, post notes, and wire up owner-only delete.
4. **[Step 4: Security rules](docs/step-4.md)** (`step-4-rules`) — publish Firestore rules for signed-in reads and owner-only create/delete, then test end to end.
5. **[Step 5: Hosting](docs/step-5.md)** (`step-5-hosting`) — build `dist/` and deploy to Firebase Hosting.

> **Fell behind during the talk?** You can inspect any completed step using its Git tag (for example, `git switch -c catchup step-2-auth`) or switch to `main` for the finished app (`git switch main`).

---

## Option 2: Run the completed app (`main` branch)

If you just want to run the finished app locally on `main`:

1. Switch to `main`:
   ```sh
   git switch main
   ```
2. Create `.env` from `.env.example` (**Windows PowerShell:** `Copy-Item .env.example .env`, **CMD:** `copy .env.example .env`, **macOS/Linux:** `cp .env.example .env`) and replace all 6 `your-...` placeholders in **`.env`** (not `.env.example`) with your Firebase Web app config (no quotes, no trailing commas).
3. In [Firebase Console](https://console.firebase.google.com/):
   - Enable **Google** under **Build → Authentication → Sign-in method** (select a support email and click **Save**).
   - Confirm `localhost` is listed under **Authentication → Settings → Authorized domains**.
   - Create a **Standard edition** `(default)` database under **Build → Firestore Database** in **Production mode**, then publish the rules from `firestore.rules` under the **Rules** tab.
4. Install and start Vite:
   ```sh
   npm install
   npm run dev
   ```
5. Open the local URL printed by Vite (usually `http://localhost:5173`).

To deploy the completed app to Firebase Hosting (in a **new terminal**, not the running `npm run dev` terminal):

```sh
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy --only hosting
```

During `firebase init hosting`, pick your Firebase project, set the public directory to **`dist`**, answer **No** to single-page app and GitHub builds, and do not overwrite existing files.

---

## Common troubleshooting

- **`auth/api-key-not-valid` or missing config error:** Confirm your real Firebase values are in **`.env`** (not `.env.example`), with no quotes or trailing commas, then stop Vite (`Ctrl+C`) and restart `npm run dev`.
- **Page loads with no CSS (plain white Times New Roman):** There is a JavaScript syntax error in `src/main.js` (most commonly importing `auth` twice in Step 3). Open **`F12` → Console** to see the exact line, or compare against the collapsible full-file snapshot at the bottom of your current step guide.
- **`permission-denied` from Firestore:** Expected at the end of Step 3 while Firestore is in Production mode! Complete **[Step 4](docs/step-4.md)** to publish the security rules, wait 30–60 seconds, and refresh.
- **`auth/unauthorized-domain`:** Open **Firebase Console → Build → Authentication → Settings → Authorized domains** and add the exact hostname from your browser address bar (`localhost` for local dev, or your `.web.app` hostname after deploying).
- **Windows PowerShell error (`firebase.ps1 cannot be loaded`):** Run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once in PowerShell, switch to Command Prompt (CMD), or use `npx firebase-tools` instead of `firebase`.
- **Google sign-in popup blocked:** Allow popups for the site in your browser and try again.

## Checklist

Track your progress in [CHECKLIST.md](CHECKLIST.md).

---

GDGoC CIT-U | Beyond the Search Bar: Getting Started with Google Technologies
