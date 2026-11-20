import './style.css';
import { auth, db } from './firebase.js';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';

const signedOutView = document.querySelector('#signed-out-view');
const signedInView = document.querySelector('#signed-in-view');
const messageInput = document.querySelector('#message-input');
const characterCount = document.querySelector('#character-count');
const statusMessage = document.querySelector('#status-message');
const messageList = document.querySelector('#message-list');
let stopMessageListener = null;

const googleProvider = new GoogleAuthProvider();

document.querySelector('#sign-in-button').addEventListener('click', async () => {
  try {
    await signInWithPopup(auth, googleProvider);
    showStatus('You are signed in.');
  } catch (error) {
    showStatus(error.message || 'Google sign-in did not complete. Please try again.');
  }
});

document.querySelector('#sign-out-button').addEventListener('click', async () => {
  try {
    await signOut(auth);
    showStatus('You are signed out.');
  } catch (error) {
    showStatus(error.message || 'Sign-out did not complete. Please try again.');
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
  statusMessage.textContent = message;
}

function listenForMessages(user) {
  const messagesQuery = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
  stopMessageListener = onSnapshot(messagesQuery, (snapshot) => {
    renderMessages(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })), user);
  }, (error) => {
    showStatus(error.code === 'permission-denied'
      ? 'Firestore denied access. Check that you are signed in and review step 4 rules.'
      : 'Could not load messages. Check your Firebase project and connection.');
  });
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
    showStatus(error.code === 'permission-denied'
      ? 'Firestore denied this post. Check that the rules from step 4 are deployed.'
      : 'Could not post your note. Please try again.');
  } finally {
    submitButton.disabled = false;
  }
}

function renderMessages(messages, currentUser = auth.currentUser) {
  messageList.replaceChildren();
  document.querySelector('#message-count').textContent = `${messages.length} ${messages.length === 1 ? 'note' : 'notes'}`;

  if (messages.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = '<span class="empty-icon" aria-hidden="true">✎</span><strong>Your community starts here.</strong><span>Sign in and leave the first note.</span>';
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
    showStatus(error.code === 'permission-denied'
      ? 'Firestore denied the delete. You can delete only your own notes.'
      : 'Could not delete your note. Please try again.');
  }
}
