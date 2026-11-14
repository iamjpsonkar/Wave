# Wave architecture

## Product contract

Wave is a local-first workspace. The user chooses a directory and Wave creates a `.wave/` folder inside it. Documents, attachments, backups and trash live in that folder. Wave does not require an account and the application has no document-storage backend.

The browser stores the most recently selected FileSystemDirectoryHandle in IndexedDB to offer a reopen shortcut. The registry stores only the handle reference. A separate IndexedDB draft journal can temporarily store unsaved editor text so it can be recovered after a tab closes or reloads; saved document content remains in the workspace folder. Clearing browser site data can remove these unsaved recovery drafts. Reopening checks read-write permission and requests it again from an explicit user action when needed. Users can always choose a folder again instead.

## Current workspace format

```text
<user-selected-directory>/
└── .wave/
    ├── manifest.json
    ├── settings.json
    ├── documents/
    │   ├── Welcome.md
    │   └── Engineering/
    │       └── Notes.md
    ├── assets/
    │   ├── diagram.png
    │   └── reference.pdf
    ├── backups/
    │   └── backup-<timestamp>/
    │       ├── manifest.json
    │       ├── settings.json
    │       ├── documents/
    │       └── assets/
    └── trash/
        ├── <id>.md
        ├── <id>.json
        └── <id>.op.json
```

- Markdown is the source of truth for documents.
- Empty directories under `documents/` are discovered independently of Markdown files, so newly created empty folders remain visible after refresh.
- Assets are ordinary files. Markdown references them using relative paths into `../assets/` (with additional parent segments for nested documents).
- `manifest.json` stores workspace identity and schema version.
- `settings.json` stores workspace preferences.
- Backup snapshots are copy-based and remain readable without Wave.
- Trash metadata records the original path and deletion timestamp so a page can be restored.

## Application layers

1. **React UI** — workspace onboarding, navigation, editor, preview and status.
2. **Document experience** — Markdown editing, formatting helpers and sanitized rendering.
3. **Storage adapter** — filesystem operations in `src/storage.ts`. Keep this API independent of React.
4. **Browser filesystem adapter** — currently uses the File System Access API and explicit user-selected directory permission.

A future Tauri adapter should implement the same storage operations. The editor and workspace UI should not need to know whether storage is browser-backed or native.

## Privacy and security

- No account, analytics SDK or document API is included.
- No document or asset content is uploaded by the application.
- The current stylesheet requests DM Sans, DM Mono and Playfair Display from Google Fonts. This sends a font request to Google when the stylesheet loads; system fallbacks are available, but the fonts are not bundled. A future privacy-hardening change should bundle licensed font files or use system fonts.
- Markdown is rendered with sanitization. Local images and attachment links are resolved from the selected workspace; remote images are not fetched by the preview.
- External links open separately with `rel="noreferrer"`.
- The browser permission model is explicit and can require user re-authorization.
- IndexedDB stores the recent directory handle and temporary unsaved-draft records; saved workspace documents and assets remain in the selected folder.

## Browser constraints

The current folder workflow depends on the File System Access API. Use a secure context (HTTPS or localhost) and a supported Chromium browser. Firefox and Safari require a different storage experience. A desktop shell is the long-term route for consistent native filesystem access.

## Reliability rules

- Write through the storage adapter and close writable streams before reporting success.
- Never silently overwrite an existing asset or restored document.
- Backups must include documents, assets and workspace metadata.
- Deletion should be recoverable through Trash before permanent removal.
- Treat search indexes as derived data; Markdown files remain authoritative.
- Introduce explicit schema migrations before changing the workspace format.


## Current reliability safeguards

The current Markdown-based MVP includes the following protections while the longer-term storage-engine redesign remains planned:

- Autosave writes are serialized per document and explicit navigation/save operations cancel pending debounce timers before flushing.
- A revision-aware UI status avoids reporting a newer edit as saved when only an older revision has completed.
- Before replacing a document, Wave compares the current on-disk content with the last content it observed. External changes produce a conflict instead of a silent overwrite; the user can reload or save the draft as a separate copy.
- A separate IndexedDB draft journal keeps unsaved editor text recoverable across reloads. The editor starts the journal write directly from each input event (rather than waiting for a debounce), and pagehide/visibility-change handlers make an additional best-effort write. Reads and writes are serialized with Web Locks where available, duplicate legacy records are reconciled, and the newest record is selected. The UI distinguishes a committed recovery draft from the Markdown file save. Draft writes start directly from the input event, request strict IndexedDB transaction durability where supported, and keep separate per-tab records so one tab cannot clear another tab's unsaved draft. IndexedDB remains asynchronous, so abrupt process termination before transaction commit can still lose the latest keystroke; this is not a durability guarantee or a replacement for backups.
- Trash moves write and verify a copy before removing the original, and use operation markers to reconcile interrupted operations when safe and surface ambiguous states. Restore allocates a new unique filename rather than replacing an existing page.
- Backups use in-progress/complete/failed markers and unique destination allocation. Source document and asset snapshots include SHA-256 content digests, and the copied backup tree is hashed independently and compared with the pre-copy snapshot before completion. Workspace initialization and Wave-managed document, folder, asset, settings, Trash and backup mutations share a cross-tab Web Lock (with an in-process fallback), so a backup cannot interleave with a Wave-managed write. External tools are not covered by this lock; before/after and copied-content checks detect observed changes. Restore creates a unique separate workspace folder and writes an in-progress/complete/failed restore marker; incomplete restore folders are refused as workspaces.
- Page, folder, asset, backup and Trash-restore allocation is serialized, uses cross-tab Web Locks where available, and avoids case-only collisions across common filesystems. Restoring the same Trash item concurrently produces only one restored page.
- Async workspace mutations carry a generation token so late completions cannot publish state into a different active workspace. Editor transitions flush revisions until the text is stable; destructive Trash transitions temporarily lock the editor.
- Storage and concurrency-helper regression tests run in CI with Node's built-in test runner. Playwright Chromium E2E tests also exercise workspace creation/autosave, IndexedDB draft recovery after reload, Trash restore, backup restore, root and nested attachments, and the mobile navigation drawer using native OPFS directory handles. The suite also checks the File System Access permission-denial contract and same-workspace concurrent edits across two tabs. Native picker prompts/revocation, external-editor fault injection, comprehensive accessibility checks and abrupt browser-process termination remain outstanding.


## Deployment boundary — static Docker hosting

The optional Docker image is a **static delivery layer**, not another storage adapter or a backend. A Node 22 build stage runs the existing Vite production build; an unprivileged Nginx runtime serves `dist/` on port 8080. Docker Compose applies a read-only root filesystem, drops Linux capabilities, enables no-new-privileges and provides only a temporary writable filesystem.

The browser still runs the React application. The File System Access API continues to access a directory selected by the browser user on that user's device. The container does not mount, own, synchronize or back up that directory. IndexedDB remains browser-local and is not shared by the container. Consequently, static hosting does not provide accounts, multi-user access, collaboration, remote persistence, an API or SQLite.

For remote deployment, terminate TLS at a trusted reverse proxy and use HTTPS so browser secure-context requirements are met. Authentication and network access controls must be supplied by the deployment environment if needed. See [Docker deployment](DOCKER.md) for exact commands and limitations.
