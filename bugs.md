# Wave — Bug and Engineering Risk Audit

> Audit date: 2026-11-14  
> Repository: https://github.com/iamjpsonkar/Wave  
> Branch: main  
> Reviewed revision: 9840fa3d10ef1cb0a2bd6916981cc2b3a2afb6a5  
> App version: 0.2.0  
> Review type: Static source-code and documentation review

This report records implementation defects, reliability risks, and usability issues found in the current source. It distinguishes confirmed code-path problems from risks requiring runtime reproduction and from planned features that are not bugs.

## Severity and confidence

| Priority | Meaning |
|---|---|
| P0 — Data safety | An ordinary workflow can lose or overwrite document data. Fix before relying on Wave for important content. |
| P1 — High | A core workflow is incorrect, fragile, or can fail without safe recovery. |
| P2 — Medium | Significant usability, performance, accessibility, or maintainability issue. |
| P3 — Low | Documentation, polish, or lower-impact engineering debt. |

Confidence:
- **Confirmed:** behavior is directly visible in the implementation.
- **High:** a concrete failure path exists, but runtime reproduction is still recommended.
- **Needs verification:** behavior depends on browser scheduling, filesystem semantics, workspace size, or external edits.

This was a static audit. Browser automation, filesystem fault injection, and a production build were not run. Do not treat an item as a reproduced runtime failure unless explicitly stated.

---

# 1. Data safety and persistence

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

## WAVE-005 — Trash operations can leave partial records

- Priority: **P1** | Confidence: **Confirmed failure windows; recovery needs fault injection**
- Files: src/storage.ts:101-111,122-138

### Problem
Moving to Trash writes the Markdown file, writes metadata JSON, then removes the original. Restore and permanent deletion also remove two files sequentially. A failure between steps can leave orphan metadata, orphan Markdown, or duplicate content.

### Fix
Add an operation journal with operation ID and state. Make steps idempotent; verify the Trash copy before deleting the source; validate metadata/file pairs; provide a recovery report for incomplete operations.

### Tests
Inject a failure after every write/remove step and verify retry/recovery returns the workspace to a consistent state.

## WAVE-006 — One malformed Trash metadata file can break the entire Trash view

- Priority: **P1** | Confidence: **Confirmed**
- Files: src/storage.ts:113-120; src/App.tsx:32

### Problem
listTrash() parses every JSON file without per-item error handling or schema validation. One truncated or edited file rejects the whole operation. loadTrash() does not catch the rejection, leaving an unhandled promise rejection instead of a usable Trash screen.

### Fix
Validate id, title, originalPath, and deletedAt; isolate parse errors per item; show valid entries while identifying corrupt entries; recover orphaned Markdown files; catch errors at the UI boundary.

### Tests
Malformed JSON, missing fields, metadata without Markdown, and Markdown without metadata.

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

## WAVE-008 — Attachment upload can append a link to the wrong document

- Priority: **P1** | Confidence: **High; reproduce with delayed file write**
- File: src/App.tsx:51

### Problem
attachment() calculates a relative asset URL using the active document path, then awaits addAsset(). After the await, it appends Markdown using the current content state. If the user switches documents during upload, the link can be appended to the newly active document even though its relative path was calculated for the previous document.

### Fix
Capture document identity and revision at upload start. On completion, append to that same document or detect that the active document changed and ask where to insert the attachment. Never append to whichever document happens to be active when the promise resolves.

### Test
Delay addAsset(), switch documents, then verify the link is inserted only into the intended document with the correct relative path.

## WAVE-009 — Attachment input is not reset after selection

- Priority: **P2** | Confidence: **Confirmed**
- File: src/App.tsx:54

### Problem
The file input handles onChange but does not clear its value after upload. Selecting the same file again may not emit another change event.

### Fix and test
Clear the input value after capturing the selected file, including on failure. Attach the same file twice without selecting another file in between.

## WAVE-010 — Local Markdown link detection relies on a substring

- Priority: **P2** | Confidence: **Confirmed**
- File: src/App.tsx:19-23

### Problem
A link is treated as a local asset whenever its URL contains assets/. An external URL such as https://example.com/assets/guide.pdf can be misclassified as a local file. Other relative links that do not follow this substring convention are treated as external.

### Fix
Parse URLs and allow only explicitly supported workspace-relative asset paths. Reject schemes/origins in the local resolver, normalize path segments, and keep external URLs on the external-link path.

### Tests
Workspace assets, external URLs containing /assets/, query strings, encoded names, root-relative paths, and unsupported schemes.

## WAVE-011 — Invalid percent encoding can throw during Markdown asset resolution

- Priority: **P2** | Confidence: **High**
- File: src/App.tsx:10-12

### Problem
decodeURIComponent() is evaluated before the promise chain is created. Malformed percent encoding in user-authored Markdown can throw synchronously inside the effect and bypass the chained catch.

### Fix and test
Use a guarded parser and render a missing-asset state on invalid input. Preview documents with malformed percent-encoded image and file paths.

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

## WAVE-013 — Nested folders are discovered but rendered as a flat list

- Priority: **P2** | Confidence: **Confirmed**
- Files: src/App.tsx:31,54; src/storage.ts:55-67

### Problem
The storage adapter discovers folders recursively, but the sidebar renders every folder at the same level. Documents are associated with their immediate parent, but folder ancestry is not represented as a recursive tree.

### Fix
Build a recursive tree from folder paths. Render direct child folders and documents with stable IDs and independent expand/collapse state.

### Tests
Use root documents, empty folders, and at least four nested levels. Verify hierarchy, expansion, selection, and search.

## WAVE-014 — Selecting a folder does not scope the visible page list

- Priority: **P2** | Confidence: **Confirmed**
- File: src/App.tsx:54

### Problem
Clicking a folder changes selectedFolder, which affects where a newly created page is stored. It does not filter the sidebar or show a scoped folder view. All folders and pages remain rendered.

### Fix
Define folder-selection semantics. Show the selected folder's direct contents and breadcrumbs or an explicit tree selection state. Keep search results distinct from normal browsing.

## WAVE-015 — Search has no path context or keyboard result navigation

- Priority: **P2** | Confidence: **Confirmed**
- File: src/App.tsx:30,54

### Problem
Search filters title and body content in memory. Results have no matching snippet, folder breadcrumb, match highlighting, or arrow/Enter navigation.

### Fix
Show title, snippet, and folder path; add keyboard navigation and Escape; separate search results from folder rendering; use a rebuildable local index for large workspaces.

## WAVE-016 — Favorite references can become stale

- Priority: **P2** | Confidence: **Confirmed**
- Files: src/App.tsx:40,52

### Problem
Favorites are stored as document path strings. Moving a page to Trash does not remove its favorite reference. Restoring under a different path leaves a stale reference; reusing the original path can make an unrelated page inherit the old favorite state.

### Fix
Prefer stable document IDs, or reconcile favorite paths whenever documents move, restore, rename, or delete. Remove invalid references during integrity checks.

---

# 4. Performance, backups, and external changes

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

## WAVE-018 — Backup creation has no restore workflow or retention policy

- Priority: **P1** | Confidence: **Confirmed missing capability, not a defect in the copy routine**
- Files: src/storage.ts:75-99,189-195; src/App.tsx:38,54

### Problem
Wave creates snapshots and can list backup directory names, but there is no user-facing backup browser, restore preview, or restore operation. Repeated backups have no retention/cleanup policy.

### Fix
Add a backup browser with timestamps and file counts; validate snapshots; restore to a new workspace/staging directory first; show a preview/diff and require confirmation before replacement; report partial failures. Add retention only after safe restore exists.

### Test
Back up, modify/delete files, restore to a separate workspace, and compare contents and metadata.

## WAVE-019 — External filesystem changes are not detected

- Priority: **P2** | Confidence: **Confirmed missing capability; conflict risk depends on usage**
- Files: src/storage.ts:39-73; docs/ROADMAP.md

### Problem
Users can edit workspace Markdown outside Wave, but the app does not watch for changes or compare the on-disk version before writing. An external editor, sync client, or another Wave tab can change a file while Wave holds stale content.

### Fix
Record last observed modification time and preferably a content hash. Check the on-disk version before replacement. Offer reload, keep local, or save conflicted copy. A future desktop file watcher helps, but should not replace pre-write conflict checks.

## WAVE-020 — Backup snapshots can be inconsistent with external edits

- Priority: **P2** | Confidence: **Needs runtime verification**
- File: src/storage.ts:75-99

### Problem
Backup copies documents and assets sequentially. The UI flushes the active editor, but the copy is not coordinated with external modifications or other Wave tabs. A snapshot may contain files from different points in time.

### Fix
Use a workspace-level operation lock for Wave-managed writes, capture source metadata before/after copying, and flag snapshots if source files changed during backup.

### Test
Modify a document and asset while a slowed backup runs. Verify the snapshot is consistent or explicitly marked incomplete.

---

# 5. Error handling and state management

## WAVE-021 — Async UI actions can reject without user feedback

- Priority: **P1** | Confidence: **Confirmed**
- Files: src/App.tsx:32,35,37,43-48

### Problem
Some event handlers invoke async operations with void but do not catch errors. Examples include document creation, template creation, opening a document, and keyboard-triggered flush. Permission revocation or filesystem failures can become unhandled promise rejections instead of visible, recoverable errors.

### Fix
Catch errors at event boundaries or use a shared async action wrapper. Preserve the current draft on failure, show actionable feedback and retry, and add an application error boundary for render-time failures.

## WAVE-022 — Save status is not tied to a document revision

- Priority: **P1** | Confidence: **Confirmed**
- File: src/App.tsx:37,47

### Problem
A completed save can set Saved locally even if a newer edit happened after that save began. Opening a document also sets All changes saved without comparing persisted and current revisions.

### Fix
Derive status from current revision, saved revision, pending write, and last error. Show saved only when revisions match.

## WAVE-023 — Settings parsing silently hides corruption and read errors

- Priority: **P2** | Confidence: **Confirmed**
- File: src/storage.ts:174-183

### Problem
readWorkspaceSettings() catches every error and returns an empty object. Missing settings, malformed JSON, and permission failures are treated identically. A later write can replace unreadable settings and lose preferences.

### Fix
Distinguish missing files from malformed content and access errors. Preserve the original file, report corruption, and offer a recoverable reset.

## WAVE-024 — Favorite writes are not serialized

- Priority: **P2** | Confidence: **High**
- File: src/App.tsx:40

### Problem
Each toggle reads settings, computes an array from the current React state closure, and writes the whole settings object. Rapid toggles can overlap and resolve out of order, losing updates.

### Fix and test
Serialize settings mutations and compute each update from the latest committed state. Toggle multiple pages rapidly and verify persistence after reload.

---

# 6. Responsive UI and accessibility

## WAVE-025 — Mobile sidebar hides essential navigation

- Priority: **P2** | Confidence: **Confirmed**
- File: src/styles.css:2

### Problem
Below 520 px, CSS hides page rows and all navigation buttons except the first. Folder links and settings are also hidden. There is no replacement drawer or mobile navigation surface.

### Fix
Use a slide-out navigation drawer or mobile workspace switcher. Preserve search, folders, Trash, and page access. Add open/close controls and focus management.

### Tests
Test 320, 375, 430 px, tablet, and desktop widths. Verify core actions remain reachable by touch and keyboard.

## WAVE-026 — Short viewport layout can clip the workspace

- Priority: **P2** | Confidence: **High; verify on actual short/mobile viewports**
- File: src/styles.css:2

### Problem
The app uses height:100vh with min-height:560px. On viewports shorter than 560 px, the app can exceed the visible viewport. The rule does not use dynamic viewport units for mobile browser chrome changes.

### Fix
Use dynamic viewport-aware sizing with a fallback, allow inner panels to scroll, and avoid forcing the whole app above the viewport height.

## WAVE-027 — Keyboard shortcuts intercept keys without checking focus

- Priority: **P2** | Confidence: **Confirmed**
- File: src/App.tsx:48

### Problem
The global handler intercepts Ctrl/Cmd+N and Ctrl/Cmd+K regardless of the focused element. This can conflict with browser/input behavior. The effect is also re-registered on every render because it has no dependency array.

### Fix
Ignore shortcuts inside inputs, textareas, selects, and editable content unless explicitly supported there. Use a stable effect/current callbacks. Add Escape behavior and keyboard navigation for search/dialogs.

## WAVE-028 — Some visible controls are placeholders or non-interactive

- Priority: **P3** | Confidence: **Confirmed**
- File: src/App.tsx:54

### Problem
Settings explicitly displays SOON. The overflow icon/avatar are rendered as visual elements without corresponding actions.

### Fix
Implement the affordance or render it clearly as disabled/non-interactive with an explanation.

---

# 7. Documentation and project quality

## WAVE-029 — Privacy/font documentation contradicts the stylesheet

- Priority: **P2** | Confidence: **Confirmed**
- Files: src/styles.css:1; README.md; docs/ARCHITECTURE.md

### Problem
The stylesheet imports DM Sans, DM Mono, and Playfair Display from Google Fonts. README mentions Google Fonts, while the architecture document says the UI uses system fonts and does not request third-party font files.

### Fix
Choose one policy: keep Google Fonts and accurately disclose the third-party request/offline fallback, or bundle fonts/use system fonts and remove the external import. Verify the network panel and update both documents.

## WAVE-030 — Workspace manifest updatedAt is initialized but not maintained

- Priority: **P3** | Confidence: **Confirmed**
- File: src/storage.ts:12-16

### Problem
The manifest receives createdAt and updatedAt when first created, but updatedAt is not updated as workspace content changes.

### Fix
Update metadata through a centralized repository operation, or remove the field until its semantics are implemented. Document which operations affect it.

## WAVE-031 — No automated storage/browser regression tests are configured

- Priority: **P1** | Confidence: **Confirmed**
- Files: package.json; .github/workflows/ci.yml

### Problem
Package scripts expose typecheck and build. CI runs install, typecheck, and build, but no test script or unit/integration/browser test suite is configured.

### Fix
Add:
1. Unit tests for path validation, slug generation, and metadata validation.
2. Storage-adapter tests using a fake filesystem or browser-compatible test environment.
3. Fault-injection tests for Trash, restore, and backup.
4. Browser tests for workspace switching, autosave, attachment upload, and mobile navigation.
5. CI execution of all tests on pull requests.

A successful typecheck/build is not evidence that data-integrity workflows are correct.

---

# 8. Additional risks to verify

These are not asserted as confirmed defects. They need explicit tests before a wider release.

| ID | Risk | Why it matters | Verification |
|---|---|---|---|
| R-01 | Multiple Wave tabs on one workspace | Both tabs can hold stale document state and write to the same files | Edit the same document in two tabs; verify conflict detection |
| R-02 | Permission revoked while editor is open | Pending saves and later actions can fail | Revoke permission during typing and during a save |
| R-03 | Very large Markdown files | Full-file reads and textarea editing can cause latency | Test 1 MB, 5 MB, and 10 MB documents |
| R-04 | Very large asset collections | Backup copies assets sequentially | Benchmark thousands of assets |
| R-05 | Backup interrupted by tab close/crash | Partial snapshots may remain | Terminate during copy; verify incomplete-backup detection |
| R-06 | Concurrent uploads with the same filename | Name check and write are separate operations | Run simultaneous uploads; verify unique names |
| R-07 | Browser compatibility outside Chromium | File System Access API is not uniformly supported | Test Firefox/Safari and provide adapter or clear unsupported state |
| R-08 | Unicode and case-sensitive paths | Slugging/normalization can collide across filesystems | Test Unicode, case-only differences, and platform-specific paths |

---

# 9. Planned features, not bugs

These are explicitly absent from the current MVP or roadmap and should not be treated as regressions:

- Rich block editor, slash commands, and draggable blocks.
- Database engine and table/board/gallery/calendar/timeline views.
- Comments, mentions, collaboration, presence, and team permissions.
- Page history and revision comparison.
- Internal page links and backlinks.
- Folder rename/delete and document rename/move.
- Import/export beyond the current Markdown workflow.
- Tauri desktop shell, native file watching, and cross-browser storage adapters.
- Optional encrypted sync.

These belong in the product roadmap. The data-loss, restore-collision, and navigation-transition findings above are defects or reliability gaps in already implemented workflows.

---

# 10. Recommended remediation order

## Release gate A — Protect user data

- [x] WAVE-001 — Flush before opening Trash.
- [x] WAVE-002 — Flush before workspace switch.
- [x] WAVE-003 — Collision-safe restore with no overwrite.
- [x] WAVE-004 — Serialized, revision-aware document writes.
- [x] WAVE-005 — Trash operation journal, safe rollback/finalization and automatic reconciliation when inspecting Trash.
- [x] WAVE-006 — Per-item Trash validation and error isolation.
- [x] WAVE-021 — Catch async failures and preserve drafts.
- [x] WAVE-022 — Revision-aware save status.
- [~] WAVE-031 — Storage regression tests run in CI; browser E2E tests remain.

## Release gate B — Make core workflows dependable

- [x] WAVE-007 — Transactional workspace activation.
- [x] WAVE-008 — Bind attachment upload to its originating document.
- [x] WAVE-010 — Correct local/external URL classification.
- [x] WAVE-011 — Guard malformed URL decoding.
- [x] WAVE-017 — Avoid reading all Markdown content on every refresh.
- [x] WAVE-018 — Implement backup browser and restore workflow (restore creates a separate workspace folder).
- [~] WAVE-019 — Detect and prevent external overwrite; reload/save-as-copy actions are available, browser conflict tests remain.
- [x] WAVE-023 — Preserve and report corrupt settings.

## Release gate C — Improve daily usability

- [x] WAVE-009 — Reset attachment input.
- [x] WAVE-012 — Multi-line toolbar formatting.
- [x] WAVE-013 — Recursive folder tree.
- [x] WAVE-014 — Clear folder selection semantics.
- [x] WAVE-015 — Search snippets and keyboard navigation.
- [x] WAVE-016 — Reconcile stale favorite references after deletion/restore.
- [x] WAVE-024 — Serialize settings updates.
- [x] WAVE-025 — Mobile navigation.
- [x] WAVE-026 — Short viewport layout.
- [x] WAVE-027 — Focus-aware keyboard shortcuts.
- [x] WAVE-028 — Clarify placeholder controls.

## Release gate D — Documentation and scale

- [~] WAVE-020 — Detect source changes during backup and reject inconsistent snapshots; no global lock/hash-based snapshot yet.
- [x] WAVE-029 — Align privacy/font documentation.
- [x] WAVE-030 — Maintain manifest metadata.
- [ ] R-01 through R-08 — Verify additional risks.

---

# 11. Definition of done for the reliability milestone

Wave should not consider its local-first reliability milestone complete until:

- A user cannot lose a recent edit by opening Trash, switching workspaces, or navigating away.
- Older saves cannot overwrite newer document revisions.
- Restore never silently replaces an existing document.
- Interrupted Trash operations can be detected and recovered.
- Corrupt Trash/settings metadata does not make the rest of the workspace inaccessible.
- Save status reflects the actual persisted revision.
- Failed writes leave the draft available for retry or export.
- Backups can be validated and restored safely.
- External modifications are detected before a conflicting overwrite.
- Storage and browser regression tests run in CI.

**Audit conclusion:** Wave has a promising local-first foundation, but the highest priority is data safety. Fix navigation flush paths and restore collision first, then introduce serialized revision-aware writes and recovery tests. Rich editor and database work should follow only after these guarantees are in place.


---

# 12. Supplemental audit findings — follow-up pass (2026-11-14)

This pass reviewed the current `main` implementation again, focusing on state transitions, asynchronous operations, failure cleanup, and build reproducibility. The findings below are additional to WAVE-001 through WAVE-031 and are not duplicates of those entries.

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

## WAVE-039 — Closing or reloading within the autosave debounce window loses the latest edit

- Priority: **P1** | Confidence: **High**
- File: `src/App.tsx` — autosave `useEffect()`

### Problem
The editor waits 600 ms after the latest content change before starting `saveDoc()`. There is no page-hide/visibility transition handling or durable draft journal. If the user closes or reloads the tab during that debounce window, the timer is discarded and the latest edit has never been written to the workspace.

### Impact
A user can type a final sentence and immediately close the tab, losing that edit despite the product presenting autosave as a core workflow. This is particularly risky when users assume the editor is continuously saving.

### Fix
Show an explicit unsaved state until the write is complete. Add a recoverable local draft journal (for example, IndexedDB) or another durable mechanism that does not rely solely on an unload-time asynchronous filesystem write. A page-hide flush can be best-effort, but must not be the only guarantee because browsers may terminate the page before asynchronous work completes.

### Regression tests
Edit content and close/reload immediately, at 100 ms, and after the debounce starts. Verify the latest text is either persisted or recoverable after reopening, and that the UI never claims it was saved prematurely.

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
- **Regression tests:** Node's built-in test runner covers path/slug behavior, non-overwriting page creation, Trash restore collisions, corrupt Trash isolation, backup completion, external edit detection, folder collisions, permission errors, concurrent allocation and incomplete backup exclusion.

## Partially complete — do not treat as fully closed

| Finding | Current state | Remaining work |
|---|---|---|
| WAVE-019 | External edits are detected before overwrite; the user can reload or save a separate copy | Add browser-level multi-tab/external-editor tests and more explicit conflict details |
| WAVE-020 | Snapshot source metadata is compared before and after backup; inconsistent snapshots are marked failed and excluded | Add workspace-wide operation coordination and stronger content-hash verification |
| WAVE-031 | Storage tests are in CI | Add browser E2E tests for navigation, permissions, draft recovery, attachments, mobile layout and real File System Access behavior |
| WAVE-039 | Drafts are persisted to IndexedDB after a short debounce and on pagehide | Browser termination can still occur before an asynchronous draft write completes; test real crash/reload timing and consider a stronger write-through strategy |

## Additional risks still requiring explicit verification

- R-01/R-02: multi-tab editing and permission revocation need browser-level scenarios.
- R-03/R-04: large Markdown and large asset collection benchmarks have not been run.
- R-05/R-06: interrupted backup and concurrent cross-tab uploads have implementation safeguards but need fault-injection/browser verification.
- R-07: Chrome/Edge are the intended current browsers; Firefox/Safari need a separate adapter and compatibility testing.
- R-08: case-normalized allocation is implemented; Unicode and platform-specific filesystem behavior still need a compatibility matrix.

## CI and release gate

The repository now includes a committed npm lockfile and uses `npm ci`. The CI workflow runs `npm test`, `npm run typecheck` and `npm run build`. Latest verified run: [43599601850](https://github.com/iamjpsonkar/Wave/actions/runs/43599601850) — success; 13 tests passed, 0 failed.

Do not begin the next feature milestone until the current CI run is green and the remaining browser-level verification items have been reviewed. No storage reliability claim should be interpreted as a substitute for keeping an independent backup of important data.
