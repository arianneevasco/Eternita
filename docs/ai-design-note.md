# Eternita — AI Design Note

## Overview

Eternta is a personal AI diary that stores daily entries over time and answers questions about the owner, including after the owner is no longer present. Answers are grounded only in permitted entries, include entry dates, and never leak restricted or non-existent records.

## Vault Access Rule

**The AI model never reads the diary vault directly.** Access control is enforced first on the backend before any entry reaches the AI assistant:

- Diary data is stored in Firestore.
- Access rules are evaluated using SWI-Prolog with **deny-by-default** and **deny-beats-allow** semantics, release date checks, and frozen policy enforcement after the death trigger.
- Only entries explicitly permitted for the authenticated user/asker and allowed by policy/release rules are passed through backend tools to the AI.
- If no record is allowed or an asker lacks permission, the system uses a neutral refusal without confirming or denying whether entries exist.

## The Three Parts of Eternita's AI

Eternita's AI assistant combines three parts so that tool access and behavioral rules work together:

1. **Model**
   - **Gemini 2.5 Flash**

2. **Tools**
   - **Firestore search** — retrieves candidate diary entries for authorized queries.
   - **Policy checker** — verifies access rules (Prolog access rules: deny-by-default, deny-beats-allow, release dates, and frozen policy).
   - **Date checker** — checks entry dates and release dates (such as time-gated letters).
   - **Citation formatter** — formats responses with entry dates and quotes from permitted entries.
   - **Safe-refusal handler** — returns a neutral response without confirming or denying records when access is denied or no permitted record exists.

3. **Instructions (First Draft)**
   - **Use only permitted entries:** Base answers strictly on entries allowed by the access check; never use unauthorized entries.
   - **Cite entry dates:** Always cite the dates of the permitted entries used in an answer.
   - **Quote real words:** Quote the owner's actual words when referencing entries.
   - **Never pretend to be the owner:** Speak as the Eternita AI assistant, not as the owner.
   - **Do not guess or invent memories:** Never fabricate, extrapolate, or infer unrecorded facts.
   - **Refuse when no record is allowed:** Give a neutral reply that neither confirms nor denies hidden or non-existent entries.