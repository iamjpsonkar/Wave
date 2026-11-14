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
- [x] Markdown formatting toolbar and sanitized live preview with local asset rendering
- [x] Nested folders and pages, including empty folders
- [x] Search page titles and document content
- [x] Create complete local backup snapshots of documents, assets and workspace settings
- [x] Move documents to local Trash, restore them or permanently delete them
- [x] Remember the most recently opened workspace handle locally and offer permission-aware reopening
- [x] Built-in templates for meetings, projects, task lists, weekly plans, research and decisions
- [x] Favorite pages with persistent workspace settings
- [x] Favorites navigation for quick access to pinned pages, including compact mobile shortcuts
- [x] Duplicate an existing page without changing the original
- [x] Full-window workspace layout with a responsive, width-expanding editor and content area
- [ ] Full Notion/Quip-inspired feature set (see the feature map and roadmap)
- [ ] Rich block editor with draggable content blocks
- [ ] Tauri desktop application

## Feature showcase

See [features.md](features.md) for the capabilities currently implemented in Wave. Read [upcoming-features.md](upcoming-features.md) for the expanded product blueprint, research across 20+ workspace tools, and the complete planned feature catalogue. The [detailed feature map](docs/FEATURES.md) tracks implementation status, while the [roadmap](docs/ROADMAP.md) summarizes delivery phases.

## Product scope

See [upcoming-features.md](upcoming-features.md) for the full future feature catalogue and product strategy. [docs/FEATURES.md](docs/FEATURES.md) tracks what is shipped versus planned, and [docs/ROADMAP.md](docs/ROADMAP.md) tracks delivery by release.

## Development
Requires Node.js 22+ and Chrome or Edge.

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
    ├── documents/  # Markdown pages and nested folders
    ├── assets/     # Uploaded images and files
    ├── backups/    # Local workspace snapshots
    └── trash/      # Recoverable deleted pages
```

## Privacy and browser support
The app has no server API or analytics. The File System Access API requires a secure context (HTTPS or localhost), explicit user permission and a supported browser. Wave stores only the selected directory handle in browser IndexedDB to offer a recent-workspace shortcut; it does not store document contents there. Permissions may need to be granted again after reload or when the browser revokes access. Chromium-based browsers currently provide the intended experience; Firefox and Safari need an alternate adapter. The interface uses DM Sans, DM Mono and Playfair Display from Google Fonts; once loaded, the app can work without contacting an application server. The app can work without contacting an application server after it has been loaded.

The UI uses a small storage adapter in `src/storage.ts`. Keep this boundary independent of React so a future Tauri adapter can provide the same operations.

**Early MVP:** do not rely on this preview as the only copy of important documents until recovery and backup features are implemented.