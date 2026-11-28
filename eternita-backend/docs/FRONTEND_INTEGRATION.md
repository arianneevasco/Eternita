# Frontend Integration Guide

This guide describes the current backend contract. Deployment URLs and Firebase Web App values are project-specific and are not stored in this repository.

## Base URLs

| Client | Base URL |
|---|---|
| Local development on the backend computer | `http://localhost:3000` |
| Android emulator | `http://10.0.2.2:3000` |
| Physical device on the same LAN | `http://<backend-computer-LAN-IPv4>:3000` |
| Expo web | `http://localhost:3000` (frontend origin must be in `CORS_ALLOWED_ORIGINS`) |
| Production | `<HTTPS backend URL>` |

Use the configured `PORT` if it differs from 3000. A physical device needs a reachable LAN address and firewall access. Do not use plain HTTP for production.

## Firebase sign-in and API authentication

The frontend needs the Firebase Web App configuration from Firebase Console → Project settings → Your apps → Web app. Set these frontend-only values in the frontend's own environment:

```dotenv
EXPO_PUBLIC_FIREBASE_API_KEY=<web-api-key>
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=<project-id>.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=<project-id>
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=<project-id>.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<sender-id>
EXPO_PUBLIC_FIREBASE_APP_ID=<web-app-id>
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```

Enable the intended Firebase Authentication provider in the project. Sign up or sign in with the Firebase client SDK, then retrieve an ID token:

```ts
const idToken = await auth.currentUser?.getIdToken();
if (!idToken) throw new Error("No signed-in Firebase user");
```

Send it on every protected backend request, refreshing it when Firebase reports expiration:

```http
Authorization: Bearer <Firebase ID token>
Content-Type: application/json
```

`POST /auth/register-owner` creates the Firebase Auth account itself and is public. For normal sign-in, Firebase Auth is the source of the token; do not send a UID as credentials. The backend verifies the token with Firebase Admin and derives the caller UID from the verified token.

## Routes

All routes below require `Authorization: Bearer <token>` except `POST /auth/register-owner` and `GET /health/database`. Nest returns 201 for POST by default and 200 for GET/PATCH/DELETE. Request fields described as strict reject unknown fields.

### Account and people

**`POST /auth/register-owner`** (public), body:

```json
{"email":"owner@example.com","password":"<user-chosen-password>","displayName":"Owner Name"}
```

Email must be valid and at most 254 characters; password is 6–128 characters; displayName is trimmed, non-empty, max 100. Success 201:

```json
{"uid":"<firebase-uid>","role":"owner","name":"Owner Name","handle":"owner"}
```

**`GET /auth/me`**: no body; success is `{uid,role,name,handle,settings}`. If no profile exists, current behavior returns `{ "error": "Register an Alaala profile first" }`.

**`POST /invites`**, body (strict):

```json
{"handle":"maria_santos","name":"Maria Santos"}
```

Both fields are trimmed non-empty strings, max 100. Success 201: `{inviteId,code,handle,name,expiresAt}`. Invite expiry is seven days.

**`POST /auth/join`**, body (strict): `{"code":"ABC123","name":"Maria Santos"}`. Code is trimmed, uppercased, and must contain 6–64 uppercase letters, digits, or hyphens; name is trimmed non-empty, max 100. Success 201: `{uid,role:"recipient",ownerUid,name,handle}`. Invalid/expired/used invites and an existing profile remain business result bodies `{error:"..."}` under the current service contract.

**`GET /people`**: no body; success `{people:[{uid,role,ownerUid,name,handle}]}`.

### Diary entries

`POST /entries` body:

| Field | Requirement |
|---|---|
| `title` | required string, 1–200 chars |
| `originalText` | required string, 1–20,000 chars |
| `journal` | required string, 1–100 chars |
| `entryDate` | required `YYYY-MM-DD` pattern |
| `entryTime` | required `HH:mm` pattern |
| `mood` | required integer 1–5 |
| `releaseDate` | optional `YYYY-MM-DD` pattern |
| `people`, `tags` | optional arrays of strings matching `^[a-z][a-z0-9_]{0,30}$`; default `[]` |
| `isFavorite` | optional boolean |
| `isDraft` | optional boolean; default `true` |
| `writingMode` | optional `verbatim`, `lightfix`, or `review`; default `verbatim` |

Example:

```json
{"title":"A memory","originalText":"The original diary entry.","journal":"Personal","entryDate":"2026-11-28","entryTime":"14:30","mood":4,"people":[],"tags":[],"isDraft":true,"writingMode":"verbatim"}
```

Success 201 returns an entry object with `entryId,ownerUid,title,originalText,journal,entryDate,entryTime,mood,people,tags,isFavorite,isDraft,writingMode,finalText,isHidden,currentVersion,previousHash,entryHash,createdAt,updatedAt`; `releaseDate` is present if supplied. Published entries also have `publishedAt` and `sequence`.

**`GET /entries`**: no body or query; success 200 is an array of `{entryId,...storedEntryFields}`, newest first.

**`GET /entries/:entryId?ownerUid=<uid>&access=<level>`**: `ownerUid` is optional; `access` is optional and defaults to `full`. Its allowed values are `existence`, `summary`, `full`; other values return 400. Owner response is the stored entry plus `entryId`. Cross-user success varies by requested level: existence `{accessGranted:true,exists:true}`, summary `{accessGranted:true,summary}`, full `{accessGranted:true,title,content,createdAt}`. Privacy-preserving denials remain `{accessGranted:false,message}`.

Other entry routes:

| Method and route | Body | Success |
|---|---|---|
| `PATCH /entries/:entryId` | Any subset of create fields, with the same constraints | 200 `{entryId,currentVersion,updatedAt}`; only drafts can be edited |
| `POST /entries/:entryId/publish` | none | 201 `{entryId,previousHash,entryHash,sequence,publishedAt}` |
| `PATCH /entries/:entryId/favorite` | strict `{"isFavorite":true}`; boolean required | 200 `{entryId,isFavorite}` |
| `DELETE /entries/:entryId` | none | 200 `{entryId,isHidden:true}` (soft hide) |
| `GET /entries/:entryId/versions` | none | 200 array of `{versionId,entryId,version,content,previousHash,entryHash,createdAt}` |

### Policies and legacy access

**`POST /policies`** body `{"policyText":"..."}` (trimmed, 1–100000 chars); success 201 `{policyId,ownerUid,policyText,compiledFacts,version,status}`. **`GET /policies/active`** returns the active policy object or `null`. **`POST /policies/:policyId/freeze`** has no body; success 201 `{policyId,status:"frozen"}`.

**`POST /legacy/request`** body (strict) `{"ownerUid":"<uid>"}`; ownerUid is trimmed non-empty, max 128. Success 201 safe request fields: `{requestId,status,decision,decisionAt,activatedAt,revokedAt,createdAt,updatedAt}`. **`GET /legacy/status/:ownerUid`** returns those fields or `{status:"not_requested"}`.

Action routes (no body): `POST /legacy/requests/:requestId/approve`, `/deny`, `/activate`, `/revoke`, `/cancel`. Success 201 returns the safe request fields above. Existing actor and lifecycle rules remain enforced by the backend.

**`POST /legacy/death-reports`** body (strict) `{"ownerUid":"<uid>"}`; same ownerUid validation. Success 201 returns `{reportId,status,confirmAfter}`. Eligibility and delayed-confirmation lifecycle are backend-controlled.

### AI and health

**`POST /ai/ask`** strict body `{ownerUid,question,promptCategory?}`. ownerUid and question are required trimmed non-empty strings; question max 4000, optional promptCategory max 100. Success 201:

```json
{"answer":"...","status":"success","error":null,"citations":["..."],"selectedEntryIds":["..."],"accessLevels":{"<entryId>":"full"}}
```

Denial and provider-failure bodies use `status:"denied"` or `status:"error"`, safe generic answers, and structured error codes; the backend does not expose unauthorized entry content. **`GET /health/database`** is unauthenticated and returns database connectivity status.

## Errors

The global exception filter returns predictable errors as:

```json
{"statusCode":400,"code":"VALIDATION_ERROR","message":"Invalid request data","errors":{"field":["validation detail"]}}
```

Other normalized envelopes are `{statusCode,code,message}`. Stable generic messages:

| Status | Code | Message |
|---:|---|---|
| 400 | `VALIDATION_ERROR` | `Invalid request data.` |
| 401 | `UNAUTHORIZED` | `Missing, invalid, or expired Firebase ID token.` |
| 403 | `FORBIDDEN` | `You are not authorized to perform this action.` |
| 404 | `NOT_FOUND` | `The requested resource was not found.` |
| 409 | `CONFLICT` | `The request conflicts with the current resource state.` |
| 500 | `INTERNAL_SERVER_ERROR` | `Internal server error.` |

Some service-level failures intentionally remain HTTP-success result bodies, including invite errors and cross-user access denials. Consume both HTTP status and response JSON. Do not treat a denial body as access granted.

## CORS and environment

`CORS_ALLOWED_ORIGINS` is a comma-separated exact-origin allowlist. Development defaults in `src/main.ts` are `http://localhost:8081` and `http://localhost:19006`; set the actual Expo web origin if it differs. For example, `http://localhost:8081,http://localhost:19006`. In production, configure explicit HTTPS origins; an unset allowlist permits no browser origins and `*` is rejected. Native Expo requests are not governed by browser CORS.

Backend settings are documented in [`.env.example`](../.env.example): `APP_ENV`, `PORT`, `FIREBASE_PROJECT_ID`, `FIREBASE_KEY_PATH` or `GOOGLE_APPLICATION_CREDENTIALS`, `FIRESTORE_EMULATOR_HOST`, `GEMINI_API_KEY`, `CORS_ALLOWED_ORIGINS`, and `DEATH_REPORT_CONFIRMATION_DELAY_MINUTES`. The frontend uses `EXPO_PUBLIC_API_BASE_URL` and Firebase Web configuration values above.

Never expose Firebase Admin credentials or service-account JSON, Gemini API keys, database credentials, backend `.env` secrets, or Firebase ID tokens. Firebase Web App configuration is client configuration; it is not an Admin credential. `.gitignore` excludes `.env` and service-account JSON filename patterns.

## OpenAPI

Swagger UI: `/api`. OpenAPI JSON: `/api-json`. Both are served by the backend and document bearer authentication.
