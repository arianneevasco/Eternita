# Frontend Integration Guide

This contract is derived from current source. Placeholders below must be replaced with project/deployment values; this repository has no production API URL or Firebase Web app configuration.

## URLs

| Client | Backend base URL |
|---|---|
| Local backend on same computer | `http://localhost:3000` (or configured `PORT`) |
| Android emulator | `http://10.0.2.2:3000` |
| Physical phone/tablet on same LAN | `http://<BACKEND_COMPUTER_LAN_IPV4>:3000` |
| Expo web in development | `http://localhost:3000`; actual browser origin is usually Expo port 8081 or 19006, but CORS is currently not enabled |
| Production | `<PRODUCTION_BACKEND_HTTPS_URL>` (not configured) |

Physical devices and backend computer must be on the same reachable network. Production must use HTTPS.

## Firebase client configuration and sign-in

Obtain these from Firebase Console → Project settings → Your apps → Web app:

```dotenv
EXPO_PUBLIC_FIREBASE_API_KEY=<FIREBASE_WEB_API_KEY>
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=<FIREBASE_AUTH_DOMAIN>
EXPO_PUBLIC_FIREBASE_PROJECT_ID=<FIREBASE_PROJECT_ID>
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=<FIREBASE_STORAGE_BUCKET>
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<FIREBASE_PROJECT_NUMBER>
EXPO_PUBLIC_FIREBASE_APP_ID=<FIREBASE_WEB_APP_ID>
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```

Enable the selected Firebase Authentication provider in the Firebase project. Register/sign in through Firebase client Auth, then obtain a fresh token:

```ts
const idToken = await auth.currentUser?.getIdToken(true);
if (!idToken) throw new Error("No signed-in Firebase user");
```

Send on every protected request:

```http
Authorization: Bearer <Firebase ID token>
Content-Type: application/json
```

The backend verifies the ID token in `AuthGuard` and uses verified UID. Do not send a UID as authentication. Do not fetch protected data directly from Firestore.

## Routes and schemas

All routes except owner registration and health require the bearer token. Nest defaults are generally 201 for POST and 200 for GET/PATCH/DELETE. See each contract below for route-specific response shapes; some business errors are returned as HTTP-success bodies.

### Accounts and people

**`POST /auth/register-owner`** is public. Request:

```json
{"email":"owner@example.com","password":"<USER-CHOSEN-PASSWORD>","displayName":"Owner Name"}
```

Validation: valid email max 254; password string 6–128; trimmed non-empty displayName max 100. HTTP 201 response:

```json
{"uid":"<FIREBASE_UID>","role":"owner","name":"Owner Name","handle":"owner"}
```

Handle is sanitized email local part (lowercase; non `[a-z0-9_]` replaced with `_`; falls back to UID if empty).

**`GET /auth/me`** returns `{uid,role,name,handle,settings}`. If the profile does not exist, current behavior is successful-status `{ "error": "Register an Alaala profile first" }`.

**`POST /invites`** accepts inline `{handle,name}` (no runtime field validation). Returns `{inviteId,code,handle,name,expiresAt}`; invitation lasts seven days.

**`POST /auth/join`** accepts `{code,name}`. Success returns `{uid,role:"recipient",ownerUid,name,handle}`. Invalid/expired/used code or existing profile returns inline `{error:"..."}`; check body as HTTP status may still indicate success.

**`GET /people`** returns `{people:[{uid,role,ownerUid,name,handle}]}` for profiles whose ownerUid is authenticated caller.

### Diary

**`POST /entries`** request:

| Field | Required | Validation/default |
|---|---:|---|
| `title` | yes | string, 1–200 |
| `originalText` | yes | string, 1–20,000 |
| `journal` | yes | string, 1–100 |
| `entryDate` | yes | `YYYY-MM-DD` regex |
| `entryTime` | yes | `HH:mm` regex |
| `mood` | yes | integer 1–5 |
| `releaseDate` | no | `YYYY-MM-DD` regex |
| `people`, `tags` | no | arrays of `^[a-z][a-z0-9_]{0,30}$`; default `[]` |
| `isFavorite` | no | boolean; create service stores false |
| `isDraft` | no | boolean, default true |
| `writingMode` | no | `verbatim`, `lightfix`, or `review`, default `verbatim` |

Example:

```json
{"title":"A memory","originalText":"The original diary entry.","journal":"Personal","entryDate":"2026-11-28","entryTime":"14:30","mood":4,"people":[],"tags":[],"isFavorite":false,"isDraft":true,"writingMode":"verbatim"}
```

HTTP 201 response contains `{entryId,ownerUid,title,originalText,journal,entryDate,entryTime,mood,people,tags,isFavorite,isDraft,writingMode,finalText,isHidden,currentVersion,previousHash,entryHash,createdAt,updatedAt}`; optional releaseDate if supplied. Published entries also include `publishedAt` and `sequence`. Dates serialize as JSON date values.

**`GET /entries`** has no body/query; returns HTTP 200 array of `{entryId,...storedEntryFields}` for owner-visible entries, newest `createdAt` first.

| Route | Request | Success shape |
|---|---|---|
| `GET /entries/:entryId?ownerUid=<uid>&access=existence\|summary\|full` | Query ownerUid optional; access defaults full; enum is not runtime validated. | Owner gets entry document. Cross-user existence: `{accessGranted:true,exists:true}`; summary: `{accessGranted:true,summary}`; full: `{accessGranted:true,title,content,createdAt}`. Denial is `{accessGranted:false,message}`. |
| `PATCH /entries/:entryId` | Partial create schema fields; Zod validates. | `{entryId,currentVersion,updatedAt}`. Only drafts can be edited. |
| `POST /entries/:entryId/publish` | No body. | `{entryId,previousHash,entryHash,sequence,publishedAt}`. |
| `PATCH /entries/:entryId/favorite` | `{isFavorite:boolean}` in TypeScript only; no runtime validator. | `{entryId,isFavorite}`. |
| `DELETE /entries/:entryId` | No body; soft hide. | `{entryId,isHidden:true}`. |
| `GET /entries/:entryId/versions` | No body. | Array `{versionId,entryId,version,content,previousHash,entryHash,createdAt}`. |

### Policies and legacy routes

`POST /policies` accepts `{policyText}` trimmed 1–100000 chars; returns `{policyId,ownerUid,policyText,compiledFacts,version,status}`. `GET /policies/active` returns policy or null. `POST /policies/:policyId/freeze` returns `{policyId,status:"frozen"}`.

`POST /legacy/request` accepts `{ownerUid}` and returns safe request data: `{requestId,status,decision,decisionAt,activatedAt,revokedAt,createdAt,updatedAt}`. `GET /legacy/status/:ownerUid` returns the same or `{status:"not_requested"}`. Action routes are `POST /legacy/requests/:requestId/approve`, `/deny`, `/activate`, `/revoke`, `/cancel`, each no body and returning the safe request shape. Request body has no DTO validation. Service enforces actor and transition rules.

`POST /legacy/death-reports` accepts `{ownerUid}` and returns `{reportId,status,confirmAfter}` on accepted report. Confirmation delay defaults to 2 minutes; background poll runs every second. Eligibility and status failures use Nest error shape. Do not add client assumptions that bypass this lifecycle.

### AI and health

`POST /ai/ask` strict body `{ownerUid,question,promptCategory?}`. Required nonempty trimmed ownerUid/question; question max 4000; optional promptCategory max 100. Response shape:

```json
{"answer":"...","status":"success","error":null,"citations":["..."],"selectedEntryIds":["..."],"accessLevels":{"<entryId>":"full"}}
```

Denials use `status:"denied"`, `error.code` `NO_ACTIVE_LEGACY_GRANT` or `NO_PERMITTED_ENTRIES`, and empty citation/selection/access structures. AI failure uses `status:"error"`, generic answer, `error.code` such as `GEMINI_CONFIGURATION_MISSING`, `GEMINI_TIMEOUT`, `GEMINI_RATE_LIMITED`, `GEMINI_INVALID_RESPONSE`, `GEMINI_PROVIDER_ERROR`, or `AI_BACKEND_ERROR`; public message is `The AI service could not complete the request.` Citations returned by backend should be rendered as-is.

`GET /health/database` is unauthenticated health probe; response reflects database connectivity, not user data.

## Errors and approved messages

Known Nest response formats:

- 400: `{message:[validation strings],error:"Bad Request",statusCode:400}` for class-validator; custom Zod response `{message:"Invalid request data",errors:{field:[messages]}}`.
- 401: `{message:"Unauthorized",statusCode:401}` for missing/invalid/expired token.
- 403/404/409: `{message:"<specific reason>",error:"Forbidden"|"Not Found"|"Conflict",statusCode:n}`.
- 500: `{statusCode:500,message:"Internal server error"}` generally.
- Business failures may instead be HTTP 200/201 result bodies such as `{error:"Invitation expired"}` or `{accessGranted:false,message:"..."}`. Handle both status and JSON fields.

Stable common messages include `An account with this email already exists.`, `The email or password is invalid.`, `Entry not found.`, `Published entries cannot be edited because that would invalidate the hash chain.`, `An active or pending legacy request already exists.`, and `The AI service could not complete the request.` Not all messages are normalized into a stable frontend error-code catalog.

## CORS, environment and secrets

CORS is currently **not configured** (`src/main.ts` does not call `enableCors()`). Thus no allowed-origin list is active and browser Expo web calls from a different origin will be blocked. Configure exact Expo web development origin (commonly `http://localhost:8081` or `http://localhost:19006`, verify the actual URL) and production web origin before web integration. Do not use wildcard origins in production. Native app API requests are not browser CORS requests.

Backend environment values are in [`.env.example`](../.env.example): `PORT`, `FIREBASE_PROJECT_ID`, optional `FIREBASE_KEY_PATH` or `GOOGLE_APPLICATION_CREDENTIALS`, `FIRESTORE_EMULATOR_HOST`, server-only `GEMINI_API_KEY`, and `DEATH_REPORT_CONFIRMATION_DELAY_MINUTES`. Frontend values are `EXPO_PUBLIC_API_BASE_URL` and Firebase Web configuration above. Firebase Web config is client app configuration; it is distinct from Admin credentials.

Never expose in frontend bundles, logs, or source control: Firebase Admin service-account key/private key, service-account JSON, ADC credential file, Gemini API key, database credentials, `.env` secrets, Firebase ID tokens, or user passwords. Root `.gitignore` already ignores `.env`, nested `.env.*` except `.env.example`, and service-account JSON filename patterns.

## OpenAPI / Swagger

Swagger UI is served at `/api`; OpenAPI JSON is served at `/api-json`. The OpenAPI document advertises bearer authentication. Controllers include tags/operation summaries and body/response schemas for primary routes. `RegisterOwnerDto` has `@ApiProperty` metadata. Zod-backed schemas are represented with explicit `@ApiBody` schemas because they are not class DTOs and do not generate `@ApiProperty` metadata automatically. Other inline body routes are documented as current source shapes and remain less strictly described than typed DTO contracts.
