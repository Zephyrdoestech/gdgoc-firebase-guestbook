# Step 4: Protect the messages

**Time:** about 5 minutes

## Goal

Publish Cloud Firestore security rules so the database itself checks every request — allowing signed-in reads, validated note creation, and owner-only deletes. *(Hiding a Delete button in JavaScript is only UI convenience; real security lives in Firestore rules.)*

---

## Part A: Save the rules in your project (`firestore.rules`)

In the **project root** (next to `package.json`), create a new file named `firestore.rules` and paste:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /messages/{messageId} {
      allow read: if request.auth != null;

      allow create: if request.auth != null
        && request.resource.data.keys().hasOnly([
          'text', 'uid', 'displayName', 'photoURL', 'createdAt'
        ])
        && request.resource.data.keys().hasAll([
          'text', 'uid', 'displayName', 'photoURL', 'createdAt'
        ])
        && request.resource.data.uid == request.auth.uid
        && request.resource.data.text is string
        && request.resource.data.text.size() > 0
        && request.resource.data.text.size() <= 280
        && request.resource.data.displayName is string
        && request.resource.data.photoURL is string
        && request.resource.data.createdAt == request.time;

      allow delete: if request.auth != null
        && resource.data.uid == request.auth.uid;
    }
  }
}
```

Save `firestore.rules`.

> **Why keep a local `firestore.rules` file?** Saving it in your repository keeps your rules version-controlled and easy to copy. It does **not** protect your live database until you publish it in Part B below.

---

## Part B: Publish the rules in Firebase Console

1. Open your project in [Firebase Console](https://console.firebase.google.com/).
2. In the left sidebar, open **Build → Firestore Database**.
3. Click the **Rules** tab at the top.
4. Click inside the rules editor, select everything (**`Ctrl+A`** on Windows / **`Cmd+A`** on macOS), and delete the default rules.
5. Copy the entire contents of your local `firestore.rules` file and paste it into the Console editor.
6. Click **Publish** and wait for the confirmation banner.

> **Propagation delay:** Newly published Firestore rules can take **10–60 seconds** to take effect. If you still see a permission error immediately after clicking Publish, wait 30 seconds and refresh your browser.

---

## Part C: Understand each permission

- **Read (`allow read`):** The visitor must be signed in (`request.auth != null`). This covers reading a single note or listening to the whole collection.
- **Create (`allow create`):** The visitor must be signed in, the document must contain **only and all 5** expected fields, `uid` must match the signed-in user (`request.auth.uid`), `text` must be a non-empty string of 1–280 characters, `displayName` and `photoURL` must be strings, and `createdAt` must be Firestore server time (`request.time`).
- **Delete (`allow delete`):** The visitor must be signed in **and** the stored document's `uid` (`resource.data.uid`) must match their own UID (`request.auth.uid`).
- **Update:** Deliberately omitted — Firestore denies any operation that is not explicitly allowed.

---

## Checkpoint (Full End-to-End Test)

1. Refresh `http://localhost:5173` and sign in with Google. The Step 3 permission message should disappear and the wall should load cleanly.
2. Type a short note and click **Post note**.
   - Confirm the status says `Your note was posted.`
   - Confirm your note appears **immediately** without refreshing, complete with your name, profile photo, timestamp, and a **Delete** button.
3. **Test live updates and owner-only delete with a second account:**
   - Open an **Incognito / Private browser window** and go to `http://localhost:5173`.
   - Sign in with a **different** Google account.
   - Confirm you can see the first account's note, with **no Delete button** beside it.
   - Post a note from the second account and watch it appear **live** in the first browser window!
4. Return to your first browser window and click **Delete** on your own note. Confirm it disappears from **both** windows.
5. Click **Sign out** and confirm the notes clear from the screen.

### If something goes wrong

- **Still seeing `permission-denied` after publishing:**
  1. Wait 30–60 seconds and hard-refresh (**`Ctrl+Shift+R`** / **`Cmd+Shift+R`**).
  2. Double-check in Firebase Console that you published rules to the **same Firebase project** whose `projectId` is in your `.env` file.
  3. Confirm you did not leave the default `allow read, write: if false;` block in the **Rules** tab.
- **Reads work, but posting gives `permission-denied`:**
  Check that `postMessage()` in `src/main.js` sends all 5 exact field names (`text`, `uid`, `displayName`, `photoURL`, `createdAt: serverTimestamp()`) and that `text` is 1–280 characters.

Once posting, live updates, and owner-only delete all work, continue to **[Step 5: Publish with Firebase Hosting](step-5.md)**.
