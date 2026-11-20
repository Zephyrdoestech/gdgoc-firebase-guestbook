# Step 5: Hosting

## Goal

Build and publish the guestbook with Firebase Hosting.

## Code to add

Add `firebase.json` with `dist` as the Hosting public directory and configure clean URLs. Use the Firebase CLI to select your project and deploy. Do not initialize Functions or overwrite the existing `firebase.json` when the CLI asks.

## Expected result

`npm run build` creates a deployable `dist` folder. `firebase deploy` publishes the site and reports its Hosting URL.
