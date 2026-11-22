# Eternita

Eternita (Alaala) is a privacy-controlled personal AI diary. The owner can write diary entries, create privacy policies, and choose what information trusted people may access. The backend verifies Firebase identities, applies Prolog-based access rules, and sends only authorized diary context to Gemini.

## Team Members

1. ARIANNE EVASCO
2. LEA MARIE GOZARIN
3. LYZA GWEN GUATNO
4. LOVELY MONTAÑO

## Repository Structure

```text
Eternita/
├── .gitignore
├── README.md
├── docs/
│   ├── ai-design-note.md
│   └── ai-use-log.md
├── eternita-backend/
│   ├── docs/
│   │   └── grammar/
│   │       └── policy-grammar.md
│   ├── prolog/
│   │   └── access-rules.pl
│   ├── scripts/
│   ├── src/
│   │   ├── account/
│   │   ├── ai/
│   │   ├── auth/
│   │   ├── common/
│   │   ├── config/
│   │   ├── diary/
│   │   ├── health/
│   │   ├── legacy/
│   │   ├── people/
│   │   └── policy/
│   ├── test/
│   ├── package.json
│   └── tsconfig.json
├── eternita-frontend/
│   ├── assets/
│   ├── src/
│   │   ├── api/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   │   ├── account/
│   │   │   ├── diary/
│   │   │   └── people/
│   │   └── screens/
│   │       ├── asker/
│   │       └── owner/
│   ├── app.json
│   ├── package.json
│   └── tsconfig.json
└── Test_Plan/
    ├── Access_Test_Cases.md
    ├── AI_Use_Logs.md
    ├── Resources_And_References.md
    ├── Test_Data.json
    ├── Test_Execution_Log.md
    └── Test_Plan.md
```

| Folder | Purpose |
| --- | --- |
| `docs/` | Shared AI design and usage notes |
| `eternita-backend/` | NestJS API, Prolog access rules, and backend tests |
| `eternita-frontend/` | Expo and React Native app for web and mobile |
| `Test_Plan/` | Test cases, test data, execution logs, and references |

## Branching Convention

Use short-lived branches for work. Merge completed work into `main` through a pull request.

| Branch                        | Purpose                                   |
| ----------------------------- | ----------------------------------------- |
| `main`                        | Stable, integrated version of the project |
| `develop`                     | Integration branch for completed features |
| `feature/<short-description>` | New feature work                          |
| `fix/<short-description>`     | Bug fixes                                 |
| `docs/<short-description>`    | Documentation changes                     |
| `test/<short-description>`    | Test improvements                         |

Examples:

```text
feature/policy-compiler
feature/prolog-access-evaluator
fix/hash-chain-integrity
docs/add-uml-diagrams
test/add-policy-compiler-tests
```

Do not commit directly to `main`. Create a branch, commit your work, push it, and open a pull request for review.

## Commit Message Convention

Use this format:

```text
<type>: <short description>
```

| Type       | Use it for                                   |
| ---------- | -------------------------------------------- |
| `feat`     | A new feature                                |
| `fix`      | A bug fix                                    |
| `docs`     | Documentation changes                        |
| `test`     | Adding or improving tests                    |
| `refactor` | Code restructuring without changing behavior |
| `chore`    | Maintenance, dependencies, or configuration  |

Examples:

```text
feat: add policy compiler
feat: add Prolog access evaluator
fix: validate diary entry dates
docs: add repository workflow
test: add policy compiler tests
chore: update backend dependencies
```

## Backend Development

The backend is built with Node.js, TypeScript, NestJS, Firebase Admin SDK, Firestore, SWI-Prolog, and Gemini.

### Requirements

- Node.js 22 or newer
- npm
- SWI-Prolog
- Firebase project with Authentication and Firestore enabled
- Firebase service-account key
- Gemini API key

### Backend setup

From the repository root:

```bash
cd eternita-backend
npm install
```

Create a `.env` file using `.env.example` as a guide. Never commit `.env`, Firebase service-account keys, API keys, or ID tokens.

### Run the backend

```bash
npm run start:dev
```

The backend should run at:

```text
http://localhost:3000
```

### Run tests

```bash
npm run build
npm test -- --runInBand
```

## Security Rules

- The mobile app must not access Firestore directly.
- All Firestore access must go through the backend.
- The backend verifies Firebase ID tokens before processing requests.
- The policy compiler turns owner privacy policies into Prolog facts.
- Prolog decides whether a viewer is allowed to access a topic.
- Access is denied by default.
- A matching denial overrides an allow rule.
- Diary entries with any denied topic must not be sent to Gemini.

## Project Documentation

Shared project notes are stored in `docs/`:

- `docs/ai-design-note.md` — AI design and usage note
- `docs/ai-use-log.md` — AI usage log

Test planning files are stored in `Test_Plan/`:

- `Test_Plan/Test_Plan.md` — Test plan
- `Test_Plan/Access_Test_Cases.md` — Access-control test cases
- `Test_Plan/Test_Data.json` — Test data
- `Test_Plan/Test_Execution_Log.md` — Test execution log
- `Test_Plan/Resources_And_References.md` — Test resources and references
- `Test_Plan/AI_Use_Logs.md` — AI use logs

## Frontend Development

The frontend is a React Native app built with Expo and TypeScript. It runs on Android, iOS, and the web. Expo Router uses files in `eternita-frontend/src/app/` for navigation.

### What the frontend does

The frontend displays screens and collects user input. The current app follows the opening Eternita prototype flow:

1. Start at the welcome screen and select **Get Started**.
2. Enter a username, email, and password in the registration screen.
3. Confirm the email using the demo inbox preview. No email is sent.
4. Continue to the placeholder sign-in screen and enter any username and password.
5. Use the face-scan preview, then choose the Owner or Asker home area.
6. The Owner and Asker pages are empty placeholders with navigation between them.

This flow is frontend-only. It does not create an account, send email, check credentials, use the camera, or call the backend. The preview buttons on the sign-in screen also open either home area directly. Real authentication and backend features are separate future work and should be coordinated with the backend developer.

### Start the frontend

From the repository root:

```bash
cd eternita-frontend
npm install
npm start
```

In the Expo terminal, press `w` to open the web app, or scan the QR code with Expo Go to open it on a mobile device. You can also run the web version directly with:

```bash
npm run web
```

### Frontend structure

| Path | Purpose |
| --- | --- |
| `eternita-frontend/src/app/` | Expo Router routes and app navigation |
| `eternita-frontend/src/screens/` | Welcome, registration, demo verification, sign-in, face preview, and home layouts |
| `eternita-frontend/src/components/` | Shared buttons and frame layout |
| `eternita-frontend/src/features/` | Frontend API functions grouped by feature |
| `eternita-frontend/src/api/` | Shared backend request client |

When adding a screen, put its layout in `src/screens/` and connect it through `src/app/`. Do not connect this scaffold flow to the backend unless that work is separately agreed and coordinated with the backend developer. Keep credentials and private keys out of frontend source code.

## Important Files

Do not commit or share these files:

```text
.env
firebase/serviceAccountKey.json
*.pem
ID tokens
API keys
```

## Documentation

Project documentation is stored in the `docs/` folder:

- `docs/uml/` — Use case, sequence, and class diagrams
- `docs/requirements/` — Finalized project requirements
- `docs/architecture/` — System and backend architecture

Project reports are stored in the `reports/` folder:

- `reports/progress-reports/`
- `reports/testing-reports/`
