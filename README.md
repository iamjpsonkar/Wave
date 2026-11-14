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
- [x] Create verified local backup snapshots with incomplete-snapshot detection
- [x] Browse verified backups and restore to a separate workspace folder
- [x] Move documents to local Trash, restore them without overwriting collisions, or permanently delete them
- [x] Journal interrupted Trash operations and safely reconcile recoverable partial states
- [x] Preserve corrupt workspace settings and offer backup-before-reset recovery
- [x] Recover unsaved drafts from browser-local IndexedDB after reload
- [x] Serialize recovery-journal updates across tabs and reconcile duplicate draft records
- [x] Guard asynchronous workspace actions against stale completions and keep flushing edits until the current revision is saved
- [x] Allocate unique backup/restore destinations and mark incomplete restores so they cannot be opened accidentally
- [x] Detect same-size backup changes with SHA-256 content snapshots
- [x] Coordinate workspace initialization, document, folder, asset, settings, Trash and backup mutations with a shared workspace lock
- [x] Verify copied backup files and workspace settings against their pre-copy content hashes before marking a snapshot complete
- [x] Detect external edits before overwriting a document and offer reload or save-as-copy
- [x] Serialize page/asset creation and prevent case-only filename collisions
- [x] Remember the most recently opened workspace handle locally and offer permission-aware reopening
- [x] Built-in templates for meetings, projects, task lists, weekly plans, research and decisions
- [x] Favorite pages with persistent workspace settings
- [x] Favorites navigation for quick access to pinned pages, including compact mobile shortcuts
- [x] Duplicate an existing page without changing the original
- [x] Full-window workspace layout with a responsive, width-expanding editor and content area
- [x] Mobile navigation drawer, nested folder tree, scoped folder contents and keyboard-navigable search
- [ ] Full Notion/Quip-inspired feature set (see the feature map and roadmap)
- [ ] Rich block editor with draggable content blocks
- [ ] Tauri desktop application

## Feature showcase

See [features.md](features.md) for the capabilities currently implemented in Wave. Read [upcoming-features.md](upcoming-features.md) for the expanded product blueprint, research across 20+ workspace tools, and the complete planned feature catalogue. The [detailed feature map](docs/FEATURES.md) tracks implementation status, while the [roadmap](docs/ROADMAP.md) summarizes delivery phases.

## Product scope

See [upcoming-features.md](upcoming-features.md) for the full future feature catalogue and product strategy. [docs/FEATURES.md](docs/FEATURES.md) tracks what is shipped versus planned, and [docs/ROADMAP.md](docs/ROADMAP.md) tracks delivery by release.

## Development
Requires Node.js 22.6+ and Chrome or Edge.

```bash
npm install
npm run dev
npm run typecheck
npm run build

# Optional browser regression suite (Chromium)
npm install --no-save --package-lock=false @playwright/test@1.55.0
npx playwright install chromium
npm run test:e2e
```

Open the Vite URL and choose a folder to initialize a workspace. CI runs the Playwright suite against Chromium using native Origin Private File System directory handles as a deterministic filesystem fixture; it does not replace manual permission testing with a user-selected folder.

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
The app has no server API or analytics. The File System Access API requires a secure context (HTTPS or localhost), explicit user permission and a supported browser. Wave stores the selected directory handle and short-lived unsaved recovery drafts in browser IndexedDB. Saved documents and assets remain in the selected folder; recovery drafts are a local safety net and can be cleared with browser site data. Permissions may need to be granted again after reload or when the browser revokes access. Chromium-based browsers currently provide the intended experience; Firefox and Safari need an alternate adapter. The interface uses DM Sans, DM Mono and Playfair Display from Google Fonts; once loaded, the app can work without contacting an application server. The app can work without contacting an application server after it has been loaded.

The UI uses a small storage adapter in `src/storage.ts`. Keep this boundary independent of React so a future Tauri adapter can provide the same operations.

**Early MVP:** keep an independent copy of important work. Wave now has local recovery drafts and verified backup/restore, but browser-local drafts can be removed if site data is cleared; backups should be stored separately from the original workspace.

The expanded blueprint also covers specialist workflows including typed knowledge graphs, research and PDF annotation, visual/technical diagramming, static documentation publishing, workflow automation, personal productivity, digital asset management, lightweight CRM, and cross-cutting requirements for data integrity, accessibility, security, performance and portability.


## Product architecture direction

Wave is planned as a two-mode workspace: an offline-capable personal core and an online layer for collaboration, sharing and connected services. User content remains in a portable, user-controlled workspace; the planned canonical store is a versioned SQLite database with ordinary asset files and Markdown/JSON/CSV export. A user-managed Docker deployment is a later target for online services. See [section 20 of the product blueprint](upcoming-features.md#20-wave-product-constitution--decisions-based-on-the-product-owners-answers) for the detailed decisions, migration strategy, security model, vertical slices and release gates.
