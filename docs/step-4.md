# Step 4: Security rules

## Goal

Protect messages in Firestore even if someone bypasses the interface.

## Code to add

Add `firestore.rules`. Allow reads only to signed-in users. Allow creation only when the document has the expected fields, the message's `uid` matches the signed-in user's UID, the text is 1–280 characters, and `createdAt` is a server timestamp. Allow deletion only when the existing document's `uid` matches that UID. Do not add an update rule.

## Expected result

Signed-in users can read notes, create notes under their own UID, and delete only their notes. Anonymous reads and forged ownership are rejected.
