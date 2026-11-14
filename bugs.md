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

- **3 open findings:** WAVE-020, WAVE-031, WAVE-039.
- **48 source-verified fixes:** tracked in `fixed-bugs.md`.
- Latest CI for this source revision: [run 43601395895](https://github.com/iamjpsonkar/Wave/actions/runs/43601395895) — success; 14 Node storage tests passed, typecheck and production build passed.
- Browser E2E, multi-tab, real File System Access API permission/failure, and abrupt process-termination tests have not been run as part of this review.

---

## WAVE-020 — Backup snapshots can miss same-size, same-timestamp external changes

- Priority: **P1** | Confidence: **High; requires runtime/fault-injection verification**
- File: `src/storage.ts` — `createBackup()`, `snapshotTree()`

### Problem

Backup creation now compares source-tree metadata before and after copying and marks a snapshot failed if the observed metadata changes. This catches many concurrent edits, but the snapshot is based on metadata such as path, size, and last-modified time rather than a content hash or a workspace-wide operation lock.

A file can be modified externally while retaining the same size and timestamp (or a sync tool can restore those metadata values). Such a change may evade the before/after comparison, allowing a snapshot assembled from inconsistent source versions to be marked complete.

### Reproduction / recheck scenario

1. Start a backup while instrumenting or slowing the copy operation.
2. Modify a source document or asset during the copy.
3. Preserve the file's byte length and last-modified timestamp if the environment permits.
4. Allow the backup to complete.
5. Compare every backed-up file byte-for-byte with a single consistent source snapshot.

### Expected behavior

A backup must either represent one consistent workspace state or be marked incomplete and excluded from restore. Metadata equality alone must not be treated as proof of content equality under concurrent external modification.

### Fix direction

Use a workspace-level operation protocol for Wave-managed mutations and content hashes (or equivalent immutable/versioned source snapshots) for files copied into a backup. Verify the copied file set and contents before writing the final complete marker.

### Regression coverage

- Concurrent Wave write during backup.
- External edit with changed size.
- External edit with same size and restored timestamp.
- Asset replacement during copy.
- Interrupted backup and failed-marker exclusion.

---

## WAVE-031 — Browser-level regression suite is still missing

- Priority: **P1** | Confidence: **Confirmed**
- Files: `package.json`, `.github/workflows/ci.yml`, `tests/storage.test.js`

### Problem

The repository has a Node storage regression suite and CI runs 14 storage tests, TypeScript typecheck, and the production build. However, there is no browser E2E suite exercising the React application with the real File System Access API and browser lifecycle.

The current tests do not validate UI state transitions, permission prompts/revocation, autosave timing, IndexedDB recovery under page lifecycle events, attachment workflows, mobile navigation, or actual browser filesystem semantics.

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

At minimum, gate releases on workspace lifecycle, edit/save/navigation, draft recovery, Trash/restore, backup/restore, attachment, and mobile-navigation browser scenarios.

---

## WAVE-039 — Abrupt termination can still occur before the draft journal commits

- Priority: **P1** | Confidence: **High; browser lifecycle dependent**
- Files: `src/App.tsx` — draft autosave and pagehide handling; `src/draftJournal.ts`

### Problem

Wave now stores unsaved drafts in IndexedDB after a short debounce and attempts a best-effort save on `pagehide`. This materially improves recovery over relying only on the 600 ms filesystem autosave timer.

However, IndexedDB persistence is asynchronous. If the browser process or tab is terminated after the user types but before the debounce callback starts or the IndexedDB transaction commits, the latest draft can still be lost. A pagehide callback is not a guaranteed completion point for arbitrary asynchronous work.

### Reproduction / recheck scenario

1. Open a document and type a unique marker.
2. Close/reload or terminate the browser immediately, then at controlled intervals around the draft debounce and IndexedDB transaction.
3. Reopen the workspace and inspect whether the marker is either persisted to the Markdown file or available as a recovery draft.
4. Repeat under CPU/disk pressure and with multiple rapid edits.

### Expected behavior

Wave must not claim an edit is safely recoverable until the draft journal transaction has committed. The product should make the residual unsaved/recovery state clear, and the strongest practical write-through strategy should minimize the crash window.

### Fix direction

Consider synchronous-in-the-interaction-path persistence alternatives where feasible, a more explicit pending-draft state, and browser lifecycle tests that terminate/reload at controlled points. Do not rely on pagehide alone as a durability guarantee.

### Regression coverage

- Immediate close after typing.
- Close during the draft debounce.
- Close during an IndexedDB write transaction.
- Repeated edits where writes complete out of order.
- Recovery after reload and after simulated browser termination.

