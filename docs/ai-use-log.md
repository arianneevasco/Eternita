# Eternita AI-Use Log

This log records how AI tools are used during the Eternita (Alaala) project, what they
produce, what the team changes or rejects, and who verifies the result.

## How to add an entry

Every team member should add an entry whenever AI output informs project work:

1. Add a new row to the table below.
2. Record the prompt or a concise summary of it, and summarize the relevant AI
   response. Do not paste private diary content, credentials, API keys, or other
   sensitive information into this log.
3. Describe what was accepted and changed, or what was rejected and why.
4. Enter the name of the person who checked the resulting work. The verifier
   should be someone who reviewed the result, not just the person who used AI.
5. If the work has not been checked yet, write `Pending` in **Verified by** and
   update it after review.

Keep entries concise but specific enough for another team member to understand
the decision. Add new entries at the bottom; do not overwrite earlier entries.

## Entries

| Date | Team member | AI tool/model | Prompt or request | AI response | Changes made or rejected (and why) | Verified by |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-11-19 | Arianne R. Evasco | AI tool/model | Prompt or request | AI response | Changes made or rejected (and why) | Verified by |
|2026-11-20 | Lovely E. Montaño | Gemini | Guide repository setup for `eternita-frontend`, scaffold the React Native (Expo + TypeScript) folder structure, create placeholder screens (`SignInScreen`, `OwnerHomeScreen`, `AskerHomeScreen`) and Owner/Asker navigation stacks, and draft the initial AI-Use Log and AI Design Note. | Provided the `src/` folder layout (`components`, `navigation`, `screens/owner`, `screens/asker`, `services`, `theme`, `types`), starter screen and navigation code, Expo preview testing steps, and initial templates for the AI-Use Log and AI Design Note. | Accepted the modular frontend layout, separated Owner/Asker navigation flows, and initial documentation drafts; verified screen layouts against UI/UX wireframes and left team rows open for teammates to fill in their own AI usage. | Pending |
| 2026-11-20 | Lovely E. Montaño | GitHub Copilot | Check the `eternita-frontend` folder structure to verify if it aligns with `eternita-backend` and whether both will work properly once connected and merged. | Reviewed the frontend directory layout and contents against the backend folder structure and confirmed compatibility for future API integration and branch merging. | Retained the modular `src/` folder structure and API service setup aligned with the backend conventions; kept environment configuration isolated in `.env.example` pending full endpoint integration. | Pending |
| 2026-11-20 | Lyza Gwen B. Guatno | AI tool/model | Prompt or request | AI response | Changes made or rejected (and why) | Verified by |
| 2026-11-20 | Lea Marie B. Gozarin | AI tool/model | Prompt or request | AI response | Changes made or rejected (and why) | Verified by |