# Step 1: Set up the project

**Time:** about 5 minutes

## Goal

Start the Vite website on your computer and connect it to your Firebase project. In this step, Firebase only starts. Sign-in and messages come later.

## Before you begin

- Install Node.js LTS and Git.
- Have a Google account ready.
- Open a terminal in the project folder. In VS Code, choose **Terminal → New Terminal**.
- Begin on the `starter` branch. It contains the page design and TODO notes.

```sh
git switch starter
```

## Part A: Create your Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com/) and sign in.
2. Select **Create a project**. Enter a name, then follow the prompts. Google Analytics is not needed for this demo.
3. Open the project overview and select the web icon, marked `</>`.
4. Give the app a nickname such as `CIT-U Guestbook` and select **Register app**. Hosting setup is not needed here.
5. Firebase displays a configuration object. Keep this page open. You will copy its values in Part B.

## Part B: Install the tools and SDK

Check that Node.js and npm are installed:

```sh
node --version
npm --version
```

Install the project packages and Firebase Web SDK:

```sh
npm install
npm install firebase
```

The first command installs Vite. The second adds Firebase to this project.

## Part C: Add your local Firebase settings

Create a private local `.env` file by copying the example.

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

**macOS / Linux:**

```sh
cp .env.example .env
```

Open `.env` in your editor. Copy the matching values from the Firebase configuration into the six lines. For example, the value of `apiKey` goes after `VITE_FIREBASE_API_KEY=`. Do the same for `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, and `appId`.

Replace every example value. Do not add quotes unless a value itself contains quotes. Do not share `.env` or commit it to Git. `.gitignore` excludes it from commits.

## Part D: Initialize Firebase

Create or replace `src/firebase.js` with this code:

```js
import { initializeApp } from 'firebase/app';

// Vite makes variables starting with VITE_ available in browser code.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const missingConfig = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingConfig.length > 0) {
  throw new Error(`Missing Firebase settings: ${missingConfig.join(', ')}`);
}

export const app = initializeApp(firebaseConfig);
```

In `src/main.js`, keep the CSS import at the top and add this line below it:

```js
import './firebase.js';
```

This loads the Firebase configuration when the page starts. The `export` keyword makes `app` available to other JavaScript files in later steps.

## Part E: Start the website

```sh
npm run dev
```

Open the local address Vite prints in the terminal. It is usually `http://localhost:5173`. Leave the terminal open while you work. To stop Vite, press **Ctrl+C**.

## Checkpoint

- The guestbook page appears in your browser.
- There is no “Missing Firebase settings” message in the browser console.
- Your `.env` contains your Firebase values and is not listed in `git status`.

If you change `.env`, stop and restart `npm run dev` so Vite reads the new values.
