# Step 1: Set up the project

**Time:** about 5 minutes

## Goal

Start the Vite website on your computer and connect it to your Firebase project. In this step, Firebase only initializes — Google sign-in and Firestore come in Steps 2 and 3.

---

## Before you begin

Make sure you have:

- **Node.js LTS** and **npm** installed ([nodejs.org](https://nodejs.org/))
- **Git** installed
- A **Google account**
- **VS Code** (or any code editor) open to this project folder

Open a terminal inside the project folder (in VS Code: **Terminal → New Terminal**) and switch to the `starter` branch:

```sh
git switch starter
```

> **Why `starter`?** The `starter` branch contains the styled HTML/CSS guestbook layout with empty TODO placeholders so we can wire up Firebase step by step. (The `main` branch has the completed solution.)

---

## Part A: Create your Firebase project & register a Web app

1. Open [Firebase Console](https://console.firebase.google.com/) and sign in with your Google account.
2. Click **Create a new Firebase project** (or **Create a project**).
3. Enter a project name (for example, `citu-guestbook`) and click **Continue**.
4. **Google Analytics (optional):** Toggle **Google Analytics** **off** to make setup faster, then click **Create project**.
5. Wait until Firebase says your project is ready, then click **Continue**.
6. On the **Project Overview** page, click the **Web icon**, marked **`</>`**.
7. Enter an app nickname such as `CIT-U Guestbook`.
8. Leave **Also set up Firebase Hosting** **unchecked** (we will do Hosting in Step 5), then click **Register app**.
9. Firebase displays a JavaScript `firebaseConfig` object with 6 values (`apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`). **Keep this browser tab open** — you will paste these values in **Part C**.

> **Accidentally closed that screen?** Click the **gear icon (⚙️)** next to *Project Overview* → **Project settings** → **General** tab → scroll down to **Your apps** → select **Config** to see your `firebaseConfig` again.

---

## Part B: Install project packages and the Firebase SDK

In your terminal, confirm Node.js and npm are available:

```sh
node --version
npm --version
```

Install the starter dependencies (Vite) and add the Firebase Web SDK:

```sh
npm install
npm install firebase
```

---

## Part C: Create and fill in `.env`

Create your private local `.env` file by copying `.env.example`:

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

**Windows Command Prompt (CMD):**

```cmd
copy .env.example .env
```

**macOS / Linux:**

```sh
cp .env.example .env
```

> **IMPORTANT — Edit `.env`, NOT `.env.example`!**
> - Vite **only reads `.env`** (it ignores `.env.example`).
> - `.env` is listed in `.gitignore` so your keys stay private; `.env.example` is tracked by Git and should keep its placeholder text.

Open **`.env`** in your editor and replace all 6 placeholder values (`your-...`) with the matching values from your Firebase `firebaseConfig` object in Part A.

**Formatting rules when copying from Firebase Console:**
- Remove the **quotes** (`"..."`) around each value.
- Remove the **trailing comma** (`,`) at the end of each line.
- Do **not** put spaces around `=`.

**Example — if Firebase Console shows:**

```js
const firebaseConfig = {
  apiKey: "AIzaSyExampleKey123456789",
  authDomain: "citu-guestbook-12345.firebaseapp.com",
  projectId: "citu-guestbook-12345",
  storageBucket: "citu-guestbook-12345.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

**Your `.env` file should look like this (with your own values):**

```env
VITE_FIREBASE_API_KEY=AIzaSyExampleKey123456789
VITE_FIREBASE_AUTH_DOMAIN=citu-guestbook-12345.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=citu-guestbook-12345
VITE_FIREBASE_STORAGE_BUCKET=citu-guestbook-12345.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

Save **`.env`**.

---

## Part D: Create `src/firebase.js` and load it in `src/main.js`

### 1. Create `src/firebase.js`

Inside the `src/` folder, **create a new file** named `firebase.js` (`src/firebase.js`) and paste this code:

```js
import { initializeApp } from 'firebase/app';

// Vite exposes variables starting with VITE_ to browser code via import.meta.env.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const invalidConfig = Object.entries(firebaseConfig)
  .filter(
    ([, value]) =>
      !value ||
      value.startsWith('your-') ||
      value.includes('"') ||
      value.includes("'") ||
      value.endsWith(','),
  )
  .map(([key]) => key);

if (invalidConfig.length > 0) {
  throw new Error(
    `Check your .env file (not .env.example) for missing, placeholder, or misformatted Firebase settings: ${invalidConfig.join(', ')}`,
  );
}

export const app = initializeApp(firebaseConfig);
```

This initializes Firebase and immediately warns you in the browser console if `.env` still has placeholders, quotes, or commas.

### 2. Import `src/firebase.js` in `src/main.js`

Open `src/main.js`. **Find line 1:**

```js
import './style.css';
```

**Add `import './firebase.js';` directly below it** so the top of `src/main.js` looks like this:

```js
import './style.css';
import './firebase.js';
```

Save both `src/firebase.js` and `src/main.js`.

<details>
<summary>Verify your complete <code>src/main.js</code> at the end of Step 1</summary>

```js
import './style.css';
import './firebase.js';

const signedOutView = document.querySelector('#signed-out-view');
const signedInView = document.querySelector('#signed-in-view');
const messageInput = document.querySelector('#message-input');
const characterCount = document.querySelector('#character-count');

// TODO Step 2: connect Google sign-in, sign-out, and auth state.
// TODO Step 3: connect Firestore, live messages, posting, and owner-only delete.
document.querySelector('#sign-in-button').addEventListener('click', () => {
  showStatus('Add Firebase Authentication in step 2 to enable sign-in.');
});
document.querySelector('#sign-out-button').addEventListener('click', () => {
  showStatus('Add Firebase Authentication in step 2 to enable sign-out.');
});

document.querySelector('#message-form').addEventListener('submit', (event) => {
  event.preventDefault();
  showStatus('Connect Firestore in step 3 to post a note.');
});

messageInput.addEventListener('input', () => {
  characterCount.textContent = `${messageInput.value.length} / 280`;
});

// These references make the two auth views easy to wire up in step 2.
void signedOutView;
void signedInView;

function showStatus(message) {
  document.querySelector('#status-message').textContent = message;
}
```

</details>

---

## Part E: Start the website

In your terminal, run:

```sh
npm run dev
```

Open the local URL Vite prints in the terminal (usually `http://localhost:5173`).

> **Terminal tip:** Leave this terminal running while you work — Vite automatically reloads the browser when you save files. To run another command later (such as `git status` or `firebase`), open a **second terminal** (click the **`+`** icon in VS Code's Terminal panel). To stop Vite, press **`Ctrl+C`**.

---

## Checkpoint

1. The styled **Campus Guestbook** page opens at `http://localhost:5173`.
2. Open browser DevTools (**`F12`** → **Console** tab). There should be **no red errors** (especially no `Check your .env file...` error).
3. In a **second terminal**, run `git status` and confirm `.env` is **not** listed (it is ignored by `.gitignore`) and `.env.example` is **not** modified.

### If something goes wrong

- **`Check your .env file (not .env.example)...` in the Console:**
  1. Confirm you edited **`.env`** in the project root (next to `package.json`), not `.env.example`.
  2. Confirm none of the 6 values still start with `your-` or contain quotes (`"`) or commas (`,`).
  3. **Stop Vite (`Ctrl+C`) and run `npm run dev` again** — Vite only reads `.env` when the server starts.
- **Page has no styling (plain white Times New Roman):**
  Open **`F12` → Console**. A JavaScript error in `src/firebase.js` or `src/main.js` stopped the script before `style.css` loaded. Fix the line shown in the console or compare with the full file above.

When everything checks out, continue to **[Step 2: Sign in with Google](step-2.md)**.
