import './style.css';
import { auth } from './firebase.js';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';

const signedOutView = document.querySelector('#signed-out-view');
const signedInView = document.querySelector('#signed-in-view');
const messageInput = document.querySelector('#message-input');
const characterCount = document.querySelector('#character-count');
const statusMessage = document.querySelector('#status-message');

// TODO Step 3: connect Firestore, live messages, posting, and owner-only delete.
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
  statusMessage.textContent = message;
}
