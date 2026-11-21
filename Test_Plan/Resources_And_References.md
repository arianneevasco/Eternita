# Eternita — Resources and References

The following resources provide official technical documentation for technologies and concepts identified in the Alaala presentation. The presentation is the primary source for the project's intended features and architecture; the links below are supplementary technical references.

## A. Project source

1. `Alaala_Presentation-1 .pptx`. Used as the primary source for the project description, component paradigms, access rules, AI behavior, and six Maria test scenarios (especially slides 10–15).

## B. Official technical documentation

| Resource | Relevance to Eternita | Official link |
|---|---|---|
| Gemini API documentation | Reference for integrating Google's Gemini models and generating AI responses | https://ai.google.dev/gemini-api/docs |
| Gemini 2.5 Flash model/pricing information | Reference for the model named in the presentation; check current model availability and migration notices before implementation | https://ai.google.dev/gemini-api/docs/pricing |
| Firebase documentation | Main documentation portal for Firebase services used by the project | https://firebase.google.com/docs |
| Cloud Firestore documentation | Data storage, collections, documents, queries, and database operations | https://firebase.google.com/docs/firestore |
| Cloud Firestore Security Rules | Guidance for access control and data validation at the database layer | https://firebase.google.com/docs/firestore/security/get-started |
| Firestore security overview | Guidance on securing mobile/web and server-side database access | https://firebase.google.com/docs/firestore/security/overview |
| SWI-Prolog Reference Manual | Reference for Prolog syntax, predicates, execution, and exception handling if SWI-Prolog is the implementation used | https://www.swi-prolog.org/pldoc/doc_for?object=manual |
| Android SpeechRecognizer API | Official Android API reference for speech recognition if the Android platform's native speech recognition is used | https://developer.android.com/reference/android/speech/SpeechRecognizer |
| Firebase AI Logic: audio analysis | Reference for sending audio to Gemini for transcription or analysis, if this is the chosen speech-to-text approach | https://firebase.google.com/docs/ai-logic/analyze-audio |

## C. How these references support the test plan

- Gemini: supports research for AI response integration. The test plan separately verifies grounding, date citations, refusal behavior, and resistance to prompt-injection attempts.
- Firestore: supports the entry storage and retrieval test areas.
- Firestore Security Rules: supports database-level authorization and validation. These rules are not a replacement for Alaala's Prolog policy engine; both layers must be tested according to the actual architecture.
- Prolog: supports the access-rule implementation and parser/interpreter research. The exact Prolog implementation must be confirmed by the development team.
- Speech recognition: supports the speech-to-text feature. The team must confirm whether it uses Android's native API or Gemini/Firebase audio processing before selecting the final implementation-specific test procedure.

## D. Important model/version note

The presentation identifies Gemini 2.5 Flash. Model names, availability, and routing can change. Google's published release notes currently describe a planned change beginning December 1, 2026, for Gemini Developer API requests using Gemini 2.5 Flash. Confirm the model endpoint and behavior actually used by the project at implementation and test time; do not assume that a model name in the presentation guarantees continued availability.

## E. Citation and use note

These links are official vendor or project documentation and are provided as technical references, not as proof that every listed technology has already been implemented.