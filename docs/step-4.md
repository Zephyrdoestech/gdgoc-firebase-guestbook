# Step 4: Protect the messages

**Time:** about 5 minutes

## Goal

Make Firestore check every request. A hidden delete button is not security because someone can send a request without using the page.

## Part A: Add the rules file

At the project root, create or replace `firestore.rules` with:

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

There is deliberately no `allow update` rule. Firestore denies any operation that is not explicitly allowed.

## Part B: Publish the rules in Firebase Console

1. Open your project in [Firebase Console](https://console.firebase.google.com/).
2. Open **Firestore Database**.
3. Select the **Rules** tab.
4. Select all the sample rules shown in the editor and replace them with the contents of your local `firestore.rules` file.
5. Select **Publish** and wait for the success message.

The local file does not protect a database until it has been published. This guide deploys rules from the Console; the Hosting command in step 5 does not publish Firestore rules.

## Part C: Understand each permission

- **Read:** a visitor must be signed in. This covers reading one message or listing the collection.
- **Create:** the visitor must be signed in, the document must contain exactly the expected fields, the UID must match, the text must be 1 to 280 characters, and the timestamp must be server time.
- **Delete:** the visitor must be signed in and the existing document's UID must match.
- **Update:** no rule allows it, so it is denied.

`request.resource.data` is the new document being created. `resource.data` is the document already stored in Firestore. Rules use `request.auth.uid` as the signed-in person's Firebase UID.

## Checkpoint

1. Refresh the guestbook and sign in. Your messages should load.
2. Post a new note. It should save and appear in the list.
3. With a second account, confirm you can read the first person's message but cannot delete it.
4. Sign out. The page should no longer read messages.

If you get `permission-denied`, check that you published the rules to the same Firebase project as the values in `.env`.
