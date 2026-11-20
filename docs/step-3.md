# Step 3: Firestore

## Goal

Post guestbook notes and display new notes as they arrive.

## Code to add

Use the `messages` collection. Each document stores `text`, `uid`, `displayName`, `photoURL`, and `createdAt` (a server timestamp). Use `addDoc` to post, `onSnapshot` to listen for messages ordered newest first, and `deleteDoc` for a delete button shown only on the current user's notes.

## Expected result

Signed-in users can post notes, see changes live, and remove their own notes. The security rules in step 4 enforce ownership on the server.
