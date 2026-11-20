# Step 5: Publish with Firebase Hosting

**Time:** about 7 minutes

## Goal

Create a production build of the guestbook and publish it to a public Firebase Hosting address.

## Part A: Install and sign in to the Firebase CLI

The Firebase CLI is a terminal tool for working with your Firebase project. Install it once:

```sh
npm install -g firebase-tools
```

Then sign in:

```sh
firebase login
```

A browser window opens. Sign in with the Google account that can access your Firebase project, then return to the terminal.

## Part B: Select your Firebase project for Hosting

From the project folder, run:

```sh
firebase init hosting
```

Answer the prompts:

1. Select **Use an existing project**.
2. Choose the Firebase project you created earlier.
3. Enter `dist` for the public directory. Vite creates this folder when it builds the site.
4. Answer **No** to configuring as a single-page app. This guestbook has no client-side routes.
5. If asked to set up automatic GitHub builds, choose **No** for this workshop.
6. Do not overwrite `index.html` if prompted. The project already has its own page.

On macOS, Linux, and Windows, the commands are the same. If Firebase CLI is not found after installing, close and reopen the terminal, then try again.

## Part C: Check the Hosting configuration

Open `firebase.json` in the project root. It should contain:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "cleanUrls": true
  }
}
```

The `public` setting tells Firebase which folder to upload. Do not change it to `src` or the project root.

## Part D: Build and deploy

Make sure your local `.env` has the correct values for this Firebase project. Then run:

```sh
npm install
npm run build
firebase deploy --only hosting
```

`npm run build` creates the `dist` folder. The deploy command uploads that folder to Firebase Hosting. The `--only hosting` option deploys the website only. Firestore rules were published separately in step 4.

When deployment finishes, Firebase prints a **Hosting URL**, usually ending with `web.app`. Open that URL and try signing in. Add the deployed hostname under **Authentication → Settings → Authorized domains** if Google sign-in reports an unauthorized domain.

## Checkpoint

- `npm run build` finishes without an error.
- Firebase reports that Hosting deployed successfully.
- The Hosting URL opens the guestbook.
- Google sign-in works on the deployed address.

To publish future changes, run `npm run build` and then `firebase deploy --only hosting` again.
