# Wave — Current Open Bugs

> Repository: https://github.com/iamjpsonkar/Wave  
> Branch: main  
> Source review baseline: application source at `28bb3d34507a0131a946b8652257b17c99a1893e`; documentation reconciliation committed on 2026-11-14.  
> Review date: 2026-11-14  
> Scope: only defects or material reliability/QA gaps that remain in the current implementation.

## Rules

- This is the active bug register. Resolved findings belong in [fixed-bugs.md](./fixed-bugs.md), not here.
- Keep original IDs when a fixed issue regresses; do not create a duplicate ID for the same root cause.
- Add only issues with a current, reproducible or code-supported failure path. Do not add planned features, preferences, or speculative risks as confirmed bugs.
- Record severity, confidence, affected code, exact reproduction, expected/actual behavior, impact, fix direction, and regression coverage.
- Distinguish source review from automated, browser, cross-tab, and fault-injection verification.
- Recheck [fixed-bugs.md](./fixed-bugs.md) during every future QA pass; its scenarios are the regression baseline.

## Current summary

- **2 remaining findings:** WAVE-031 (native picker/filesystem/accessibility/lifecycle QA gap) and WAVE-039 (IndexedDB pre-commit crash window).
- `fixed-bugs.md` retains 50 historical source-verified fixes and regression scenarios; this pass re-read the register but did not execute every historical scenario.
- Current checked-in test definitions: **30 Node tests** and **28 Playwright Chromium E2E scenarios**. The E2E fixture uses OPFS and simulates permission behavior; it does not exercise the native OS picker.
- Historical CI evidence in `dev-build.md` verifies an earlier 10-scenario E2E suite. CI run [43618423075](https://github.com/iamjpsonkar/Wave/actions/runs/43618423075) passed Node tests, typecheck, production build and all 28 Playwright scenarios on the corrected template/test baseline. The subsequent diagram-accessibility patch still requires its own CI run.

---

## WAVE-031 — Native picker permission and browser lifecycle/accessibility coverage remains incomplete

- Priority: **P1** | Confidence: **Confirmed**
- Files: `package.json`, `.github/workflows/ci.yml`, `tests/storage.test.js`

### Problem

The checked-in test files currently define 30 Node storage/concurrency tests plus 23 Playwright Chromium E2E scenarios. The latest inspected CI run for the corrected Markdown/template baseline passed 28 Playwright scenarios; later diagram-accessibility changes still need a separate run. The browser suite uses native Origin Private File System (OPFS) directory handles as a deterministic filesystem fixture and covers workspace creation/autosave, IndexedDB draft recovery after reload, Trash restore, backup restore, root/nested attachments, mobile navigation, simulated permission denial and same-workspace two-tab editing.

The remaining gap is specifically the native user-picked-folder permission prompt and OS/browser permission revocation: the OPFS fixture simulates the File System Access permission contract rather than exercising the real picker lifecycle. External filesystem edits during active operations, comprehensive keyboard/accessibility paths, and actual abrupt browser-process termination also remain untested.

### Impact

The current test source covers simulated permission denial, two-tab editing, and cross-tab draft provenance. It still does not establish behavior for the native picker lifecycle, OS permission revocation, external filesystem races during active operations, full accessibility interactions, or process termination.

### Reproduction / recheck scenario

Recheck the current Playwright suite and add browser-supported tests for the remaining gaps:
1. Exercise the real user-picked-folder permission prompt and permission revocation where the browser runner supports it.
2. Modify a Markdown file externally while Wave is reading, saving, backing up, or restoring it; verify no silent overwrite or inconsistent snapshot.
3. Exercise keyboard-only navigation, focus order, focus restoration, accessible names, and screen-reader semantics.
4. Terminate the browser process during an IndexedDB journal transaction and verify the documented recovery behavior.
5. Keep the existing simulated permission-denial, same-workspace two-tab, autosave, recovery, Trash, backup, attachment, and mobile journeys as regression coverage.

### Expected behavior

CI should retain all 23 current Chromium journeys and add deterministic coverage for the native picker lifecycle, external filesystem changes, accessibility, and browser-process termination when supported.

### Fix direction

Extend the existing Playwright suite with permission/picker integration coverage, external-edit fault injection, accessibility tooling, and lifecycle fault injection. Keep the OPFS fixture for deterministic tests and the Node storage tests as the faster lower-level layer.

### Regression coverage

Keep all 23 current Chromium scenarios in CI. Add native picker prompt/revocation, external filesystem edits during active operations, keyboard/accessibility checks, and browser lifecycle fault injection when supported.

---

## WAVE-039 — Abrupt termination can still occur before the draft journal commits

- Priority: **P1** | Confidence: **High; browser lifecycle dependent**
- Files: `src/App.tsx` — draft autosave and pagehide handling; `src/draftJournal.ts`

### Problem

Wave now starts an IndexedDB journal write directly in the editor input handler instead of waiting for the former 120 ms debounce. It also retries a best-effort write on `visibilitychange` to hidden and `pagehide`, and the UI reports when the recovery-draft transaction has committed.

IndexedDB remains asynchronous. If the browser process is terminated after an input event but before the transaction commits, the latest keystroke can still be lost. `pagehide` and `visibilitychange` are best-effort lifecycle signals, not durability guarantees. A Chromium E2E test now verifies recovery after a page reload once the journal commit has completed; it does not simulate an OS-level process kill.

### Reproduction / recheck scenario

1. Open a document and type a unique marker.
2. Close/reload or terminate the browser immediately, then at controlled intervals after the input handler starts and while the IndexedDB transaction is pending.
3. Reopen the workspace and inspect whether the marker is either persisted to the Markdown file or available as a recovery draft.
4. Repeat under CPU/disk pressure and with multiple rapid edits.

### Expected behavior

Wave must not claim an edit is safely recoverable until the draft journal transaction has committed. The product should make the residual unsaved/recovery state clear, and the strongest practical write-through strategy should minimize the crash window.

### Fix direction

Keep the write in the input-event path, request strict IndexedDB durability, expose pending/committed recovery status, and add controlled transaction-delay and browser termination tests. Do not claim crash-proof durability: even a strict IndexedDB transaction is asynchronous and cannot protect edits if the process is terminated before commit.

### Regression coverage

- Immediate close after typing (currently best-effort only).
- Close during an IndexedDB write transaction.
- Repeated edits where writes complete out of order.
- Recovery after reload after a confirmed journal commit (covered by Playwright).
- Strict IndexedDB transaction durability option (covered by Playwright).
- Actual browser-process termination before commit (not yet automated).



## Follow-up remediation — 2026-11-14

- WAVE-031: added Chromium coverage for permission denial through the File System Access permission contract and concurrent edits from two tabs sharing the same OPFS workspace. The denial contract is simulated; the native picker prompt and OS-level permission revocation are not yet automated. The browser suite source now contains 13 scenarios, including a check that a recovery prompt identifies a draft originating in another tab.
- WAVE-042: the new two-tab scenario exposed that one tab could overwrite or clear another tab's single shared recovery-draft record. Drafts are now isolated by a session-scoped tab ID, and clearing after a successful save removes only the current tab's record. Both edits must survive as saved Markdown or as the other tab's retained recovery draft.
- WAVE-039: draft journal writes now request IndexedDB `strict` transaction durability, with a compatibility fallback for browsers that reject the option. A browser regression test verifies the strict option is requested. This reduces the durability window but cannot eliminate the interval before an asynchronous transaction commits; WAVE-039 remains partial rather than falsely marked fixed.
- WAVE-042 is now closed: per-tab draft isolation passed the two-tab Chromium regression test.
- Verified source CI: [run 43603278555](https://github.com/iamjpsonkar/Wave/actions/runs/43603278555) on `b11b46eebc1558de9910d8523cdaa027817b087d` — 30 Node tests, all 9 Chromium E2E tests, typecheck and production build passed. Documentation-only commits followed; their CI is tracked separately.
