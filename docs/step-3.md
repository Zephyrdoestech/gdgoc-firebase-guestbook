# Step 3: Save and display messages

**Time:** about 8 minutes

## Goal

Save each note in Cloud Firestore, show all notes to signed-in users, and update the page when a note is added or deleted. The delete button appears only beside notes written by the signed-in user.

## Part A: Create the Firestore database

1. In Firebase Console, open **Firestore Database**.
2. Select **Create database**.
3. Choose a location close to your users. The location cannot easily be changed later.
4. Choose **Production mode**. Step 4 adds the rules that allow this app to work safely.
5. Select **Create** and wait for the database page to open.

Do not leave Firestore in open test mode. The rules in step 4 will protect the messages.

## Part B: Add Firestore to the Firebase module

In `src/firebase.js`, add this import:

```js
import { getFirestore } from 'firebase/firestore';
```

Below the exported `auth`, add:

```js
export const db = getFirestore(app);
```

In `src/main.js`, import both services:

```js
import { auth, db } from './firebase.js';
```

Also import the Firestore functions used by this page:

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

## Part C: Decide what one message contains

Each document goes in the `messages` collection and has these fields:

| Field | Meaning |
| --- | --- |
| `text` | The note, up to 280 characters |
| `uid` | Firebase UID of the author |
| `displayName` | Name shown beside the note |
| `photoURL` | Google profile image URL, or an empty string |
| `createdAt` | Firestore server time when the note is saved |

The UID is important. The app uses it to decide which delete button to show, and the security rules in step 4 use it to enforce ownership.

## Part D: Listen for new notes

Add this variable near the other top-level variables in `src/main.js`:

```js
let stopMessageListener = null;
```

Also add these references near the other `const` declarations if they are not already there:

```js
const messageList = document.querySelector('#message-list');
const messageCount = document.querySelector('#message-count');
```

Add a function that subscribes to Firestore:

```js
function listenForMessages(user) {
  const messagesQuery = query(
    collection(db, 'messages'),
    orderBy('createdAt', 'desc'),
  );

  stopMessageListener = onSnapshot(messagesQuery, (snapshot) => {
    const messages = snapshot.docs.map((item) => ({
      id: item.id,
      ...item.data(),
    }));
    renderMessages(messages, user);
  }, (error) => {
    showStatus(error.message || 'Could not load messages.');
  });
}
```

`onSnapshot` stays connected and calls its function whenever the collection changes. `orderBy` puts the newest message first. The returned `stopMessageListener` function can stop the subscription when the user signs out.

Replace the `onAuthStateChanged` callback from step 2 with this version. It stops the previous listener when the user signs out or changes account, then starts listening for the signed-in user:

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
  listenForMessages(user);
});
```

The empty list clears old messages from the screen when the user signs out. The profile photo code from step 2 can stay in this callback before `listenForMessages(user)`.

## Part E: Save a note

The starter form already prevents the browser's normal page reload. Replace the starter's placeholder text in its submit handler with a call to `postMessage()`:

```js
document.querySelector('#message-form').addEventListener('submit', (event) => {
  event.preventDefault();
  postMessage();
});
```

Add this function below the event handlers:

```js
async function postMessage() {
  const user = auth.currentUser;
  const text = messageInput.value.trim();
  if (!user || !text) return;

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
    showStatus(error.message || 'Could not post your note.');
  }
}
```

`trim()` removes extra spaces at the start and end. `serverTimestamp()` asks Firestore to set the time, so the browser cannot choose a false date. Keep the existing `try`/`catch` from the finished version if you want to show friendly errors.

## Part F: Render notes and add delete buttons

Add this complete simple renderer. It clears the old list, creates one card per note, and writes user-provided text with `textContent`:

```js
function renderMessages(messages, currentUser) {
  messageList.replaceChildren();
  messageCount.textContent = `${messages.length} ${messages.length === 1 ? 'note' : 'notes'}`;

  if (messages.length === 0) {
    const empty = document.createElement('p');
    empty.textContent = 'No notes yet. Be the first to write one!';
    messageList.append(empty);
    return;
  }

  for (const message of messages) {
    const card = document.createElement('article');
    card.className = 'message-card';

    const author = document.createElement('strong');
    author.textContent = message.displayName || 'Google user';

    const text = document.createElement('p');
    text.textContent = message.text;

    card.append(author, text);

    if (currentUser?.uid === message.uid) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = 'Delete';
      button.addEventListener('click', () => removeMessage(message.id));
      card.append(button);
    }

    messageList.append(card);
  }
}
```

`textContent` treats a note as plain text instead of HTML. The `if` statement adds a delete button only to notes from the current user.

Add the function that removes the Firestore document:

```js
async function removeMessage(messageId) {
  await deleteDoc(doc(db, 'messages', messageId));
}
```

The interface hides other people's delete buttons. That is only a convenience. Step 4 makes Firestore reject a delete request for another person's note.

## Checkpoint

1. Sign in with Google.
2. Type a short note and select **Post note**.
3. Confirm the note appears without refreshing the page.
4. Open the app in a second browser window and sign in as another account. The first account's note should appear, but it should not have a delete button.
5. Return to the author account and delete the note.

If Firestore reports `permission-denied`, continue to step 4 and publish the rules. Until then, production mode intentionally blocks requests.
