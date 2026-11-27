# Step 2: Sign in with Google

**Time:** about 5 minutes

## Goal

Let visitors sign in with Google, show their name and profile photo alongside the guestbook composer, and let them sign out again.

---

## Part A: Turn on Google sign-in in Firebase Console

1. Open your project in [Firebase Console](https://console.firebase.google.com/).
2. In the left sidebar, open **Build → Authentication**.
3. If shown, click **Get started**.
4. Open the **Sign-in method** tab and click **Google** (under Native providers / Add new provider).
5. Switch the **Enable** toggle **on**.
6. Under **Support email for project**, choose your email from the dropdown *(the **Save** button stays disabled until you select one)*.
7. Click **Save**.
8. Open the **Settings** tab → **Authorized domains** and confirm **`localhost`** is listed. Add `localhost` if it is missing.

---

## Part B: Export `auth` from `src/firebase.js`

Open `src/firebase.js` and add two lines:

1. Below `import { initializeApp } from 'firebase/app';`, add:

```js
import { getAuth } from 'firebase/auth';
```

2. At the bottom of the file, below `export const app = initializeApp(firebaseConfig);`, add:

```js
export const auth = getAuth(app);
```

<details>
<summary>Verify your complete <code>src/firebase.js</code> at the end of Step 2</summary>

```js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

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
export const auth = getAuth(app);
```

</details>

Save `src/firebase.js`.

---

## Part C: Import the auth functions in `src/main.js`

Open `src/main.js`.

**Find this line** (line 2 from Step 1):

```js
import './firebase.js';
```

**Replace it with** (keep `import './style.css';` on line 1):

```js
import { auth } from './firebase.js';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
```

---

## Part D: Connect BOTH the sign-in and sign-out buttons

1. Right below `const characterCount = document.querySelector('#character-count');`, add the Google provider:

```js
const googleProvider = new GoogleAuthProvider();
```

2. **Find and delete BOTH starter button handlers** in `src/main.js`:

```js
document.querySelector('#sign-in-button').addEventListener('click', () => {
  showStatus('Add Firebase Authentication in step 2 to enable sign-in.');
});
document.querySelector('#sign-out-button').addEventListener('click', () => {
  showStatus('Add Firebase Authentication in step 2 to enable sign-out.');
});
```

3. **Replace them with both working handlers:**

```js
document.querySelector('#sign-in-button').addEventListener('click', async () => {
  try {
    await signInWithPopup(auth, googleProvider);
    showStatus('You are signed in.');
  } catch (error) {
    showStatus(error.message || 'Google sign-in did not complete. Try again.');
  }
});

document.querySelector('#sign-out-button').addEventListener('click', async () => {
  try {
    await signOut(auth);
    showStatus('You are signed out.');
  } catch (error) {
    showStatus(error.message || 'Sign-out did not complete. Try again.');
  }
});
```

---

## Part E: Show the signed-in view and profile info

1. Directly below the `#sign-out-button` handler you just added, paste this `onAuthStateChanged` listener:

```js
onAuthStateChanged(auth, (user) => {
  signedOutView.hidden = Boolean(user);
  signedInView.hidden = !user;

  if (!user) return;

  document.querySelector('#user-name').textContent = user.displayName || 'Google user';
  const photo = document.querySelector('#user-photo');
  photo.src = user.photoURL || '';
  photo.hidden = !user.photoURL;
  photo.alt = user.displayName ? `${user.displayName}'s profile photo` : 'Profile photo';
});
```

2. Clean up the starter placeholder lines near the bottom of `src/main.js` — **find and delete** these 3 lines (now that both views are used):

```js
// These references make the two auth views easy to wire up in step 2.
void signedOutView;
void signedInView;
```

Save `src/main.js`.

<details>
<summary>Verify your complete <code>src/main.js</code> at the end of Step 2</summary>

```js
import './style.css';
import { auth } from './firebase.js';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';

const signedOutView = document.querySelector('#signed-out-view');
const signedInView = document.querySelector('#signed-in-view');
const messageInput = document.querySelector('#message-input');
const characterCount = document.querySelector('#character-count');
const googleProvider = new GoogleAuthProvider();

// TODO Step 3: connect Firestore, live messages, posting, and owner-only delete.
document.querySelector('#sign-in-button').addEventListener('click', async () => {
  try {
    await signInWithPopup(auth, googleProvider);
    showStatus('You are signed in.');
  } catch (error) {
    showStatus(error.message || 'Google sign-in did not complete. Try again.');
  }
});

document.querySelector('#sign-out-button').addEventListener('click', async () => {
  try {
    await signOut(auth);
    showStatus('You are signed out.');
  } catch (error) {
    showStatus(error.message || 'Sign-out did not complete. Try again.');
  }
});

onAuthStateChanged(auth, (user) => {
  signedOutView.hidden = Boolean(user);
  signedInView.hidden = !user;

  if (!user) return;

  document.querySelector('#user-name').textContent = user.displayName || 'Google user';
  const photo = document.querySelector('#user-photo');
  photo.src = user.photoURL || '';
  photo.hidden = !user.photoURL;
  photo.alt = user.displayName ? `${user.displayName}'s profile photo` : 'Profile photo';
});

document.querySelector('#message-form').addEventListener('submit', (event) => {
  event.preventDefault();
  showStatus('Connect Firestore in step 3 to post a note.');
});

messageInput.addEventListener('input', () => {
  characterCount.textContent = `${messageInput.value.length} / 280`;
});

function showStatus(message) {
  document.querySelector('#status-message').textContent = message;
}
```

</details>

---

## Checkpoint

1. Save `src/firebase.js` and `src/main.js`, and check `http://localhost:5173`.
2. Click **Continue with Google** and pick your Google account.
3. Confirm your **Google name**, **profile photo**, and the **message box** appear.
4. Click **Sign out**. Confirm the **Continue with Google** card returns.

### If something goes wrong

- **`auth/api-key-not-valid`:** Double-check that your real values are inside **`.env`** (not `.env.example`), with no quotes or commas, then stop Vite (`Ctrl+C`) and run `npm run dev` again.
- **`auth/unauthorized-domain`:** In Firebase Console, open **Build → Authentication → Settings → Authorized domains** and add the exact hostname in your browser's address bar (usually `localhost`).
- **Clicking "Sign out" says `"Add Firebase Authentication in step 2 to enable sign-out."`:** You replaced `#sign-in-button` but left the starter `#sign-out-button` handler in place. Check Part D or compare with the full `src/main.js` snapshot above.
- **Page has no CSS / looks unstyled:** There is a JavaScript syntax error in `src/main.js` (such as a duplicate `import` or `const`). Open **`F12` → Console** to see the exact line, or copy the full `src/main.js` snapshot above.
- **Popup blocked:** Allow popups for `localhost` in your browser's address bar and try again.

When both sign-in and sign-out work, continue to **[Step 3: Save and display messages](step-3.md)**.
