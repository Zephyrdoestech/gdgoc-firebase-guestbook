# Step 3: Save and display messages

**Time:** about 8 minutes

## Goal

Connect Cloud Firestore so notes save to the database, update live on every signed-in screen, and show a **Delete** button only on notes written by the signed-in user.

---

## Part A: Create the Firestore database

1. In [Firebase Console](https://console.firebase.google.com/), open **Build → Firestore Database** in the left sidebar.
2. Click **Create database**.
3. If asked for an **Edition**, choose **Standard edition** *(do **not** choose Enterprise edition)*.
4. Keep the **Database ID** set to **`(default)`**.
5. Choose a **Location** close to your users (for example, `asia-southeast1` for the Philippines / Southeast Asia), then click **Next**. *(The location cannot be changed later.)*
6. Select **Start in production mode**, then click **Create** and wait for the database view to load.

> **Important:** Because we start in **Production mode**, Firestore intentionally denies all reads and writes (`permission-denied`) until we publish our security rules in **Step 4**. Do **not** switch to open test mode — seeing `permission-denied` at the end of Step 3 is expected and proves your app is connected!

---

## Part B: Add Firestore to `src/firebase.js` and `src/main.js`

### 1. Export `db` from `src/firebase.js`

Open `src/firebase.js` and add two lines:

1. Below `import { getAuth } from 'firebase/auth';`, add:

```js
import { getFirestore } from 'firebase/firestore';
```

2. At the bottom of the file, below `export const auth = getAuth(app);`, add:

```js
export const db = getFirestore(app);
```

<details>
<summary>Verify your complete <code>src/firebase.js</code> at the end of Step 3</summary>

```js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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
export const db = getFirestore(app);
```

</details>

Save `src/firebase.js`.

### 2. Update imports in `src/main.js`

Open `src/main.js`.

**Find this line from Step 2:**

```js
import { auth } from './firebase.js';
```

**Replace that line with** *(do **not** keep both lines — importing `auth` twice causes a syntax error that breaks the page and its CSS)*:

```js
import { auth, db } from './firebase.js';
```

Directly below the `from 'firebase/auth';` import, add the Firestore imports:

```js
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
```

---

## Part C: Understand what one message document contains

Each note is saved in the `messages` collection with these exact 5 fields:

| Field | Meaning |
| --- | --- |
| `text` | The note, 1–280 characters |
| `uid` | Firebase UID of the author |
| `displayName` | Name shown beside the note |
| `photoURL` | Google profile image URL, or `""` |
| `createdAt` | Firestore server timestamp when the note is saved |

The `uid` lets the UI show a delete button only on your own notes, and Step 4's security rules verify `uid` on the server so nobody else can delete your note.

---

## Part D: Listen for live messages

### 1. Add message DOM references and listener state

Right below `const googleProvider = new GoogleAuthProvider();` near the top of `src/main.js`, add:

```js
const messageList = document.querySelector('#message-list');
const messageCount = document.querySelector('#message-count');
let stopMessageListener = null;
```

### 2. Update `onAuthStateChanged`

**Find your entire `onAuthStateChanged(...)` block from Step 2** and **replace it with** this version (it keeps your profile photo code, stops old listeners on sign-out, and starts listening when signed in):

```js
onAuthStateChanged(auth, (user) => {
  signedOutView.hidden = Boolean(user);
  signedInView.hidden = !user;

  stopMessageListener?.();
  stopMessageListener = null;

  if (!user) {
    renderMessages([]);
    return;
  }

  document.querySelector('#user-name').textContent = user.displayName || 'Google user';
  const photo = document.querySelector('#user-photo');
  photo.src = user.photoURL || '';
  photo.hidden = !user.photoURL;
  photo.alt = user.displayName ? `${user.displayName}'s profile photo` : 'Profile photo';

  listenForMessages(user);
});
```

### 3. Add `listenForMessages`

At the **very bottom of `src/main.js`** (below `showStatus`), add:

```js
function listenForMessages(user) {
  const messagesQuery = query(
    collection(db, 'messages'),
    orderBy('createdAt', 'desc'),
  );

  stopMessageListener = onSnapshot(
    messagesQuery,
    (snapshot) => {
      const messages = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));
      renderMessages(messages, user);
    },
    (error) => {
      showStatus(
        error.code === 'permission-denied'
          ? 'Firestore denied access (expected before Step 4!). Publish the rules in Step 4 next.'
          : error.message || 'Could not load messages.',
      );
    },
  );
}
```

---

## Part E: Post a new note

### 1. Update the `#message-form` submit handler

**Find these lines in `src/main.js`:**

```js
document.querySelector('#message-form').addEventListener('submit', (event) => {
  event.preventDefault();
  showStatus('Connect Firestore in step 3 to post a note.');
});
```

**Replace them with:**

```js
document.querySelector('#message-form').addEventListener('submit', (event) => {
  event.preventDefault();
  postMessage();
});
```

### 2. Add `postMessage`

At the **very bottom of `src/main.js`** (below `listenForMessages`), add:

```js
async function postMessage() {
  const user = auth.currentUser;
  const text = messageInput.value.trim();
  if (!user || !text) return;

  const submitButton = document.querySelector('#message-form button[type="submit"]');
  submitButton.disabled = true;

  try {
    await addDoc(collection(db, 'messages'), {
      text,
      uid: user.uid,
      displayName: user.displayName || 'Google user',
      photoURL: user.photoURL || '',
      createdAt: serverTimestamp(),
    });

    messageInput.value = '';
    characterCount.textContent = '0 / 280';
    showStatus('Your note was posted.');
  } catch (error) {
    showStatus(
      error.code === 'permission-denied'
        ? 'Firestore denied this post (expected before Step 4!). Publish the rules in Step 4 next.'
        : error.message || 'Could not post your note.',
    );
  } finally {
    submitButton.disabled = false;
  }
}
```

---

## Part F: Render notes on the page

At the **very bottom of `src/main.js`** (below `postMessage`), add `renderMessages`. It uses the styles already defined in `src/style.css`, treats user text safely with `textContent`, and adds a **Delete** button only when `currentUser?.uid === message.uid`:

```js
function renderMessages(messages, currentUser = auth.currentUser) {
  messageList.replaceChildren();
  messageCount.textContent = `${messages.length} ${messages.length === 1 ? 'note' : 'notes'}`;

  if (messages.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML =
      '<span class="empty-icon" aria-hidden="true">✎</span><strong>Your community starts here.</strong><span>Sign in and leave the first note.</span>';
    messageList.append(empty);
    return;
  }

  for (const message of messages) {
    const card = document.createElement('article');
    card.className = 'message-card';

    const meta = document.createElement('div');
    meta.className = 'message-meta';

    const photo = document.createElement('img');
    photo.src = message.photoURL || '';
    photo.alt = '';
    photo.hidden = !message.photoURL;

    const author = document.createElement('span');
    author.className = 'message-author';
    author.textContent = message.displayName || 'Google user';

    const date = document.createElement('time');
    date.className = 'message-date';
    const createdAt = message.createdAt?.toDate?.();
    date.dateTime = createdAt?.toISOString() || '';
    date.textContent = createdAt ? createdAt.toLocaleString() : 'Just now';

    meta.append(photo, author, date);

    if (currentUser?.uid === message.uid) {
      const removeButton = document.createElement('button');
      removeButton.className = 'delete-button';
      removeButton.type = 'button';
      removeButton.textContent = 'Delete';
      removeButton.setAttribute('aria-label', `Delete note by ${message.displayName || 'you'}`);
      removeButton.addEventListener('click', () => removeMessage(message.id));
      meta.append(removeButton);
    }

    const body = document.createElement('p');
    body.className = 'message-text';
    body.textContent = message.text || '';

    card.append(meta, body);
    messageList.append(card);
  }
}
```

---

## Part G: Delete your own notes

At the **very bottom of `src/main.js`** (below `renderMessages`), add `removeMessage`:

```js
async function removeMessage(messageId) {
  try {
    await deleteDoc(doc(db, 'messages', messageId));
    showStatus('Your note was deleted.');
  } catch (error) {
    showStatus(
      error.code === 'permission-denied'
        ? 'Firestore denied the delete. You can delete only your own notes.'
        : error.message || 'Could not delete your note.',
    );
  }
}
```

Save `src/main.js`.

<details>
<summary>Verify your complete <code>src/main.js</code> at the end of Step 3</summary>

```js
import './style.css';
import { auth, db } from './firebase.js';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';

const signedOutView = document.querySelector('#signed-out-view');
const signedInView = document.querySelector('#signed-in-view');
const messageInput = document.querySelector('#message-input');
const characterCount = document.querySelector('#character-count');
const googleProvider = new GoogleAuthProvider();
const messageList = document.querySelector('#message-list');
const messageCount = document.querySelector('#message-count');
let stopMessageListener = null;

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

  stopMessageListener?.();
  stopMessageListener = null;

  if (!user) {
    renderMessages([]);
    return;
  }

  document.querySelector('#user-name').textContent = user.displayName || 'Google user';
  const photo = document.querySelector('#user-photo');
  photo.src = user.photoURL || '';
  photo.hidden = !user.photoURL;
  photo.alt = user.displayName ? `${user.displayName}'s profile photo` : 'Profile photo';

  listenForMessages(user);
});

document.querySelector('#message-form').addEventListener('submit', (event) => {
  event.preventDefault();
  postMessage();
});

messageInput.addEventListener('input', () => {
  characterCount.textContent = `${messageInput.value.length} / 280`;
});

function showStatus(message) {
  document.querySelector('#status-message').textContent = message;
}

function listenForMessages(user) {
  const messagesQuery = query(
    collection(db, 'messages'),
    orderBy('createdAt', 'desc'),
  );

  stopMessageListener = onSnapshot(
    messagesQuery,
    (snapshot) => {
      const messages = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));
      renderMessages(messages, user);
    },
    (error) => {
      showStatus(
        error.code === 'permission-denied'
          ? 'Firestore denied access (expected before Step 4!). Publish the rules in Step 4 next.'
          : error.message || 'Could not load messages.',
      );
    },
  );
}

async function postMessage() {
  const user = auth.currentUser;
  const text = messageInput.value.trim();
  if (!user || !text) return;

  const submitButton = document.querySelector('#message-form button[type="submit"]');
  submitButton.disabled = true;

  try {
    await addDoc(collection(db, 'messages'), {
      text,
      uid: user.uid,
      displayName: user.displayName || 'Google user',
      photoURL: user.photoURL || '',
      createdAt: serverTimestamp(),
    });

    messageInput.value = '';
    characterCount.textContent = '0 / 280';
    showStatus('Your note was posted.');
  } catch (error) {
    showStatus(
      error.code === 'permission-denied'
        ? 'Firestore denied this post (expected before Step 4!). Publish the rules in Step 4 next.'
        : error.message || 'Could not post your note.',
    );
  } finally {
    submitButton.disabled = false;
  }
}

function renderMessages(messages, currentUser = auth.currentUser) {
  messageList.replaceChildren();
  messageCount.textContent = `${messages.length} ${messages.length === 1 ? 'note' : 'notes'}`;

  if (messages.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML =
      '<span class="empty-icon" aria-hidden="true">✎</span><strong>Your community starts here.</strong><span>Sign in and leave the first note.</span>';
    messageList.append(empty);
    return;
  }

  for (const message of messages) {
    const card = document.createElement('article');
    card.className = 'message-card';

    const meta = document.createElement('div');
    meta.className = 'message-meta';

    const photo = document.createElement('img');
    photo.src = message.photoURL || '';
    photo.alt = '';
    photo.hidden = !message.photoURL;

    const author = document.createElement('span');
    author.className = 'message-author';
    author.textContent = message.displayName || 'Google user';

    const date = document.createElement('time');
    date.className = 'message-date';
    const createdAt = message.createdAt?.toDate?.();
    date.dateTime = createdAt?.toISOString() || '';
    date.textContent = createdAt ? createdAt.toLocaleString() : 'Just now';

    meta.append(photo, author, date);

    if (currentUser?.uid === message.uid) {
      const removeButton = document.createElement('button');
      removeButton.className = 'delete-button';
      removeButton.type = 'button';
      removeButton.textContent = 'Delete';
      removeButton.setAttribute('aria-label', `Delete note by ${message.displayName || 'you'}`);
      removeButton.addEventListener('click', () => removeMessage(message.id));
      meta.append(removeButton);
    }

    const body = document.createElement('p');
    body.className = 'message-text';
    body.textContent = message.text || '';

    card.append(meta, body);
    messageList.append(card);
  }
}

async function removeMessage(messageId) {
  try {
    await deleteDoc(doc(db, 'messages', messageId));
    showStatus('Your note was deleted.');
  } catch (error) {
    showStatus(
      error.code === 'permission-denied'
        ? 'Firestore denied the delete. You can delete only your own notes.'
        : error.message || 'Could not delete your note.',
    );
  }
}
```

</details>

---

## Checkpoint

1. Save `src/firebase.js` and `src/main.js`, and check `http://localhost:5173`.
2. Confirm the page is **fully styled** and there are **no JavaScript syntax errors** in DevTools (`F12` → Console).
3. Sign in with Google.
4. **Expected result right now:** At the bottom of the guestbook panel, you should see:
   > `Firestore denied access (expected before Step 4!). Publish the rules in Step 4 next.`
   
   *(Posting a note will also be denied right now — this is Firestore Production mode protecting your database! We will unlock reads, posting, and owner-only deletes in Step 4 and test everything end-to-end there.)*

### If something goes wrong

- **Page suddenly has no CSS (plain white Times New Roman):** You likely imported `auth` twice (`import { auth } from './firebase.js';` AND `import { auth, db } from './firebase.js';`) or declared a `const` twice. Open **`F12` → Console** to see the exact line, or replace `src/main.js` with the full snapshot above.
- **Profile photo disappeared next to your name:** Make sure you kept the `photo` lines inside `onAuthStateChanged` (see Part D or the full snapshot above).
- **`removeMessage is not defined`:** Make sure you completed **Part G**.

Now continue to **[Step 4: Protect the messages](step-4.md)** to publish the security rules and test posting and deleting!
