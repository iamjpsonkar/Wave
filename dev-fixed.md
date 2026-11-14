# Wave — Development Fix Log

> Branch: `main`  
> Updated: 2026-11-14  
> Purpose: record development fixes and code-level changes independently from the QA registers.

## 2026-11-14 — Cross-tab recovery draft provenance

### Problem identified
When a document had an unsaved recovery draft from another browser tab, opening the same document in a second tab could show a generic recovery confirmation. The draft was preserved per tab by the existing WAVE-042 isolation work, but the user was not told which tab owned the candidate draft.

### Changes made
- `src/draftJournal.ts`
  - Added `isCurrentTabDraft()` to identify whether a recovery record belongs to the current browser tab's session-scoped draft identity.
  - Kept existing per-tab write and clear behavior intact.
- `src/App.tsx`
  - Recovery confirmation now distinguishes a draft from **this tab** versus **another browser tab**.
  - The recovery content remains user-confirmed; it is not silently applied.
- `tests/e2e/workspace.spec.ts`
  - Added a cross-tab recovery scenario.
  - The scenario checks that the confirmation identifies the other tab and that declining the draft preserves the originating tab's record.

### Commits
| Change | Commit |
|---|---|
| Expose draft tab ownership | `dfe9f2f142f362cc29ee02b6a0f38a104bd74f11` |
| Identify cross-tab recovery source | `4c945049301ffc73e9059f89299c5a269152d897` |
| Add cross-tab recovery regression test | `2f697f7cc632022e89d5e9c08acd7a2961b0019d` |
| Fix recovery draft TypeScript shape | `3fcea5ca05f1bda3894262cc94a9999a6340a0ab` |
| Correct newline literals in the E2E assertions | `09021ed224f739fd66325bb8f6cc8f1bcca5b142` |

### Current status
- Existing nine browser scenarios passed in the first run of the new suite.
- The new tenth scenario initially failed because its expected test string contained literal backslash-n characters rather than newline characters. This was a test-fixture assertion defect, not evidence of a product failure.
- The test was corrected in commit `09021ed224f739fd66325bb8f6cc8f1bcca5b142`.
- Final CI for that corrected commit is tracked in [dev-build.md](./dev-build.md). Do not classify this change as fully CI-verified until that run succeeds.

### Remaining limitations
- IndexedDB is asynchronous; a process kill before a draft transaction commits can still lose the latest edit.
- Native folder picker permission prompts/revocation, external filesystem fault injection, comprehensive accessibility checks, and actual process termination remain outside current automated coverage.
