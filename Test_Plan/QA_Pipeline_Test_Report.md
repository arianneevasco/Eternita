# QA Pipeline Test Report

**Tester:** Lyza Gwen B. Guatno 
**Date:** November 24, 2026  
**Operating System:** Windows (PowerShell)  
**Node.js Version:** `v24.14.0`  
**npm Version:** `11.9.0`  

**Implementation Branch Tested:** `backend`  
**QA Report Branch:** `test-plan`



## 1. Entry Tests

**Command executed:**

```powershell
npx jest test/entry.test.ts --runInBand
```

**Expected Result:** Entry tests should pass.

**Actual Result:**

```text
PASS test/entry.test.ts

Test Suites: 1 passed, 1 total
Tests:       9 passed, 9 total
Snapshots:   0 total
Time:        5.6 s
```

**Status: PASS**

The test output confirms that all nine Entry tests passed. The displayed test cases cover:

- Storing date, text, and tags.
- Describing and summarizing a diary entry.
- Returning false for readability when text is empty.
- Preventing duplicate tags.
- Storing a letter's release date and recipient.
- Describing and summarizing a letter.
- Preventing a letter from being readable before its release date.
- Rejecting an empty recipient.
- Calling common methods on different entry types without type checks.

**Evidence:** `evidence/Pipeline/entry-tests.png`


## 2. Pipeline Tests

**Command executed:**

```powershell
npx jest test/pipeline --runInBand
```

**Expected Result:** Pipeline tests should pass.

**Actual Result:**

```text
PASS test/pipeline/processEntry.test.ts
PASS test/pipeline/createTextDiff.test.ts
PASS test/pipeline/extractNames.test.ts
PASS test/pipeline/extractTopics.test.ts
PASS test/pipeline/correctText.test.ts
PASS test/pipeline/normalizeText.test.ts

Test Suites: 6 passed, 6 total
Tests:       27 passed, 27 total
Snapshots:   0 total
Time:        7.114 s
```

**Status: PASS**

All six pipeline test files passed:

- `normalizeText`
- `extractNames`
- `extractTopics`
- `correctText`
- `createTextDiff`
- `processEntry`

The supplied screenshot confirms the passing test files and aggregate result of 27 passing tests. It does not show every individual assertion for input immutability, deterministic output, invalid input, whitespace-only input, or all text-diff cases; those details are not independently confirmed by the screenshot.

**Evidence:** `evidence/Pipeline/pipeline-tests.png`



## 3. Storage and Hash-Chain Tests

**Command executed:**

```powershell
npx jest test/storage --runInBand
```

**Expected Result:** Storage and hash-chain tests should pass.

**Actual Result:**

```text
PASS test/storage/entryStore.test.ts
PASS test/storage/hashChain.test.ts

Test Suites: 2 passed, 2 total
Tests:       12 passed, 12 total
Snapshots:   0 total
Time:        5.608 s
```

**Status: PASS**

Both storage test files passed:

- `entryStore.test.ts`
- `hashChain.test.ts`

The previously supplied Jest output confirms that both test suites passed, with 12 tests passing in total. The aggregate output does not independently show every assertion for append behavior, previous-hash linking, hash determinism, tamper detection, or unsupported edit/delete operations.

**Evidence:** `evidence/Pipeline/storage-tests.png`



## 4. TypeScript Build Test

**Command executed:**

```powershell
npm run build
```

**Expected Result:** The TypeScript build should complete successfully without compilation errors.

**Actual Result:**

```text
> eternita-backend@1.0.0 build
> tsc

PS C:\Users\Lyza Gwen Guatno\GitHub\Eternita-\eternita-backend>
```

The screenshot shows that the build script invoked the TypeScript compiler (`tsc`). No compilation errors are displayed, and PowerShell returned to the command prompt.

**Status: PASS**

The TypeScript build completed successfully based on the final terminal output supplied.

**Evidence:** `evidence/Pipeline/build-result-incomplete.png`


## 5. Test Summary

| Test Area | Test Suites Passed | Tests Passed | Status |
|---|---:|---:|---|
| Entry | 1 | 9 | PASS |
| Pipeline | 6 | 27 | PASS |
| Storage and Hash Chain | 2 | 12 | PASS |
| TypeScript Build | N/A | N/A | PASS |
| **Total Jest Tests** | **9** | **48** | **PASS** |

**Overall Test Execution:** All 9 Jest test suites and 48 individual tests passed. The TypeScript build also completed successfully.



## 6. Acceptance Criteria

| Acceptance Criterion | Result Based on Supplied Evidence |
|---|---|
| Base `Entry` class and subclasses | Entry test suite passed; inheritance assertion is not individually visible in the screenshot |
| `LetterOfWishes` release date and recipient | Corresponding Entry test is displayed as passed |
| Polymorphic methods | Polymorphism test is displayed as passed |
| Entries store date, text, and tags | Corresponding Entry test is displayed as passed |
| Separate pipeline functions | All six pipeline test files passed |
| Pipeline functions do not modify inputs | Not individually verifiable from the aggregate screenshot |
| Pipeline functions return new values | Not individually verifiable from the aggregate screenshot |
| Same input produces the same output | Not individually verifiable from the aggregate screenshot |
| Empty and whitespace-only text handling | Not individually verifiable from the aggregate screenshot |
| Repeated names/topics and text without names | Not individually verifiable from the aggregate screenshot |
| Invalid input handling | Not individually verifiable from the aggregate screenshot |
| Diff shows unchanged, added, and removed text | Diff test file passed; individual assertions are not visible |
| Storage and hash-chain behavior | Both storage test files passed; individual assertions are not visible |
| TypeScript build succeeds | PASS; compiler completed and PowerShell returned to the prompt |



## 7. Defects Found

**None reported in the supplied test results.**

No failing Jest tests or TypeScript compilation errors were shown in the supplied evidence. This finding is limited to the test execution and evidence recorded in this report; it does not establish that the implementation is free of all defects.



## 8. Final QA Decision

**FINAL RESULT: PASS**

The Entry, Pipeline, and Storage/Hash-chain test commands completed with passing results:

- Entry: 1 test suite passed; 9 tests passed.
- Pipeline: 6 test suites passed; 27 tests passed.
- Storage: 2 test suites passed; 12 tests passed.
- Combined Jest result: 9 test suites passed; 48 tests passed.

The TypeScript build also completed successfully using `npm run build`. The final terminal screenshot shows the TypeScript compiler invocation, no displayed compilation errors, and the returned PowerShell prompt.

Based on the recorded test results and supplied evidence, the tested backend implementation passed the executed QA test suites and build verification.


## Conclusion

The QA testing of the Eternita backend implementation was successfully completed. The Entry, Pipeline, and Storage/Hash-chain test suites achieved a total of 48 passing tests across 9 test suites, with no failing tests reported. The TypeScript build also completed successfully without displaying any compilation errors. Through these tests, the implementation was evaluated based on its functionality, expected behavior, and build requirements. All recorded test results met the expected outcomes, resulting in an overall QA decision of PASS. The test results and supporting screenshots were documented and submitted through the test-plan branch of GitHub for review by the development team.


