# Wave — Current Open Bugs

> Repository: https://github.com/iamjpsonkar/Wave  
> Branch: main  
> Reviewed source revision: `1f676a2317339b29bdca9952b0288ded25a58616`  
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

- **2 remaining partial findings:** WAVE-031, WAVE-039.
- **49 source-verified fixes:** tracked in `fixed-bugs.md`.
- CI now runs Node storage/concurrency tests and Playwright Chromium E2E. Six browser journeys use native OPFS directory handles; real user-picked-folder permission denial/revocation, multi-tab race testing, external-editor fault injection and abrupt process-termination tests remain outstanding.

---

## WAVE-031 — Browser regression coverage still lacks real picker-permission and cross-tab scenarios

- Priority: **P1** | Confidence: **Confirmed**
- Files: `package.json`, `.github/workflows/ci.yml`, `tests/storage.test.js`

### Problem

The repository now runs 30 Node storage/concurrency tests plus six Playwright Chromium E2E tests. The browser suite uses native Origin Private File System (OPFS) directory handles as a deterministic filesystem fixture and covers workspace creation/autosave, IndexedDB draft recovery after reload, Trash restore, backup restore, root/nested attachments and mobile navigation.

It does not yet exercise the native user-picked-folder permission prompt/revocation flow, multi-tab write races, external editor changes during active operations, all keyboard/accessibility paths, or actual abrupt browser-process termination.

### Impact

Source-level and storage-adapter fixes can pass CI while browser-only races, permissions, focus behavior, and user-visible failures remain undetected.

### Reproduction / recheck scenario

Inspect the test scripts and CI workflow, then verify whether automated browser tests cover:
1. Workspace creation, switching, and reopening.
2. Autosave, navigation during a delayed save, and conflict recovery.
3. Trash, restore, backup, and interrupted operations.
4. Draft recovery across reload/pagehide.
5. Attachment upload in root and nested pages.
6. Mobile navigation, keyboard access, and accessibility basics.
7. Permission denial/revocation and unavailable File System Access API behavior.

### Expected behavior

A browser automation suite should run in CI and cover the critical user journeys using a browser-supported filesystem test strategy. Tests should include deterministic delays and failure injection where possible.

### Fix direction

Add Playwright (or an equivalent browser automation framework), provide a controlled File System Access API test adapter/fixture, and run the critical E2E suite in CI. Keep the Node storage tests as a faster lower-level layer.

### Regression coverage

Keep the six current Chromium scenarios in CI and extend them with real user-picked-folder permission denial/revocation, two-tab concurrency, external filesystem edits, keyboard/accessibility checks and browser lifecycle fault injection.

---

## WAVE-039 — Abrupt termination can still occur before the draft journal commits

- Priority: **P1** | Confidence: **High; browser lifecycle dependent**
- Files: `src/App.tsx` — draft autosave and pagehide handling; `src/draftJournal.ts`

### Problem

Wave now starts an IndexedDB journal write directly in the editor input handler instead of waiting for the former 120 ms debounce. It also retries a best-effort write on `visibilitychange` to hidden and `pagehide`, and the UI reports when the recovery-draft transaction has committed.

IndexedDB remains asynchronous. If the browser process is terminated after an input event but before the transaction commits, the latest keystroke can still be lost. `pagehide` and `visibilitychange` are best-effort lifecycle signals, not durability guarantees. A Chromium E2E test now verifies recovery after a page reload once the journal commit has completed; it does not simulate an OS-level process kill.

### Reproduction / recheck scenario

1. Open a document and type a unique marker.
2. Close/reload or terminate the browser immediately, then at controlled intervals around the draft debounce and IndexedDB transaction.
3. Reopen the workspace and inspect whether the marker is either persisted to the Markdown file or available as a recovery draft.
4. Repeat under CPU/disk pressure and with multiple rapid edits.

### Expected behavior

Wave must not claim an edit is safely recoverable until the draft journal transaction has committed. The product should make the residual unsaved/recovery state clear, and the strongest practical write-through strategy should minimize the crash window.

### Fix direction

Keep the write in the input-event path, expose pending/committed recovery status, and add controlled transaction-delay and browser termination tests. Do not claim crash-proof durability: the browser's IndexedDB transaction is still asynchronous.

### Regression coverage

- Immediate close after typing (currently best-effort only).
- Close during an IndexedDB write transaction.
- Repeated edits where writes complete out of order.
- Recovery after reload after a confirmed journal commit (covered by Playwright).
- Actual browser-process termination before commit (not yet automated).

