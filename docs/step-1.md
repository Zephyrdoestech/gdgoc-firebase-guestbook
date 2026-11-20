# Step 1: Setup

## Goal

Run the guestbook locally with Vite and load Firebase configuration from environment variables.

## Code to add

Install the dependencies and create `.env` from `.env.example`. In `src/firebase.js`, initialize Firebase using `import.meta.env.VITE_FIREBASE_*` values. Do not place real values in source code or commit `.env`.

## Expected result

`npm run dev` opens the styled guestbook. Firebase initializes using your local project settings.
