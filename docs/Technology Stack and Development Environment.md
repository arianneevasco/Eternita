Technology Stack and Development Environment
---

## 1. Purpose

This document records the chosen programming languages, logic engine, AI model, scripting orchestrator, cloud database, media storage, and user interface framework for Eternita, along with the rationale for how each technology fits its assigned programming paradigm and component. It also defines the reproducible local setup and cross-language verification steps required across all team members' machines.

---

## 2. Technology Selections and Paradigm Fit

| Component / Layer | Paradigm | Selected Technology | Rationale & Paradigm Fit |
|---|---|---|---|
| Diary Model | Object-Oriented (OOP) | Python 3.11+ | Provides clear class hierarchies, encapsulation, and inheritance to model core domain entities (`Entry`, `Journal`, `Person`, `Star`, `LegacyItem`) and polymorphic writing modes. |
| Entry Processing Pipeline | Functional Programming | Python 3.11+ | Supports pure functions, immutable data transformations (`dataclasses(frozen=True)`), comprehensions, and composable transformation steps without unintended side effects. |
| Access Rules Engine | Logic / Declarative Programming | SWI-Prolog (`swipl`) | Expresses deny-by-default authorization rules, role relationships (Owner, Trustee, Registered Asker), and release-date constraints declaratively rather than burying security checks in imperative branches. |
| Grounded AI Q&A Engine | Generative AI / Tool-Augmented LLM | Gemini 2.5 Flash (`gemini-2.5-flash`) | Delivers fast, low-latency responses with structured tool/function calling for grounded Q&A. **Note:** Deprecated on Google AI Studio with automatic routing to `gemini-3.5-flash-lite` starting Dec 1, 2026; keep the model ID configurable via environment variables. |
| Q&A Orchestration & Scripting | Scripting / Glue Integration | Python + `janus-swi` + `google-genai` | Bridges the OOP/Functional core, SWI-Prolog rule evaluation, and Gemini tool calls in a single scriptable workflow, ensuring Prolog authorizes every query before any diary content reaches the LLM. |
| Cloud Database & Auth | Persistence / Backend-as-a-Service | Firebase (Cloud Firestore + Firebase Authentication) | Stores diary entries, people, stars, trustees, and release-date records as documents in a managed cloud database, with built-in authentication for the Owner, Trustee, and Registered Asker accounts. Works directly with React Native (Expo) and the Python backend. |
| Media Storage | Cloud Media / CDN | Cloudinary | Stores and serves user-uploaded images (such as the one image per person that becomes a constellation) and resizes them on delivery, keeping binary files out of the database. |
| User Interface | Component-Based UI | React Native (Expo + TypeScript) | Aligns with the existing frontend prototype, providing type-safe screens and state flows for Owner, Trustee, and Registered Asker interactions. |

---

## 3. Architectural & Security Rationale

### Deterministic Security Before LLM Generation

Access control is enforced strictly by SWI-Prolog (deny-by-default) before the Python Q&A script retrieves entries or invokes Gemini. Prompt instructions alone are never relied upon to protect private diary entries.

### Zero Existence Leakage

When SWI-Prolog denies access (or an entry does not exist), the Python orchestrator returns a uniform neutral refusal without revealing whether matching records exist.

### Configurable Model Endpoint

Because `gemini-2.5-flash` routes automatically to `gemini-3.5-flash-lite` starting December 1, 2026, the model identifier is loaded from `.env` (`GEMINI_MODEL`) so the team can update or test models without modifying source code.

### Protected Data Layer (Firebase)

Firestore Security Rules are set to deny all direct client reads and writes of diary data, as a second layer behind the Prolog rules. Diary content is read only by the Python backend through the Firebase Admin SDK, and the service account credentials are never shipped in the mobile app. The app uses only the public Firebase client configuration and Firebase Authentication.

### Controlled Media Access (Cloudinary)

Uploads are signed by the backend so the Cloudinary API secret never reaches the client. Diary-related images are stored as authenticated assets, and the app receives a delivery URL only after Prolog has authorized the request.

---

## 4. Repository Dependency Files

All project dependencies are tracked in version-controlled manifest files in the repository.

### Backend / Logic / AI (`requirements.txt`)

```text
janus-swi>=1.5.0
google-genai>=1.0.0
python-dotenv>=1.0.0
firebase-admin>=6.0.0
cloudinary>=1.40.0
pytest>=8.0.0
```

### Frontend (`package.json`)

Tracks Expo, React Native, TypeScript, and `firebase` (Firebase JS SDK) dependencies in the frontend workspace.

### Environment Variables (`.env.example`)

```bash
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# Firebase (backend only: never commit the service account file or ship it in the mobile app)
FIREBASE_PROJECT_ID=your_firebase_project_id
GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccountKey.json

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret            # backend only, never in the mobile app
```

---

## 5. Reproducible Setup & Cross-Language Smoke Test

Every team member must verify that their local machine can execute a SWI-Prolog rule directly from Python.

### Prerequisites

- Python 3.11+ installed and available on `PATH`.
- SWI-Prolog (`swipl`) installed and available on `PATH`.
- Node.js (LTS) installed for the Expo frontend.
- Access to the team Firebase project and Cloudinary account (credentials shared privately and copied into a local `.env`, which is never committed).

### Verification Files

**`tests/smoke/rules_smoke.pl`**

```prolog
% Deny-by-default sample access rule for environment verification
can_read(asker_alice, public_note).
can_read(_, _) :- fail.
```

**`tests/smoke/smoke_prolog.py`**

```python
import pathlib
import janus_swi as janus

rules_path = pathlib.Path(__file__).with_name("rules_smoke.pl")
janus.consult(str(rules_path))

allowed = janus.query_once("can_read(asker_alice, public_note)")["truth"]
denied = janus.query_once("can_read(asker_alice, private_note)")["truth"]

assert allowed is True, "Expected asker_alice to read public_note"
assert denied is False, "Expected asker_alice to be denied private_note"
print("SUCCESS: Python -> SWI-Prolog smoke test passed.")
```

### Run Command

```bash
pip install -r requirements.txt
python tests/smoke/smoke_prolog.py
```

---
