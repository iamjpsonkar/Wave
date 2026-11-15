# Wave

> **AI agents and automated contributors:** Read [AGENTS.md](./AGENTS.md) before starting any task. It is the single-entry operating guide for what Wave is, why its engineering rules exist, and how to plan, implement, test and document changes.

**Your thoughts. Your space.**

Wave is a local-first workspace for notes, documents and ideas. Choose a folder and Wave creates a portable `.wave/` workspace inside it. Your Markdown pages and attachments remain ordinary files you own.

[Features](./trash/FEATURES.md) · [Roadmap](./trash/docs/ROADMAP.md) · [Architecture](./trash/docs/ARCHITECTURE.md) · [Documentation index](./trash/docs/README.md) · [Docker guide](./trash/docs/DOCKER.md)

## What Wave includes today

- **Writing:** Markdown editor, formatting helpers, sanitized live preview, GFM tables, task lists, footnotes, alerts, collapsible details, math and local Mermaid previews.
- **Organization:** nested folders, page templates, favorites, duplicate pages, wiki links, backlinks and document search.
- **Discoverability:** searchable in-editor Markdown sample library with rendered preview and one-click source insertion.
- **Local assets:** images and file attachments stored alongside the workspace and referenced with portable relative paths.
- **Data safety:** autosave, external-edit conflict checks, unsaved-draft recovery, recoverable Trash, verified backups and restore to a separate workspace.
- **Responsive workspace:** full-window editor, mobile navigation and keyboard-oriented workflows.

See [FEATURES.md](./trash/FEATURES.md) for the combined shipped-feature overview and detailed feature map. The [complete product blueprint](./trash/upcoming-features.md) and [priority plan](./trash/priority-features.md) retain the wider agreed scope; planned items are not represented as shipped.

## Choose how to run Wave

### 1. Local development

Requirements: Node.js 22.6+ and npm.

```bash
git clone https://github.com/iamjpsonkar/Wave.git
cd Wave
npm ci
npm run dev
```

Open the Vite URL (normally [http://localhost:5173](http://localhost:5173)) in a supported Chromium browser and select a folder to create or open a workspace.

### 2. Production build

```bash
npm ci
npm test
npm run typecheck
npm run build
npm run preview
```

The production site is generated in `dist/` and can be served by any static web host that supports SPA fallback to `index.html`.

### 3. Docker / self-hosted static web hosting

Requirements: Docker Engine and Compose v2.

```bash
docker compose up --build -d
```

Open [http://localhost:8080](http://localhost:8080). To choose another host port, set `WAVE_PORT=8090` before starting Compose. Stop it with:

```bash
docker compose down
```

The container builds the frontend and serves static files through an unprivileged Nginx process. It uses a read-only root filesystem, drops Linux capabilities and exposes an HTTP health check. See the [Docker deployment guide](trash/docs/DOCKER.md) for standalone Docker, HTTPS/reverse-proxy and troubleshooting instructions.

**Important:** Docker currently hosts the browser application only. It does not add a backend, database, user accounts, shared server-side workspace or collaboration service. When a user opens Wave, the browser still accesses a folder on that user's own device through the File System Access API. For remote access, serve the site over HTTPS; browser filesystem access and supported-browser requirements still apply.

## Development and quality checks

```bash
npm ci
npm test
npm run typecheck
npm run build

# Optional Playwright Chromium browser suite
npm install --no-save --package-lock=false @playwright/test@1.55.0
npx playwright install chromium
npm run test:e2e
```

GitHub Actions runs Node tests, TypeScript checks, a production build and the Playwright suite. Container image construction is also checked in CI.

## Workspace format

```text
<chosen-folder>/
└── .wave/
    ├── manifest.json
    ├── settings.json
    ├── documents/  # Markdown pages and nested folders
    ├── assets/     # ordinary uploaded files
    ├── backups/    # verified workspace snapshots
    └── trash/      # recoverable deleted pages and metadata
```

Markdown documents and ordinary assets are the current workspace source of truth. Browser IndexedDB stores the recent folder handle and temporary unsaved recovery drafts; it is not the canonical document store.

## Privacy, security and browser support

- The current application has no server API, analytics SDK or document upload service.
- Saved pages and assets stay in the folder explicitly selected by the user.
- The File System Access API requires a secure context (HTTPS or localhost), explicit permission and a supported browser. Chromium-based browsers provide the intended workflow; Firefox and Safari need an alternate storage adapter.
- Recent workspace handles and temporary unsaved drafts are browser-local. Clearing browser site data can remove them. Keep independent backups of important work.
- Markdown preview is sanitized; raw HTML/scripts are not enabled and remote images are not fetched as part of preview.
- The interface currently requests DM Sans, DM Mono and Playfair Display from Google Fonts, with local system fallbacks.

## Project structure

```text
src/                  React application, Markdown and storage adapters
tests/                Node storage tests and Playwright browser tests
docs/                 Architecture, feature map, roadmap and deployment docs
docker/               Nginx static hosting configuration
.github/workflows/    CI automation
*.md                  Product blueprints and engineering registers
```

The consolidated feature, UI and QA registers reduce duplicate files while preserving their meaningful requirements, stable IDs and historical evidence. The complete product blueprint, priority plan, development logs and open/fixed bug registers remain separate because they serve distinct purposes. Start with the [documentation index](./trash/docs/README.md) to find the right one.

## Product direction

Wave's personal core remains local-first and useful without an account. Optional collaboration, connected services, richer database capabilities and a desktop application remain planned work. A versioned SQLite store and server-side services require explicit migration, authorization, integrity, export and recovery design; static Docker hosting does not imply those capabilities. See [the product constitution](./trash/upcoming-features.md#20-wave-product-constitution--decisions-based-on-the-product-owners-answers).


## Project context

- [Wave Wiki — complete product, repository and AI-agent context](./WIKI.md)
## Documentation location note

The repository's current tree keeps the detailed product and engineering reference documents under `trash/` (including `trash/docs/` and the product/QA trackers). These are tracked files and must not be assumed deleted or disposable solely because of the directory name. Use the exact paths linked above and in the repository tree. Do not move, rename or purge them without first migrating their meaningful content, checking inbound links and obtaining the task's intended scope.
