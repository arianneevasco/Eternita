# Presentation Implementation Status

Inspection of the current NestJS source, controllers, services, DTOs, guards, Firestore rules, environment configuration and tests. This report is based on the presentation checklist only, not an ERD. Statuses describe backend behavior present in this repository.

## Presentation feature checklist

| # | Feature | Status | Evidence / gap |
|---:|---|---|---|
| 1 | Owner registration and profile | PARTIALLY IMPLEMENTED | `POST /auth/register-owner` provisions Firebase Auth and `users/{uid}`; `GET /auth/me` reads profile. No profile update route. |
| 2 | Firebase Authentication and ID-token verification | IMPLEMENTED | `AuthGuard` verifies Firebase bearer ID tokens through Firebase Admin and attaches verified UID. |
| 3 | Owner invitations | IMPLEMENTED | `POST /invites` creates seven-day invite. Inline body type only; no runtime validation. |
| 4 | Beneficiary joining | IMPLEMENTED | `POST /auth/join` consumes pending invite transactionally and creates associated profile. The backend role is currently `recipient`. |
| 5 | Trusted people list | PARTIALLY IMPLEMENTED | `GET /people` lists profiles with `ownerUid` equal to authenticated UID. No update/removal management. |
| 6 | Diary entry creation | IMPLEMENTED | `POST /entries`, Zod validation, defaults, Firestore transaction. |
| 7 | Diary entry listing | IMPLEMENTED | `GET /entries`, authenticated owner; non-hidden newest-first. |
| 8 | Single entry retrieval | IMPLEMENTED | `GET /entries/:entryId`, owner or gated cross-user access. Query validation for `access` is missing. |
| 9 | Entry editing | IMPLEMENTED | `PATCH /entries/:entryId`; owner only; published entries rejected; draft snapshot written. |
| 10 | Entry publishing | IMPLEMENTED | `POST /entries/:entryId/publish`; transaction assigns sequence and hash metadata. |
| 11 | Entry favorites | IMPLEMENTED | `PATCH /entries/:entryId/favorite`; inline request type lacks runtime validation. |
| 12 | Entry deletion | PARTIALLY IMPLEMENTED | `DELETE /entries/:entryId` marks `isHidden: true`; it does not physically delete. |
| 13 | Entry version history | PARTIALLY IMPLEMENTED | Draft edits write snapshots to versions subcollection; `GET /entries/:entryId/versions`. No published-entry edit history because published edits are prohibited. |
| 14 | Entry drafts | IMPLEMENTED | `isDraft` default true; publishing is separate. |
| 15 | Multiple journals | PARTIALLY IMPLEMENTED | Entry has required `journal` string. No journal entity, list/filter/management routes. |
| 16 | Owner policy creation | IMPLEMENTED | `POST /policies`, parses/compiles policy and supersedes previous active policy. |
| 17 | Active policy retrieval | IMPLEMENTED | `GET /policies/active`. |
| 18 | Policy freeze | IMPLEMENTED | `POST /policies/:policyId/freeze`; death-confirmation flow also freezes active policy. |
| 19 | Legacy access request | IMPLEMENTED | `POST /legacy/request`; transactional duplicate check and pending request. |
| 20 | Legacy request approval, denial, activation, revocation, cancellation | IMPLEMENTED | Five status-transition routes; service verifies actor and allowed prior state. |
| 21 | Legacy status | IMPLEMENTED | `GET /legacy/status/:ownerUid`. |
| 22 | Death reports and delayed automatic confirmation | PARTIALLY IMPLEMENTED | `POST /legacy/death-reports`; configurable confirmation delay, automatic confirmation path, transactional freeze/release. Not external identity verification. |
| 23 | AI question answering | IMPLEMENTED | `POST /ai/ask` uses Gemini; safe body on backend error. Requires server-side Gemini configuration. |
| 24 | AI policy enforcement | IMPLEMENTED | Candidate entries are gated through legacy grant, release date, hidden state, and policy evaluation before prompt construction. |
| 25 | AI citations | IMPLEMENTED | Citation service adds citations for selected permitted records; response also includes citation array. |
| 26 | Safe refusal for unauthorized access | IMPLEMENTED | Entry access returns `accessGranted:false`; AI returns denied answer if no permitted entries. Evaluation fails closed. |
| 27 | Activity and audit logging | PARTIALLY IMPLEMENTED | Registration/death events in `activity`; AI use logs in `aiUseLogs`. No activity query API and not all lifecycle events logged. |
| 28 | Firestore security rules | IMPLEMENTED | Owner-only profile/entry read, nested version owner reads, client writes denied, all unspecified paths default-denied. Admin SDK bypasses rules, so backend authorization remains essential. |
| 29 | Unit, Firestore-rules, integration emulator tests | PARTIALLY IMPLEMENTED | Jest suites, rules emulator suite, selected integration emulator suite exist. Latest command outcomes below. |
| 30 | Speech-to-text | NOT IMPLEMENTED | No transcription route/provider. |
| 31 | AI writing modes: verbatim, light fix, review | PARTIALLY IMPLEMENTED | Entry `writingMode` enum and text processing pipeline functions/tests exist. No corresponding dedicated writing-assistance controller route found. |
| 32 | Weekly summaries | NOT IMPLEMENTED | No generation or retrieval route. |
| 33 | Monthly summaries | NOT IMPLEMENTED | No generation or retrieval route. |
| 34 | Life-story summary | NOT IMPLEMENTED | No summary API. |
| 35 | On This Day | NOT IMPLEMENTED | No date-match API. |
| 36 | Mood calendar and analytics | PARTIALLY IMPLEMENTED | Entry stores mood integer 1–5. No aggregation/calendar endpoints. |
| 37 | Notifications and reminders | PARTIALLY IMPLEMENTED | Profile settings include `reminderTime`; no scheduler, delivery or notification API. |
| 38 | Life-story builder | NOT IMPLEMENTED | No builder workflow/API. |
| 39 | Future messages | FUTURE SCOPE | No backend storage/API. |
| 40 | Bucket list | FUTURE SCOPE | No backend storage/API. |
| 41 | Final wishes | PARTIALLY IMPLEMENTED | `LetterOfWishes` model and policy parser support letter release text, but no complete persisted CRUD route/workflow. |
| 42 | Memory album | FUTURE SCOPE | No album implementation. |
| 43 | Face recognition login | NOT IMPLEMENTED | Authentication uses Firebase ID token; no face recognition. |
| 44 | Auto-lock | PARTIALLY IMPLEMENTED | Profile defaults contain `autoLockMinutes: 5`; no backend enforcement route. Likely client concern. |
| 45 | Constellation visuals | FUTURE SCOPE | No star/constellation API or representation. |
| 46 | Emotion symbols | FUTURE SCOPE | Mood number exists; no symbol mapping API. |
| 47 | Media attachments | NOT IMPLEMENTED | No upload, storage, attachment metadata, or media route found. |

No feature was labeled REMOVED FROM SCOPE: repository evidence did not establish an explicit removal decision.

## Implemented and partial API contracts

Unless noted, protected routes require `Authorization: Bearer <Firebase ID token>`. JSON dates/times are strings on input; Firestore `Date`/Timestamp response values serialize through the server JSON serializer. Nest default error responses are `{ "statusCode": n, "message": "...", "error": "..." }`; validation or service-specific results may differ as noted. Exact error JSON for all backend and provider failures is not fully normalized.

### Account and people

| Route | Request and validation | Success response | Errors / storage / tests |
|---|---|---|---|
| `POST /auth/register-owner` (public) | `{email,password,displayName}`. Email valid, max 254; password 6–128; displayName trimmed, nonempty, max 100. | HTTP 201 `{uid,role:"owner",name,handle}`. | 400 invalid email/password or validation; 409 duplicate email. Firebase auth + `users/{uid}` and `users/{uid}/activity/{id}`. `people-integration.test.ts`. |
| `GET /auth/me` | No body. Auth required. | HTTP 200 `{uid,role,name,handle,settings}`. | Missing profile currently returns HTTP-success `{error:"Register an Alaala profile first"}`. `users/{uid}`. People integration. |
| `POST /invites` | `{handle,name}`; AuthGuard. No runtime field validation. | HTTP 201 `{inviteId,code,handle,name,expiresAt}`. Invite expires in seven days. | Invalid/missing fields are not consistently normalized. `invites/{inviteId}`. People integration; rules tests. |
| `POST /auth/join` | `{code,name}`; AuthGuard. No runtime DTO validation. | HTTP 201 `{uid,role:"recipient",ownerUid,name,handle}`. | Invalid/used/expired invite and existing profile return inline `{error:"..."}` (often HTTP 200); creates `users/{uid}`, updates invite. People integration; rules tests. |
| `GET /people` | No body. AuthGuard. | HTTP 200 `{people:[{uid,role,ownerUid,name,handle}]}`. | Firestore query on `users` where `ownerUid` matches caller. People integration. |

### Diary

Create schema (`POST /entries`) and edit schema (`PATCH /entries/:entryId`) use Zod:

| Field | Create | Edit | Constraint/default |
|---|---|---|---|
| `title` | required | optional | string 1–200 |
| `originalText` | required | optional | string 1–20,000 |
| `journal` | required | optional | string 1–100 |
| `entryDate` | required | optional | `YYYY-MM-DD` regex |
| `entryTime` | required | optional | `HH:mm` regex |
| `releaseDate` | optional | optional | `YYYY-MM-DD` regex |
| `mood` | required | optional | integer 1–5 |
| `people`, `tags` | optional | optional | array of `^[a-z][a-z0-9_]{0,30}$`, default `[]` on create |
| `isFavorite` | optional | optional | boolean, default false; create service stores false |
| `isDraft` | optional | optional | boolean, default true |
| `writingMode` | optional | optional | `verbatim`, `lightfix`, `review`; default `verbatim` |

| Route | Request | Success response | Errors / storage / tests |
|---|---|---|---|
| `POST /entries` | Required create schema above. AuthGuard. | HTTP 201 entry document: `entryId,ownerUid,title,originalText,journal,entryDate,entryTime,releaseDate?,mood,people,tags,isFavorite,isDraft,writingMode,finalText,isHidden,currentVersion,previousHash,entryHash,createdAt,updatedAt`; published create also `publishedAt,sequence`. | Zod 400 `{message:"Invalid request data",errors:{field:[messages]}}`; auth 401. `users/{uid}/entries/{entryId}`; published creates update user `lastSeq,lastHash`. Entry/hash tests. |
| `GET /entries` | No body/query. AuthGuard. | HTTP 200 array of `{entryId,...storedFields}`, own visible entries ordered `createdAt` descending. | Auth 401. `users/{uid}/entries`. Entry tests. |
| `GET /entries/:entryId?ownerUid=&access=` | Optional `ownerUid`; `access` defaults `full`, intended values `existence|summary|full`, not runtime validated. | Owner: stored document `{entryId,...fields}`. Cross-user: existence `{accessGranted:true,exists:true}`; summary `{accessGranted:true,summary}`; full `{accessGranted:true,title,content,createdAt}`. | Not-found/denial may return HTTP-success `{accessGranted:false,message}`; guarded by legacy state, hidden/release checks, policy. Entries path. Policy access integration tests. |
| `PATCH /entries/:entryId` | Any subset of create fields (Zod partial). AuthGuard. | HTTP 200 `{entryId,currentVersion,updatedAt}`. | 400 schema; 403 non-owner; 404 missing; 409 published entry `{message:"Published entries cannot be edited because that would invalidate the hash chain.",error:"Conflict",statusCode:409}`. Creates snapshot in `users/{uid}/versions/{entryId}/versions/{versionId}`. Entry/hash tests. |
| `POST /entries/:entryId/publish` | No body. AuthGuard. | HTTP 201 `{entryId,previousHash,entryHash,sequence,publishedAt}`. | 403 non-owner; 404 draft not found. Entry path and user sequence/hash. Hash chain integration. |
| `PATCH /entries/:entryId/favorite` | `{isFavorite:boolean}` inline type; no runtime validator. | HTTP 200 `{entryId,isFavorite}`. | 403 non-owner, 404 missing; malformed values not consistently validated. Entry path. Entry tests. |
| `DELETE /entries/:entryId` | No body. AuthGuard. | HTTP 200 `{entryId,isHidden:true}`. | 403 non-owner, 404 missing. Soft hide in entry path. Entry tests. |
| `GET /entries/:entryId/versions` | No body. AuthGuard. | HTTP 200 array of `{versionId,entryId,version,content,previousHash,entryHash,createdAt}`. | Uses caller UID path, so owner-scoped. Nested versions path above. Hash/version tests. |

### Policies and legacy lifecycle

| Route | Request | Success response | Errors / storage / tests |
|---|---|---|---|
| `POST /policies` | `{policyText}` trimmed, length 1–100000, Zod strict schema. | HTTP 201 `{policyId,ownerUid,policyText,compiledFacts,version:1,status:"active"}`. | Syntax errors from parser; 409 when owner deceased. Supersedes active policies transactionally. `users/{uid}/policies/{policyId}`; policy/parser/compiler/evaluator tests. |
| `GET /policies/active` | No body. | HTTP 200 stored policy object with `policyId` and document fields, or `null`. | AuthGuard; path `users/{uid}/policies`. Policy tests. |
| `POST /policies/:policyId/freeze` | No body. | HTTP 201 `{policyId,status:"frozen"}`. | 404 `{message:"Policy not found",error:"Not Found",statusCode:404}`. Policy path. Legacy lifecycle tests. |
| `POST /legacy/request` | `{ownerUid}` inline body, no DTO validation. | HTTP 201 safe request fields: `requestId,status,decision,decisionAt,activatedAt,revokedAt,createdAt,updatedAt`. | Self-request 400; duplicate 409. `users/{ownerUid}/legacyRequests/{requestId}`. Legacy integration/lifecycle/auth tests. |
| `GET /legacy/status/:ownerUid` | No body. | HTTP 200 safe request fields above or `{status:"not_requested"}`. | AuthGuard. Same path. Legacy tests. |
| `POST /legacy/requests/:requestId/approve` | No body. | HTTP 201 safe request result; status `approved`. | 403 wrong actor; 404 missing; 409 invalid transition. Same request path. Legacy tests. |
| `POST /legacy/requests/:requestId/deny` | No body. | HTTP 201 safe result; status `denied`. | Same error envelope/codes as approve. Legacy tests. |
| `POST /legacy/requests/:requestId/activate` | No body. | HTTP 201 safe result; status `active`. | Requires approved state; same transition errors. Legacy tests. |
| `POST /legacy/requests/:requestId/revoke` | No body. | HTTP 201 safe result; status `revoked`. | Requires approved/active/released state; same transition errors. Legacy tests. |
| `POST /legacy/requests/:requestId/cancel` | No body. | HTTP 201 safe result; status `cancelled`. | Requester-only, pending-only; same transition errors. Legacy tests. |
| `POST /legacy/death-reports` | `{ownerUid}` inline body, AuthGuard. | HTTP 201 service result with report/status fields. Exact fields are determined by `DeathVerificationService`; report is stored with delayed confirmation state. | Business validation/eligibility errors from service; response contract is not represented by a DTO. `users/{ownerUid}/deathReports/{reportId}`, policy and request transaction updates, activity event. Death-report integration tests. |

### AI, health, auth, and non-HTTP paths

`POST /ai/ask` has strict Zod request `{ownerUid,question,promptCategory?}`; ownerUid and question are trimmed nonempty strings, question max 4000, category max 100. Success HTTP 201 body: `{answer,status:"success",error:null,citations:[...],selectedEntryIds:[...],accessLevels:{entryId:level}}`. Denial response has `status:"denied"`, error code `NO_ACTIVE_LEGACY_GRANT` or `NO_PERMITTED_ENTRIES`, safe answer and empty citation/selection structures. Provider failure response is `status:"error"`, generic answer, error code such as `GEMINI_CONFIGURATION_MISSING`, `GEMINI_TIMEOUT`, `GEMINI_RATE_LIMITED`, `GEMINI_INVALID_RESPONSE`, or `GEMINI_PROVIDER_ERROR`, with generic message. Logs at `users/{uid}/aiUseLogs/{logId}`; reads candidates from `users/{ownerUid}/entries`. Tests: `ai/ai-access.test.ts`, `ai/gemini-verification.test.ts`, plus policy access tests.

`GET /health/database` has no auth requirement; it probes `health/connection`. Health tests/config tests exist. `AuthGuard` verifies tokens; invalid/missing bearer usually gives `{message:"Unauthorized",statusCode:401}`.

### Firestore paths and rules for implemented behavior

Paths found in code: `users/{uid}`, `users/{uid}/activity/{id}`, `users/{uid}/entries/{entryId}`, `users/{uid}/versions/{entryId}/versions/{versionId}`, `users/{uid}/policies/{policyId}`, `users/{uid}/legacyRequests/{requestId}`, `users/{uid}/deathReports/{reportId}`, `users/{uid}/aiUseLogs/{logId}`, `invites/{inviteId}`, `health/connection`. Firestore rules allow authenticated owner read of own profile and entries; nested version reads are owner-only. All client writes denied. Other paths and catch-all are denied. Backend Admin SDK operations bypass these rules.

## Gaps, scope guidance, and next tasks

Frontend blockers: CORS is not enabled; invite/join/favorite/legacy/death-report inline body types lack consistent runtime validation; access query enum is unvalidated; business errors sometimes return HTTP success with error fields; no production URL or Firebase Web config exists in repository; current API has no profile update, journal management, media attachment, summary/analytics, notification delivery, or speech transcription.

Do not build future messages, bucket-list workflow, memory album, constellation data, or emotion-symbol APIs until product confirms they are current scope. Keep cross-user access behind backend policy and legacy checks. No business logic, authorization, rules, lifecycle, or tests were altered for this report.

Recommended next three backend tasks:

1. Add stable frontend contracts and runtime validation on the existing inline-body routes, preserving current decisions and lifecycle behavior.
2. Configure explicit CORS origins for Expo web and deployment, after obtaining the actual origin values.
3. Confirm product scope, then implement one current-scope feature vertical slice (for example, profile settings/reminders or mood analytics) with route/DTO/tests.

## Test outcomes

- `npm run build`: passed (`tsc`).
- `npm run start:dev`: Nest application started, all registered routes were mapped, and it reported port 3000; process was stopped after startup check.
- `npm test -- --runInBand --verbose`: passed; 23 suites passed, 1 skipped; 128 tests passed, 5 skipped; 24 suites and 133 tests total.
- `npm run test:firestore`: passed; 1 suite and 5 tests passed. Emulator output included expected permission-denied warnings from rules assertions.
- `npm run test:integration:emulator`: passed; 4 suites and 45 tests passed. Node emitted the experimental VM Modules warning and Google Auth emitted a credentials deprecation warning.
- Swagger smoke check: `/api` returned HTTP 200; `/api-json` returned OpenAPI 3.0.0 with bearer security scheme and discovered routes.
