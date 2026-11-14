# Wave — Current Open Bugs

> Repository: https://github.com/iamjpsonkar/Wave  
> Branch: main  
> Reviewed source revision: `9fdd7559d1bef165f838585bf73eb73a67b0d526`  
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

- **2 remaining partial findings:** WAVE-031, WAVE-039. Permission-denial and same-workspace two-tab journeys are now covered in Chromium; draft writes request strict IndexedDB durability where supported.
- **49 source-verified fixes:** tracked in `fixed-bugs.md`.
- CI now runs Node storage/concurrency tests and Playwright Chromium E2E. Six browser journeys use native OPFS directory handles; real user-picked-folder permission denial/revocation, multi-tab race testing, external-editor fault injection and abrupt process-termination tests remain outstanding.
- Verified code CI: [run 43602384257](https://github.com/iamjpsonkar/Wave/actions/runs/43602384257) — 30 Node tests and 6 Chromium E2E tests passed; typecheck and production build passed.

---

## WAVE-031 — Browser regression coverage still lacks real picker-permission and cross-tab scenarios

- Priority: **P1** | Confidence: **Confirmed**
- Files: `package.json`, `.github/workflows/ci.yml`, `tests/storage.test.js`

### Problem

The repository now runs 30 Node storage/concurrency tests plus nine Playwright Chromium E2E tests. The browser suite uses native Origin Private File System (OPFS) directory handles as a deterministic filesystem fixture and covers workspace creation/autosave, IndexedDB draft recovery after reload, Trash restore, backup restore, root/nested attachments and mobile navigation.

The browser suite now exercises permission denial through the File System Access permission contract and concurrent editing from two tabs sharing one OPFS workspace. The permission contract is deterministically simulated because Chromium's OPFS fixture does not produce the native user-picked-folder prompt. External editor changes during active operations, comprehensive keyboard/accessibility paths, native picker prompt/revocation, and actual abrupt browser-process termination remain outstanding.

### Impact

Source-level and storage-adapter fixes can pass CI while browser-only races, permissions, focus behavior, and user-visible failures remain undetected.

### Reproduction / recheck scenario

Inspect the test scripts and CI workflow, then verify whether automated browser tests cover:
1. Workspace creation, switching, and reopening.
2. Autosave, navigation during a delayed save, and conflict recovery.
3. Trash, restore, backup, and interrupted operations.
4. Draft recovery across reload/pagehide and strict IndexedDB transaction durability.
5. Attachment upload in root and nested pages.
6. Mobile navigation and two-tab concurrent editing.
7. Permission denial/revocation and unavailable File System Access API behavior.

### Expected behavior

A browser automation suite should run in CI and cover the critical user journeys using a browser-supported filesystem test strategy. Tests should include deterministic delays and failure injection where possible.

### Fix direction

Add Playwright (or an equivalent browser automation framework), provide a controlled File System Access API test adapter/fixture, and run the critical E2E suite in CI. Keep the Node storage tests as a faster lower-level layer.

### Regression coverage

Keep the current nine Chromium scenarios in CI. Add native user-picked-folder prompt/revocation, external filesystem edits, keyboard/accessibility checks and browser lifecycle fault injection when a supported browser fixture is available.

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

- WAVE-031: added Chromium coverage for permission denial through the File System Access permission contract and concurrent edits from two tabs sharing the same OPFS workspace. The denial contract is simulated; the native picker prompt and OS-level permission revocation are not yet automated. The browser suite now contains nine scenarios.
- WAVE-039: draft journal writes now request IndexedDB `strict` transaction durability, with a compatibility fallback for browsers that reject the option. A browser regression test verifies the strict option is requested. This reduces the durability window but cannot eliminate the interval before an asynchronous transaction commits; WAVE-039 remains partial rather than falsely marked fixed.
- The exact CI result for these changes is pending the workflow run triggered by the commits above.
