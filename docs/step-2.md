# Step 2: Authentication

## Goal

Let attendees sign in with Google and sign out.

## Code to add

Create a `GoogleAuthProvider`, then use `signInWithPopup` and `signOut`. Observe the current user with `onAuthStateChanged`. Show the sign-in card when signed out; show the profile and message composer when signed in.

## Expected result

Google sign-in changes the page to the signed-in view. Signing out returns to the sign-in card.
