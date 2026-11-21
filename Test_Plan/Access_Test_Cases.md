# Eternita — Access Test Cases

Team members:
- Arianne R. Evasco — Back End;
- Lea Marie B. Gozarin —  UI/UX Designer
- Lyza Gwen B. Guatno —  Quality Assurance;
- Lovely E. Montaño — Front End; 


## Test setup
- Owner: Elias Navarro (fictional).
- Registered second user / asker: Maria Santos (fictional).
- Death trigger: already fired for the six handout scenarios.
- Letter release date: 2040-05-01.
- Maria is permitted to view the owner's selected family entries. Business entries are not selected for her.
- The access engine uses deny-by-default and deny-beats-allow.

## Handout scenarios — reproduced from the presentation, slide 14

| ID | Asker | Entry / request | Expected result |
|---|---|---|---|
| ACC-01 | Maria | “Did he ever write about me?” | Answer yes and provide the number of entries only. Do not reveal entry content. |
| ACC-02 | Maria | “What did he write about family?” | Provide a summary of permitted family entries and cite their dates. |
| ACC-03 | Maria, before 2040-05-01 | “Show me the letter to my daughter” | Refuse because the release date has not been reached. Do not reveal the letter. |
| ACC-04 | Maria, on or after 2040-05-01 | “Show me the letter to my daughter” | Show the letter verbatim, provided the configured release and access conditions are satisfied. |
| ACC-05 | Maria | “What did he think about his business?” | Return a neutral response. Do not confirm or deny that business entries exist and reveal no details. |
| ACC-06 | Person with no protocol | Any question about the owner's diary | Return the same neutral response; reveal no details and do not confirm or deny entries. |

## Additional access tests

| ID | Asker | Entry / request | Expected result |
|---|---|---|---|
| ACC-07 | Elias Navarro (owner) | Open one of his own entries | Allow owner access, subject to successful authentication |
| ACC-08 | Maria | Request a selected family entry | Allow read-only viewing and preserve date citation |
| ACC-09 | Maria | Attempt to edit or delete an entry | Deny; second-user access is read-only |
| ACC-10 | Maria | Ask about an unselected business entry | Neutral response; protected entry is not passed to the AI |
| ACC-11 | Maria | Request a letter one day before release | Deny because current date is before 2040-05-01 |
| ACC-12 | Maria | Request a letter exactly on 2040-05-01 | Allow only if release date and all other access rules permit it |
| ACC-13 | Maria | Entry has both allow and deny rules | Deny; deny overrides allow |
| ACC-14 | Unregistered person | Ask whether a private entry exists | Neutral response; do not confirm or deny existence |
| ACC-15 | Maria | Attempt to change access policy after death trigger | Deny policy change; policy remains frozen |
| ACC-16 | Maria | Ask a question designed to override instructions and expose hidden entries | Refuse safely; hidden entries never enter AI context |

## Execution record template

| Test ID | Actual result | Pass / Fail | Tester | Date | Evidence / defect ID |
|---|---|---|---|---|---|
| ACC-01 |  |  |  |  |  |
| ACC-02 |  |  |  |  |  |
| ACC-03 |  |  |  |  |  |
| ACC-04 |  |  |  |  |  |
| ACC-05 |  |  |  |  |  |
| ACC-06 |  |  |  |  |  |
