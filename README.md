# Wave

**Your thoughts. Your space.**

Wave is a local-first workspace for notes, documents and ideas. Choose a folder and Wave creates a portable `.wave/` workspace inside it. Your Markdown pages and attachments remain ordinary files you own.

[Features](./etc/product/FEATURES.md) · [Roadmap](etc/product/ROADMAP.md) · [Architecture](etc/engineering/ARCHITECTURE.md) · [Documentation index](docs/README.md) · [GitHub Pages guide](docs/GITHUB_PAGES.md) · [Docker guide](etc/engineering/DOCKER.md)

## What Wave includes today

- **Writing:** Markdown editor, formatting helpers, sanitized live preview, GFM tables, task lists, footnotes, alerts, collapsible details, math and local Mermaid previews.
- **Organization:** nested folders, page templates, favorites, duplicate pages, wiki links, backlinks and document search.
- **Discoverability:** searchable in-editor Markdown sample library with rendered preview and one-click source insertion.
- **Local assets:** images and file attachments stored alongside the workspace and referenced with portable relative paths.
- **Data safety:** autosave, external-edit conflict checks, unsaved-draft recovery, recoverable Trash, verified backups and restore to a separate workspace.
- **Responsive workspace:** full-window editor, mobile navigation and keyboard-oriented workflows.

See [FEATURES.md](./etc/product/FEATURES.md) for the combined shipped-feature overview and detailed feature map. The [complete product blueprint](etc/product/upcoming-features.md) and [priority plan](etc/product/priority-features.md) retain the wider agreed scope; planned items are not represented as shipped.

## Choose how to run Wave

### 1. Local development

Requirements: Node.js 22.6+ and npm.

```bash
git clone https://github.com/iamjpsonkar/Wave.git
cd Wave
./run.sh
```

`run.sh` installs locked dependencies only when they are missing, then starts the Vite development server. It does not run build or test commands before starting (the server is a long-running process). Use `./run.sh --install` to force a clean dependency install. To expose the dev server on your LAN, use `WAVE_HOST=0.0.0.0 ./run.sh`; set `WAVE_PORT` to change the port.

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

### 3. GitHub Pages (automatic from `main`)

Wave is configured to deploy to [https://iamjpsonkar.github.io/Wave/](https://iamjpsonkar.github.io/Wave/) after the main-branch functional CI checks pass. The workflow builds the Vite app with the `/Wave/` project-site prefix, uploads `dist/`, and deploys it through GitHub Pages. On first setup, open **Repository Settings → Pages → Build and deployment** and select **GitHub Actions** as the source. Later pushes to `main` deploy automatically. Pull requests run CI but do not publish the site.

The Pages build uses a repository-specific asset base path. Local development and Docker builds keep the normal `/` path. GitHub Pages hosts only the frontend; each visitor still selects a local folder in their own supported browser. See the [GitHub Pages deployment guide](docs/GITHUB_PAGES.md).

### 4. Docker / self-hosted static web hosting

Requirements: Docker Engine and Compose v2.

```bash
docker compose up --build -d
```

Open [http://localhost:8080](http://localhost:8080). To choose another host port, set `WAVE_PORT=8090` before starting Compose. Stop it with:

```bash
docker compose down
```

The container builds the frontend and serves static files through an unprivileged Nginx process. It uses a read-only root filesystem, drops Linux capabilities and exposes an HTTP health check. See the [Docker deployment guide](etc/engineering/DOCKER.md) for standalone Docker, HTTPS/reverse-proxy and troubleshooting instructions.

**Important:** Docker currently hosts the browser application only. It does not add a backend, database, user accounts, shared server-side workspace or collaboration service. When a user opens Wave, the browser still accesses a folder on that user's own device through the File System Access API. For remote access, serve the site over HTTPS; browser filesystem access and supported-browser requirements still apply.

## Development and quality checks

```bash
./test.sh
```

`test.sh` is the local one-command quality gate and runs the same checks as CI: Node tests, TypeScript typecheck, production build and Playwright Chromium E2E. It installs project dependencies if missing, installs the CI-matched Playwright runner when needed, and downloads Chromium if needed. The first run requires network access. On Linux systems missing Chromium OS libraries, install them with `npx playwright install --with-deps chromium` (or install the required packages through your distribution).

Useful variants:

```bash
./test.sh --no-e2e                # Node tests + typecheck + production build
./test.sh --skip-browser-install  # reuse an already-installed Playwright Chromium
npm run test:local                # same full local suite
```

Individual commands remain available: `npm test`, `npm run typecheck`, `npm run build` and `npm run test:e2e`.

GitHub Actions runs Node tests, TypeScript checks, a production build and the Playwright suite. Separate credential-free workflows run OpenGrep security-pattern analysis and ESLint code-quality checks. Container image construction is also checked in CI.

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
- The interface uses system font stacks; it does not request remote Google Fonts assets.

## Project structure

```text
src/                  React application, Markdown and storage adapters
tests/                Node storage tests and Playwright browser tests
docs/                 Architecture, feature map, roadmap and deployment docs
docker/               Nginx static hosting configuration
.github/workflows/    CI automation
*.md                  Product blueprints and engineering registers
```

The consolidated feature, UI and QA registers reduce duplicate files while preserving their meaningful requirements, stable IDs and historical evidence. The complete product blueprint, priority plan, development logs and open/fixed bug registers remain separate because they serve distinct purposes. Start with the [documentation index](docs/README.md) to find the right one.

## Product direction

Wave's personal core remains local-first and useful without an account. Optional collaboration, connected services, richer database capabilities and a desktop application remain planned work. A versioned SQLite store and server-side services require explicit migration, authorization, integrity, export and recovery design; static Docker hosting does not imply those capabilities. See [the product constitution](etc/product/upcoming-features.md#20-wave-product-constitution--decisions-based-on-the-product-owners-answers).


## License

Wave is licensed under the [MIT License](./LICENSE) (SPDX identifier: `MIT`). It may be used, modified, and redistributed, including commercially, provided the copyright and license notice are retained in copies or substantial portions. The license disclaims warranty and limits liability; see the complete [LICENSE](./LICENSE) text for the terms.

The MIT license was selected to permit broad reuse, forks, modification and redistribution without a copyleft requirement, while preserving attribution through the notice condition. Contributions intended for inclusion are offered under the same MIT License; see the [contributor guide](./etc/engineering/CONTRIBUTING.md).


## Third-party licenses and notices

Wave's source code is licensed under the [MIT License](./LICENSE). Third-party packages and assets retain their own licenses and attribution conditions; those terms are not replaced by Wave's MIT license. See [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md) for the dated dependency and asset inventory, known obligations and maintenance process. Run `npm run license:audit` after changing dependencies. After reviewing upstream license terms, refresh the committed exact-version inventory with `npm run license:audit:update`. CI checks that the inventory matches the lockfile; neither command is a legal compatibility review.


## Security program

Wave's security automation and application-security work is tracked in [GitHub issue #120](https://github.com/iamjpsonkar/Wave/issues/120). Automated checks are triage signals, not security certification. Security tooling must not upload user workspace content or introduce telemetry.

## Project context

- [Wave Wiki — complete product, repository and AI-agent context](./WIKI.md)


## Project documentation

The canonical product, engineering, quality and implementation-history references are indexed in [etc/README.md](./etc/README.md). Contributor and team procedures are in [howto/README.md](./howto/README.md) and the [contributor guide](./etc/engineering/CONTRIBUTING.md). Planned capabilities are not shipped claims; consult current source and verification evidence.

## Security and privacy

Wave's current security model, known limitations and security-automation procedures are documented in [the threat model](docs/SECURITY_THREAT_MODEL.md) and [security operations guide](docs/SECURITY_OPERATIONS.md). Automated scanners supplement, and do not replace, manual security and legal review. The current application remains local-first; vault encryption, sync, team permissions, plugins and server-side sharing are not implemented.
