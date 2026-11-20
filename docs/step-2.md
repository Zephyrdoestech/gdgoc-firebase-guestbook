# Step 2: Sign in with Google

**Time:** about 5 minutes

## Goal

Let a visitor sign in with Google. Show the guestbook form only after sign-in, and let the visitor sign out again.

## Part A: Turn on Google sign-in

1. In Firebase Console, open **Authentication**.
2. If asked, select **Get started**.
3. Open **Sign-in method** or **Sign-in providers**.
4. Select **Google**, switch it on, choose a support email, and save.
5. Open the **Settings** tab and find **Authorized domains**. Check that `localhost` is listed. Add it if it is missing.

## Part B: Make Firebase Authentication available

Open `src/firebase.js`. Add this import below the `initializeApp` import:

```js
import { getAuth } from 'firebase/auth';
```

At the bottom of the file, after `export const app = initializeApp(firebaseConfig);`, add:

```js
export const auth = getAuth(app);
```

`auth` is the Firebase Authentication service used by the sign-in buttons.

## Part C: Import the sign-in functions

In `src/main.js`, replace the line `import './firebase.js';` with:

```js
import { auth } from './firebase.js';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
```

Keep the existing `import './style.css';` line.

## Part D: Connect the Google buttons

After the existing `const` declarations, create a Google provider:

```js
const googleProvider = new GoogleAuthProvider();
```

Replace the starter's sign-in button handler with:

```js
document.querySelector('#sign-in-button').addEventListener('click', async () => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    showStatus(error.message || 'Google sign-in did not complete. Try again.');
  }
});
```

Replace the sign-out button handler with:

```js
document.querySelector('#sign-out-button').addEventListener('click', async () => {
  try {
    await signOut(auth);
  } catch (error) {
    showStatus(error.message || 'Sign-out did not complete. Try again.');
  }
});
```

The starter already has a `showStatus` helper. It writes a message into the page's status area.

## Part E: Show the correct view

The starter already declares `signedOutView` and `signedInView` near the top of `src/main.js`. Keep those declarations. Add this listener below the button handlers:

```js
onAuthStateChanged(auth, (user) => {
  signedOutView.hidden = Boolean(user);
  signedInView.hidden = !user;

  if (!user) return;

  document.querySelector('#user-name').textContent = user.displayName || 'Google user';
  const photo = document.querySelector('#user-photo');
  photo.src = user.photoURL || '';
  photo.hidden = !user.photoURL;
});
```

`onAuthStateChanged` runs when Firebase first checks the saved session and whenever the user signs in or out. The page already contains both views. The `hidden` property switches between them. Do not add the two `const` declarations a second time. JavaScript reports an error if the same `const` name is declared twice in one file.

## Checkpoint

1. Save the files and let Vite refresh the page.
2. Select **Continue with Google** and choose an account.
3. Check that your Google name appears and the message form becomes visible.
4. Select **Sign out**. The sign-in card should return.

If Google reports an unauthorized domain, add the exact hostname shown in the browser address bar to **Authentication → Settings → Authorized domains**. For local work that hostname is usually `localhost`.
