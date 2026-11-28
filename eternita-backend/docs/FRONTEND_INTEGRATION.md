# Eternita frontend integration contract

This document describes the current backend implementation, not a proposed
contract. Timestamps shown below are JSON-serialized values; IDs and dates are
examples/placeholders. `POST` routes use Nest's default success status `201`,
`GET` routes `200`, `PATCH` routes `200`, and `DELETE` routes `200`, unless
otherwise stated.

## Base URLs

The backend listens on `PORT` (default `3000`). There is no production API
hostname configured in this repository.

| Client | Base URL |
| --- | --- |
| Expo web on the same computer as backend | `http://localhost:3000` |
| Android emulator | `http://10.0.2.2:3000` |
| Physical device on the same Wi-Fi | `http://<backend-computer-LAN-IP>:3000` |
| Production | `<deployment HTTPS URL; not configured here>` |

On a physical phone, use the backend computer's LAN IPv4 address, not
`localhost`, and ensure the host firewall permits port 3000. Expo web runs in
a browser and needs CORS; native Expo networking does not use browser CORS.

## Firebase client authentication

The repository has Firebase Admin configuration but no Firebase Web client
configuration. Obtain the Firebase client values from Firebase Console →
Project settings → Your apps → Web app. Firebase JS SDK setup normally needs
`apiKey`, `authDomain`, `projectId`, and `appId`, plus `messagingSenderId` and
`storageBucket` if supplied by the project's Web app config. These are client
configuration values, not Admin credentials. Enable the selected Firebase
Authentication provider in the Firebase project.

Sign in/create the Firebase Auth user using the frontend Firebase SDK. For an
authenticated Firebase user obtain an ID token with:

```ts
const token = await user.getIdToken();
```

For every protected backend request send exactly:

```http
Authorization: Bearer <Firebase ID token>
```

The backend verifies the ID token and treats the verified token UID as the
request identity. Never use a client-provided UID as proof of identity. Missing
or invalid tokens are normalized by the guard to HTTP 401:

```json
{ "message": "Unauthorized", "statusCode": 401 }
```

## Routes and response/error contracts

All routes below are relative to the base URL. Except where marked public,
authentication is required with the bearer header above. The only modeled
roles are `owner` and `recipient`, but not every controller explicitly checks
the profile role; authorization behavior is stated per route.

For Nest exceptions constructed with a string message, the standard JSON
shape is `{ "message": "...", "error": "...", "statusCode": N }`. The
`error` value is the corresponding Nest label (for example `Forbidden`,
`Not Found`, `Conflict`). The custom Zod pipe instead returns
`{ "message": "Invalid request data", "errors": { ...fieldErrors } }` with
HTTP 400. Some business denials intentionally return HTTP 200/201 JSON values
rather than HTTP errors; those are called out below.

### Authentication, invitation, and people

#### `POST /auth/register-owner`

- **Authentication:** Public; no bearer token.
- **Allowed role:** New owner only. This route always creates role `owner`.
- **Request fields:** `email` string, valid email, max 254; `password` string,
  length 6–128; `displayName` string, trimmed, non-empty, max 100. No other
  DTO fields are declared; global validation rejects non-whitelisted fields.
- **Example:**

```json
{ "email": "owner@example.com", "password": "Password123!", "displayName": "Owner Name" }
```

- **Success:** 201

```json
{ "uid": "<firebase-uid>", "role": "owner", "name": "Owner Name", "handle": "owner_example.com" }
```

- **Errors:** 400 invalid DTO → `{ "message": ["<validator message>"], "error": "Bad Request", "statusCode": 400 }`; Firebase invalid email/weak password → `{ "message": "The email or password is invalid.", "error": "Bad Request", "statusCode": 400 }`; duplicate email → `{ "message": "An account with this email already exists.", "error": "Conflict", "statusCode": 409 }`. Unexpected Firebase/config errors are not normalized by this controller.
- **Authorization:** Public by design because a new user cannot have an ID token. The endpoint validates DTO fields before execution via the global `ValidationPipe`.

#### `GET /auth/me`

- **Authentication:** Required; bearer token.
- **Request:** No body/query/params.
- **Allowed roles:** Any authenticated profile.
- **Success:** 200; profile exists:

```json
{ "uid": "<verified-uid>", "role": "owner", "name": "Owner Name", "handle": "owner_example.com", "settings": { "reminderTime": "20:00", "autoLockMinutes": 5, "darkMode": false } }
```

Fields reflect the saved profile and can vary by role/profile. If no profile:
`{ "error": "Register an Alaala profile first" }` (still HTTP 200).
- **Errors:** 401 token missing/invalid as above; Firestore failures are not mapped to a route-specific error.
- **Authorization:** UID is read from the verified token and only that profile path is fetched.

#### `POST /invites`

- **Authentication:** Required; bearer token.
- **Allowed role:** The implementation checks authentication but does not verify the profile's role is `owner`.
- **Required body fields:** `handle` and `name`, both intended strings. There is no runtime DTO validation on this inline TypeScript type; no explicit optional fields.
- **Example:** `{ "handle": "beneficiary_handle", "name": "Beneficiary Name" }`
- **Success:** 201

```json
{ "inviteId": "<invite-id>", "code": "<six-character-code>", "handle": "beneficiary_handle", "name": "Beneficiary Name", "expiresAt": "<JSON date>" }
```

- **Errors:** 401 for missing/invalid token; malformed/missing fields do not have an explicitly defined contract and may fail later during persistence.
- **Authorization:** `ownerUid` is taken from verified request UID. Invitation expires seven days after creation. The route has no role check; this is a contract/security gap to resolve separately, not changed here.

#### `POST /auth/join`

- **Authentication:** Required; bearer token (the new Firebase user must already be signed in).
- **Allowed role:** Authenticated user without an existing `users/{uid}` profile; created profile role is `recipient`.
- **Required body fields:** `code`, `name`, both intended strings. There is no runtime DTO validation. No explicit optional fields.
- **Example:** `{ "code": "ABC123", "name": "Beneficiary Name" }`
- **Success:** 201

```json
{ "uid": "<verified-uid>", "role": "recipient", "ownerUid": "<inviting-owner-uid>", "name": "Beneficiary Name", "handle": "<invite-handle>" }
```

- **Business failures:** Returned as JSON with HTTP 201, not exceptions: `{ "error": "Invalid or already used invitation code" }`, `{ "error": "Invitation expired" }`, or `{ "error": "This account already has an Alaala profile" }`.
- **Other errors:** 401 for token failure. Body field errors are not given a controlled validation response.
- **Authorization:** User identity comes from verified token; invite is transactionally marked used. Invitee cannot choose `ownerUid` in body.

#### `GET /people`

- **Authentication:** Required; bearer token.
- **Request:** No body/query/params.
- **Allowed role:** Any authenticated UID; it returns profiles whose `ownerUid` equals that UID.
- **Success:** 200

```json
{ "people": [{ "uid": "<recipient-uid>", "role": "recipient", "ownerUid": "<verified-owner-uid>", "name": "Beneficiary Name", "handle": "beneficiary_handle" }] }
```

- **Errors:** 401 for token failure; Firestore failures are not mapped.
- **Authorization:** Uses the verified UID as target owner filter. Projection is limited to `uid`, `role`, `ownerUid`, `name`, and `handle`.

### Entries

All `/entries` endpoints require bearer auth. Role/profile is not separately
checked; owner identity for owner CRUD/list routes is always the verified UID.

#### `POST /entries`

- **Authentication/allowed role:** Required; authenticated owner profile is the intended actor. Service writes under verified UID.
- **Required fields:** `title` string 1–200; `originalText` string 1–20,000; `journal` string 1–100; `entryDate` string matching `YYYY-MM-DD`; `entryTime` string matching `HH:mm`; `mood` integer 1–5.
- **Optional fields/defaults:** `releaseDate` optional `YYYY-MM-DD`; `people` and `tags` arrays of strings matching `^[a-z][a-z0-9_]{0,30}$`, default `[]`; `isFavorite` boolean default false (service stores false at creation); `isDraft` boolean default true; `writingMode` enum `verbatim | lightfix | review`, default `verbatim`. Zod object currently strips unknown keys (it is not `.strict()`).
- **Example:**

```json
{
  "title": "A memory", "originalText": "The original entry.", "journal": "Personal",
  "entryDate": "2026-11-28", "entryTime": "14:30", "mood": 4,
  "people": [], "tags": [], "isDraft": true, "writingMode": "verbatim"
}
```

- **Success:** 201, stored document shape:

```json
{
  "entryId": "<generated-id>", "ownerUid": "<verified-uid>", "title": "A memory",
  "originalText": "The original entry.", "journal": "Personal", "entryDate": "2026-11-28",
  "entryTime": "14:30", "mood": 4, "people": [], "tags": [], "isFavorite": false,
  "isDraft": true, "writingMode": "verbatim", "finalText": "The original entry.",
  "isHidden": false, "currentVersion": 1, "previousHash": "GENESIS", "entryHash": "GENESIS",
  "createdAt": "<JSON date>", "updatedAt": "<JSON date>"
}
```

When created with `isDraft:false`, response also has `publishedAt` and `sequence`; hash fields are computed. Server timestamps are JSON serialized dates.
- **Errors:** 400 Zod failure → `{ "message": "Invalid request data", "errors": { "<field>": ["<Zod message>"] } }`; 401 token failure; other persistence errors are not normalized here.
- **Authorization:** Owner UID cannot be supplied in body; backend uses verified request UID.

#### `GET /entries`

- **Authentication/allowed role:** Required; any authenticated profile is queried at `users/{verifiedUid}/entries`.
- **Request fields:** None.
- **Success:** 200 array; each item is `{ "entryId": "<id>", ...all stored entry fields }`. Query returns `isHidden == false` entries ordered by `createdAt` descending. Owner listing includes original/final content and stored internal fields.
- **Errors:** 401 token failure; Firestore errors not route-mapped.
- **Authorization:** Only entries under authenticated UID; it does not accept `ownerUid`.

#### `GET /entries/:entryId`

- **Authentication:** Required; bearer token.
- **Path:** `entryId` string.
- **Optional query:** `ownerUid` string (target owner; defaults to authenticated UID); `access` string `existence | summary | full` (controller default `full`). There is no runtime validation that query `access` is one of the declared TypeScript union values.
- **Example:** `/entries/entry123?ownerUid=ownerUid&access=summary`
- **Success:** 200. Owner/full response: `{ "accessGranted": true, "title": "...", "content": "...", "createdAt": "<JSON date>" }`; existence: `{ "accessGranted": true, "exists": true }`; summary: `{ "accessGranted": true, "summary": "..." }`.
- **Safe denials:** 200 `{ "accessGranted": false, "message": "Entry not available." }` or `{ "accessGranted": false, "message": "Entry is not available yet." }`; policy evaluator may supply a different refusal message.
- **Errors:** 401 missing/invalid token. Service does not return 404 for missing/inaccessible entries; it returns the safe refusal above. Unexpected evaluation failures may propagate as 500.
- **Authorization:** Owner may access own entry. Other users require active/released legacy grant and policy permission. Hidden and unreleased entries are refused for recipients; existence/summary/full controls returned fields. `ownerUid` selects target resource only, never proves identity.

#### `PATCH /entries/:entryId`

- **Authentication/allowed role:** Required; only owner UID (verified UID) can edit.
- **Body:** Partial `POST /entries` schema; all fields optional, but any supplied field uses the same validation and enum rules. Empty object is schema-valid. Unknown fields are stripped by Zod.
- **Success:** 200 `{ "entryId": "<id>", "currentVersion": 2, "updatedAt": "<JSON date>" }`.
- **Errors:** 400 Zod error shape above; 401 token failure; 403 `{ "message": "Only the owner can edit an entry.", "error": "Forbidden", "statusCode": 403 }`; 404 `{ "message": "Entry not found.", "error": "Not Found", "statusCode": 404 }`; 409 published edit `{ "message": "Published entries cannot be edited because that would invalidate the hash chain.", "error": "Conflict", "statusCode": 409 }`.
- **Authorization:** Controller passes verified UID as both requester and owner; published entries cannot be edited.

#### `POST /entries/:entryId/publish`

- **Authentication/allowed role:** Required; owner only.
- **Body:** None.
- **Success:** 201 `{ "entryId": "<id>", "previousHash": "<hash>", "entryHash": "<hash>", "sequence": 1, "publishedAt": "<JSON date>" }`.
- **Errors:** 401; 403 `{ "message": "Only the owner can publish an entry.", "error": "Forbidden", "statusCode": 403 }`; 404 `{ "message": "Draft not found.", "error": "Not Found", "statusCode": 404 }`.
- **Authorization:** Uses verified UID; only that owner's draft is publishable.

#### `PATCH /entries/:entryId/favorite`

- **Authentication/allowed role:** Required; owner only.
- **Required body:** `{ "isFavorite": boolean }`. Inline body type has no route-specific validator; invalid/missing values may be persisted as given.
- **Success:** 200 `{ "entryId": "<id>", "isFavorite": true }`.
- **Errors:** 401; 403 `{ "message": "Only the owner can favorite an entry.", "error": "Forbidden", "statusCode": 403 }`; 404 `{ "message": "Entry not found.", "error": "Not Found", "statusCode": 404 }`.
- **Authorization:** Controller supplies verified UID as requester/owner.

#### `DELETE /entries/:entryId`

- **Authentication/allowed role:** Required; owner only.
- **Body:** None. This is a soft-hide operation, not a Firestore delete.
- **Success:** 200 `{ "entryId": "<id>", "isHidden": true }`.
- **Errors:** 401; 403 `{ "message": "Only the owner can hide an entry.", "error": "Forbidden", "statusCode": 403 }`; 404 `{ "message": "Entry not found.", "error": "Not Found", "statusCode": 404 }`.
- **Authorization:** Uses verified UID.

#### `GET /entries/:entryId/versions`

- **Authentication/allowed role:** Required; endpoint queries versions only under authenticated UID.
- **Request fields:** Path `entryId`; no body/query.
- **Success:** 200 array of `{ "versionId": "<version-id>", "entryId": "<id>", "version": 1, "content": "...", "previousHash": "...", "entryHash": "...", "createdAt": "<JSON date>" }` (fields vary with stored version data).
- **Errors:** 401; Firestore errors are not mapped.
- **Authorization:** Only versions at `users/{verifiedUid}/versions/{entryId}/versions` are queried.

### Policies

#### `POST /policies`

- **Authentication/allowed role:** Required; policy is created under verified UID. No separate role lookup is made.
- **Body:** Required `policyText` string, trimmed, 1–100,000 chars; unknown Zod object fields are stripped.
- **Example:** `{ "policyText": "protocol ..." }`
- **Success:** 201 `{ "policyId": "<id>", "ownerUid": "<verified-uid>", "policyText": "...", "compiledFacts": ["..."], "version": 1, "status": "active" }`.
- **Errors:** 400 custom Zod error shape; 401; 409 if owner has death trigger `{ "message": "Policies cannot be changed after the death trigger.", "error": "Conflict", "statusCode": 409 }`. Policy parser/compiler errors are plain errors and are not given a controlled 4xx response by this controller.
- **Authorization:** Profile/target UID comes only from token.

#### `GET /policies/active`

- **Authentication:** Required.
- **Request:** No body/query.
- **Success:** 200 active policy object `{ "policyId": "<id>", ...policyDocumentFields }`, or `null` if none.
- **Errors:** 401; Firestore errors not route-mapped.
- **Authorization:** Reads active policy under verified UID.

#### `POST /policies/:policyId/freeze`

- **Authentication/allowed role:** Required; operates on policy under verified UID.
- **Body:** None; path `policyId` string.
- **Success:** 201 `{ "policyId": "<id>", "status": "frozen" }`.
- **Errors:** 401; 404 `{ "message": "Policy not found", "error": "Not Found", "statusCode": 404 }`.
- **Authorization:** Uses verified UID for policy document path; no caller-supplied owner selector.

### Legacy requests and death reports

#### `POST /legacy/request`

- **Authentication:** Required; beneficiary/requester is verified UID. No explicit profile-role check.
- **Body:** Required target `ownerUid` string by convention, but there is no runtime DTO validation. No other fields are used.
- **Example:** `{ "ownerUid": "<target-owner-uid>" }`
- **Success:** 201 safe result:

```json
{
  "requestId": "<id>", "status": "pending", "decision": null,
  "decisionAt": null, "activatedAt": null, "revokedAt": null,
  "createdAt": { "_seconds": 0, "_nanoseconds": 0 },
  "updatedAt": { "_seconds": 0, "_nanoseconds": 0 }
}
```

Timestamp values are populated at runtime; sample numeric values are illustrative.
- **Errors:** 400 self-request `{ "message": "A user cannot request legacy access to their own diary.", "error": "Bad Request", "statusCode": 400 }`; 401; 409 duplicate `{ "message": "An active or pending legacy request already exists.", "error": "Conflict", "statusCode": 409 }`.
- **Authorization:** requester identity never comes from body; only owner target does.

#### `GET /legacy/status/:ownerUid`

- **Authentication:** Required.
- **Path:** `ownerUid` is target owner.
- **Success:** 200 same safe request fields as above for this authenticated requester, or `{ "status": "not_requested" }`.
- **Errors:** 401; Firestore errors not route-mapped.
- **Authorization:** Query filters by verified requester UID; does not return another requester's record.

#### Owner-controlled request transitions

Applies to `POST /legacy/requests/:requestId/approve`, `/deny`, `/activate`,
and `/revoke`.

- **Authentication:** Required; owner must match request document `ownerUid`.
- **Request:** Path `requestId`; no body fields are accepted/used.
- **Success:** 201 safe result with `requestId`, next `status`, `decision`, `decisionAt`, `activatedAt`, `revokedAt`, `createdAt`, `updatedAt` (same shape as request result).
- **Authorization/state:** approve pending→approved; deny pending→denied; activate approved→active; revoke approved/active/released→revoked.
- **Errors:** 401; 403 `{ "message": "You are not authorized to change this legacy request.", "error": "Forbidden", "statusCode": 403 }`; 404 `{ "message": "Legacy request not found.", "error": "Not Found", "statusCode": 404 }`; invalid transition 409 with exact message `Cannot transition legacy request from <current-status> to <next-status>.`, standard Conflict JSON shape.

#### `POST /legacy/requests/:requestId/cancel`

- **Authentication:** Required; requester must match request `requesterUid`.
- **Request:** Path `requestId`; no body fields.
- **Success:** 201 safe request result; pending→cancelled.
- **Errors:** 401, 403, 404, 409 with the same error shapes/messages as above; invalid transition message reports target `cancelled`.
- **Authorization:** verified UID must be the requester; owner cannot cancel another's request.

#### `POST /legacy/death-reports`

- **Authentication:** Required; eligible beneficiary/requester must have an active or released grant. No explicit role DTO validation.
- **Body:** `{ "ownerUid": "<target-owner-uid>" }`; inline body type only, no runtime validation.
- **Success:** 201 `{ "reportId": "<id>", "status": "pending", "confirmAfter": { "_seconds": 0, "_nanoseconds": 0 } }` (timestamps reflect runtime).
- **Errors:** 401; 403 self-report `{ "message": "The owner cannot submit a death report for themselves.", "error": "Forbidden", "statusCode": 403 }`; 403 ineligible `{ "message": "An active legacy grant is required to submit a death report.", "error": "Forbidden", "statusCode": 403 }`; 409 already deceased `{ "message": "This owner is already marked deceased.", "error": "Conflict", "statusCode": 409 }`; 409 duplicate `{ "message": "An active death report already exists for this beneficiary.", "error": "Conflict", "statusCode": 409 }`.
- **Authorization:** submitter identity comes from verified UID. Confirmation is backend scheduled; no client confirmation route is exposed.

### AI

#### `POST /ai/ask`

- **Authentication:** Required; bearer token.
- **Allowed users:** Owner can ask about own records; another user requires an active/released legacy grant and policy permission.
- **Required fields:** `ownerUid` non-empty trimmed string; `question` non-empty trimmed string, max 4,000 chars.
- **Optional:** `promptCategory` trimmed string max 100 chars.
- **Unexpected fields:** Rejected by strict Zod schema.
- **Example:** `{ "ownerUid": "<owner-uid>", "question": "What memories mention our trip?", "promptCategory": "reflection" }`
- **Success:** 201 (Nest POST default):

```json
{
  "answer": "<answer>", "status": "success", "error": null,
  "citations": ["<citation>"], "selectedEntryIds": ["<entry-id>"],
  "accessLevels": { "<entry-id>": "full" }
}
```

- **Business denial:** 201 with `status:"denied"`, safe `answer`, `error:{code:"NO_ACTIVE_LEGACY_GRANT"|"NO_PERMITTED_ENTRIES",message:"I cannot answer because no permitted records are available."}`, and empty citations/IDs/accessLevels.
- **AI/runtime failure:** 201 with `answer:"I cannot answer this request right now."`, `status:"error"`, `error:{code:"<service-code-or-AI_BACKEND_ERROR>",message:"The AI service could not complete the request."}`, and empty arrays/object.
- **Errors:** 400 custom Zod JSON `{ "message": "Invalid request data", "errors": { ... } }`; 401; 404 unknown/non-owner target `{ "message": "Owner profile not found.", "error": "Not Found", "statusCode": 404 }`.
- **Authorization/filtering:** owner UID is target selection, not proof of identity. Backend checks existing owner profile, active/released legacy status for recipients, policy, hidden/release/access rules; raw load is limited to 50 entries and selected context to 20.

### Health

#### `GET /health/database`

- **Authentication:** Public.
- **Request:** None.
- **Success:** 200 `{ "status": "ok", "database": "reachable" }` after reading only `health/connection`.
- **Errors:** If Firestore access throws, no route-specific mapping exists; Nest returns its standard 500 response.
- **Authorization:** No write operation is performed by this endpoint.

## CORS

`src/main.ts` does not currently enable CORS. Browser Expo web calls from a
different origin may fail preflight/browser CORS checks. Configure CORS in the
backend for exact origins used by the frontend:

- the actual local Expo web origin (check browser address bar; often
  `http://localhost:8081`, but the port can vary);
- the deployed frontend HTTPS origin.

Use explicit origins, not wildcard `*`, for production bearer-token requests.
Native Android/iOS apps do not require browser CORS permission.

## Environment variables

### Frontend

The backend repo has no frontend and prescribes no framework-specific variable
names. Frontend needs an environment-specific public API base URL and the
Firebase Web app config (`apiKey`, `authDomain`, `projectId`, `appId`, and
optional `messagingSenderId`/`storageBucket`). Prefix variables with the
framework's public prefix (for Expo, commonly `EXPO_PUBLIC_`).

### Backend

See [`.env.example`](../.env.example). Variables read by current backend code:

| Variable | Meaning |
| --- | --- |
| `PORT` | Listen port; default `3000`. |
| `FIREBASE_PROJECT_ID` | Optional Firebase project ID. |
| `FIREBASE_KEY_PATH` | Optional path to server-side Admin service-account JSON. If unset, Admin uses Application Default Credentials. |
| `GOOGLE_APPLICATION_CREDENTIALS` | Standard ADC credential file path, when using ADC. Never share that file with frontend. |
| `FIRESTORE_EMULATOR_HOST` | Firestore emulator host/port, generally injected by Firebase Emulator tooling. |
| `GEMINI_API_KEY` | Server-only Gemini API credential. |
| `DEATH_REPORT_CONFIRMATION_DELAY_MINUTES` | Death report delay in minutes; defaults to `2`. |

## Never expose to the frontend

Never bundle or share Firebase Admin service-account JSON/private keys, ADC
credential files, database credentials, `.env` values containing secrets,
Gemini API keys, or other server-only credentials. Never log or hardcode
Firebase ID tokens or user passwords. Firebase Web app config is client
configuration; it is not a substitute for and must not contain Admin
credentials.

## Contract gaps identified

1. No production API hostname or Firebase Web app configuration is checked in.
2. CORS is currently not configured.
3. `POST /invites`, `/auth/join`, `/legacy/request`, `/legacy/death-reports`,
   and `PATCH /entries/:entryId/favorite` use inline body types without runtime
   validation; their required fields are conventions rather than enforced DTO
   schemas. `/entries/:entryId` query `access` is also not runtime-validated.
4. `POST /invites` checks authentication but does not check owner role.
5. Several expected business failures are returned as HTTP 200/201 JSON
   `{error:...}` or `{accessGranted:false,...}` instead of 4xx errors.
6. Policy parser/compiler errors do not have a controller-level controlled
   4xx contract.
7. Global validation errors (class-validator) and custom Zod errors have
   different JSON formats.
