# Wave architecture

## Product contract

Wave is a local-first workspace. The user chooses a directory and Wave creates a `.wave/` folder inside it. Documents, attachments, backups and trash live in that folder. Wave does not require an account and the application has no document-storage backend.

The browser may retain a local permission handle in a future release to make reopening easier, but that handle is only a pointer/permission record. It must never become a second copy of user content.

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
        └── <id>.json
```

- Markdown is the source of truth for documents.
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
- Typography uses system fonts; the UI does not request third-party font files.
- Markdown is rendered with sanitization. Local images and attachment links are resolved from the selected workspace; remote images are not fetched by the preview.
- External links open separately with `rel="noreferrer"`.
- The browser permission model is explicit and can require user re-authorization.

## Browser constraints

The current folder workflow depends on the File System Access API. Use a secure context (HTTPS or localhost) and a supported Chromium browser. Firefox and Safari require a different storage experience. A desktop shell is the long-term route for consistent native filesystem access.

## Reliability rules

- Write through the storage adapter and close writable streams before reporting success.
- Never silently overwrite an existing asset or restored document.
- Backups must include documents, assets and workspace metadata.
- Deletion should be recoverable through Trash before permanent removal.
- Treat search indexes as derived data; Markdown files remain authoritative.
- Introduce explicit schema migrations before changing the workspace format.
