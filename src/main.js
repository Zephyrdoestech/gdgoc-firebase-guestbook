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
