# Wave

**Your thoughts. Your space.** Wave is a local-first workspace for notes, documents and ideas. Choose a folder; Wave creates a `.wave/` directory there and stores workspace data on your device.

## Principles
- **Local-first:** document content and assets stay in the directory selected by the user.
- **Portable:** documents are Markdown files and assets are ordinary files.
- **No account required:** this MVP has no application backend.
- **User-owned:** users can inspect, copy and back up their workspace.

## Current MVP (0.2)
- [x] Browser folder selection using the File System Access API
- [x] Initialize `.wave/` with manifest, settings, documents and assets
- [x] List, create, open and autosave Markdown documents
- [x] Store images and file attachments locally with collision-safe names
- [x] Markdown formatting toolbar and sanitized live preview
- [x] Nested folders and pages
- [x] Search page titles and document content
- [x] Create complete local backup snapshots of documents, assets and workspace settings
- [x] Move documents to local Trash, restore them or permanently delete them
- [ ] Rich block editor with draggable content blocks
- [ ] Tauri desktop application

## Development
Requires Node.js 20+ and Chrome or Edge.

```bash
npm install
npm run dev
npm run typecheck
npm run build
```

Open the Vite URL and choose a folder to initialize a workspace.

## Workspace layout
```text
<chosen-folder>/
└── .wave/
    ├── manifest.json
    ├── settings.json
    ├── documents/  # Markdown pages
    └── assets/     # Uploaded images and files
```

## Privacy and browser support
The app has no server API or analytics. The File System Access API requires a secure context (HTTPS or localhost), explicit user permission and a supported browser. Permissions may need to be granted again after reload. Chromium-based browsers currently provide the intended experience; Firefox and Safari need an alternate adapter. The interface uses system fonts and makes no third-party font requests. The app can work without contacting an application server after it has been loaded.

The UI uses a small storage adapter in `src/storage.ts`. Keep this boundary independent of React so a future Tauri adapter can provide the same operations.

**Early MVP:** do not rely on this preview as the only copy of important documents until recovery and backup features are implemented.