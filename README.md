# Campus Guestbook

A small, beginner-friendly guestbook built during **Beyond the Search Bar: Getting Started with Google Technologies**, a 30-minute GDGoC CIT-U webinar. The app uses Vite, vanilla JavaScript, Firebase Authentication, and Cloud Firestore.

## What you will build

Sign in with Google, post a short note, see notes update live, and delete notes you wrote. The work is split into five steps so you can follow along during the session or complete it later.

## Prerequisites

- Node.js LTS and npm
- Git
- A Google account
- A Firebase project (free Spark plan is enough for this demo)

Use the current Node.js LTS from [nodejs.org](https://nodejs.org/). Vite may require a recent Node.js release; use the version shown by Vite's installation guide if it is newer than your installed LTS.

## Create and configure your Firebase project

1. Open the [Firebase Console](https://console.firebase.google.com/) and create a project.
2. In **Project settings**, add a **Web app** and register it. You do not need to set up Hosting from this page.
3. Copy the web app configuration values into a local `.env` file, following `.env.example`. These values identify your Firebase project; do not commit your `.env` file.
4. In **Authentication → Sign-in method**, enable **Google**.
5. In **Authentication → Settings → Authorized domains**, confirm `localhost` is listed for local development. Add your deployed domain after deployment if needed.
6. In **Firestore Database**, create a database. For this guide, choose production mode and deploy the included `firestore.rules` in step 4. Do not leave broad test-mode rules enabled.

## Install and run

Run these commands from the project folder.

### Windows PowerShell

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

### macOS / Linux

```sh
cp .env.example .env
npm install
npm run dev
```

Before running the app, replace each placeholder in `.env` with the values from your registered Firebase web app. Keep `.env` private. Vite loads `VITE_` variables when the dev server starts, so restart it after changing `.env`.

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Follow the build steps

Each step has a short guide in `docs/` and a matching Git tag.

1. [Setup](docs/step-1.md): Vite and Firebase configuration.
2. [Authentication](docs/step-2.md): Google sign-in and sign-out.
3. [Firestore](docs/step-3.md): live messages, posting, and deleting.
4. [Security rules](docs/step-4.md): signed-in reads and owner-only writes.
5. [Hosting](docs/step-5.md): build and deploy the app.

Use `git switch starter` to see the styled starting UI with Firebase TODOs. Use `git switch main` for the completed app.

## Deploy to Firebase Hosting

Install the Firebase CLI if it is not already available, then run the commands in order:

```sh
npm install
npm run dev
firebase login
firebase init hosting
npm run build
firebase deploy
```

During `firebase init hosting`, select the Firebase project you created, set the public directory to `dist`, configure as a single-page app only if your app uses client-side routes (this guestbook does not), and do not overwrite existing files. The included `firebase.json` already defines the `dist` directory and clean URLs; retain it if the CLI offers to overwrite it. Deploy Firestore rules separately from the Firebase Console unless you also initialize Firestore with the CLI.

The Firebase CLI works in PowerShell and macOS/Linux shells. If it is not installed, install it with `npm install -g firebase-tools` in either shell, then run `firebase login`.

## Troubleshooting

- **Unauthorized domain:** In Firebase Console, open **Authentication → Settings → Authorized domains** and add the exact hostname you use. For local development, add `localhost`. For Hosting, add the deployed domain.
- **Missing environment variables:** Confirm `.env` is in the repository root and each `VITE_FIREBASE_*` value is filled in. Restart `npm run dev` after editing it. Never commit `.env`.
- **permission-denied:** Confirm Firestore is created and the rules from `firestore.rules` are deployed. Reads require sign-in; creating and deleting notes requires the document's `uid` to match the signed-in user's UID.
- **Google sign-in popup blocked:** Allow popups for the local or deployed site, or try again in a standard browser window.

## Checklist

See [CHECKLIST.md](CHECKLIST.md) to track the five steps.

---

GDGoC CIT-U | Beyond the Search Bar: Getting Started with Google Technologies
