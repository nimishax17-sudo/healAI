# Security Specification: HealAI Firestore

## 1. Data Invariants
- Users can only read and write their own profile document.
- Users can only read, create, and delete their own medical history records.
- Medical history records are immutable after creation (only creation and deletion allowed, no updates to existing records to preserve medical audit trail).
- Root access is default-denied.
- Every write must have a valid `userId` matching the authenticated user.
- Timestamps must be validated against `request.time`.

## 2. The "Dirty Dozen" Payloads (Exploit Attempts)

1.  **Identity Spoofing (User Profile)**: Creating a user document with a different user's UID.
2.  **Identity Spoofing (History)**: Creating a history entry where `userId` does not match `request.auth.uid`.
3.  **Cross-User Read**: Attempting to read another user's history collection.
4.  **Ghost Field Injection**: Adding an `isAdmin` field to the `User` document.
5.  **State Shortcutting (Report)**: Sending a history entry with a type not in the enum (e.g., `type: 'Fake'`).
6.  **Resource Poisoning (Vitals)**: Sending a 1MB string as a blood pressure value.
7.  **Resource Poisoning (History ID)**: Attempting to use a 2000-character string as a document ID.
8.  **Atomic Violation (Timestamp)**: Providing a client-side timestamp that is in the future.
9.  **Unverified User Write**: Attempting a write without `email_verified == true`.
10. **Shadow Profile Read**: Reading a user's PII (email) without being that user.
11. **Malicious Update**: Attempting to change the `userId` of an existing history entry.
12. **Unauthorized Deletion**: Attempting to delete another user's history record.

## 3. Test Runner (Conceptual `firestore.rules.test.ts`)
```typescript
// Conceptual tests
test('should deny unauthenticated write to /users', async () => { ... });
test('should deny user A reading user B history', async () => { ... });
test('should deny creating history with mismatching userId', async () => { ... });
test('should deny updates to history entries', async () => { ... });
test('should enforce server timestamps on User update', async () => { ... });
```
