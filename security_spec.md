# Firestore Security Specification (`balo_xio portfolio`)

## 1. Data Invariants
1. **Private Owner Inbox Isolation**: Only the verified portfolio owner (`request.auth.token.email == 'xamch22@gmail.com'` with `request.auth.token.email_verified == true`) can `get`, `list`, `update`, or `delete` documents in `/commissions/{commissionId}`.
2. **Strict Creation Identity & Recipient Binding**: Any authenticated user with a verified email can `create` a commission submission in `/commissions/{commissionId}` ONLY if `submitterUid == request.auth.uid`, `recipientEmail == 'xamch22@gmail.com'`, `status == 'unread'`, and `createdAt == request.time && updatedAt == request.time`.
3. **Volumetric & Array Boundaries**: Every string field enforces strict `.size()` limits, IDs match `^[a-zA-Z0-9_\-]+$`, and `gameImages` is strictly bounded to `<= 4` items.
4. **Terminal State Locking**: Once a commission reaches `status == 'completed'`, subsequent updates are blocked unless overridden by the verified owner admin.

## 2. The "Dirty Dozen" Payloads
1. **Unauthenticated Read/Write**: `auth == null` attempting `get` or `create` on `/commissions/comm_1` -> `PERMISSION_DENIED`.
2. **Unverified Email Spoofing**: `auth.token.email == 'xamch22@gmail.com'` with `email_verified == false` attempting `list` -> `PERMISSION_DENIED`.
3. **Non-Owner PII Read**: Authenticated user `intruder@gmail.com` attempting `get` or `list` on `/commissions/comm_1` -> `PERMISSION_DENIED`.
4. **Identity Spoofing on Create**: `submitterUid` set to another user's UID -> `PERMISSION_DENIED`.
5. **Shadow / Ghost Field Injection**: Payload containing `isAdmin: true` -> `PERMISSION_DENIED` via `.keys().hasOnly(...)`.
6. **ID Poisoning**: Document ID containing spaces or >128 chars -> `PERMISSION_DENIED` via `isValidId(commissionId)`.
7. **Array Overflow**: `gameImages` containing 5 elements (exceeding limit of 4) -> `PERMISSION_DENIED`.
8. **String Overflow**: `projectDetails` exceeding 3000 characters -> `PERMISSION_DENIED`.
9. **Enum Bypass**: `contractType: 'free-rev-share'` -> `PERMISSION_DENIED`.
10. **Timestamp Forgery**: Client passing past/future `createdAt` not equal to `request.time` -> `PERMISSION_DENIED`.
11. **Immutable Field Mutation**: Updating `submitterUid`, `createdAt`, or `recipientEmail` during `update` -> `PERMISSION_DENIED`.
12. **Value Poisoning on Update**: Updating `status` to a number `123` instead of a valid status string -> `PERMISSION_DENIED`.
