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
        └── <id>.json
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
- IndexedDB stores only the recent directory handle; workspace documents and assets remain in the selected folder.

## Browser constraints

The current folder workflow depends on the File System Access API. Use a secure context (HTTPS or localhost) and a supported Chromium browser. Firefox and Safari require a different storage experience. A desktop shell is the long-term route for consistent native filesystem access.

## Reliability rules

- Write through the storage adapter and close writable streams before reporting success.
- Never silently overwrite an existing asset or restored document.
- Backups must include documents, assets and workspace metadata.
- Deletion should be recoverable through Trash before permanent removal.
- Treat search indexes as derived data; Markdown files remain authoritative.
- Introduce explicit schema migrations before changing the workspace format.
