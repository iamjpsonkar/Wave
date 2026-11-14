# Wave — Fixed Bugs and Regression Scenarios

> Repository: https://github.com/iamjpsonkar/Wave  
> Branch: main  
> Source revision reviewed: `9fdd7559d1bef165f838585bf73eb73a67b0d526`  
> Review date: 2026-11-14  
> Purpose: historical fixes and mandatory rechecking scenarios for future QA passes.

## How to use this file

- Every entry retains its original ID. Never recycle an ID.
- Re-run the listed reproduction/regression scenarios whenever related code changes, before a release, and during the relevant QA-pillar audit.
- A fix is classified as **source-verified**, not automatically as browser/runtime-proven.
- If a scenario fails again, move the finding back to `bugs.md` with the evidence, affected revision, and failing environment. Keep its original ID.
- If the implementation changes materially, update the scenario here rather than silently deleting it.
- The current CI run for this source revision succeeded: [GitHub Actions run 43602646473](https://github.com/iamjpsonkar/Wave/actions/runs/43602646473). It reports 30 Node tests and 6 Chromium E2E tests passing, plus typecheck and production build. Browser E2E uses OPFS fixtures; it does not replace real user-picked-folder permission, cross-tab, or process-termination testing.

## Verification summary

**49 findings are source-verified as implemented** and retained below as regression scenarios. This does not mean all scenarios have been executed in a real browser. WAVE-031 and WAVE-039 remain open in `bugs.md`.

| ID range | Source-level disposition |
|---|---|
| WAVE-001–WAVE-019 | Implemented; WAVE-019 now has a pre-write conflict guard |
| WAVE-021–WAVE-030 | Implemented |
| WAVE-032–WAVE-038 | Implemented |
| WAVE-040–WAVE-051 | Implemented in current source |

## Recheck register

## WAVE-001 — Opening Trash can discard pending editor changes

- Priority: **P0** | Confidence: **Confirmed**
- Files: src/App.tsx:32,47

### Problem
loadTrash() clears the active document and editor content without flushing the editor first. Autosave is debounced by 600 ms. Clearing active causes the autosave effect cleanup to cancel a pending timer. If the user types and immediately opens Trash, the latest text may never reach disk.

### Reproduction
1. Open a page and type a change.
2. Open Trash within 600 ms.
3. Reopen the page and compare its saved content.

### Expected and fix
Navigation must flush or preserve the current unsaved revision before clearing editor state. Route all navigation through a save-and-navigate operation. If saving fails, keep the editor and draft available and abort navigation.

### Regression tests
- Open Trash within the debounce interval and verify the latest text survives.
- Revoke permission before navigation and verify the draft remains recoverable.
- Repeat while a write is already running.

### Current verification note

- Status: **Source-verified implementation present**.
- Recheck: use the reproduction and regression scenarios above as release checks.
- Evidence boundary: source review at `1f676a2317339b29bdca9952b0288ded25a58616`; browser-specific timing, multi-tab behavior, permission failures, and crash recovery still require their relevant runtime tests.
- Note: Current source contains the corrective implementation. Re-run the reproduction and regression scenarios below; runtime/browser behavior is not claimed unless covered by CI or an explicit manual test.

---

## WAVE-002 — Switching workspaces can discard pending edits

- Priority: **P0** | Confidence: **Confirmed**
- Files: src/App.tsx:39-42

### Problem
The switch flow activates a new workspace without flushing the previously active document. activateWorkspace() replaces workspace state and resets active/content. If the user switches before autosave fires, effect cleanup can cancel the pending timer and the old workspace retains the older version.

### Reproduction
Edit a page in Workspace A, immediately switch to Workspace B, then reopen A and inspect the page.

### Expected and fix
Save the old workspace successfully before replacing it. Abort the transition if saving fails. Load and validate the new workspace before committing it to UI state.

### Regression tests
Switch within the debounce interval, during an in-flight write, and after revoking write permission.

### Current verification note

- Status: **Source-verified implementation present**.
- Recheck: use the reproduction and regression scenarios above as release checks.
- Evidence boundary: source review at `1f676a2317339b29bdca9952b0288ded25a58616`; browser-specific timing, multi-tab behavior, permission failures, and crash recovery still require their relevant runtime tests.
- Note: Current source contains the corrective implementation. Re-run the reproduction and regression scenarios below; runtime/browser behavior is not claimed unless covered by CI or an explicit manual test.

---

## WAVE-003 — Restore can overwrite an existing -restored document

- Priority: **P0** | Confidence: **Confirmed**
- Files: src/storage.ts:122-134,70-73

### Problem
If the original path exists, restoreTrashItem() generates one -restored candidate but does not check whether that candidate also exists. saveDoc() opens with create:true and writes to the path, replacing existing content.

### Reproduction
1. Trash Notes.md.
2. Create a different Notes.md.
3. Create a different Notes-restored.md.
4. Restore the trashed item.

### Expected and fix
Restore must select an unused path and never overwrite an existing document. Check candidates in a loop, serialize check-and-create, validate metadata paths, and retain the Trash copy until the restored file is verified.

### Regression tests
Original path occupied; original plus first restored candidate occupied; multiple collisions; interruption after destination creation.

### Current verification note

- Status: **Source-verified implementation present**.
- Recheck: use the reproduction and regression scenarios above as release checks.
- Evidence boundary: source review at `1f676a2317339b29bdca9952b0288ded25a58616`; browser-specific timing, multi-tab behavior, permission failures, and crash recovery still require their relevant runtime tests.
- Note: Current source contains the corrective implementation. Re-run the reproduction and regression scenarios below; runtime/browser behavior is not claimed unless covered by CI or an explicit manual test.

---

## WAVE-004 — Autosave and explicit saves have no revision ordering

- Priority: **P1** | Confidence: **High; browser write ordering needs runtime verification**
- Files: src/App.tsx:37,47-48; src/storage.ts:70-73

### Problem
Autosave, keyboard save, navigation flush, and backup can call saveDoc independently. There is no per-document write queue, revision number, or stale-write guard. Clearing the debounce timer cannot cancel a write that has already started. Save status is updated by whichever promise resolves, not by checking that the saved revision is still current.

### Impact
An older save may race a newer save depending on filesystem scheduling. The UI can also report Saved locally while a newer revision remains pending.

### Fix
Assign monotonically increasing document revisions; serialize writes per document; mark a revision saved only after its write closes; prevent older revisions replacing newer ones; make flush await the current revision.

### Tests
Type during delayed writes, trigger Ctrl/Cmd+S during autosave, navigate during a pending write, and deliberately vary write completion order.

### Current verification note

- Status: **Source-verified implementation present**.
- Recheck: use the reproduction and regression scenarios above as release checks.
- Evidence boundary: source review at `1f676a2317339b29bdca9952b0288ded25a58616`; browser-specific timing, multi-tab behavior, permission failures, and crash recovery still require their relevant runtime tests.
- Note: Current source contains the corrective implementation. Re-run the reproduction and regression scenarios below; runtime/browser behavior is not claimed unless covered by CI or an explicit manual test.

---

## WAVE-005 — Trash operations can leave partial records

- Priority: **P1** | Confidence: **Confirmed failure windows; recovery needs fault injection**
- Files: src/storage.ts:101-111,122-138

### Problem
Moving to Trash writes the Markdown file, writes metadata JSON, then removes the original. Restore and permanent deletion also remove two files sequentially. A failure between steps can leave orphan metadata, orphan Markdown, or duplicate content.

### Fix
Add an operation journal with operation ID and state. Make steps idempotent; verify the Trash copy before deleting the source; validate metadata/file pairs; provide a recovery report for incomplete operations.

### Tests
Inject a failure after every write/remove step and verify retry/recovery returns the workspace to a consistent state.

### Current verification note

- Status: **Source-verified implementation present**.
- Recheck: use the reproduction and regression scenarios above as release checks.
- Evidence boundary: source review at `1f676a2317339b29bdca9952b0288ded25a58616`; browser-specific timing, multi-tab behavior, permission failures, and crash recovery still require their relevant runtime tests.
- Note: Current source contains the corrective implementation. Re-run the reproduction and regression scenarios below; runtime/browser behavior is not claimed unless covered by CI or an explicit manual test.

---

## WAVE-006 — One malformed Trash metadata file can break the entire Trash view

- Priority: **P1** | Confidence: **Confirmed**
- Files: src/storage.ts:113-120; src/App.tsx:32

### Problem
listTrash() parses every JSON file without per-item error handling or schema validation. One truncated or edited file rejects the whole operation. loadTrash() does not catch the rejection, leaving an unhandled promise rejection instead of a usable Trash screen.

### Fix
Validate id, title, originalPath, and deletedAt; isolate parse errors per item; show valid entries while identifying corrupt entries; recover orphaned Markdown files; catch errors at the UI boundary.

### Tests
Malformed JSON, missing fields, metadata without Markdown, and Markdown without metadata.

### Current verification note

- Status: **Source-verified implementation present**.
- Recheck: use the reproduction and regression scenarios above as release checks.
- Evidence boundary: source review at `1f676a2317339b29bdca9952b0288ded25a58616`; browser-specific timing, multi-tab behavior, permission failures, and crash recovery still require their relevant runtime tests.
- Note: Current source contains the corrective implementation. Re-run the reproduction and regression scenarios below; runtime/browser behavior is not claimed unless covered by CI or an explicit manual test.

---

## WAVE-007 — Workspace activation changes UI state before initialization succeeds

- Priority: **P1** | Confidence: **Confirmed**
- File: src/App.tsx:39

### Problem
activateWorkspace() calls setWs(w) before reading settings and refreshing documents/folders. If settings or enumeration fails, the UI may already point to the new workspace while initialization is incomplete.

### Fix
Load settings, documents, and folders into local variables first. Commit the new workspace only after required initialization succeeds. Keep the previous workspace active if activation fails.

### Tests
Force settings read, document enumeration, and folder enumeration to fail independently. Verify the previous workspace remains usable.

---

# 2. Document and attachment correctness

### Current verification note

- Status: **Source-verified implementation present**.
- Recheck: use the reproduction and regression scenarios above as release checks.
- Evidence boundary: source review at `1f676a2317339b29bdca9952b0288ded25a58616`; browser-specific timing, multi-tab behavior, permission failures, and crash recovery still require their relevant runtime tests.
- Note: Current source contains the corrective implementation. Re-run the reproduction and regression scenarios below; runtime/browser behavior is not claimed unless covered by CI or an explicit manual test.

---

## WAVE-008 — Attachment upload can append a link to the wrong document

- Priority: **P1** | Confidence: **High; reproduce with delayed file write**
- File: src/App.tsx:51

### Problem
attachment() calculates a relative asset URL using the active document path, then awaits addAsset(). After the await, it appends Markdown using the current content state. If the user switches documents during upload, the link can be appended to the newly active document even though its relative path was calculated for the previous document.

### Fix
Capture document identity and revision at upload start. On completion, append to that same document or detect that the active document changed and ask where to insert the attachment. Never append to whichever document happens to be active when the promise resolves.

### Test
Delay addAsset(), switch documents, then verify the link is inserted only into the intended document with the correct relative path.

### Current verification note

- Status: **Source-verified implementation present**.
- Recheck: use the reproduction and regression scenarios above as release checks.
- Evidence boundary: source review at `1f676a2317339b29bdca9952b0288ded25a58616`; browser-specific timing, multi-tab behavior, permission failures, and crash recovery still require their relevant runtime tests.
- Note: Current source contains the corrective implementation. Re-run the reproduction and regression scenarios below; runtime/browser behavior is not claimed unless covered by CI or an explicit manual test.

---

## WAVE-009 — Attachment input is not reset after selection

- Priority: **P2** | Confidence: **Confirmed**
- File: src/App.tsx:54

### Problem
The file input handles onChange but does not clear its value after upload. Selecting the same file again may not emit another change event.

### Fix and test
Clear the input value after capturing the selected file, including on failure. Attach the same file twice without selecting another file in between.

### Current verification note

- Status: **Source-verified implementation present**.
- Recheck: use the reproduction and regression scenarios above as release checks.
- Evidence boundary: source review at `1f676a2317339b29bdca9952b0288ded25a58616`; browser-specific timing, multi-tab behavior, permission failures, and crash recovery still require their relevant runtime tests.
- Note: Current source contains the corrective implementation. Re-run the reproduction and regression scenarios below; runtime/browser behavior is not claimed unless covered by CI or an explicit manual test.

---

## WAVE-010 — Local Markdown link detection relies on a substring

- Priority: **P2** | Confidence: **Confirmed**
- File: src/App.tsx:19-23

### Problem
A link is treated as a local asset whenever its URL contains assets/. An external URL such as https://example.com/assets/guide.pdf can be misclassified as a local file. Other relative links that do not follow this substring convention are treated as external.

### Fix
Parse URLs and allow only explicitly supported workspace-relative asset paths. Reject schemes/origins in the local resolver, normalize path segments, and keep external URLs on the external-link path.

### Tests
Workspace assets, external URLs containing /assets/, query strings, encoded names, root-relative paths, and unsupported schemes.

### Current verification note

- Status: **Source-verified implementation present**.
- Recheck: use the reproduction and regression scenarios above as release checks.
- Evidence boundary: source review at `1f676a2317339b29bdca9952b0288ded25a58616`; browser-specific timing, multi-tab behavior, permission failures, and crash recovery still require their relevant runtime tests.
- Note: Current source contains the corrective implementation. Re-run the reproduction and regression scenarios below; runtime/browser behavior is not claimed unless covered by CI or an explicit manual test.

---

## WAVE-011 — Invalid percent encoding can throw during Markdown asset resolution

- Priority: **P2** | Confidence: **High**
- File: src/App.tsx:10-12

### Problem
decodeURIComponent() is evaluated before the promise chain is created. Malformed percent encoding in user-authored Markdown can throw synchronously inside the effect and bypass the chained catch.

### Fix and test
Use a guarded parser and render a missing-asset state on invalid input. Preview documents with malformed percent-encoded image and file paths.

### Current verification note

- Status: **Source-verified implementation present**.
- Recheck: use the reproduction and regression scenarios above as release checks.
- Evidence boundary: source review at `1f676a2317339b29bdca9952b0288ded25a58616`; browser-specific timing, multi-tab behavior, permission failures, and crash recovery still require their relevant runtime tests.
- Note: Current source contains the corrective implementation. Re-run the reproduction and regression scenarios below; runtime/browser behavior is not claimed unless covered by CI or an explicit manual test.

---

## WAVE-012 — Toolbar list formatting only prefixes the first selected line

- Priority: **P2** | Confidence: **Confirmed**
- File: src/App.tsx:50

### Problem
linePrefix() inserts one prefix at the start of the line containing selectionStart. Selecting multiple lines and clicking Bulleted list, Numbered list, Quote, or Heading modifies only the first line. The numbered-list button always inserts 1. rather than incrementing numbers for a multi-line selection.

### Fix
Determine the complete selected line range, prefix every selected line, preserve selection/cursor, generate sequential ordered-list markers, and define behavior for partially selected first/last lines.

### Tests
Select 1, 2, and 5 lines and apply each line-based formatting action.

---

# 3. Navigation and search

### Current verification note

- Status: **Source-verified implementation present**.
- Recheck: use the reproduction and regression scenarios above as release checks.
- Evidence boundary: source review at `1f676a2317339b29bdca9952b0288ded25a58616`; browser-specific timing, multi-tab behavior, permission failures, and crash recovery still require their relevant runtime tests.
- Note: Current source contains the corrective implementation. Re-run the reproduction and regression scenarios below; runtime/browser behavior is not claimed unless covered by CI or an explicit manual test.

---

## WAVE-013 — Nested folders are discovered but rendered as a flat list

- Priority: **P2** | Confidence: **Confirmed**
- Files: src/App.tsx:31,54; src/storage.ts:55-67

### Problem
The storage adapter discovers folders recursively, but the sidebar renders every folder at the same level. Documents are associated with their immediate parent, but folder ancestry is not represented as a recursive tree.

### Fix
Build a recursive tree from folder paths. Render direct child folders and documents with stable IDs and independent expand/collapse state.

### Tests
Use root documents, empty folders, and at least four nested levels. Verify hierarchy, expansion, selection, and search.

### Current verification note

- Status: **Source-verified implementation present**.
- Recheck: use the reproduction and regression scenarios above as release checks.
- Evidence boundary: source review at `1f676a2317339b29bdca9952b0288ded25a58616`; browser-specific timing, multi-tab behavior, permission failures, and crash recovery still require their relevant runtime tests.
- Note: Current source contains the corrective implementation. Re-run the reproduction and regression scenarios below; runtime/browser behavior is not claimed unless covered by CI or an explicit manual test.

---

## WAVE-014 — Selecting a folder does not scope the visible page list

- Priority: **P2** | Confidence: **Confirmed**
- File: src/App.tsx:54

### Problem
Clicking a folder changes selectedFolder, which affects where a newly created page is stored. It does not filter the sidebar or show a scoped folder view. All folders and pages remain rendered.

### Fix
Define folder-selection semantics. Show the selected folder's direct contents and breadcrumbs or an explicit tree selection state. Keep search results distinct from normal browsing.

### Current verification note

- Status: **Source-verified implementation present**.
- Recheck: use the reproduction and regression scenarios above as release checks.
- Evidence boundary: source review at `1f676a2317339b29bdca9952b0288ded25a58616`; browser-specific timing, multi-tab behavior, permission failures, and crash recovery still require their relevant runtime tests.
- Note: Current source contains the corrective implementation. Re-run the reproduction and regression scenarios below; runtime/browser behavior is not claimed unless covered by CI or an explicit manual test.

---

## WAVE-015 — Search has no path context or keyboard result navigation

- Priority: **P2** | Confidence: **Confirmed**
- File: src/App.tsx:30,54

### Problem
Search filters title and body content in memory. Results have no matching snippet, folder breadcrumb, match highlighting, or arrow/Enter navigation.

### Fix
Show title, snippet, and folder path; add keyboard navigation and Escape; separate search results from folder rendering; use a rebuildable local index for large workspaces.

### Current verification note

- Status: **Source-verified implementation present**.
- Recheck: use the reproduction and regression scenarios above as release checks.
- Evidence boundary: source review at `1f676a2317339b29bdca9952b0288ded25a58616`; browser-specific timing, multi-tab behavior, permission failures, and crash recovery still require their relevant runtime tests.
- Note: Current source contains the corrective implementation. Re-run the reproduction and regression scenarios below; runtime/browser behavior is not claimed unless covered by CI or an explicit manual test.

---

## WAVE-016 — Favorite references can become stale

- Priority: **P2** | Confidence: **Confirmed**
- Files: src/App.tsx:40,52

### Problem
Favorites are stored as document path strings. Moving a page to Trash does not remove its favorite reference. Restoring under a different path leaves a stale reference; reusing the original path can make an unrelated page inherit the old favorite state.

### Fix
Prefer stable document IDs, or reconcile favorite paths whenever documents move, restore, rename, or delete. Remove invalid references during integrity checks.

---

# 4. Performance, backups, and external changes

### Current verification note

- Status: **Source-verified implementation present**.
- Recheck: use the reproduction and regression scenarios above as release checks.
- Evidence boundary: source review at `1f676a2317339b29bdca9952b0288ded25a58616`; browser-specific timing, multi-tab behavior, permission failures, and crash recovery still require their relevant runtime tests.
- Note: Current source contains the corrective implementation. Re-run the reproduction and regression scenarios below; runtime/browser behavior is not claimed unless covered by CI or an explicit manual test.

---

## WAVE-017 — Every refresh reads every Markdown document in full

- Priority: **P1** | Confidence: **Confirmed**
- Files: src/storage.ts:39-53; src/App.tsx:31,37,47

### Problem
listDocs() recursively reads the full text of every Markdown file. refresh() calls listDocs() and listFolders(). Refresh runs after autosave and explicit flushes. Saving one page can therefore cause every page to be read again and every document body to be held in React state.

### Impact
Large workspaces incur unnecessary filesystem I/O, memory use, and UI latency. Cost grows with total Markdown content, not just the active document.

### Fix
Separate lightweight metadata listing from content loading; keep only the active document body in editor state; cache metadata and invalidate only the changed path; use a rebuildable search index; avoid a full workspace refresh after each save.

### Performance tests
Benchmark 100, 1,000, and 10,000 Markdown files. Measure initial load, typing-to-save latency, memory, and search latency.

### Current verification note

- Status: **Source-verified implementation present**.
- Recheck: use the reproduction and regression scenarios above as release checks.
- Evidence boundary: source review at `1f676a2317339b29bdca9952b0288ded25a58616`; browser-specific timing, multi-tab behavior, permission failures, and crash recovery still require their relevant runtime tests.
- Note: Current source contains the corrective implementation. Re-run the reproduction and regression scenarios below; runtime/browser behavior is not claimed unless covered by CI or an explicit manual test.

---

## WAVE-018 — Backup creation has no restore workflow or retention policy

- Priority: **P1** | Confidence: **Confirmed missing capability, not a defect in the copy routine**
- Files: src/storage.ts:75-99,189-195; src/App.tsx:38,54

### Problem
Wave creates snapshots and can list backup directory names, but there is no user-facing backup browser, restore preview, or restore operation. Repeated backups have no retention/cleanup policy.

### Fix
Add a backup browser with timestamps and file counts; validate snapshots; restore to a new workspace/staging directory first; show a preview/diff and require confirmation before replacement; report partial failures. Add retention only after safe restore exists.

### Test
Back up, modify/delete files, restore to a separate workspace, and compare contents and metadata.

### Current verification note

- Status: **Source-verified implementation present**.
- Recheck: use the reproduction and regression scenarios above as release checks.
- Evidence boundary: source review at `1f676a2317339b29bdca9952b0288ded25a58616`; browser-specific timing, multi-tab behavior, permission failures, and crash recovery still require their relevant runtime tests.
- Note: The backup browser and restore-to-new-workspace workflow now exist. Retention limits and preview/diff are product enhancements, not confirmed defects, and are intentionally not carried into the open bug register.

---

## WAVE-019 — External filesystem changes are not detected

- Priority: **P2** | Confidence: **Confirmed missing capability; conflict risk depends on usage**
- Files: src/storage.ts:39-73; docs/ROADMAP.md

### Problem
Users can edit workspace Markdown outside Wave, but the app does not watch for changes or compare the on-disk version before writing. An external editor, sync client, or another Wave tab can change a file while Wave holds stale content.

### Fix
Record last observed modification time and preferably a content hash. Check the on-disk version before replacement. Offer reload, keep local, or save conflicted copy. A future desktop file watcher helps, but should not replace pre-write conflict checks.

### Current verification note

- Status: **Source-verified implementation present**.
- Recheck: use the reproduction and regression scenarios above as release checks.
- Evidence boundary: source review at `1f676a2317339b29bdca9952b0288ded25a58616`; browser-specific timing, multi-tab behavior, permission failures, and crash recovery still require their relevant runtime tests.
- Note: Pre-write disk comparison and conflict recovery (reload or save as copy) are present. A continuous filesystem watcher is not required for the core no-silent-overwrite guarantee. Browser-level multi-tab/external-editor scenarios remain useful regression checks.

---

## WAVE-020 — Backup snapshots can miss same-size, same-timestamp external changes

- Priority: **P1** | Original confidence: **High**
- Files: `src/storage.ts` — `snapshotTree()`, `createBackup()`

### Original problem

The earlier backup consistency check relied on file metadata such as path, size, and last-modified time. An external edit that preserved file size and timestamp could evade the before/after comparison, allowing a backup assembled from inconsistent source versions to be marked complete.

### Current implementation

The current implementation computes a SHA-256 digest of every file's bytes in `snapshotTree()`. Backup creation compares:
- The source document and asset trees before and after copying.
- The copied document and asset trees against the original source snapshots.
- The workspace manifest/settings before and after copying, and against the copied files.

Backup creation also runs under a workspace-wide lock shared with Wave-managed mutations. Failed or inconsistent snapshots receive a failed status and are excluded by `listBackups()`.

### Regression scenarios

1. Modify a source file during backup while preserving its byte length and last-modified timestamp; verify the backup is rejected if the copied bytes differ.
2. Modify a file during copying and restore the source content before the final source scan; verify comparison against the copied snapshot still detects the mismatch.
3. Change an asset during backup and verify the backup is marked failed and omitted from the backup list.
4. Attempt a Wave-managed document write while backup holds the workspace lock; verify the write waits and the backup contains a consistent pre-write state.
5. Change `manifest.json` or `settings.json` during the backup window and verify the snapshot is rejected.
6. Verify only backups with a complete status and matching manifest counts appear as restorable.

### Current verification note

- Status: **Source-verified implementation present**.
- Automated evidence: Node storage/concurrency tests include copied-file mismatch detection and workspace-wide backup/write serialization.
- CI at the reviewed source revision: 30 Node tests, 6 Chromium E2E tests, typecheck, and production build passed ([run 43602646473](https://github.com/iamjpsonkar/Wave/actions/runs/43602646473)).
- Evidence boundary: the test suite does not prove behavior for every external sync tool or OS-level filesystem race; retain the scenarios above for future QA rechecks.

---

## WAVE-021 — Async UI actions can reject without user feedback

- Priority: **P1** | Confidence: **Confirmed**
- Files: src/App.tsx:32,35,37,43-48

### Problem
Some event handlers invoke async operations with void but do not catch errors. Examples include document creation, template creation, opening a document, and keyboard-triggered flush. Permission revocation or filesystem failures can become unhandled promise rejections instead of visible, recoverable errors.

### Fix
Catch errors at event boundaries or use a shared async action wrapper. Preserve the current draft on failure, show actionable feedback and retry, and add an application error boundary for render-time failures.

### Current verification note

- Status: **Source-verified implementation present**.
- Recheck: use the reproduction and regression scenarios above as release checks.
- Evidence boundary: source review at `1f676a2317339b29bdca9952b0288ded25a58616`; browser-specific timing, multi-tab behavior, permission failures, and crash recovery still require their relevant runtime tests.
- Note: Current source contains the corrective implementation. Re-run the reproduction and regression scenarios below; runtime/browser behavior is not claimed unless covered by CI or an explicit manual test.

---

## WAVE-022 — Save status is not tied to a document revision

- Priority: **P1** | Confidence: **Confirmed**
- File: src/App.tsx:37,47

### Problem
A completed save can set Saved locally even if a newer edit happened after that save began. Opening a document also sets All changes saved without comparing persisted and current revisions.

### Fix
Derive status from current revision, saved revision, pending write, and last error. Show saved only when revisions match.

### Current verification note

- Status: **Source-verified implementation present**.
- Recheck: use the reproduction and regression scenarios above as release checks.
- Evidence boundary: source review at `1f676a2317339b29bdca9952b0288ded25a58616`; browser-specific timing, multi-tab behavior, permission failures, and crash recovery still require their relevant runtime tests.
- Note: Current source contains the corrective implementation. Re-run the reproduction and regression scenarios below; runtime/browser behavior is not claimed unless covered by CI or an explicit manual test.

---

## WAVE-023 — Settings parsing silently hides corruption and read errors

- Priority: **P2** | Confidence: **Confirmed**
- File: src/storage.ts:174-183

### Problem
readWorkspaceSettings() catches every error and returns an empty object. Missing settings, malformed JSON, and permission failures are treated identically. A later write can replace unreadable settings and lose preferences.

### Fix
Distinguish missing files from malformed content and access errors. Preserve the original file, report corruption, and offer a recoverable reset.

### Current verification note

- Status: **Source-verified implementation present**.
- Recheck: use the reproduction and regression scenarios above as release checks.
- Evidence boundary: source review at `1f676a2317339b29bdca9952b0288ded25a58616`; browser-specific timing, multi-tab behavior, permission failures, and crash recovery still require their relevant runtime tests.
- Note: Current source contains the corrective implementation. Re-run the reproduction and regression scenarios below; runtime/browser behavior is not claimed unless covered by CI or an explicit manual test.

---

## WAVE-024 — Favorite writes are not serialized

- Priority: **P2** | Confidence: **High**
- File: src/App.tsx:40

### Problem
Each toggle reads settings, computes an array from the current React state closure, and writes the whole settings object. Rapid toggles can overlap and resolve out of order, losing updates.

### Fix and test
Serialize settings mutations and compute each update from the latest committed state. Toggle multiple pages rapidly and verify persistence after reload.

---

# 6. Responsive UI and accessibility

### Current verification note

- Status: **Source-verified implementation present**.
- Recheck: use the reproduction and regression scenarios above as release checks.
- Evidence boundary: source review at `1f676a2317339b29bdca9952b0288ded25a58616`; browser-specific timing, multi-tab behavior, permission failures, and crash recovery still require their relevant runtime tests.
- Note: Current source contains the corrective implementation. Re-run the reproduction and regression scenarios below; runtime/browser behavior is not claimed unless covered by CI or an explicit manual test.

---

## WAVE-025 — Mobile sidebar hides essential navigation

- Priority: **P2** | Confidence: **Confirmed**
- File: src/styles.css:2

### Problem
Below 520 px, CSS hides page rows and all navigation buttons except the first. Folder links and settings are also hidden. There is no replacement drawer or mobile navigation surface.

### Fix
Use a slide-out navigation drawer or mobile workspace switcher. Preserve search, folders, Trash, and page access. Add open/close controls and focus management.

### Tests
Test 320, 375, 430 px, tablet, and desktop widths. Verify core actions remain reachable by touch and keyboard.

### Current verification note

- Status: **Source-verified implementation present**.
- Recheck: use the reproduction and regression scenarios above as release checks.
- Evidence boundary: source review at `1f676a2317339b29bdca9952b0288ded25a58616`; browser-specific timing, multi-tab behavior, permission failures, and crash recovery still require their relevant runtime tests.
- Note: Current source contains the corrective implementation. Re-run the reproduction and regression scenarios below; runtime/browser behavior is not claimed unless covered by CI or an explicit manual test.

---

## WAVE-026 — Short viewport layout can clip the workspace

- Priority: **P2** | Confidence: **High; verify on actual short/mobile viewports**
- File: src/styles.css:2

### Problem
The app uses height:100vh with min-height:560px. On viewports shorter than 560 px, the app can exceed the visible viewport. The rule does not use dynamic viewport units for mobile browser chrome changes.

### Fix
Use dynamic viewport-aware sizing with a fallback, allow inner panels to scroll, and avoid forcing the whole app above the viewport height.

### Current verification note

- Status: **Source-verified implementation present**.
- Recheck: use the reproduction and regression scenarios above as release checks.
- Evidence boundary: source review at `1f676a2317339b29bdca9952b0288ded25a58616`; browser-specific timing, multi-tab behavior, permission failures, and crash recovery still require their relevant runtime tests.
- Note: Current source contains the corrective implementation. Re-run the reproduction and regression scenarios below; runtime/browser behavior is not claimed unless covered by CI or an explicit manual test.

---

## WAVE-027 — Keyboard shortcuts intercept keys without checking focus

- Priority: **P2** | Confidence: **Confirmed**
- File: src/App.tsx:48

### Problem
The global handler intercepts Ctrl/Cmd+N and Ctrl/Cmd+K regardless of the focused element. This can conflict with browser/input behavior. The effect is also re-registered on every render because it has no dependency array.

### Fix
Ignore shortcuts inside inputs, textareas, selects, and editable content unless explicitly supported there. Use a stable effect/current callbacks. Add Escape behavior and keyboard navigation for search/dialogs.

### Current verification note

- Status: **Source-verified implementation present**.
- Recheck: use the reproduction and regression scenarios above as release checks.
- Evidence boundary: source review at `1f676a2317339b29bdca9952b0288ded25a58616`; browser-specific timing, multi-tab behavior, permission failures, and crash recovery still require their relevant runtime tests.
- Note: Current source contains the corrective implementation. Re-run the reproduction and regression scenarios below; runtime/browser behavior is not claimed unless covered by CI or an explicit manual test.

---

## WAVE-028 — Some visible controls are placeholders or non-interactive

- Priority: **P3** | Confidence: **Confirmed**
- File: src/App.tsx:54

### Problem
Settings explicitly displays SOON. The overflow icon/avatar are rendered as visual elements without corresponding actions.

### Fix
Implement the affordance or render it clearly as disabled/non-interactive with an explanation.

---

# 7. Documentation and project quality

### Current verification note

- Status: **Source-verified implementation present**.
- Recheck: use the reproduction and regression scenarios above as release checks.
- Evidence boundary: source review at `1f676a2317339b29bdca9952b0288ded25a58616`; browser-specific timing, multi-tab behavior, permission failures, and crash recovery still require their relevant runtime tests.
- Note: Current source contains the corrective implementation. Re-run the reproduction and regression scenarios below; runtime/browser behavior is not claimed unless covered by CI or an explicit manual test.

---

## WAVE-029 — Privacy/font documentation contradicts the stylesheet

- Priority: **P2** | Confidence: **Confirmed**
- Files: src/styles.css:1; README.md; docs/ARCHITECTURE.md

### Problem
The stylesheet imports DM Sans, DM Mono, and Playfair Display from Google Fonts. README mentions Google Fonts, while the architecture document says the UI uses system fonts and does not request third-party font files.

### Fix
Choose one policy: keep Google Fonts and accurately disclose the third-party request/offline fallback, or bundle fonts/use system fonts and remove the external import. Verify the network panel and update both documents.

### Current verification note

- Status: **Source-verified implementation present**.
- Recheck: use the reproduction and regression scenarios above as release checks.
- Evidence boundary: source review at `1f676a2317339b29bdca9952b0288ded25a58616`; browser-specific timing, multi-tab behavior, permission failures, and crash recovery still require their relevant runtime tests.
- Note: Current source contains the corrective implementation. Re-run the reproduction and regression scenarios below; runtime/browser behavior is not claimed unless covered by CI or an explicit manual test.

---

## WAVE-030 — Workspace manifest updatedAt is initialized but not maintained

- Priority: **P3** | Confidence: **Confirmed**
- File: src/storage.ts:12-16

### Problem
The manifest receives createdAt and updatedAt when first created, but updatedAt is not updated as workspace content changes.

### Fix
Update metadata through a centralized repository operation, or remove the field until its semantics are implemented. Document which operations affect it.

### Current verification note

- Status: **Source-verified implementation present**.
- Recheck: use the reproduction and regression scenarios above as release checks.
- Evidence boundary: source review at `1f676a2317339b29bdca9952b0288ded25a58616`; browser-specific timing, multi-tab behavior, permission failures, and crash recovery still require their relevant runtime tests.
- Note: Current source contains the corrective implementation. Re-run the reproduction and regression scenarios below; runtime/browser behavior is not claimed unless covered by CI or an explicit manual test.

---

## WAVE-032 — Workspace switch can autosave the previous document into the new workspace

- Priority: **P0** | Confidence: **High; timing-dependent but follows directly from effect dependencies**
- Files: `src/App.tsx` — `activateWorkspace()` and the autosave `useEffect`

### Problem
`activateWorkspace(w)` calls `setWs(w)` immediately, but does not clear `active` or `content` until after it has awaited settings and document/folder enumeration. The autosave effect depends on `ws`, `active`, and `content`. When `ws` changes, React runs the effect with the new workspace handle and the previous workspace's active path and content. It schedules a write after 600 ms.

If initialization of the new workspace takes longer than that delay, the pending effect can call `saveDoc()` using the **new workspace's documents directory** and the **old workspace's active path/content**. This can create or overwrite a same-named document in the destination workspace. This is separate from losing a pending edit while switching workspaces (WAVE-002): it is cross-workspace data contamination.

### Reproduction
1. Open workspace A and edit a page named `Notes.md`.
2. Switch to workspace B.
3. Make B's initialization take longer than 600 ms (for example, use a workspace with many files or throttle filesystem operations).
4. Inspect B's `.wave/documents/Notes.md` after activation.

### Expected and fix
Do not publish the new `ws` state while the old `active` and `content` are still live. Flush/resolve the old workspace's pending revision first, cancel its pending debounce, then initialize the destination workspace into local variables. Commit the new workspace, its documents, favorites, and an empty editor state together only after initialization succeeds. The autosave effect should be keyed to a document/workspace identity that cannot mix generations.

### Regression tests
Switch A to B with a pending edit; delay B initialization beyond 600 ms; use identical and different document paths; assert that B receives no bytes from A and A retains its latest edit.

### Current verification note

- Status: **Source-verified implementation present**.
- Recheck: use the reproduction and regression scenarios above as release checks.
- Evidence boundary: source review at `1f676a2317339b29bdca9952b0288ded25a58616`; browser-specific timing, multi-tab behavior, permission failures, and crash recovery still require their relevant runtime tests.
- Note: Current source contains the corrective implementation. Re-run the reproduction and regression scenarios below; runtime/browser behavior is not claimed unless covered by CI or an explicit manual test.

---

## WAVE-033 — Failed backup creation leaves a partial directory that looks like a valid backup

- Priority: **P1** | Confidence: **High**
- File: `src/storage.ts` — `createBackup()`, `copyFolder()`

### Problem
`createBackup()` creates the timestamped backup directory before copying documents, assets, and metadata. If any later read, write, or permission operation fails, the function rejects but does not remove the incomplete directory or mark it as incomplete. The directory remains under `backups/` with a normal `backup-...` name, which is indistinguishable from a completed snapshot to any future backup browser or recovery tool.

### Impact
A user may later select a partial snapshot and believe it contains a complete recovery point. A failure while copying assets can leave documents present but attachments missing.

### Fix
Write a completion manifest only after every copy and validation succeeds. Until then, mark the directory as in-progress; on failure, either clean it up safely or retain it with an explicit failed marker and surface it as unusable. A restore flow must reject snapshots without a valid completion marker and verify expected file counts.

### Regression tests
Inject failures during document copy, asset copy, and metadata copy. Confirm incomplete snapshots are never listed as restorable backups and can be cleaned up or retried.

### Current verification note

- Status: **Source-verified implementation present**.
- Recheck: use the reproduction and regression scenarios above as release checks.
- Evidence boundary: source review at `1f676a2317339b29bdca9952b0288ded25a58616`; browser-specific timing, multi-tab behavior, permission failures, and crash recovery still require their relevant runtime tests.
- Note: Current source contains the corrective implementation. Re-run the reproduction and regression scenarios below; runtime/browser behavior is not claimed unless covered by CI or an explicit manual test.

---

## WAVE-034 — Asset collision detection treats every lookup error as “filename is free”

- Priority: **P1** | Confidence: **High**
- File: `src/storage.ts` — `addAsset()`

### Problem
The collision loop calls `getFileHandle(candidate)` and catches every exception. It assumes any exception means the candidate does not exist, then proceeds to write that name. The File System Access API uses a not-found error for an absent file, but other failures (for example, permission or I/O errors) should not be interpreted as proof that a name is available.

### Impact
An unexpected lookup failure can bypass the collision check. Since the subsequent write uses `create: true`, it can open an existing filename and replace its contents rather than choosing a suffixed name.

### Fix
Treat only the specific not-found condition as an available name. Propagate permission, security, and I/O errors. Prefer an exclusive create/claim strategy or serialize asset-name allocation so concurrent uploads cannot both claim the same candidate.

### Regression tests
Mock not-found, permission-denied, and generic I/O failures separately. Verify only not-found advances to the write path and that existing asset bytes remain unchanged for all other failures.

### Current verification note

- Status: **Source-verified implementation present**.
- Recheck: use the reproduction and regression scenarios above as release checks.
- Evidence boundary: source review at `1f676a2317339b29bdca9952b0288ded25a58616`; browser-specific timing, multi-tab behavior, permission failures, and crash recovery still require their relevant runtime tests.
- Note: Current source contains the corrective implementation. Re-run the reproduction and regression scenarios below; runtime/browser behavior is not claimed unless covered by CI or an explicit manual test.

---

## WAVE-035 — Creating a folder with an existing name silently selects the existing directory

- Priority: **P2** | Confidence: **High**
- File: `src/storage.ts` — `createFolder()`

### Problem
`createFolder()` calls `getDirectoryHandle(safe, { create: true })` without checking whether the directory already exists. If the user enters a name that is already present in the selected parent, the operation succeeds and returns the existing directory as though a new folder had been created.

### Impact
The user receives no indication that the name was already in use. A repeated action can silently navigate to an existing folder rather than creating a distinct one, making the folder-creation result ambiguous.

### Fix
Check for an existing directory and return a clear “folder already exists” result, or generate a unique name with an explicit naming policy. Do not silently treat an existing directory as a newly created folder.

### Regression tests
Create the same folder twice at the root and inside a nested parent. Verify the second attempt reports a collision or uses a clearly communicated unique name.

### Current verification note

- Status: **Source-verified implementation present**.
- Recheck: use the reproduction and regression scenarios above as release checks.
- Evidence boundary: source review at `1f676a2317339b29bdca9952b0288ded25a58616`; browser-specific timing, multi-tab behavior, permission failures, and crash recovery still require their relevant runtime tests.
- Note: Current source contains the corrective implementation. Re-run the reproduction and regression scenarios below; runtime/browser behavior is not claimed unless covered by CI or an explicit manual test.

---

## WAVE-036 — Rapid document opens can finish out of order and show the wrong page

- Priority: **P2** | Confidence: **High; timing-dependent**
- File: `src/App.tsx` — `open(d)`

### Problem
Each call to `open(d)` awaits `flush()` and then `readDoc()`, with no request token or cancellation check. If a user clicks two pages quickly, the reads can complete in the opposite order from the clicks. The older request can then call `setContent()` and `setActive()` last, replacing the page the user most recently selected.

### Impact
The editor can display a different document from the user's last selection. This is especially confusing when the user starts typing immediately after selecting a page, and can contribute to editing the wrong document.

### Fix
Assign each open request a monotonically increasing token. After every awaited operation, ignore results unless the token is still current. Keep the target path and loaded content paired in one state transition.

### Regression tests
Delay the first document read, open a second document, let the second read finish first, then release the first. The final active path and editor content must belong to the second click.

### Current verification note

- Status: **Source-verified implementation present**.
- Recheck: use the reproduction and regression scenarios above as release checks.
- Evidence boundary: source review at `1f676a2317339b29bdca9952b0288ded25a58616`; browser-specific timing, multi-tab behavior, permission failures, and crash recovery still require their relevant runtime tests.
- Note: Current source contains the corrective implementation. Re-run the reproduction and regression scenarios below; runtime/browser behavior is not claimed unless covered by CI or an explicit manual test.

---

## WAVE-037 — Concurrent create actions can select the same filename and overwrite one another

- Priority: **P2** | Confidence: **High; race requires overlapping actions**
- File: `src/App.tsx` — `create()`, `createFromTemplate()`; `src/storage.ts` — `saveDoc()`

### Problem
The create flows choose a candidate by checking the in-memory `docs` array, then call `saveDoc()`. The candidate check and file creation are not atomic. Two overlapping create actions can both observe that the same path is unused and both write it. `saveDoc()` opens the file with `create: true`, which does not provide exclusive creation.

### Impact
A rapid double-click or overlapping keyboard/template action can create only one file where the UI implied two pages, with the later write replacing the earlier page's initial content. The same pattern can affect page duplication when the list is stale.

### Fix
Centralize document creation in the storage layer with exclusive collision handling. Generate the final path at the point of creation and return it to the UI. Serialize create operations per workspace.

### Regression tests
Trigger two blank-page creates and two identical-template creates concurrently. Assert that both produce distinct files and neither write replaces the other.

### Current verification note

- Status: **Source-verified implementation present**.
- Recheck: use the reproduction and regression scenarios above as release checks.
- Evidence boundary: source review at `1f676a2317339b29bdca9952b0288ded25a58616`; browser-specific timing, multi-tab behavior, permission failures, and crash recovery still require their relevant runtime tests.
- Note: Current source contains the corrective implementation. Re-run the reproduction and regression scenarios below; runtime/browser behavior is not claimed unless covered by CI or an explicit manual test.

---

## WAVE-038 — CI installs floating dependency versions because the repository has no lockfile

- Priority: **P2** | Confidence: **High**
- Files: `package.json`, `.github/workflows/ci.yml`; no package lockfile is present on `main`

### Problem
Dependencies use semver ranges (including caret ranges), the repository does not contain a committed npm lockfile, and CI runs `npm install` rather than `npm ci`. Consequently, different CI runs can resolve different transitive dependency versions even when the application source has not changed.

### Impact
A dependency release can unexpectedly break a previously green build, introduce behavior changes, or alter the dependency tree without a reviewed source change. Builds are not reliably reproducible.

### Fix
Commit the appropriate lockfile, use `npm ci` in CI, and update dependencies through reviewed lockfile changes. Consider automated dependency update PRs and a documented Node/npm version policy.

### Regression tests
Run CI from a clean checkout and verify that installation uses the committed lockfile and produces a stable dependency tree.

### Current verification note

- Status: **Source-verified implementation present**.
- Recheck: use the reproduction and regression scenarios above as release checks.
- Evidence boundary: source review at `1f676a2317339b29bdca9952b0288ded25a58616`; browser-specific timing, multi-tab behavior, permission failures, and crash recovery still require their relevant runtime tests.
- Note: Current source contains the corrective implementation. Re-run the reproduction and regression scenarios below; runtime/browser behavior is not claimed unless covered by CI or an explicit manual test.

---

## WAVE-040 — Folder creation accepts nested paths but returns an incomplete selected path

- Priority: **P2** | Confidence: **High**
- Files: `src/storage.ts` — `createFolder()`; `src/App.tsx` — `newFolder()`

### Problem
The prompt accepts a string that may contain slashes. `createFolder()` splits that string into parent segments and a leaf, creates the nested path, but returns only the leaf folder name. `newFolder()` then appends that leaf to the current selection rather than using the full created path.

### Reproduction
1. At the workspace root, create a folder by entering `Projects/Backend`.
2. The storage layer creates `Projects/Backend`.
3. The UI sets `selectedFolder` to `Backend` rather than `Projects/Backend`.
4. Create a page; it is saved under the wrong path or under a newly created `Backend` folder.

### Expected and fix
Either reject path separators and treat the prompt as a single folder name, or return the full normalized path from `createFolder()` and use that exact path as the selection.

### Regression tests
Create a nested path at root and under an already selected folder. Verify the selected path matches the actual directory and subsequent pages are created inside it.

## Supplemental remediation priorities

- [x] **Immediate data-safety gate:** WAVE-032 — prevent cross-workspace autosave contamination.
- [~] WAVE-039 — IndexedDB draft journal with a 120 ms debounce and pagehide best-effort flush; an abrupt kill inside the debounce window is not an absolute guarantee.
- [x] WAVE-034 — distinguish missing assets from permission/I/O failures.
- [x] WAVE-033 — mark or clean up incomplete backup snapshots.
- [x] WAVE-036 and WAVE-037 — guard asynchronous navigation and concurrent creation.
- [x] WAVE-035 and WAVE-040 — make folder creation collision and path semantics explicit.
- [x] WAVE-038 — commit a lockfile and use deterministic CI installation.

**Updated audit count:** 40 numbered findings (WAVE-001 through WAVE-040), plus the 8 cross-cutting risks listed earlier. Findings with timing-dependent behavior should also be covered by automated browser/storage tests before being treated as fully reproduced in production.


---

# 13. Remediation execution status — 2026-11-14

This section supersedes the original unchecked remediation lists above. It records code-level changes pushed after the audit. A checked item means the implementation change is present; it does **not** imply that every browser-specific scenario has been manually reproduced. CI currently runs storage regression tests, TypeScript typecheck and the production build.

## Implemented in the current remediation pass

- **Navigation and state safety:** Trash navigation and workspace activation flush the current editor first; workspace activation loads destination data before publishing the new workspace; open requests are token-guarded; autosave timers are cancelled by explicit flush.
- **Write ordering and external edits:** document writes are serialized; save status is revision-aware; external file changes are checked before a write; conflicts preserve the draft and offer Reload latest or Save draft as copy.
- **Creation and attachment safety:** page creation, duplication, folder creation and asset allocation use collision checks; browser Web Locks are used when available, with an in-process lock fallback; case-only path collisions are avoided; attachment uploads remain bound to the document where they started.
- **Trash and backup safety:** restore uses unique page creation rather than overwriting; Trash metadata is validated per item; interrupted Trash operations are journaled and safely reconciled on Trash inspection when their source/copy state is unambiguous; unresolved states are reported; backups have in-progress/complete/failed markers; only completed snapshots are listed; backup creation checks source metadata before and after copying; restore writes into a separate workspace folder.
- **Recovery:** unsaved editor drafts are stored in a separate IndexedDB journal, recovered with user confirmation, and cleared after a successful save. A pagehide flush is best-effort.
- **Navigation and usability:** recursive folder navigation, folder-scoped page lists, path/snippet search results, arrow/Enter search navigation, multiline toolbar formatting, mobile drawer navigation and short-viewport layout are implemented.
- **Error handling and metadata:** settings corruption is surfaced without overwriting the original file and can be backed up before resetting defaults; manifest updatedAt is refreshed after workspace mutations; placeholder controls are clearly non-interactive.
- **Build reproducibility:** package-lock.json is committed and CI uses npm ci.
- **Regression tests:** Node's built-in test runner covers path/slug behavior, non-overwriting page creation, Trash restore collisions, corrupt Trash isolation, backup completion, external edit detection, folder collisions, permission errors, concurrent allocation, incomplete backup exclusion, interrupted Trash recovery and corrupt-settings backup/reset.

## Partially complete — do not treat as fully closed

| Finding | Current state | Remaining work |
|---|---|---|
| WAVE-019 | External edits are detected before overwrite; the user can reload or save a separate copy | Add browser-level multi-tab/external-editor tests and more explicit conflict details |
| WAVE-020 | **Implemented in the 2026-11-14 recheck:** shared cross-tab workspace operation lock, source and copied-tree SHA-256 comparison, settings-copy verification, and failed-snapshot exclusion | `tests/storage.test.js`: concurrent Wave write waits for backup completion; altered copied bytes are rejected even when the source scan is unchanged |
| WAVE-031 | Storage tests are in CI | Add browser E2E tests for navigation, permissions, draft recovery, attachments, mobile layout and real File System Access behavior |
| WAVE-039 | Drafts are persisted to IndexedDB after a short debounce and on pagehide | Browser termination can still occur before an asynchronous draft write completes; test real crash/reload timing and consider a stronger write-through strategy |

## Additional risks still requiring explicit verification

- R-01/R-02: multi-tab editing and permission revocation need browser-level scenarios.
- R-03/R-04: large Markdown and large asset collection benchmarks have not been run.
- R-05/R-06: interrupted backup and concurrent cross-tab uploads have implementation safeguards but need fault-injection/browser verification.
- R-07: Chrome/Edge are the intended current browsers; Firefox/Safari need a separate adapter and compatibility testing.
- R-08: case-normalized allocation is implemented; Unicode and platform-specific filesystem behavior still need a compatibility matrix.

## CI and release gate

The repository now includes a committed npm lockfile and uses `npm ci`. The CI workflow runs `npm test`, `npm run typecheck` and `npm run build`. Latest verified run: [43599727201](https://github.com/iamjpsonkar/Wave/actions/runs/43599727201) — success; 14 tests passed, 0 failed.

Do not begin the next feature milestone until the current CI run is green and the remaining browser-level verification items have been reviewed. No storage reliability claim should be interpreted as a substitute for keeping an independent backup of important data.


---

# 14. Independent verification against current main — 2026-11-14

**Verified revision:** `c372653d642742d7ae75333da6d2fa1287a423fa`  
**Scope:** Current `src/App.tsx`, `src/storage.ts`, `src/draftJournal.ts`, package/CI configuration, and the committed storage test suite.  
**Method:** Static source review plus inspection of the latest GitHub Actions run. No interactive browser session or real File System Access API fault-injection was performed.

A status of **Implemented** means the original defect's code path has been changed in the current source. It is not a claim that all browser timing, multi-tab, permission, or crash scenarios have been reproduced. **Partial** means a safeguard exists but a meaningful gap remains.

## 14.1 Status of the original 40 findings

| Finding | Current status | Verification notes |
|---|---|---|
| WAVE-001 | **Implemented** | `loadTrash()` flushes the active document before clearing editor state. |
| WAVE-002 | **Implemented** | `activateWorkspace()` flushes the previous workspace before loading and publishing the next one. |
| WAVE-003 | **Implemented** | Restore now uses collision-safe `createDoc()`; existing pages are not silently replaced. |
| WAVE-004 | **Implemented** | App-level save queue plus storage-level per-path write queue and compare-before-write guard. |
| WAVE-005 | **Implemented** | Trash operations have operation markers, verification, and recovery reconciliation. Fault-injection remains outstanding. |
| WAVE-006 | **Implemented** | `listTrashDetailed()` validates each record and reports bad/orphaned entries without aborting the entire listing. |
| WAVE-007 | **Implemented** | Destination docs/folders/settings are loaded before `setWs()`; settings failures are surfaced while preserving the original. |
| WAVE-008 | **Implemented** | Attachment operation captures its originating workspace/path and writes to that document rather than whichever page is currently active. |
| WAVE-009 | **Implemented** | File input value is cleared immediately after selection, allowing the same file to be selected again. |
| WAVE-010 | **Implemented** | Local asset detection parses the URL/path shape instead of using a loose `includes('assets/')` test. |
| WAVE-011 | **Implemented** | Percent decoding is guarded; malformed paths are treated as non-local assets. |
| WAVE-012 | **Implemented** | Toolbar list/quote prefixes transform every selected line; numbered lists receive sequential numbers. |
| WAVE-013 | **Implemented** | Folder navigation now renders recursively. |
| WAVE-014 | **Implemented** | The unsearched page list is scoped to the selected folder; search remains workspace-wide. |
| WAVE-015 | **Implemented** | Search results include path/snippet context and keyboard result navigation. |
| WAVE-016 | **Implemented** | Refresh and Trash flows reconcile favorite paths against existing documents. |
| WAVE-017 | **Implemented** | `listDocs()` reads only a small prefix for title extraction instead of loading every document body; full content is read for actual search/open operations. |
| WAVE-018 | **Implemented** | Backup browser and restore-to-separate-folder workflow are present. |
| WAVE-019 | **Partial** | Writes compare the current disk content with the last observed content and expose reload/save-copy conflict handling. There is no continuous filesystem watcher; browser-level multi-tab/external-editor tests remain. |
| WAVE-020 | **Partial** | Backup snapshots compare path/size/lastModified metadata and settings before/after copying. This is not a content-hash snapshot or workspace-wide lock; same-size/same-timestamp changes and concurrent operations need stronger protection. |
| WAVE-021 | **Implemented in inspected paths** | Core async UI actions catch and surface errors; storage and browser failure-path testing is still needed. |
| WAVE-022 | **Implemented** | Save status is tied to the active document revision and completed persistence operation. |
| WAVE-023 | **Implemented** | Corrupt settings now raise an explicit error; the UI can back up the original before resetting defaults. |
| WAVE-024 | **Implemented** | Settings writes are serialized; favorite state is kept in a ref and queued. |
| WAVE-025 | **Implemented** | Mobile navigation uses a drawer/backdrop and restores essential navigation controls. |
| WAVE-026 | **Implemented** | Short viewport CSS removes the old 560px minimum-height clipping behavior and makes constrained panes scrollable. |
| WAVE-027 | **Implemented** | Global shortcuts check whether focus is in an input, textarea, select, or contenteditable element. |
| WAVE-028 | **Implemented as a UX clarification** | Placeholder settings are visibly marked as coming later rather than presented as working controls. Full settings functionality remains planned, not a bug in the current MVP. |
| WAVE-029 | **Implemented** | Architecture/privacy documentation now accurately discloses the Google Fonts request rather than claiming system-only fonts. |
| WAVE-030 | **Implemented** | Workspace mutation flows call manifest metadata update; settings writes also update it. |
| WAVE-031 | **Partial** | Storage regression tests run in CI. There are still no browser E2E tests for real File System Access behavior, navigation timing, permissions, attachments, or crash recovery. |
| WAVE-032 | **Implemented for the reported activation path** | Workspace activation flushes the old editor and does not publish the new workspace until destination loading completes. A related late-completing-action race is newly recorded as WAVE-041. |
| WAVE-033 | **Implemented** | Backup directories receive in-progress/complete/failed markers; only complete snapshots are listed and accepted for restore. |
| WAVE-034 | **Implemented** | Asset allocation checks only actual directory entries and propagates permission/I/O errors; allocation is serialized and verifies the saved size. |
| WAVE-035 | **Implemented** | Folder creation checks for case-insensitive existing entries and rejects collisions. |
| WAVE-036 | **Implemented** | Document open uses a monotonically increasing request token and checks it after awaited operations. |
| WAVE-037 | **Implemented in the storage creation path** | `createDoc()` allocates a unique path under a per-path queue and workspace lock; same-name and case-only concurrent creation has a storage regression test. |
| WAVE-038 | **Implemented** | A committed `package-lock.json` exists and CI uses `npm ci`. The latest CI run confirms the lockfile install succeeds. |
| WAVE-039 | **Partial** | An IndexedDB draft journal saves after a short debounce and on `pagehide`. This improves recovery but does not guarantee persistence if the browser/process is terminated before the asynchronous transaction completes. The journal's own concurrent-write behavior also needs a fix (WAVE-042). |
| WAVE-040 | **Implemented** | `createFolder()` returns the complete normalized path and the UI selects that returned path. |

### Summary

- **36 findings:** implementation changes are present for the original reported defect.
- **4 findings remain partial:** WAVE-019, WAVE-020, WAVE-031, WAVE-039.
- “Implemented” is source-level verification, not a statement that every edge case has passed browser testing.
- The 14 storage tests cover selected storage behaviors; they do not test React component state races or actual browser crash timing.

## 14.2 New findings discovered during the verification pass

### Current verification note

- Status: **Source-verified implementation present**.
- Recheck: use the reproduction and regression scenarios above as release checks.
- Evidence boundary: source review at `1f676a2317339b29bdca9952b0288ded25a58616`; browser-specific timing, multi-tab behavior, permission failures, and crash recovery still require their relevant runtime tests.
- Note: Current source contains the corrective implementation. Re-run the reproduction and regression scenarios below; runtime/browser behavior is not claimed unless covered by CI or an explicit manual test.

---

## WAVE-041 — A late async page operation can publish stale workspace state after a workspace switch

- Priority: **P1** | Confidence: **High; timing-dependent**
- File: `src/App.tsx` — `create()`, `createFromTemplate()`, `duplicateCurrent()`, `refresh()`, and attachment completion

### Problem
Workspace activation now loads the destination before publishing it, which fixes WAVE-032's original autosave-effect ordering. However, other asynchronous UI operations capture a workspace and then perform multiple awaited operations without checking that the captured workspace is still the active workspace before committing React state.

For example, `create()` captures `current = wsRef.current`, awaits flush, creates a document in that workspace, updates metadata and refreshes it, then calls `setActive(path)`, updates `activeRef`, and changes editor content. If the user switches to another workspace while those awaits are in flight, the old operation can complete afterward and publish its old path/content into the new workspace's editor state. The autosave effect is keyed from the currently selected `ws`; if the destination workspace already has a document at the same path, this can overwrite that destination document with the stale operation's content. If it does not, it can cause a save error and leave navigation state inconsistent.

The same stale-publication pattern exists in template creation and duplication. The attachment flow correctly captures its source document for file writes, but its final `refresh(targetWorkspace)` can still publish old workspace docs/folders after the user has switched.

### Reproduction
1. Open workspace A and trigger New page, New from template, or Duplicate.
2. Delay the storage operation (or use a workspace/filesystem that makes it slow).
3. Switch to workspace B before the operation completes.
4. Let the A operation finish. Inspect the active editor, sidebar list, and any same-path page in B.

### Expected and fix
Give each workspace activation a generation/token. Every async action that captures a workspace must verify both the generation and `wsRef.current === capturedWorkspace` after awaited work and before changing UI state. Make `refresh(w)` publish docs/folders/favorites only if `w` is still active; do not use the current workspace's favorites to rewrite a different workspace's settings. Consider disabling workspace switching while a mutation is committing, but still keep generation checks as the correctness boundary.

### Regression tests
Add component/browser tests that pause create/template/duplicate/attachment operations, switch A to B, then release the operation. Assert B's editor and sidebar remain unchanged and no B document is overwritten.

### Current verification note

- Status: **Source-verified implementation present**.
- Recheck: use the reproduction and regression scenarios above as release checks.
- Evidence boundary: source review at `1f676a2317339b29bdca9952b0288ded25a58616`; browser-specific timing, multi-tab behavior, permission failures, and crash recovery still require their relevant runtime tests.
- Note: Current source contains the corrective implementation. Re-run the reproduction and regression scenarios below; runtime/browser behavior is not claimed unless covered by CI or an explicit manual test.

---

## WAVE-042 — Concurrent draft-journal writes can create duplicate or stale recovery records

- Priority: **P1** | Confidence: **High; concurrent timing-dependent**
- File: `src/draftJournal.ts` — `saveDraft()`, `findDraft()`, `getDraft()`

### Problem
`saveDraft()` first reads all records and searches for a matching workspace/path, then starts a separate IndexedDB write transaction. That read-then-write sequence is not atomic and is not serialized. If two saves for the same workspace/path overlap (for example, the 120 ms draft debounce and a `pagehide` save), both can observe no existing record and each call `put()` without an ID. Because the object store uses an auto-increment key, this can create two records for the same document. Concurrent updates to an existing record can also complete out of order.

`getDraft()` returns the first matching record from `getAll()`; it does not select the newest `updatedAt`. A stale record can therefore be recovered instead of the latest draft.

### Impact
The recovery journal can offer older text even though a newer draft write was attempted. This weakens the safety net intended to cover the autosave debounce/crash window.

### Fix
Use a stable key for each workspace/path (or a serialized per-key queue) and make lookup/update atomic within a single readwrite transaction. If duplicate legacy records exist, select the greatest `updatedAt` and clean up older duplicates. Ensure a late older save cannot replace a newer revision by carrying a monotonic revision or timestamp check.

### Regression tests
Run two overlapping saves for the same new draft and for an existing draft, complete them in both possible orders, and verify exactly one record remains and `getDraft()` returns the newest content.

### Current verification note

- Status: **Source-verified implementation present**.
- Recheck: use the reproduction and regression scenarios above as release checks.
- Evidence boundary: source review at `1f676a2317339b29bdca9952b0288ded25a58616`; browser-specific timing, multi-tab behavior, permission failures, and crash recovery still require their relevant runtime tests.
- Note: Current source contains the corrective implementation. Re-run the reproduction and regression scenarios below; runtime/browser behavior is not claimed unless covered by CI or an explicit manual test.

---

## WAVE-043 — Backup restore can reuse an existing destination folder and overwrite its contents

- Priority: **P1** | Confidence: **High**
- File: `src/storage.ts` — `restoreBackupToNewWorkspace()`

### Problem
The restore target name is generated from the workspace name and current timestamp. The code requests the directory with `create:false`, but if that directory already exists, the call succeeds and the existing directory is reused. The restore then copies backup files into its `.wave/documents` and `.wave/assets` directories using writes that create or replace files.

This is not an exclusive destination allocation. A pre-existing folder with the generated name, or two overlapping restore actions that generate the same name, can cause an existing restored/user directory to be reused and its same-path files overwritten.

### Fix
Allocate a genuinely unused destination name with collision handling protected by a workspace lock. Never use an existing directory as a restore target. Create the restore in a temporary/in-progress folder and publish/rename it only after all files and metadata have been copied and verified.

### Regression tests
Pre-create a folder matching the generated restore name and attempt restore; verify the existing folder is byte-for-byte unchanged and a new unique destination is chosen. Also run two restore operations concurrently.

### Current verification note

- Status: **Source-verified implementation present**.
- Recheck: use the reproduction and regression scenarios above as release checks.
- Evidence boundary: source review at `1f676a2317339b29bdca9952b0288ded25a58616`; browser-specific timing, multi-tab behavior, permission failures, and crash recovery still require their relevant runtime tests.
- Note: Current source contains the corrective implementation. Re-run the reproduction and regression scenarios below; runtime/browser behavior is not claimed unless covered by CI or an explicit manual test.

---

## WAVE-044 — Failed backup restore leaves a partial workspace folder without a recovery marker

- Priority: **P2** | Confidence: **High**
- File: `src/storage.ts` — `restoreBackupToNewWorkspace()`

### Problem
The restore function creates the destination root folder and `.wave` directory before copying documents, assets, and metadata. If a copy, verification, or metadata write fails, the function throws but does not mark the destination as incomplete or remove it safely. A partial folder remains in the user's selected root and may be mistaken for a usable restored workspace.

### Fix
Use an explicit restore operation marker/state, validate all copied content, and only mark the target as complete after verification. On failure, either safely roll back the newly created target or leave an unmistakable failed marker and exclude it from workspace discovery/restore completion.

### Regression tests
Inject failures during document copy, asset copy, and metadata copy. Verify incomplete destinations are never presented as successful restores and can be safely retried or cleaned up.

## 14.3 Current CI evidence

The latest observed GitHub Actions run for the verified revision is:

- Run: [43599964894](https://github.com/iamjpsonkar/Wave/actions/runs/43599964894)
- Commit: `c372653d642742d7ae75333da6d2fa1287a423fa`
- Result: **Success**
- Steps verified: `npm ci`, `npm test`, `npm run typecheck`, and `npm run build`.
- The committed test file currently contains 14 Node storage regression tests. A successful CI run is not browser E2E coverage.

## 14.4 Updated next actions

1. **P1 — WAVE-041:** Add workspace-generation guards to all asynchronous UI mutations and to `refresh()`.
2. **P1 — WAVE-042:** Make draft-journal writes atomic/serialized and recover the newest revision only.
3. **P1 — WAVE-043:** Make backup restore destination allocation exclusive; never reuse an existing folder.
4. **P2 — WAVE-044:** Mark or roll back incomplete restore destinations.
5. **P1/P2 — WAVE-019, WAVE-020, WAVE-031, WAVE-039:** Complete browser-level conflict, backup, crash-recovery, and navigation testing.

**Updated audit count:** 44 numbered findings (WAVE-001 through WAVE-044), plus the 8 cross-cutting risks. The original 40-item remediation status is superseded by the verification matrix in this section.


## 15. Additional independent audit — 2026-11-14

A second source-level pass on the current `main` revision found seven additional issues not covered by WAVE-001 through WAVE-044. These findings are based on the current implementation paths below. Timing-dependent findings still require browser/filesystem fault-injection tests before their full impact can be quantified.

### Current verification note

- Status: **Source-verified implementation present**.
- Recheck: use the reproduction and regression scenarios above as release checks.
- Evidence boundary: source review at `1f676a2317339b29bdca9952b0288ded25a58616`; browser-specific timing, multi-tab behavior, permission failures, and crash recovery still require their relevant runtime tests.
- Note: Current source contains the corrective implementation. Re-run the reproduction and regression scenarios below; runtime/browser behavior is not claimed unless covered by CI or an explicit manual test.

---

## WAVE-045 — Double-escaped newline and whitespace patterns break document and Trash titles

- Priority: **P2** | Confidence: **High**
- File: `src/storage.ts` — `listDocs()`, `searchDocs()`, `moveDocToTrash()`

### Problem
Several string and regular-expression patterns contain an extra backslash:
- `listDocs()` uses `text.split('\\\\n')`, which splits on the two literal characters backslash+n rather than actual newline characters.
- Its heading cleanup uses `/^#\\\\s*/`, which does not remove the normal whitespace after a Markdown heading marker.
- The filename fallback uses `/\\\\.md$/i`, which does not correctly strip a normal `.md` suffix.
- `moveDocToTrash()` repeats the incorrect newline and heading patterns when deriving the Trash title.
- `searchDocs()` uses `/\\\\s+/g`, so snippets are not normalized to spaces as intended.

As a result, a normal multi-line Markdown page can be represented in the sidebar by a title containing much or all of its first 4 KB, rather than its first non-empty heading. Trash entries can similarly show document content instead of a concise title. Search snippets can retain line breaks.

### Reproduction
1. Create a page with a heading followed by several paragraphs.
2. Refresh the workspace or reopen it.
3. Inspect the page title in the sidebar and then move the page to Trash.
4. Search for a phrase spanning a document with multiple lines and inspect the snippet formatting.

### Fix
Use actual newline splitting (`'\\n'` in TypeScript source) and correctly escaped regexes such as `/^#\\s*/`, `/\\.md$/i`, and `/\\s+/g`. Add tests with multi-line Markdown, headings with spaces/tabs, empty documents, and long documents.

### Current verification note

- Status: **Source-verified implementation present**.
- Recheck: use the reproduction and regression scenarios above as release checks.
- Evidence boundary: source review at `1f676a2317339b29bdca9952b0288ded25a58616`; browser-specific timing, multi-tab behavior, permission failures, and crash recovery still require their relevant runtime tests.
- Note: Current source contains the corrective implementation. Re-run the reproduction and regression scenarios below; runtime/browser behavior is not claimed unless covered by CI or an explicit manual test.

---

## WAVE-046 — Save-conflict-copy does not remove the original Markdown extension

- Priority: **P2** | Confidence: **High**
- File: `src/App.tsx` — `saveConflictCopy()`

### Problem
The filename expression uses `path.replace(/\\\\\\\\.md$/,'')`. The regular expression is double-escaped and does not match a normal filename such as `Notes.md`. The resulting copy name becomes `Notes.md-conflict-copy.md` instead of `Notes-conflict-copy.md`.

This does not overwrite the original document, but produces an inconsistent and confusing filename every time the user chooses the conflict recovery action.

### Reproduction
1. Open `Notes.md`.
2. Cause an external-edit conflict.
3. Choose **Save draft as copy**.
4. Inspect the created filename.

### Fix
Use a correctly escaped extension matcher (or a small filename helper shared with duplicate naming). Add a test for root and nested paths, uppercase `.MD`, and filenames containing multiple dots.

### Current verification note

- Status: **Source-verified implementation present**.
- Recheck: use the reproduction and regression scenarios above as release checks.
- Evidence boundary: source review at `1f676a2317339b29bdca9952b0288ded25a58616`; browser-specific timing, multi-tab behavior, permission failures, and crash recovery still require their relevant runtime tests.
- Note: Current source contains the corrective implementation. Re-run the reproduction and regression scenarios below; runtime/browser behavior is not claimed unless covered by CI or an explicit manual test.

---

## WAVE-047 — A queued favorite update can write another workspace's favorites into the wrong settings file

- Priority: **P1** | Confidence: **High; timing-dependent**
- File: `src/App.tsx` — `toggleFavorite()`, `activateWorkspace()`

### Problem
`toggleFavorite()` captures the current workspace in `current`, but its queued callback later reads `favoritesRef.current`. That ref is global to the component and is replaced by `activateWorkspace()` when another workspace becomes active.

If a favorite update for workspace A is queued and the user switches to workspace B before the callback reads the ref, the callback can write B's favorites array into A's `settings.json`. The queue itself is also global rather than partitioned by workspace.

### Reproduction
1. Open workspace A and toggle a favorite while its settings read/write is delayed.
2. Switch to workspace B before the queued callback reads `favoritesRef.current`.
3. Inspect A's `.wave/settings.json`; it may now contain B's favorites.

### Fix
Capture an immutable favorites snapshot at the moment of the toggle and write that snapshot to the captured workspace. Prefer a per-workspace serialized queue or a workspace-keyed state map. Do not read a global active-workspace ref from a delayed callback. Add a deterministic test that pauses the queued write, switches workspaces, and then releases it.

### Current verification note

- Status: **Source-verified implementation present**.
- Recheck: use the reproduction and regression scenarios above as release checks.
- Evidence boundary: source review at `1f676a2317339b29bdca9952b0288ded25a58616`; browser-specific timing, multi-tab behavior, permission failures, and crash recovery still require their relevant runtime tests.
- Note: Current source contains the corrective implementation. Re-run the reproduction and regression scenarios below; runtime/browser behavior is not claimed unless covered by CI or an explicit manual test.

---

## WAVE-048 — Editor transitions can discard edits typed while a flush is in progress

- Priority: **P1** | Confidence: **High; timing-dependent**
- File: `src/App.tsx` — `flush()`, `open()`, `create()`, `createFromTemplate()`, `trashCurrent()`, `activateWorkspace()`

### Problem
`flush()` captures `contentRef.current` and `revisionRef.current` once, then awaits `persistDocument()`. The editor remains interactive during that await. If the user types again while the filesystem operation is pending, the flush only persists the earlier revision and does not check whether the revision changed before the caller proceeds.

Callers such as `open()`, page creation, Trash, and workspace activation can then replace or clear the editor state. Their React autosave debounce can be cancelled by the navigation/state change, leaving the newer text that was typed during the wait unsaved and discarded.

### Reproduction
1. Use a workspace/filesystem where a save or metadata operation is slow.
2. Start opening another page, creating a page, moving the current page to Trash, or switching workspaces.
3. While the action is waiting for `flush()`, type additional text in the editor.
4. Allow the operation to finish and inspect the original document.

### Fix
Make transitions revision-aware. After each awaited flush, verify that the active workspace, path, and editor revision are still the expected values; if the revision changed, persist the latest revision before transitioning or cancel the transition. Alternatively, make the editor explicitly read-only while a transition is committing, while preserving the user's ability to cancel. Add browser tests with controllable delayed writes.

### Current verification note

- Status: **Source-verified implementation present**.
- Recheck: use the reproduction and regression scenarios above as release checks.
- Evidence boundary: source review at `1f676a2317339b29bdca9952b0288ded25a58616`; browser-specific timing, multi-tab behavior, permission failures, and crash recovery still require their relevant runtime tests.
- Note: Current source contains the corrective implementation. Re-run the reproduction and regression scenarios below; runtime/browser behavior is not claimed unless covered by CI or an explicit manual test.

---

## WAVE-049 — Concurrent backup requests can write into the same timestamp-named snapshot

- Priority: **P1** | Confidence: **High; timing-dependent**
- File: `src/storage.ts` — `createBackup()`

### Problem
Backup names are derived from the current timestamp. The code checks whether the directory exists and then creates it, but the check-and-create sequence is not protected by a lock or exclusive allocation. Two backup requests in the same timestamp interval can both observe that the name is unused and then open the same directory with `create: true`.

Both operations can then copy files into the same snapshot and overwrite each other's completion/failure marker. The resulting backup may be inconsistent even though one or both calls report success.

### Reproduction
1. Trigger two backup operations nearly simultaneously (for example, double-click Backup or call the storage API twice).
2. Arrange for both calls to start before either creates the destination directory.
3. Inspect the resulting snapshot and its status marker.

### Fix
Allocate backup destinations exclusively under a workspace-scoped lock, with collision handling inside the lock. Give each operation a unique ID and ensure only the operation that owns the destination can write its status marker. Add a concurrent-backup test that verifies distinct snapshot names and independently valid contents.

### Current verification note

- Status: **Source-verified implementation present**.
- Recheck: use the reproduction and regression scenarios above as release checks.
- Evidence boundary: source review at `1f676a2317339b29bdca9952b0288ded25a58616`; browser-specific timing, multi-tab behavior, permission failures, and crash recovery still require their relevant runtime tests.
- Note: Current source contains the corrective implementation. Re-run the reproduction and regression scenarios below; runtime/browser behavior is not claimed unless covered by CI or an explicit manual test.

---

## WAVE-050 — Concurrent restore of the same Trash item can create duplicate pages

- Priority: **P2** | Confidence: **High; timing-dependent**
- File: `src/storage.ts` — `restoreTrashItem()`

### Problem
Trash restoration is not serialized by an item-specific lock. Two tabs or two rapid UI actions can both read the same Trash metadata and Markdown content, then each call `createDoc()`. The page-creation allocator correctly avoids overwriting, so the two restore operations can create two different filenames containing identical restored content. Both then attempt to remove the same Trash files and may both report success.

### Reproduction
1. Open the same workspace in two tabs.
2. Restore the same Trash item from both tabs at nearly the same time.
3. Inspect the documents folder for duplicate restored pages.

### Fix
Serialize restoration by workspace and Trash item ID, and re-check the item/operation marker inside the lock before creating a destination. Keep the operation journal state transitions within that serialized operation. Add a two-call concurrency test asserting exactly one restored page is created.

### Current verification note

- Status: **Source-verified implementation present**.
- Recheck: use the reproduction and regression scenarios above as release checks.
- Evidence boundary: source review at `1f676a2317339b29bdca9952b0288ded25a58616`; browser-specific timing, multi-tab behavior, permission failures, and crash recovery still require their relevant runtime tests.
- Note: Current source contains the corrective implementation. Re-run the reproduction and regression scenarios below; runtime/browser behavior is not claimed unless covered by CI or an explicit manual test.

---

## WAVE-051 — Attachments in nested pages receive an incorrect relative Markdown path

- Priority: **P2** | Confidence: **High**
- File: `src/App.tsx` — `attachment()`

### Problem
The generated asset URL uses:
`Math.max(1, targetPath.split('/').length - 1)`
parent-directory segments. For a page stored at `folder/Notes.md`, the generated link is `../assets/file.png`, but the correct relative path from `.wave/documents/folder/` to `.wave/assets/` is `../../assets/file.png`.

Wave's preview can hide this defect because `localAssetName()` extracts the asset filename and looks it up directly in the assets directory without validating the relative path depth. The Markdown file itself therefore contains a broken relative link when opened by another Markdown viewer or tool.

### Reproduction
1. Create a page inside a nested folder.
2. Attach an image or file.
3. Inspect the generated Markdown link and open the Markdown file outside Wave.

### Fix
Calculate the number of parent segments from the document's directory depth: a root-level document needs one `../`; a document one folder deep needs two, and so on. Add tests for root-level, one-level, and multi-level nested documents, and verify the generated link resolves relative to the Markdown file.

## 15.1 Additional audit conclusions

- **7 new findings:** WAVE-045 through WAVE-051.
- **New P1 findings:** WAVE-047, WAVE-048, and WAVE-049.
- **New P2 findings:** WAVE-045, WAVE-046, WAVE-050, and WAVE-051.
- These findings have not been fixed in this audit pass. They are recorded for implementation and regression testing.
- The audit was source-level against the current `main` tree. It did not include interactive browser tests, multi-tab execution, or filesystem fault injection.

**Updated audit count:** 51 numbered findings (WAVE-001 through WAVE-051), plus the previously recorded cross-cutting risks.


---

# 16. Recheck of bugs.md against current main — 2026-11-14

**Reviewed revision:** `c930fbad9e34a82cdeb7c700367b0ff6468a552f`  
**Files rechecked:** `src/App.tsx`, `src/storage.ts`, `src/draftJournal.ts`, `tests/storage.test.js`, `package.json`, and this audit.  
**Method:** current-source inspection, comparison against WAVE-001–WAVE-051, and inspection of the GitHub Actions run for this exact main revision. No interactive browser, multi-tab browser run, or real File System Access API fault-injection was performed.

## 16.1 Recheck result

The prior audit is not fully closed. The eleven newer findings WAVE-041 through WAVE-051 are still present in the current source. The findings below were rechecked against the actual code paths, not merely copied from their earlier descriptions.

| Finding | Recheck status | Current evidence |
|---|---|---|
| WAVE-041 | **Open — confirmed** | `refresh(w)` publishes docs/folders and reconciles global favorites without checking that `w` is still active (`src/App.tsx:40`). `create()`, `createFromTemplate()` and `duplicateCurrent()` publish state after awaits without a workspace-generation guard (`src/App.tsx:44,57-58`). |
| WAVE-042 | **Open — confirmed** | Draft journal still performs `findDraft()` before a separate read-write transaction; records use auto-increment IDs and `getDraft()` returns the first match, not the newest (`src/draftJournal.ts:1-6,25-51`). |
| WAVE-043 | **Open — confirmed** | Backup restore reuses an existing timestamp-named directory when `getDirectoryHandle(...,{create:false})` succeeds; no exclusive allocation or collision suffix is used (`src/storage.ts:282-299`). |
| WAVE-044 | **Open — confirmed** | Restore creates the destination and copies files before verification, but does not write a restore-in-progress/failed marker or roll back the partial destination on error (`src/storage.ts:287-299`). |
| WAVE-045 | **Open — confirmed** | Markdown title, Trash title and search snippet code still use double-escaped newline/whitespace patterns (`src/storage.ts:120-121,139,306`). |
| WAVE-046 | **Open — confirmed** | Conflict-copy naming still uses the double-escaped extension expression in `saveConflictCopy()`; a normal `.md` suffix is not stripped as intended (`src/App.tsx:50`). |
| WAVE-047 | **Open — confirmed** | The queued favorite write reads mutable global `favoritesRef.current` after awaiting its place in a global queue, rather than writing the immutable snapshot captured for the original workspace (`src/App.tsx:54`). |
| WAVE-048 | **Open — confirmed** | `flush()` captures content/revision once and returns after that revision is persisted; it does not detect edits typed while the awaited write is pending (`src/App.tsx:46-47`). Transition callers can then replace editor state. |
| WAVE-049 | **Open — confirmed** | Backup name check and directory creation are not inside an exclusive workspace lock; concurrent calls can select and write to the same timestamp name (`src/storage.ts:241-247`). |
| WAVE-050 | **Open — confirmed** | Trash restore has no item-specific/workspace lock around reading the Trash item, allocating the destination and removing the source records (`src/storage.ts:393-416`). |
| WAVE-051 | **Open — confirmed** | Attachment relative path depth is calculated as `targetPath.split('/').length - 1`; a page one folder deep still gets only one `../` instead of two (`src/App.tsx:70`). |

**Recheck conclusion:** none of WAVE-041 through WAVE-051 can currently be marked fixed. These are source-confirmed code-path defects; timing-dependent impact and reproduction frequency still require browser/concurrency tests.

## 16.2 Earlier partial findings remain partial

The following earlier findings are not upgraded to complete:

- **WAVE-019:** compare-before-write conflict detection exists, but no continuous file watcher and no browser-level multi-tab/external-editor verification.
- **WAVE-020:** backup compares path/size/lastModified snapshots and manifest/settings text, but does not provide a workspace-wide operation lock or content-hash snapshot.
- **WAVE-031:** current CI runs storage unit tests only; no browser E2E suite exercises the actual File System Access API and React state transitions.
- **WAVE-039:** IndexedDB journal remains debounce/pagehide based and does not guarantee completion before abrupt process termination. WAVE-042 is a separate concurrency defect in that journal.

## 16.3 Regression test coverage gap

The current `tests/storage.test.js` still contains 14 Node tests. They cover selected storage operations, but none of the following newer findings has a regression test:

- WAVE-041 workspace-switch races and stale UI publication.
- WAVE-042 concurrent draft saves and newest-record selection.
- WAVE-043 existing restore destination collision and concurrent restore destination allocation.
- WAVE-044 partial restore cleanup/failed marker.
- WAVE-045 Markdown title, Trash title and snippet newline handling.
- WAVE-046 conflict-copy filename normalization.
- WAVE-047 workspace-isolated favorite queue behavior.
- WAVE-048 typing during a delayed flush/navigation transition.
- WAVE-049 concurrent backup destination allocation.
- WAVE-050 concurrent restore of one Trash item.
- WAVE-051 relative attachment links from root, one-level and multi-level folders.

The current test suite is useful but does not establish that these defects are absent.

## 16.4 Current CI evidence

The latest inspected workflow run is for the exact reviewed main revision:

- Run: [43600560309](https://github.com/iamjpsonkar/Wave/actions/runs/43600560309)
- Commit: `c930fbad9e34a82cdeb7c700367b0ff6468a552f`
- Result: **Success**
- Steps: `npm ci`, `npm test`, `npm run typecheck`, `npm run build`.
- Test result: **14 passed, 0 failed**.

A green CI run means the existing tests, typecheck and production build pass. It does not mean the open findings above are fixed.

## 16.5 Updated overall status and next actions

- Original findings WAVE-001–WAVE-040: the earlier matrix reports 36 implementation changes and 4 partial findings. This remains a source-level assessment, not browser sign-off.
- WAVE-019, WAVE-020, WAVE-031 and WAVE-039 remain partial.
- WAVE-041–WAVE-051: **11 open findings confirmed in the current source**.
- Total catalogue: **51 findings** plus the 8 cross-cutting risks. Do not close or delete findings without a code change and matching regression evidence.

Recommended fix order:

1. **P0 data-loss/concurrency:** WAVE-041, WAVE-042, WAVE-043, WAVE-044, WAVE-047, WAVE-048, WAVE-049 and WAVE-050.
2. **P1/P2 correctness and portability:** WAVE-045, WAVE-046 and WAVE-051.
3. Add regression tests alongside each fix; add browser E2E and filesystem fault-injection coverage for the timing-dependent cases.
4. Re-run CI and update this file with the exact verified commit and test evidence.

**Important:** this recheck updates the audit only. It does not claim the listed defects have been fixed, and no application source code was changed during this pass.


---

# 17. Remediation pass — 2026-11-14

**Reviewed code revision:** `94dbaaa447291cc9e29cfb5b51de80eadff79b60`  
**Scope:** `src/App.tsx`, `src/storage.ts`, `src/draftJournal.ts`, new `src/safety.ts`, and `tests/storage.test.js`. Documentation was also updated on `main`.  
**Verification:** source inspection and GitHub Actions run [43601335473](https://github.com/iamjpsonkar/Wave/actions/runs/43601335473) for the exact code revision. The run passed `npm ci`, `npm test`, `npm run typecheck`, and `npm run build`; **26 tests passed, 0 failed**. No interactive browser E2E or real multi-tab IndexedDB run was performed.

## 17.1 New findings WAVE-041 through WAVE-051

| Finding | Current status | Implemented change and evidence |
|---|---|---|
| WAVE-041 | **Partial — source safeguards implemented** | Workspace-generation tokens now guard workspace activation, refresh, page/template creation, duplication, folder creation, Trash actions, backup actions, opening, attachment completion and other async UI publication. Browser component tests for delayed A-to-B workspace switches remain outstanding. |
| WAVE-042 | **Partial — source safeguards implemented** | Draft saves, reads and clears are serialized with Web Locks where available and a local queue fallback. Matching records are reconciled, the newest record is selected, duplicate legacy records are deleted during save, and timestamps are monotonically advanced. Real IndexedDB multi-tab/concurrent transaction tests remain outstanding. |
| WAVE-043 | **Implemented** | Restore destinations use collision-aware unique directory allocation under a lock and do not reuse existing directories. Regression test verifies a pre-existing destination and its sentinel file remain unchanged. |
| WAVE-044 | **Implemented** | Restore writes `in-progress`, `failed` or `complete` state. `openWorkspace()` refuses a folder whose restore marker is not complete. Fault-injection test verifies a failed copy is marked and cannot be opened. |
| WAVE-045 | **Implemented** | Corrected actual newline splitting and heading/extension/whitespace expressions in document titles, Trash titles and search snippets. Regression test covers multi-line Markdown and Trash title extraction. |
| WAVE-046 | **Implemented** | Added and used a shared conflict-copy path helper that strips a normal `.md` suffix correctly, including uppercase extensions. Regression test covers nested paths and extension case. |
| WAVE-047 | **Partial — source safeguards implemented** | Favorite writes now use a per-workspace queue and an immutable favorites snapshot; delayed callbacks no longer read another workspace's global favorites ref. Queue ordering and workspace isolation are covered by a helper test; full React/workspace-switch integration testing remains outstanding. |
| WAVE-048 | **Partial — source safeguards implemented** | Flush now persists revisions until the editor content is stable. Page open/create/template/duplicate/workspace activation and Trash flows perform guarded flushes; destructive Trash operations temporarily lock the editor. A delayed-write revision test covers the stable-flush primitive; browser transition tests remain outstanding. |
| WAVE-049 | **Implemented** | Backup creation is serialized and allocates a unique destination before copying. Snapshot consistency now includes SHA-256 digests of document and asset contents, not only size/timestamp metadata. Concurrent-backup regression test verifies distinct snapshots. |
| WAVE-050 | **Implemented** | Trash restore is serialized by Trash item ID across tabs where Web Locks are available. Concurrent restore test verifies exactly one call succeeds and only one page is created. |
| WAVE-051 | **Implemented** | Attachment Markdown paths now use one parent segment per document path segment. Regression tests cover root, one-level and multi-level nested pages. |

## 17.2 Earlier partial findings

- **WAVE-019 remains partial:** external edit detection is implemented, but browser-level multi-tab and external-editor conflict scenarios have not been exercised.
- **WAVE-020 remains partial:** backup snapshots now include SHA-256 content digests and backup creation is serialized against other backup calls. A workspace-wide operation lock coordinating every document, asset, settings and Trash mutation is not yet in place; browser/filesystem fault-injection remains necessary.
- **WAVE-031 remains partial:** CI now runs 26 Node storage and concurrency-helper tests. There is still no browser E2E suite using the real File System Access API, actual IndexedDB, permission revocation and React component transitions.
- **WAVE-039 remains partial:** the journal is serialized and reads the newest record, but debounce/pagehide writes cannot guarantee completion if the browser process is terminated before IndexedDB commits.

## 17.3 Regression coverage added

The suite grew from 14 to **26 tests**. New tests cover:

- concurrent backup allocation and distinct snapshots;
- unique directory allocation and restore destination collision safety;
- failed restore markers and refusal to open incomplete restores;
- concurrent restore of the same Trash item;
- real newline parsing for document titles, Trash titles and search snippets;
- conflict-copy filename normalization;
- stale workspace-generation rejection;
- newest draft-record selection;
- relative attachment paths at three nesting depths;
- revision-stable flush behavior during a delayed save;
- per-workspace async queue ordering.

The draft tests exercise the newest-record selector and queue primitives; they do not replace browser-backed IndexedDB integration tests. The workspace-generation test exercises the guard helper, not a rendered React component.

## 17.4 Current status summary

- **43 of 51 findings** now have implementation-level fixes recorded (36 original findings plus 7 newly closed findings).
- **8 findings remain partial:** WAVE-019, WAVE-020, WAVE-031, WAVE-039, WAVE-041, WAVE-042, WAVE-047 and WAVE-048.
- The 8 cross-cutting risks still require the browser, performance, compatibility and filesystem verification described earlier.
- Latest verified code revision: `94dbaaa447291cc9e29cfb5b51de80eadff79b60`.
- CI: [43601335473](https://github.com/iamjpsonkar/Wave/actions/runs/43601335473) — success; 26 passed, 0 failed; typecheck and production build passed.

**Release gate:** do not describe the bug audit as fully closed. The next reliability step is browser E2E and real IndexedDB/File System Access API fault-injection for the eight partial findings and cross-cutting risks. No next feature milestone is started by this remediation pass.

### Current verification note

- Status: **Source-verified implementation present**.
- Recheck: use the reproduction and regression scenarios above as release checks.
- Evidence boundary: source review at `1f676a2317339b29bdca9952b0288ded25a58616`; browser-specific timing, multi-tab behavior, permission failures, and crash recovery still require their relevant runtime tests.
- Note: Current source contains the corrective implementation. Re-run the reproduction and regression scenarios below; runtime/browser behavior is not claimed unless covered by CI or an explicit manual test.

---

## Current recheck — 2026-11-14

**Reviewed source:** `74314ab702b05f4c3d123d3f6fc466689d6a103d` plus subsequent browser-test and documentation commits on `main`.

### WAVE-020 — closed

- `openWorkspace()` registers all workspace directory handles under a shared workspace lock key.
- Initialization and Wave-managed mutations (Markdown writes, page/folder creation, asset writes, settings changes/reset, Trash moves/list-recovery/restores/deletes, backup creation and backup restore) use the same cross-tab Web Lock. Environments without Web Locks use an in-process queue.
- Backup generation hashes the source documents/assets before copying, hashes them again after copying, and independently hashes the copied backup tree. A copied tree that differs from the pre-copy source is rejected even if the source appears unchanged at the final scan.
- Manifest/settings content is also compared before, after and in the copied backup.
- Two regression tests cover a Wave write waiting behind backup verification and a copy that differs from the source snapshot.
- Limitation: external applications do not participate in Wave's lock. Source-before/source-after and copied-content checks detect observed changes, but cannot coordinate an external writer that changes files in a way the filesystem does not expose during the observation window.

### WAVE-031 — partially closed

- Added `playwright.config.ts` and six Chromium E2E scenarios, run by CI after installing Playwright and Chromium.
- Tests use native OPFS `FileSystemDirectoryHandle` instances as a deterministic browser filesystem fixture; only the user gesture's folder-picker method is stubbed.
- Covered: workspace creation/autosave, recovery draft reload, Trash restore, backup restore, root/nested attachments and mobile navigation.
- Still missing: native user-selected folder permission prompts/revocation, cross-tab race scenarios, external editor interference, comprehensive keyboard/accessibility checks and OS-level browser termination.

### WAVE-039 — improved, still partial

- Removed the 120 ms draft debounce; the editor starts `saveDraft()` directly in the input handler.
- Added best-effort draft writes when the document becomes hidden and on `pagehide`.
- UI reports when the recovery-draft transaction commits, separately from the Markdown file autosave.
- Playwright verifies recovery after reload once the IndexedDB write has completed.
- IndexedDB is asynchronous; abrupt process termination before commit can still lose the newest edit. No claim of crash-proof recovery is made.


## Follow-up reliability remediation — 2026-11-14

- WAVE-042 draft-journal cross-tab isolation: each browser tab now has a session-scoped draft identity. Draft saves update only that tab's record, and a successful Markdown save clears only its own recovery record; another tab's unsaved draft is preserved. The new two-tab Chromium regression scenario checks that both concurrent edits survive as either saved Markdown or a retained recovery draft.
- WAVE-031 browser coverage: the suite now adds simulated File System Access permission denial and two-tab concurrent editing to the existing six journeys. Native picker prompts/revocation and full keyboard/accessibility coverage remain outstanding.
- WAVE-039 durability: draft write transactions request IndexedDB `strict` durability where supported, with a compatibility fallback. This reduces the persistence window but cannot guarantee recovery if the browser process is killed before the asynchronous transaction commits.
- Verified source CI: [run 43603278555](https://github.com/iamjpsonkar/Wave/actions/runs/43603278555) on `b11b46eebc1558de9910d8523cdaa027817b087d` — 30 Node tests and all 9 Chromium E2E tests passed; typecheck and production build passed.
