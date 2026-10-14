# Security Specification & Threat Model

## Data Invariants
1. A Task document must have `userId` strictly matching the authenticated user's `request.auth.uid`. No user can query, read, create, update, or delete any task belonging to another user.
2. The `createdAt` property of a Task is immutable on updates.
3. Path variables (`{taskId}`, `{userId}`) are sanitized with `isValidId()` enforcing alphanumeric and hyphen characters up to 128 bytes.
4. Input fields are strictly bounded: Title is between 1 and 200 characters, description up to 2000 characters, category up to 50 characters, and tags up to 10 entries.
5. In Single-User Mode, the application validates the user email against the authorized owner (`marcomatouschek@gmail.com` or custom owner) to block unauthorized viewers on public endpoints (e.g. GitHub Pages).

## The Dirty Dozen Payloads Handled & Blocked
1. **Unauthenticated Read/Write**: Denied by `isSignedIn()` check.
2. **Cross-Tenant Task Snooping**: Reading another user's taskId is blocked (`existing().userId == request.auth.uid`).
3. **List Query Scraping**: `allow list: if isSignedIn() && resource.data.userId == request.auth.uid;` enforces rule-level document filtering.
4. **Id Impersonation**: Setting `userId` to a target victim's UID on create is blocked (`incoming().userId == request.auth.uid`).
5. **Created Timestamp Tampering**: Modifying `createdAt` during update is blocked (`incoming().createdAt == existing().createdAt`).
6. **Title Bombing (Denial of Wallet)**: Setting title to > 200 characters or empty string is rejected.
7. **Description Exhaustion**: Submitting descriptions > 2000 characters is rejected.
8. **Invalid Priority Injection**: Priority not in `['low', 'medium', 'high', 'urgent']` is rejected.
9. **Category Flooding**: Setting category > 50 characters is rejected.
10. **Tag Array DOS**: Exceeding 10 tags or sending non-string items is rejected.
11. **Path Traversal / Junk ID Injection**: Path variables with illegal symbols or > 128 chars fail `isValidId()`.
12. **Foreign Profile Tampering**: Accessing or writing `/users/{otherUserId}` is strictly blocked (`request.auth.uid == userId`).
