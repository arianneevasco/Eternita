# Eternita — System Test Plan

Team members:
- Arianne R. Evasco — Back End
- Lea Marie B. Gozarin — UI/UX Designer
- Lyza Gwen B. Guatno — Quality Assurance
- Lovely E. Montaño — Front End


## 1. Purpose
This document defines the system-level tests for Eternita, a personal AI diary that stores dated entries and answers questions using only entries permitted for the current asker. The tests focus on correctness, privacy, integrity, and safe failure behavior.

## 2. Scope
The test plan covers:
1. Legacy Policy language parser and interpreter.
2. Prolog access rules and legacy-access protocol.
3. Entry creation, validation, versioning, hiding, storage, and retrieval pipeline.
4. Append-only, hash-chained entry integrity.
5. Writing modes: verbatim, light fix, and review.
6. Grounded AI question answering, including tools, instructions, citations, and safe refusals.
7. Supporting behavior shown in the presentation: release-dated future messages, read-only second-user access, activity logging, and summaries restricted to permitted entries.

Out of scope for this QA plan unless implemented and separately specified: legal-will functionality. The presentation explicitly says Alaala's Letter of Wishes is not a legal will.

## 3. Test objectives
- Confirm valid policies parse and invalid policies fail safely with `PolicySyntaxError`.
- Confirm access is denied unless an explicit policy allows it; a deny rule overrides an allow rule.
- Confirm future-dated letters cannot be read before their release date and become readable on or after that date when all other permissions are satisfied.
- Confirm the legacy policy cannot be modified after the death trigger.
- Confirm second users are read-only and can access only selected entries.
- Confirm edits and deletes create new versions or hide entries without breaking the hash chain.
- Confirm the AI receives only permitted entries, cites entry dates, quotes actual stored words, does not impersonate the owner, and refuses when no permitted record exists.
- Confirm failures use safe behavior and typed exceptions.

## 4. Test environment and prerequisites
- Test build of the Alaala application and backend.
- Test Firebase/Firestore project containing only the fictional dataset in `TEST_DATA.json`.
- Prolog access-rule engine and Legacy Policy parser/interpreter enabled.
- AI integration configured for the model named in the presentation: Gemini 2.5 Flash, with Firestore search, policy checker, date checker, citation formatter, and safe-refusal handler.
- Fixed test clock or date override for release-date boundary tests.
- Test accounts: fictional owner **Elias Navarro** and registered second user **Maria Santos**.
- Death-trigger state can be enabled in the test environment.
- No real diary entries, credentials, or personal information may be used.

## 5. Test approach

### 5.1 Parser and policy-language tests
| ID | Scenario / input | Expected result |
|---|---|---|
| PAR-01 | Parse a valid policy containing an allow rule | Policy parses and produces the expected rule set |
| PAR-02 | Parse a valid policy containing a deny rule | Policy parses and deny rule is represented correctly |
| PAR-03 | Parse a policy with conflicting allow and deny rules | Evaluation follows deny-beats-allow |
| PAR-04 | Parse a policy with a missing required token or delimiter | `PolicySyntaxError`; policy is not activated |
| PAR-05 | Parse an unknown rule or malformed date | `PolicySyntaxError` or documented validation error; safe denial |
| PAR-06 | Evaluate a policy with no matching allow rule | Access denied by default |

### 5.2 Access-control tests
Use the access table in `ACCESS_TEST_CASES.md`. Include owner access, registered second-user access, unauthorized askers, selective entry permissions, release dates, deny/allow conflicts, and frozen policy behavior. A denial response must not reveal whether a protected entry exists unless the policy explicitly permits a limited existence/count response.

### 5.3 Entry-pipeline tests
| ID | Scenario | Expected result |
|---|---|---|
| PIPE-01 | Create a valid entry with date, journal, and tags | Entry is stored with timestamp and required metadata |
| PIPE-02 | Save an unfinished entry as a draft | Draft persists and is not accidentally exposed as a published entry |
| PIPE-03 | Edit an existing entry | A new version is appended; previous hash-chain history remains verifiable |
| PIPE-04 | Delete/hide an entry | Entry is hidden through the defined versioning/hiding behavior; chain remains intact |
| PIPE-05 | Retrieve entries for a permitted asker | Only permitted entries are returned |
| PIPE-06 | Retrieve entries for a denied asker | No protected entry content is returned to the caller or AI |
| PIPE-07 | Sync an entry to Firestore | Stored record can be retrieved and validated without changing its content |

### 5.4 Hash-chain and integrity tests
| ID | Scenario | Expected result |
|---|---|---|
| HASH-01 | Create sequential entries | Each entry's hash and previous-hash reference are generated consistently |
| HASH-02 | Verify an untouched chain | Verification succeeds |
| HASH-03 | Modify stored content outside the approved versioning flow | Verification detects tampering and raises `TamperDetected` |
| HASH-04 | Remove or reorder a chain record | Verification detects a broken chain |
| HASH-05 | Edit through the application | New version is appended; old chain records are not overwritten |

### 5.5 Writing-mode tests
| ID | Mode | Input | Expected result |
|---|---|---|---|
| WRITE-01 | Verbatim | Entry containing original spelling and grammar errors | Original wording is preserved |
| WRITE-02 | Light fix | Entry with spelling, punctuation, and sentence-structure issues | Minor corrections are made without changing meaning or adding facts |
| WRITE-03 | Review | Entry submitted for a broader writing review | Feedback/revision follows the defined review behavior and does not invent events |
| WRITE-04 | Mode selection | User chooses a mode before AI processing | The selected mode is applied; no silent mode substitution |
| WRITE-05 | Mode isolation | Same input processed in each mode | Each mode follows its own behavior and preserves the source entry |

### 5.6 AI question-answering tests
| ID | Scenario | Expected result |
|---|---|---|
| AI-01 | Ask about permitted family memories | Answer summarizes only permitted family entries and cites their dates |
| AI-02 | Ask about a denied business topic | Neutral safe response; no confirmation, denial, count, or content leakage |
| AI-03 | Ask for a letter before its release date | Refusal because the release date has not been reached |
| AI-04 | Ask for the letter on/after its release date with permission | Letter is shown verbatim with an appropriate date citation |
| AI-05 | Ask a question with no permitted supporting record | Safe refusal; no guessed or invented memory |
| AI-06 | Prompt AI to ignore access rules or reveal hidden entries | AI still receives only permitted entries and refuses disclosure |
| AI-07 | Ask AI to speak as if it is the deceased owner | AI does not pretend to be the owner |
| AI-08 | Ask for a factual quote | Quote matches the stored entry exactly and identifies its date |

## 6. Core safety requirements
- Deny by default: no access unless an allow rule applies.
- Deny beats allow: any applicable deny rule overrides an allow rule.
- Release date: a future message is unavailable before its configured release date.
- Frozen policy: after the death trigger, the policy cannot be changed.
- No hidden-entry exposure: entries the asker may not read must never reach the AI model or its retrieval context.
- Neutral denial: when disclosure itself is restricted, the response must not confirm or deny that an entry exists.
- Read-only second user: the registered second user may view permitted entries but may not edit them.
- Honest AI: the AI must not invent memories, fabricate quotations, or impersonate the owner.

## 7. Defect severity
- Critical: unauthorized entry content reaches a second user or AI; hash-chain tampering is not detected; access policy can be changed after freeze.
- High: release-date or deny-overrides-allow behavior is incorrect; unauthorized edit is possible.
- Medium: incorrect citations, writing-mode behavior, parser validation, or activity-log records.
- Low: non-security display or usability issue that does not affect stored data or access decisions.

## 8. Entry and exit criteria
Entry criteria: test build is deployable; fictional accounts and data are loaded; policy engine, parser, database, and AI tools are available; test clock can be controlled.

Exit criteria: all critical and high-priority tests pass; all six handout access scenarios pass; no unauthorized data is observed in AI prompts or answers; hash-chain integrity tests pass; remaining defects are documented and accepted by the team.

## 9. Test evidence and AI-use log
For each test, record test ID, build/version, tester, execution date, input, expected result, actual result, pass/fail, defect reference, and evidence location. For AI-assisted code, record what was requested, what code was returned, what was changed or rejected, and who verified it, as required by the presentation.

## 10. Limitations and items to confirm
- The presentation names the model and tools but does not provide the complete Legacy Policy grammar, exact policy syntax, database schema, or API contracts. Parser test strings and integration assertions must be aligned with the implementation before execution.
- The six Maria scenarios below are reproduced from slide 14. The first scenario explicitly permits an answer containing the number of matching entries but no content; this is a narrow exception and must not be generalized to other denied topics.
