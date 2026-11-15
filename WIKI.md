# Wave Wiki — Complete Product, Repository and AI-Agent Context

> **Purpose:** This is the main orientation document for any developer or AI agent working on Wave. Read it before planning or editing code. It explains the product, current architecture, user decisions, project-wide working instructions, implementation history, quality gates, documentation map, roadmap and known limitations.
>
> Repository: https://github.com/iamjpsonkar/Wave  
> Default branch: `main`  
> Context reviewed: 2026-11-15  
> Canonical detailed handoff: [DEV_CONTEXT.md](./DEV_CONTEXT.md)
> Start here for the complete project/product/agent guide: [WIKI.md](./WIKI.md)  
> Product scope source of truth: [upcoming-features.md](./etc/product/upcoming-features.md)

---

## 1. Start here — mandatory reading order for an AI agent

Before making any change:

1. Read this `WIKI.md` in full enough to understand the relevant section.
2. Read [DEV_CONTEXT.md](./DEV_CONTEXT.md) for the current source baseline, implementation invariants, exact commands, latest known verification and task workflow.
3. Read [etc/engineering/CONTRIBUTING.md](./etc/engineering/CONTRIBUTING.md) for repository contribution conventions and license-maintenance requirements.
4. Read [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md) before changing dependencies or third-party assets.
5. Read the relevant source files and tests. Never assume that documentation accurately describes current code without checking it.
6. Read the relevant tracker(s): [bugs.md](./etc/quality/bugs.md), [fixed-bugs.md](./etc/quality/fixed-bugs.md), [consolidated UI backlog](./etc/product/UI_BACKLOG.md), [Markdown gap checklist](./etc/product/markdown-coverage.md), [priority plan](./etc/product/priority-features.md), and/or [GitHub issue index](./etc/quality/github-issues.md).
7. Read [upcoming-features.md](./etc/product/upcoming-features.md) before proposing a feature. It is the complete feature inventory; a feature absent from the short priority plan is not permission to drop it.
8. Check the latest GitHub `main` commit and CI runs before claiming anything is current or verified.

### Agent operating contract

- Treat the repository as an ongoing product, not a disposable prototype.
- Preserve all features, ideas, requirements, IDs, decisions, historical notes and acceptance criteria already agreed. **Do not remove scope to make a document shorter or a task easier.**
- When the user says “go ahead”, “build it”, “pick next one”, or similar in an implementation context, proceed with implementation rather than only giving a plan. Choose the next uncompleted item from the applicable priority list if the user has not named one.
- Make coherent implementation batches: inspect → plan briefly → implement → add/update regression tests → update the correct tracker and feature docs → verify what can be verified → record the work.
- Implement the underlying behavior, not just a UI mock, documentation claim or disabled control. Visible controls must work or be clearly identified as planned/disabled.
- Preserve existing functionality while adding features. Do not replace or regress earlier work to make room for new work.
- Fix root causes and add regression coverage. Re-check related entries in the fixed-bug register when changing the affected code.
- Do not claim a test, browser journey, native permission flow, visual check, Docker runtime or CI job passed unless the exact run/evidence confirms it.
- Separate source inspection, test definitions, local test execution, CI execution, manual QA and native-environment QA in all reports.
- Keep changes scoped, readable, typed and consistent with existing architecture. Avoid unnecessary dependencies and premature abstractions.
- Update the relevant development log(s): `etc/history/dev-fixed.md` for fixes and regressions; `etc/history/dev-build.md` for features, build/CI and implementation batches. Keep both histories useful and append/update rather than erasing prior entries.
- **Update `DEV_CONTEXT.md` as the final documentation action of an implementation batch.** It is the concise, current developer handoff and should point to the detailed logs and trackers.
- **Documentation is part of task completion, not optional cleanup.** After every implementation, bug-fix, refactor, QA audit, dependency/configuration change or user-visible behavior change, review the Markdown documentation affected by that work before reporting completion. Update the relevant feature/status map, bug/UI/QA register, roadmap/priority tracker, user guide, development log and handoff as applicable. If no Markdown file needs a content change, record that conclusion in the appropriate development log; do not make meaningless edits just to touch a file.
- **Use the smallest authoritative set of Markdown files.** Before creating a new `.md`, search for an existing file with the same responsibility. Prefer updating an existing source of truth. Create a new file only when it has a distinct durable audience/purpose and add it to `docs/README.md` and this wiki's file map.
- **No orphan Markdown files.** Every maintained `.md` must have a clear owner, purpose, navigation link (where appropriate), and update rule. Avoid duplicate status tables and competing copies of the same requirements.
- **Consolidation and deletion are allowed.** Before deleting an `.md`, migrate its meaningful current guidance, unique requirements, IDs, statuses, acceptance criteria, decisions, evidence and useful history into an existing or new authoritative `.md`. Check inbound links and update them, verify the destination contains the material, then delete the old file. Preserve Git history; do not retain empty pointer files unless a compatibility requirement justifies them.
- **After each task, perform a Markdown hygiene pass:** check changed-file references, links/case-sensitive paths, stale claims, duplicated/conflicting status, feature IDs and tracker cross-links; update navigation indexes. Never delete meaningful history or product scope merely to reduce file count.
- The user explicitly instructed that development work should use `etc/history/dev-fixed.md` and `etc/history/dev-build.md`, not keep editing the legacy `etc/quality/bugs.md` / `etc/quality/fixed-bugs.md` registers as general progress logs. Keep the bug registers as their own QA records; only change them when a task explicitly calls for a bug-register reconciliation or a real status change.
- Never silently delete, merge destructively, rename or rewrite a context file. If consolidation is requested, first migrate every unique requirement, status, ID, decision, evidence item and link; verify references; only then remove a source file with explicit scope approval.
- When a user asks for a broad audit, inspect the actual repository and trackers. Do not infer completeness from a previous assistant response.

---

## Documentation enforcement after every task

**A task is not complete until its Markdown impact has been reviewed.** This applies to features, bug fixes, refactors, QA audits, dependency/configuration changes, CI/deployment changes and user-visible behavior changes.

### Required end-of-task documentation pass

1. Identify the behavior, decision, status or architecture that changed.
2. Update the existing authoritative Markdown source(s), not every file indiscriminately:
   - Shipped behavior → `FEATURES.md`, relevant user guide and/or `docs/MARKDOWN_SUPPORT.md`.
   - Product scope or a new idea → `upcoming-features.md`; delivery ordering/dependencies → `etc/product/priority-features.md`.
   - UI defects/gaps/proposals → `etc/product/UI_BACKLOG.md`, preserving UIB/UI/UIF IDs.
   - Open/fixed defect status → `etc/quality/bugs.md` / `etc/quality/fixed-bugs.md` only when a genuine QA register change is required.
   - QA evidence and limitations → `QA_CONTEXT.md`.
   - Fix/regression history → `etc/history/dev-fixed.md`; features/build/CI/deployment history → `etc/history/dev-build.md`.
   - Architecture/deployment/contributor guidance → relevant file under `docs/` or `CONTRIBUTING.md`.
3. Update cross-links and navigation indexes (`README.md`, `docs/README.md`, `WIKI.md`) when the file map, onboarding or durable project rules change.
4. Update `DEV_CONTEXT.md` **last** with the current baseline, changed areas, verification state and links to the detailed records.
5. If no existing Markdown needs a content change, record in the appropriate development log why documentation was not applicable. Never create filler edits.

### Markdown quality rules

- One authoritative location per type of information; link to it rather than copy/paste competing status tables.
- Keep current status separate from dated history. Label historical counts, CI results and implementation snapshots with their commit/date.
- Preserve stable IDs, acceptance criteria, meaningful owner decisions, rationale and evidence. Do not mark work shipped/fixed without verification.
- Use relative, case-correct links and verify every renamed/moved/deleted path.
- New Markdown files require a unique purpose, an owner/update rule and a navigation link. Search for an existing destination first.
- Consolidate related files when responsibilities overlap. Before deleting a Markdown file, migrate its meaningful information into an authoritative destination, update inbound links, verify the destination and only then delete the old file.
- Do not delete the full product catalogue, priority plan, development logs or distinct open/fixed bug registers merely to reduce file count.
- Do not update every Markdown file for every task. Update only the files whose facts or responsibilities changed, plus the required development log and final handoff.

## 2. Product vision and promise

Wave is evolving from a local-first Markdown workspace into a complete workspace for documents, knowledge, data and work. Its intended combination draws lessons from Notion, Quip, Coda, Obsidian, Anytype and Outline without copying proprietary implementations.

### Product pillars

1. **Write:** notes, documents, specifications, meeting notes and long-form writing.
2. **Connect:** pages, tasks, databases, people, files and decisions through links and a navigable knowledge graph.
3. **Organize:** workspaces, folders, tags, properties, collections, databases and multiple views.
4. **Execute:** tasks, projects, calendars, dashboards, forms and lightweight automation.
5. **Collaborate:** comments, discussions, shared documents, presence and optional real-time co-editing.
6. **Own:** local-first storage, open formats, offline access, transparent backups and user-controlled sync.
7. **Extend:** integrations, APIs, plugins, embeds and optional AI tools.

### Product constitution — decisions to preserve

- Wave must support two operating modes:
  - **Offline Core:** personal writing, organization and locally available structured data continue to work without a network connection after the app is available.
  - **Online Workspace:** optional online capabilities can add sharing, collaboration, remote integrations and other network-dependent workflows.
- Online does not mean Wave silently takes ownership of or gains readable access to user content. Data flows and trust boundaries must be explicit.
- The user's data remains accessible, portable and under the user's control.
- Local Markdown and ordinary files are the current MVP source of truth. A versioned SQLite canonical store is a future architecture direction, not current implementation.
- Markdown remains a supported interchange format, but every future structured object does not need to be forced into Markdown syntax.
- Every first-class data type needs a documented export path.
- Sync, collaboration, AI providers, telemetry, integrations and remote processing are explicit opt-ins with clear permission and disclosure.
- Keep the basic notes workflow simple. Advanced modules should be modular and must not clutter the default experience.
- Build useful end-to-end workflows, not feature parity for its own sake.
- Reliability, data integrity, accessibility, recovery, portability and security are release gates, not optional polish.

The full product constitution, feature catalogue, competitive research, dependencies and release sequence remain in [upcoming-features.md](./etc/product/upcoming-features.md). The actionable order is in [priority-features.md](./etc/product/priority-features.md).

---

## 3. Current application — verified repository shape

### Technology stack

- React 18, TypeScript 5.7 and Vite 6.
- Browser File System Access API for a user-selected workspace directory.
- IndexedDB for a remembered workspace directory handle and temporary unsaved recovery drafts only.
- Markdown pipeline based on `react-markdown`, `remark-gfm` and `rehype-sanitize`.
- `lucide-react` icons.
- Node built-in test runner for storage/safety tests.
- Playwright Chromium for end-to-end journeys.
- GitHub Actions CI on Node 22.
- Docker/Nginx static hosting is available; it does not create a backend.

Check `package.json`, lockfile, Vite config and CI workflow for exact current versions before changing dependencies or commands.

### Source map

| File | Responsibility |
|---|---|
| `index.html` | HTML entry point |
| `src/main.tsx` | React application bootstrap |
| `src/App.tsx` | Main workspace UI/state, onboarding/reopen, navigation, editor/autosave, Markdown preview, local assets, search, favorites, templates, Trash, backups/restore, command palette, backlinks, dialogs and recovery prompts |
| `src/storage.ts` | Filesystem/storage adapter: workspace initialization, document/folder/asset operations, settings, backups, Trash, integrity, path validation, collision handling, queues and locking |
| `src/workspaceRegistry.ts` | IndexedDB registry for recently used directory handle and permission-aware reopening; stores a handle, not document content |
| `src/draftJournal.ts` | Browser-local IndexedDB journal for temporary unsaved drafts, including tab/session identity and cross-tab behavior |
| `src/safety.ts` | Reliability primitives: task queues, workspace-generation checks, stable revision flush, relative asset paths and newest-draft selection |
| `src/markdown.tsx` | Markdown preprocessing, wiki-link extraction/resolution, alert blockquotes and code-block copy |
| `src/templates.ts` | Built-in page templates |
| `src/SnippetLibrary.tsx` | Contextual Markdown sample/snippet discovery, preview and insertion |
| `src/MarkdownBlockEditor.tsx` | Block-oriented Markdown editing surface |
| `src/EditorEnhancements.tsx` | Editor enhancement components |
| `src/styles.css` | App styling, themes, responsive behavior and print/export styling |
| `tests/storage.test.js` | Node storage, concurrency and safety regression tests |
| `tests/e2e/workspace.spec.ts` | Playwright Chromium user journeys |
| `config/vite.config.ts` | Vite configuration |
| `config/playwright.config.ts` | Playwright configuration and Vite test server |
| `config/tsconfig.app.json` | Application TypeScript project configuration |
| `.github/workflows/ci.yml` | CI quality gates, including container build/validation |
| `Dockerfile`, `compose.yaml`, `docker/nginx.conf` | Static frontend container and Nginx runtime |

### Current workspace data layout

```text
<user-selected-folder>/
└── .wave/
    ├── manifest.json
    ├── settings.json
    ├── documents/   # Markdown pages and nested folders
    ├── assets/      # ordinary uploaded files/images
    ├── backups/     # verified snapshots
    └── trash/       # recoverable deleted pages and operation metadata
```

- Markdown in `.wave/documents/` is the current canonical document content.
- Assets are ordinary files in `.wave/assets/`; Markdown references them using paths relative to document nesting.
- The manifest contains workspace identity/schema metadata.
- Settings contain preferences such as favorites.
- The recent-workspace registry is in IndexedDB database `wave-local`, object store `workspaces`.
- Temporary unsaved drafts are separate browser-local IndexedDB records. They are not the saved document store.
- Clearing browser site data can remove remembered handles and recovery drafts. Users need independent backups.

### Current user-facing capabilities

The current source/docs report a working foundation that includes:
- User-selected folder onboarding and `.wave/` initialization.
- Markdown page creation/open/list/autosave, nested folders and empty folders.
- Formatting toolbar, sanitized Markdown preview and GFM support.
- Local image/file attachments, collision-safe naming and relative links.
- Search over titles/content, snippets and keyboard result navigation.
- Recoverable Trash, restore without overwrite, permanent deletion and interrupted-operation reconciliation.
- Local backup snapshots, integrity verification, backup browsing and restore to a separate workspace.
- IndexedDB recovery drafts, per-tab isolation and cross-tab provenance.
- Revision-aware saves, stable flushes on transitions, workspace-generation guards, serialized writes and Web Locks with fallback.
- External-edit detection before overwrite, with reload or save-as-copy path.
- Case-insensitive collision protection and serialized allocation.
- Permission-aware recent-workspace reopening.
- Built-in templates: blank, meeting, project brief, task list, weekly plan, research notes and decision record.
- Favorites, duplicate page, responsive/mobile navigation, command palette and wiki-link/backlink behavior.
- Contextual Markdown sample library with category/search, preview/source and insertion into the current editor/selection.
- Markdown list Enter continuation, ordered numbering, nested indentation and empty-list exit behavior.
- Theme-aware formatting and color extensions, block background controls, Markdown/diagram rendering and PDF/print export work.

This list is an orientation snapshot, not proof that every path is currently regression-free. Confirm relevant code, tests and CI before making claims.

---

## 4. Core engineering invariants — do not break these

1. Never silently overwrite documents, assets, backups or restore destinations.
2. Validate workspace-relative paths; reject absolute paths, traversal segments, invalid separators and unsafe names.
3. Close writable streams before reporting success; abort failed writes while preserving the original error.
4. Serialize operations mutating the same workspace/resource; use Web Locks when available and a safe in-process fallback.
5. Treat async UI completions as stale when workspace generation changes. Never publish old-workspace results into the active workspace.
6. Editor transitions flush until the latest revision is persisted. Never mark a newer revision saved based on an earlier write.
7. Detect external document changes before overwrite; offer reload or save-as-copy.
8. Trash: verify the recoverable copy before deleting the original; journal/reconcile interrupted operations; restore to a unique destination.
9. Backup: allocate a unique destination; track in-progress/complete/failed; verify snapshot/copied content hashes before completion.
10. Restore to a unique separate workspace; refuse incomplete restore destinations.
11. Recovery status distinguishes pending from committed. IndexedDB is asynchronous; never claim crash-proof durability or protection before transaction commit.
12. Markdown preview stays sanitized. Do not execute raw HTML/scripts or fetch remote image content as part of preview.
13. External links remain safe (for example, `noreferrer`); treat workspace paths and file names as untrusted input.
14. New data shapes require schema/version/migration and backup/export/recovery consideration.
15. Preserve keyboard access, focus behavior, semantic labels, contrast, responsive/mobile behavior and reduced-motion/accessibility.
16. Never conflate Docker static hosting with server-side workspace storage, collaboration, sync or an API.

For architecture details see [architecture guide](./etc/engineering/ARCHITECTURE.md).

---

## 5. Project-wide instructions and decisions from Wave conversations

This section consolidates durable directions repeatedly given by the product owner in Wave project conversations and the latest explicit documentation/workflow choices.

### Preserve the whole product

- Wave has many features and long-term ideas. The user explicitly rejected removing earlier features when new priorities were added.
- `upcoming-features.md` is the complete feature catalogue; `etc/product/priority-features.md` orders work. Neither should be silently shortened.
- “Build all priority features” means implement the agreed priority scope in sensible batches, not delete lower-priority features or claim unimplemented work is shipped.
- When choosing the next task, inspect the latest backlog and current source, then pick the next unfinished, dependency-ready item.
- Maintain existing behavior, prior features, user decisions and historical context.
- The user requested a new priority feature plan and a durable development history rather than destructive edits to legacy registers.

### Documentation workflow

- `DEV_CONTEXT.md` is the canonical developer handoff for agents.
- `etc/history/dev-fixed.md` records implemented bug fixes and regression coverage.
- `etc/history/dev-build.md` records features, implementation batches, build/CI and verification evidence.
- `etc/quality/bugs.md` is the current open-bug register; `etc/quality/fixed-bugs.md` is the historical fixed-bug/regression register. They are not general implementation journals.
- The user explicitly directed development logs to be maintained in `etc/history/dev-fixed.md` and `etc/history/dev-build.md`, not to keep editing the legacy bug files for every implementation.
- Keep `etc/product/markdown-coverage.md` as the Markdown compatibility checklist. UI bugs, UI gaps and UI feature proposals now share `etc/product/UI_BACKLOG.md` with separate sections.
- Keep `upcoming-features.md` (full product scope) distinct from `etc/product/priority-features.md` (delivery order).
- Update relevant user-facing docs and trackers for every shipped feature. Update `DEV_CONTEXT.md` last in each implementation batch.

### UI/product requests recorded

- Wave's breadth makes feature discovery difficult. The user requested a right-side panel containing categorized/searchable examples; selecting a sample should show a preview in the panel while inserting its Markdown/source into the current editor/window.
- Enter in a Markdown list should create the next list item; ordered lists should increment, nested indentation should remain, task list continuation should work, and Enter on an empty list should exit the list. These behaviors require regression tests.
- Toolbar controls/icons must be distinct and understandable; the user noticed duplicate-looking code icons and requested correction. Keep icon semantics, labels, tooltips and keyboard behavior coherent.
- UI work must not remove other toolbar or workspace features.
- The user requested UI feature discovery and a dedicated UI feature backlog; track ideas and implementation status rather than losing them.
- Color formatting should be Markdown-safe/portable where possible, support foreground and background, and remain accessible and theme-aware. Do not assume custom syntax is universally portable; document its semantics and test round-trip.
- PDF export should export the rendered Preview, not raw editor source, and must be checked across themes, math, tables, details/disclosure blocks and Wave-specific color syntax.
- Technical learning-notes template should render correctly; regression coverage must guard template content and delimiters.
- Settings, dialogs, editor blocks, themes and responsive layouts need real keyboard/focus/contrast checks, not just appearance changes.

### Repository and deployment requests

- The user asked for a complete repository restructure, better documentation/readmes and Docker files to provide multiple ways to run/deploy Wave.
- Docker work implemented a static frontend deployment path. Preserve the explicit boundary: it serves the built Vite app through Nginx, and does not add a backend/database/account system, remote workspace storage, sync or collaboration.
- Keep Docker deployment instructions, Compose validation and container CI coverage aligned with actual files.
- When consolidating documentation, retain all source content/IDs/status/history and update links; do not discard content simply because files overlap.

---

## 6. Markdown/editor subsystem

Markdown is a core Wave capability and a major compatibility promise. Consult:
- [Markdown support guide](./etc/engineering/MARKDOWN_SUPPORT.md)
- [Markdown feature-gap checklist](./etc/product/markdown-coverage.md)
- [Consolidated UI backlog — bugs, gaps and feature proposals](./etc/product/UI_BACKLOG.md)

Key areas to preserve and test:
- CommonMark inline formatting, paragraphs, headings, anchors, links, images, escaping and literal characters.
- Lists including ordered, unordered, nested, task and continuation/exit behavior.
- Code fences, multiline code, syntax presentation and copy behavior.
- Blockquotes, tables, horizontal rules, GFM, alerts and HTML sanitization.
- Math/LaTeX and malformed-input/complexity safeguards.
- Mermaid and supported diagram formats, accessible labels/fallbacks and failure behavior.
- Emoji/special symbols, local images, missing asset fallbacks and alt text.
- Preview/source round-trip, import/export interoperability and safe rendering.
- Wave color extensions: foreground `[[color:#RRGGBB|text]]`, inline background `[[bg:#RRGGBB|text]]`, and block background marker `> [!COLOR=#RRGGBB]` as documented by the relevant implementation/tracker. Verify current parser and docs before changing syntax.

### Sample library and list keyboard behavior

The right-side contextual sample library is a feature-discovery mechanism, not merely a static help page:
- Samples are grouped by category (for example Text, Blocks, Lists, Data, Code, Advanced and Media).
- Search and category filtering should help a user find examples quickly.
- Preview should be visible in the side panel.
- The source/Markdown should be inserted at the current editor selection; if there is no active textarea in a non-editor mode, follow the documented append/fallback behavior.
- Insertion must preserve selection/caret semantics and not overwrite unrelated content.
- List Enter handling must distinguish list context from fenced code and ordinary paragraphs.
- Ordered list numbers increment; nested indentation and task-list marker behavior are preserved; an empty list item exits cleanly.

### PDF/print export

- Export the rendered Preview, retaining theme-independent readable output.
- Verify foreground/background contrast, Wave color extensions, display math, tables and collapsed `DETAILS` content.
- Keep export-specific UI defects in `etc/product/UI_BACKLOG.md` (UIB-001..006) until their evidence/status is reconciled.
- Do not mark visual issues closed based solely on source edits; inspect rendered output or record the evidence gap.

---

## 7. Current bug, QA and verification posture

### Open reliability/QA findings

The current open-bug snapshot in `etc/quality/bugs.md` identifies:
- **WAVE-031:** native user-picked-folder permission prompt and OS permission revocation, external filesystem edits racing reads/saves/backups/restores, actual browser process termination and comprehensive keyboard/screen-reader accessibility are not fully exercised.
- **WAVE-039:** IndexedDB recovery journal writes are asynchronous. A process kill before transaction commit can still lose the latest keystroke. Pending and committed states must remain distinct; do not claim crash-proof durability.

The QA context also notes WAVE-042 fixed in source with per-tab draft records/current-tab-only clearing and cross-tab recovery provenance coverage. Verify latest CI and code before relying on this as a release claim.

### Test inventory caveat

A prior QA source inventory listed 30 Node test definitions and 13 Playwright test definitions in `QA_CONTEXT.md`; another later bug-register snapshot described 30 Node tests and 28 Playwright scenarios. These are time-sensitive counts and may refer to different source baselines or test accounting. **Do not repeat a stale count as current.** Inspect the current test files and latest CI workflow.

### Verification ladder

Report these independently:
1. Static source inspection.
2. Test definitions present in source.
3. Unit/storage tests actually executed.
4. Typecheck actually executed.
5. Production build actually executed.
6. Playwright E2E actually executed.
7. CI job/run completed and passed.
8. Manual browser/UI/visual inspection.
9. Native browser/OS picker, permission, lifecycle and filesystem behavior tested on real supported platforms.

A mocked OPFS picker fixture is not the native OS folder picker. A successful post-commit draft recovery test does not prove survival of a process kill before the IndexedDB transaction commits. A source change is not proof of visual correctness.

### Required verification for changes

At minimum, when the environment allows:
```bash
npm ci
npm test
npm run typecheck
npm run build
# Match the CI Playwright version/setup in package.json and CI:
npm install --no-save --package-lock=false @playwright/test@1.55.0
npx playwright install chromium
npm run test:e2e
```

For Docker:
```bash
docker compose config -q
docker build -t wave:local .
docker compose up -d
docker compose ps
docker compose logs wave
```

Only report Docker runtime validation if an actual Docker runtime was available and the commands completed. CI container build is not the same as a local runtime test.

---

## 8. Product roadmap — complete scope, not just immediate work

The full catalogue in [upcoming-features.md](./etc/product/upcoming-features.md) spans:

- A. Writing, pages and block editor; CommonMark/GFM and advanced Markdown.
- B. Knowledge management, wiki and knowledge graph.
- C. Structured data model, database properties, views, formulas and calculations.
- D. Tasks, projects, calendars and operations.
- E. Comments, discussions, suggestions, review, real-time collaboration and team communication.
- F. Spreadsheet blocks and interactive document controls.
- G. Forms, workflows and automation.
- H. Search, navigation and personal productivity.
- I. Files, media and content capture.
- J. Import, export, portability and publishing.
- K. Local-first storage, privacy, security, sync and offline behavior.
- L. Integrations, APIs, plugins and developer platform.
- M. Optional AI-assisted workspace and knowledge operations.
- N. Desktop/mobile, accessibility and localization.
- O. Templates, examples and onboarding.
- P. Team administration and governance.
- Q. Whiteboards, canvas and visual thinking.
- R. Dashboards, reporting and analytics.
- S. Advanced knowledge and research workflows.
- T. Publishing, sharing and document delivery.
- U. Advanced task and operations management.
- V. Reusable components and connected work.
- W. Knowledge quality and governance.
- X. Advanced forms and data collection.
- Y. Advanced integrations and interoperability.
- Z. Explicitly opt-in AI knowledge operations.
- AA. Administration, observability and supportability.

Specialist visual diagram capabilities and architecture are covered in [diagram-features.md](./etc/product/diagram-features.md). Do not treat the existing Mermaid renderer as equivalent to a native diagrams.net-style canvas editor.

### Priority model

- **P0:** foundation, reliability, data safety, Markdown/editor foundations, storage architecture and core interoperability.
- **P1:** core daily workspace: editor/page experience, search/navigation, knowledge management, templates and first structured-data capabilities.
- **P2:** advanced workspace: database views/formulas, projects/calendars, interactive documents, forms, automation, collaboration, whiteboards and dashboards.
- **P3:** platform capabilities: integrations, developer ecosystem, optional AI and enterprise administration/governance.

Dependencies matter. For example:
- Database UI depends on a stable versioned object/property model.
- Relations/rollups depend on stable identity and query semantics.
- Collaboration depends on versioning, conflict handling, permissions and durable sync.
- AI requires explicit data-flow consent, provider boundaries and user control.
- Public publishing requires access control, safe rendering, revocation and export semantics.
- Plugins require a permission/capability model and sandboxing.

[priority-features.md](./etc/product/priority-features.md) is the practical execution sequence. [github-issues.md](./etc/quality/github-issues.md) indexes the roadmap issues and defect/gap issues. GitHub issue counts and checklists are snapshots; re-fetch before reporting current status.

---

## 9. UI backlog and specialist registers

Keep the following identifiers stable; do not renumber or recycle them.

### UI bugs — `etc/product/UI_BACKLOG.md`

- UIB-001 — dark-theme export foreground unreadable on white page.
- UIB-002 — dark component surfaces inconsistent with exported page background.
- UIB-003 — Wave inline color extensions printed as literal code-like text.
- UIB-004 — display-style summation math missing from PDF output.
- UIB-005 — first table row loses Priority value in PDF output.
- UIB-006 — collapsed DETAILS disclosure content absent from PDF export.

### UI gaps — `etc/product/UI_BACKLOG.md`

UI-001 through UI-024 cover settings/dialog QA, editor experience, canvas width, toolbar icon distinction, text hierarchy, navigation/context, outline, backlinks, undo/redo/find/replace, document stats, onboarding, backup context, responsive/mobile behavior, save history/recovery, dark-theme surfaces/contrast, wordmark/navigation contrast, preview typography/regression coverage, selection-based text color, rendered Preview PDF export, contextual Markdown sample library and list Enter continuation.

Use the source file for full descriptions, statuses, acceptance criteria and evidence limitations.

### UI feature proposals — `etc/product/UI_BACKLOG.md`

UIF-001 through UIF-021 cover undo/redo, find, toolbar grouping/discoverability, heading styles, shortcut hints, color/highlight, alignment/indentation, insert menu, table helpers, link editing/preview, document statistics, zoom/focus mode, reading layout, contextual formatting, spreadsheet number formats/cell formatting/grid/formulas, comments/review, toolbar customization and context menu/command palette parity.

Do not infer that a feature is shipped because a related control or partial implementation exists.

### Markdown compatibility — `etc/product/markdown-coverage.md`

Contains a detailed acceptance checklist across formatting, headings, lists, links/images, code, blockquotes/tables, escaping, HTML, GFM, math, Mermaid, other diagram languages, emoji, templates, compatibility and regression coverage.

---

## 10. Documentation and context-file map

This map is intentionally explicit so an agent knows which file to read/update and which files are not interchangeable.

| File | Purpose / authority | When to consult or update |
|---|---|---|
| `WIKI.md` | This comprehensive product/repository/agent orientation | Read first; update when durable cross-project decisions or repository structure materially change |
| `DEV_CONTEXT.md` | Canonical concise developer handoff and current implementation baseline | Read before every coding task; update last after each implementation batch |
| `README.md` | Public project overview, setup, deployment and license summary | Update when onboarding, capabilities, run/deploy workflow or public license description changes |
| `LICENSE` | Canonical MIT License text and copyright notice | Keep exact canonical license wording; change holder/year only with owner approval |
| `THIRD_PARTY_NOTICES.md` | Dependency, font, icon and external asset license/attribution inventory | Update on every dependency or third-party asset change; preserve upstream notices |
| `scripts/check-dependency-licenses.mjs` | Lockfile-based dependency license metadata guard | Keep synchronized with lockfile format and CI; metadata screening only, not legal advice |
| `etc/engineering/CONTRIBUTING.md` | Canonical contributor workflow, engineering rules and contribution licensing expectations | Update when contribution, verification or licensing practices change |
| `etc/history/dev-fixed.md` | Append-only-ish implementation fix and regression history | Record bug fixes and regression tests |
| `etc/history/dev-build.md` | Feature/build/CI implementation and verification history | Record feature batches, CI outcomes, build/deployment changes |
| `upcoming-features.md` | Canonical complete product blueprint and feature catalogue | Add new agreed product scope; never silently prune |
| `etc/product/priority-features.md` | Delivery order, priorities and dependencies | Reprioritize transparently; preserve complete scope |
| `FEATURES.md` | Combined shipped-feature overview and detailed feature map | Update shipped/planned status with evidence |
| `docs/ROADMAP.md` | Release sequencing | Update when delivery milestones change |
| `docs/ARCHITECTURE.md` | Current architecture, boundaries, privacy and reliability | Update when architecture changes |
| `docs/MARKDOWN_SUPPORT.md` | User-facing Markdown syntax/support guide | Update when parser, renderer or export behavior changes |
| `etc/product/markdown-coverage.md` | Markdown compatibility gap checklist | Update checklist status and acceptance evidence |
| `etc/product/UI_BACKLOG.md` | Consolidated UIB/UI/UIF bug, gap and feature register | Preserve IDs, statuses, criteria, evidence and history |
| `diagram-features.md` | Specialist diagram research, capability map and native diagram editor proposal | Consult for visual diagram scope/architecture |
| `etc/quality/bugs.md` | Current open reliability/functional bug register | Update only during explicit bug-register/QA reconciliation |
| `etc/quality/fixed-bugs.md` | Historical fixed bug descriptions and regression scenarios | Preserve history; recheck affected scenarios after related changes |
| `QA_CONTEXT.md` | Consolidated current QA disposition, test inventory and historical audit/evidence trail | Refresh current status while preserving useful historical findings |
| `github-issues.md` | Index of GitHub defect/gap and roadmap issues | Refresh after issue creation/closure/reconciliation |
| `docs/DOCKER.md` | Docker and Compose deployment instructions | Update when container/Nginx/Compose behavior changes |
| `docs/README.md` | Documentation navigation index | Update when docs are added, renamed or reorganized |

### File consolidation rules — current state

The following consolidations have been completed:
- `QA_CONTEXT.md` combines the current QA disposition and test inventory formerly in `qa-context.md` with the detailed historical audits/evidence formerly in `QA-CONTEXT.md`.
- `etc/product/UI_BACKLOG.md` combines export/print UI bugs (UIB-001..006), UI gaps (UI-001..024) and UI feature proposals (UIF-001..021) from the former three UI registers.
- `FEATURES.md` combines the shipped-feature overview and detailed feature map formerly split between root `features.md` and `docs/FEATURES.md`.

The former source files were removed only after the consolidated destinations were created and references migrated. Preserve every stable ID and meaningful requirement when updating the consolidated files.
- Keep `etc/history/dev-fixed.md` and `etc/history/dev-build.md` distinct.
- Keep `upcoming-features.md` and `etc/product/priority-features.md` distinct.
- Keep `etc/quality/bugs.md` and `etc/quality/fixed-bugs.md` distinct.
- Keep `etc/product/markdown-coverage.md` and `diagram-features.md` as specialist checklist/research files.
- Keep `DEV_CONTEXT.md` concise; historical implementation detail belongs in the development logs.

---

## 11. Docker and deployment boundary

Wave supports static frontend hosting through Docker:
- Multi-stage Node build creates the Vite production bundle.
- Nginx unprivileged runtime serves the static application on port 8080.
- Compose defaults to host port 8080, configurable with `WAVE_PORT`.
- Container hardening includes read-only root filesystem, temporary filesystem for `/tmp`, dropped capabilities, no-new-privileges and healthcheck.
- Nginx config includes SPA fallback, hashed asset caching, no-cache app shell, dotfile denial and security headers.
- CI validates Compose configuration and builds the container image.

Typical commands:
```bash
cp .env.example .env
# Set WAVE_PORT in .env if needed
docker compose config -q
docker compose up --build -d
docker compose ps
docker compose logs -f wave
docker compose down
```

Important boundary:
- Docker only hosts the static web app.
- It does not add an API, database, server-side workspace, user accounts, remote document storage, shared workspace, collaboration or sync.
- Browser File System Access API selects a directory on the end user's own device. A remote browser cannot use it to select a folder on the Docker host.
- File System Access requires a supported browser and secure context (HTTPS for remote access; localhost is treated as secure by browsers).
- Read [Docker guide](./etc/engineering/DOCKER.md) before changing deployment files.

---

## 12. Architecture direction and future design guardrails

### Near-term

Strengthen the current local-first file-backed implementation. Reliability, editor usability, Markdown compatibility, search/navigation, recovery, backups and portability are more important than adding broad modules on unstable foundations.

### Future data architecture

A future versioned SQLite canonical store is an explicit direction to evaluate. It is not present in the current MVP. Before implementation, define:
- Stable IDs and object/page/block schema.
- Versioning, migration, forward/backward compatibility and unknown-field preservation.
- Transaction boundaries and conflict semantics.
- Attachment/blob storage and portable export.
- Backup, restore, recovery and integrity verification.
- Interchange with Markdown/HTML/CSV/JSON.
- How local-only and optional online modes share the same model.
- How to migrate existing Markdown workspaces repeat-safely without deleting source files until verification succeeds.

### Future collaboration/sync

Do not bolt real-time collaboration onto the present filesystem adapter. First design identity, revisions, conflict handling, authorization, durable sync, offline queues, deletion propagation and recovery. Online services must be optional and transparent.

### Future AI

AI-assisted features are opt-in. Define provider choice, content scope, local/remote processing, data retention, explicit consent, cancellation, export and auditability. No silent upload or telemetry.

### Future plugins/integrations

Define permission scopes, capability boundaries, sandboxing, data access, network access and revocation before exposing extension APIs.

---

## 13. Recommended improvements — additions to the existing plan

These are recommendations, not claims of implementation. Add them to the appropriate source-of-truth tracker before building, and avoid duplicate requirements if they already exist.

### A. Agent/developer experience

1. **Automated documentation consistency check:** validate Markdown links, required tracker IDs, duplicate IDs, and references to renamed files in CI.
2. **Feature traceability:** give every roadmap feature a stable ID and trace it through blueprint → priority → GitHub issue → implementation PR/commit → tests → shipped docs.
3. **Single current-status snapshot:** generate or maintain a small status table with last verified commit, CI run, test counts and unresolved limitations; avoid contradictory counts across docs.
4. **Architecture decision records:** add short ADRs for consequential choices (storage model, sync, schema, Markdown extensions, plugin security) with context, alternatives and consequences.
5. **Agent task protocol:** require each task to state target IDs, files inspected, tests added, verification performed and unresolved evidence gaps.
6. **Documentation link/heading lint:** catch broken relative links, stale case-sensitive paths, malformed Markdown and duplicate heading anchors.
7. **Release readiness checklist:** make data migration, restore verification, security, accessibility, browser compatibility and export proof explicit release blockers.

### B. Product UX

1. **Command palette as a unified action surface:** searchable commands, shortcuts, recency and discoverability; avoid duplicating toolbar actions with indistinguishable icons.
2. **Contextual onboarding:** explain workspace location, browser permission, local data ownership, backups and the difference between saved files and browser-local recovery drafts.
3. **Document outline and navigation:** headings outline, breadcrumbs, backlinks and path context with keyboard navigation.
4. **Save/recovery transparency:** distinguish saving, saved, pending recovery draft, committed recovery draft, external conflict and backup state in clear language.
5. **Accessible formatting controls:** visible labels/tooltips, keyboard operation, contrast-safe palettes and a non-color cue.
6. **Feature discovery panel:** retain the contextual sample library; consider a command/feature catalogue with preview and one-click insertion that never changes content until the user selects an item.
7. **First-run demo workspace:** optional sample content with an explicit “create/delete demo” lifecycle, never mix demo content into the user's actual workspace without consent.
8. **Undo/redo and find/replace:** prioritize editor fundamentals before expanding toolbar breadth.

### C. Reliability and data safety

1. Add deterministic fault injection for partial writes, failed stream close, browser termination windows and interrupted backup/restore.
2. Add restore drills that restore backups into a temporary workspace and compare content/asset hashes.
3. Add external filesystem race tests and native picker/permission revocation tests on supported browsers.
4. Add schema/migration fixtures for old, current, malformed and forward-version workspaces.
5. Add property-based/fuzz tests for path validation, Markdown preprocessing, archive/import parsing and malformed math.
6. Add large-workspace performance fixtures (thousands of pages, large assets, long documents) and performance budgets.
7. Add explicit recovery UX when browser storage is unavailable, denied or cleared.

### D. Security and privacy

1. Maintain a threat model covering workspace files, browser storage, Markdown/HTML, attachments/imports, remote links, plugins and optional sync.
   - Regression coverage exercises malformed percent-encoded reserved preview routes; invalid internal page links remain inert and cannot crash the Markdown preview.
2. Review CSP, dependency updates, MIME sniffing, attachment size/type limits and unsafe archive extraction.
3. Add a visible network/data-flow disclosure when optional online features are enabled.
4. Add privacy-safe diagnostics with no page contents, filenames, secrets or workspace paths in logs.
5. Define deletion semantics for Trash, backups, caches, synced replicas and published shares.

### E. Collaboration and platform foundations

1. Define stable object identity and revision model before relations, databases or sync.
2. Specify conflict-free offline edits and conflict UI before real-time collaboration.
3. Design permissions at workspace/collection/page/object level before sharing.
4. Ensure all first-class object types have Markdown/HTML/CSV/JSON or other documented export.
5. Keep local-only usage independent of accounts and online services.

---

## 14. Definition of done for every feature

A feature is not complete merely because its UI appears.

- User story and acceptance criteria are clear.
- Existing behavior and product principles are preserved.
- Error, empty, loading, denied-permission and recovery states are designed.
- Data schema/version/migration is considered if data shape changes.
- Keyboard, focus, screen-reader semantics, contrast, responsive layout and reduced motion are considered.
- Unit/storage tests cover logic, failures and concurrency where relevant.
- E2E tests cover the user-visible journey and regression.
- Security/sanitization/path validation is covered for untrusted inputs.
- Export/backup/restore behavior is considered for persisted data.
- Documentation, feature status and relevant tracker are updated.
- CI results are checked and accurately reported.
- `etc/history/dev-fixed.md` / `etc/history/dev-build.md` are updated as appropriate.
- `DEV_CONTEXT.md` is updated last.
- Any remaining limitation is explicit; do not mark the feature fully shipped/verified if a critical criterion is missing.

---

## 15. How to report work to the product owner

Use a concise but evidence-based summary:
1. What changed (user-visible behavior and underlying files).
2. Which feature/bug/UI IDs were addressed.
3. Tests added or updated.
4. Exact verification performed (commands, CI run and job outcomes).
5. What was not verified (manual UI, native picker, browser lifecycle, Docker runtime, etc.).
6. Commits/links.
7. Remaining blockers and the next logical priority.

Do not say “all bugs fixed”, “fully tested”, “complete” or “production-ready” unless the scope and evidence genuinely support that statement.

---

## 16. External references and competitive inspiration

Use competitor research as workflow inspiration, not as an instruction to copy features blindly:
- Notion — flexible pages, blocks, databases, relations, views, wikis, forms, automation.
- Quip — document-led collaboration, contextual discussion, spreadsheet-in-document workflows.
- Coda — interactive docs, tables, formulas, buttons, controls, Packs and automations.
- Obsidian — local Markdown vaults, backlinks, graph, templates, plugins and file ownership.
- Anytype — offline-first objects, relations, encryption and peer-to-peer sync.
- Outline — structured knowledge base, collections, permissions, search and navigation.
- Specialist diagrams: diagrams.net/draw.io, Excalidraw, tldraw, Miro, FigJam, Lucidchart and related products.
- Specialist research, reading, assets, forms, automation and publishing references are catalogued in `upcoming-features.md` and `diagram-features.md`.

---

## 17. Final agent checklist

Before coding:
- [ ] Read `WIKI.md`, `DEV_CONTEXT.md` and `etc/engineering/CONTRIBUTING.md`.
- [ ] Refresh current `main` baseline and relevant CI status.
- [ ] Inspect source and tests, not just documentation.
- [ ] Identify existing feature/bug/UI/roadmap IDs.
- [ ] Preserve full product scope and prior behavior.

Before finishing:
- [ ] Implement actual behavior, not only a placeholder.
- [ ] Add regression tests for the new behavior and related edge cases.
- [ ] Run all relevant checks available in the environment.
- [ ] Inspect CI results and distinguish passed/running/failed/skipped.
- [ ] Update the relevant product/UI/QA tracker and feature docs.
- [ ] Update `etc/history/dev-fixed.md` and/or `etc/history/dev-build.md`.
- [ ] Update `DEV_CONTEXT.md` last.
- [ ] Update this wiki only when a durable cross-project instruction, architecture, file map or roadmap direction changes.
- [ ] Report evidence and limitations honestly.

**If two documents appear to conflict:** follow the most recent explicit product-owner instruction for workflow, the product constitution and complete catalogue for scope, `DEV_CONTEXT.md` for current implementation facts, source/tests for actual behavior, and the latest successful CI evidence for verification. Record and resolve material conflicts rather than silently choosing the convenient interpretation.


## 18. GitHub issue implementation and review workflow

For every issue selected by the product owner, work on an isolated issue branch and leave final integration to the product owner.

1. Refresh the latest `main` branch and read the issue body, acceptance criteria, relevant source, tests and project handoff files.
2. Create a branch from the latest `main` using the GitHub issue number padded to four digits: issue #1 → `WAVE-0001`, issue #42 → `WAVE-0042`. The branch name uses the GitHub issue number, not a similarly named internal WAVE defect ID.
3. Implement the issue in that branch. Keep the change cohesive; preserve existing features and scope.
4. Add regression coverage and run relevant checks. If local execution is unavailable, rely on the PR CI workflow and report its exact status; never infer a pass from test definitions.
5. Commit the changes to the issue branch and push through the GitHub integration.
6. Open a pull request targeting `main`, link the originating issue (for example, `Closes #1` only when all acceptance criteria are truly complete), and include a concise summary, tests, CI status and remaining limitations.
7. Add a comment to the GitHub issue describing what changed, the branch, commit/PR links, verification performed and unresolved criteria.
8. Do not merge the PR or close the issue. The product owner reviews and decides when to merge. If only part of an issue is completed, do not use an auto-closing PR keyword and keep the issue open with the remaining acceptance criteria explicit.

Branch naming is case-sensitive and zero-padded to exactly four digits. Do not reuse an issue branch for a different issue. If the branch already exists, inspect it and its PR before proceeding rather than overwriting it.



## 19. CI failure triage and browser regression tests

- Read the failing job log and classify each failure as a product defect, stale selector, invalid fixture, or infrastructure issue before editing.
- Keep assertions tied to the current accessible UI contract. Use exact accessible names where labels overlap (for example Edit vs Block editing, Settings vs a page titled Settings, and Preview vs a page titled Preview).
- Markdown fixtures must contain actual newline characters (`\\n` in TypeScript source), not literal backslash-plus-n text (`\\\\n`). Validate both fixture data and expected values.
- Preserve meaningful end-to-end coverage. Correct tests to match intended product behavior; do not delete scenarios, broaden locators to hide ambiguity, or weaken expectations just to turn CI green.
- After changes, inspect the latest PR head SHA and its own workflow run. Report each job's conclusion and keep the issue/PR open until required checks and acceptance criteria are complete.


### Follow-up: interpreting failed Playwright retries

- After a CI failure, always re-fetch the PR head SHA and workflow runs. Multiple commits on the same branch create separate runs; only the run tied to the latest PR head determines current verification.
- A completed run that is red is not remedied by an earlier green job subset. Report total E2E pass/fail counts and every remaining failure category; verify fresh results after each subsequent fix.
- UI event tests that simulate toolbar actions must account for browser focus/selection loss and React's controlled-state timing. Prefer dispatching through the real interaction and verify the persisted editor value, rather than relying on a stale DOM selection.


## WAVE-0001 CI triage — consolidated follow-up (2026-11-15)

When a latest-head E2E run fails, use the failure log and retry trace as the source of truth; do not infer current state from older runs. For run [43684569184](https://github.com/iamjpsonkar/Wave/actions/runs/43684569184), 42 Playwright scenarios passed and 6 failed. The container job passed; Node tests, TypeScript and production build passed.

The follow-up patch reads the latest editor source through `contentRef.current`, sends toolbar color mutations through `handleEditorChange` so recovery drafts/title state are updated, and replaces the current Markdown block range for color updates. Settings tests must close the dialog before clicking editor controls because the modal backdrop intentionally blocks pointer events. Check icon expectations against the installed Lucide version's rendered SVG class (`file-code2`).

**Verification rule:** these are source-level corrections, not verified fixes until a new workflow for the exact current PR head completes. Never mark WAVE-031 closed based on simulated OPFS permission tests; native picker/OS revocation, external-process races, full accessibility review and pre-commit process-kill behavior remain documented acceptance gaps.

## Local development and one-command verification scripts

The root scripts are the supported shortcuts:

- `./run.sh`: checks Node.js 22.6+, installs locked npm dependencies only when missing, then starts the Vite development server. It must not run typecheck/build after launching Vite because the server process is long-running. Configure bind address/port with `WAVE_HOST` and `WAVE_PORT`; use `./run.sh --install` to force `npm ci`.
- `./test.sh`: local quality gate matching CI: Node tests → TypeScript typecheck → production build → Playwright Chromium E2E. It bootstraps missing project dependencies, the CI-pinned Playwright package and Chromium browser. Use `./test.sh --no-e2e` for the fast non-browser checks.
- `./test.sh --skip-install --skip-playwright-install --skip-browser-install`: run the checks using pre-provisioned dependencies, as CI does after its setup steps.
- `npm run test:local`: package-script alias for the full local test script.

The scripts fail fast, print the failing stage, validate the minimum supported Node version, and return a non-zero exit code on failure. A local pass shortens feedback time; GitHub CI remains the shared authoritative run on the pushed commit. Browser E2E requires Chromium and may require OS libraries on Linux.


## Mobile workspace preferences

On narrow screens the sidebar is a slide-out navigation drawer. The top bar exposes a dedicated Settings control so users can open workspace preferences without first opening the drawer. The editor content-width preference is a maximum width; the rendered editor/preview may be narrower when its available grid column is constrained by the contextual sample library or viewport.


## 2026-11-15 — CI follow-up: Markdown directives and E2E stability

- Run `43687589347` failed only in Playwright; Node tests, typecheck, production build and container build passed. The suite reported 44 passes, two deterministic failures and two flaky scenarios (cross-tab recovery and list typing).
- Fixed malformed `[[color:red|...]]`-style directives being mistaken for unresolved wiki links: invalid `color:`/`bg:` directives now remain literal text, while valid six-digit hex directives retain their existing rendering path.
- Corrected the block-background E2E assertion to compare the browser-computed RGB CSS value rather than expecting the source hex serialization. Removed an unnecessary frozen clock from the second cross-tab page, asserted the dialog source before checking the declined-recovery result, and made list continuation tests wait for focus/caret restoration before typing the next item.
- Verification is pending on the new commit. No local browser run is claimed. Native OS picker/permission, external-process race, accessibility and process-termination checks remain outstanding; issue #1 stays open and PR #101 stays unmerged.


## 2026-11-15 — Cross-tab recovery CI follow-up

- Workflow `43688050754` passed 47 of 48 Playwright tests; Node tests (30), typecheck, production build and container image passed. The remaining failure was the cross-tab recovery test: after removing the fake clock from both pages, the source tab's 600ms autosave committed the changed Markdown before the second tab opened it, so no recovery dialog was expected and the prompt assertion received an empty string.
- Corrected the test to freeze only the source tab's clock after workspace/page setup and before editing. Draft-journal writes remain immediate; only the delayed Markdown autosave is held. The second tab remains on real time so navigation and recovery interaction are not blocked.
- Fresh CI is pending. No local browser execution is claimed. Outstanding manual OS picker/permission, external-process race, accessibility, and process-termination criteria remain tracked; issue #1 and PR #101 remain open.


## 2026-11-15 — Cross-tab recovery test clock isolation correction

- Run `43688362527` failed only in the cross-tab recovery E2E scenario (47/48 passed). Node tests, typecheck, production build and container image passed.
- Removed an unintended first clock installation before workspace setup. The source tab's autosave clock is now frozen only after the baseline page is saved and immediately before the recovery draft is written; the second tab stays on real time. This preserves the test's intended state: baseline Markdown on disk plus a distinct unsaved draft owned by another tab.
- Fresh CI must verify the correction. No local execution is claimed; WAVE-031 manual/native acceptance criteria remain open.


### Cross-tab recovery verification
The cross-tab recovery browser test validates the persisted IndexedDB record from both tabs before invoking the recovery flow. It checks draft text, tab ownership, shared workspace-handle identity, and distinct session IDs, then retains the existing prompt-source and decline-preservation checks. This prevents treating a missing dialog as an unexplained timing failure.


### Cross-tab recovery: diagnosis and completion plan
CI run #918 showed the source tab successfully committed the expected IndexedDB draft with its own session ID and a matching workspace handle. The failure was in the new diagnostic assertion: its expected Markdown used over-escaped newline sequences, unlike the actual content. The expectation has been corrected. Completion requires proving the second tab reads the same record, the recovery decision labels it as another tab, declining leaves the source record intact, and the full CI gate passes. If the next check fails, isolate the exact boundary (cross-tab IndexedDB visibility, handle matching, draft selection, or `open()` logic) before changing production code.

## Main-to-feature synchronization and conflict-resolution policy

The canonical step-by-step procedure is [etc/howtodev.md — Main-to-feature branch synchronization](./etc/howtodev.md#main-to-feature-branch-synchronization-required-workflow). Every developer/agent must follow it rather than improvising a branch update.

Key rules:
- Fetch remote refs first; refresh local `main` with `git pull --ff-only origin main`.
- Switch to the explicitly assigned feature branch and merge `origin/main` into that branch. Never merge the feature branch into `main` during a sync task.
- Resolve conflicts by understanding and preserving both sides' intent. Do not blindly choose ours/theirs, remove tests/features, or use force-push to bypass conflicts.
- Verify that `origin/main` is an ancestor of the feature HEAD, inspect the merge graph and diff, run `./test.sh`, and check CI for the exact pushed SHA.
- Push normally. Force-push is exceptional and requires explicit owner approval; if approved, use `--force-with-lease` after inspecting the remote head, never blind `--force`.
- Report source and feature SHAs, merge commit, conflict resolutions, test/CI evidence and limitations. Update development/QA logs and `DEV_CONTEXT.md` last.

A historical main-sync PR (#107) was closed unmerged when the owner chose to perform the synchronization manually. Do not reopen or reuse that PR as the normal sync mechanism.

## Documentation organization

The maintained project reference library is indexed at [etc/README.md](./etc/README.md). Team and contributor procedures are indexed at [howto/README.md](./howto/README.md). The former `trash/` documentation directory has been replaced by categorized product, engineering, quality and history directories.


## 2026-11-15 — License audit work (#118 / PR #121)

The third-party license audit implementation is tracked in [PR #121](https://github.com/iamjpsonkar/Wave/pull/121) and is also retained under the consolidated security tracker [#120](https://github.com/iamjpsonkar/Wave/issues/120). The branch adds an exact 221-entry npm lockfile inventory, a metadata freshness/license-declaration checker, CI enforcement, notices and a repeatable dependency/asset update procedure.

Follow-up attribution review records the upstream `caniuse-lite` instruction to credit `caniuse.com`, source/version references for the Apache-2.0 dependencies, and the Feather-derived Lucide icon attribution caveat in [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md). The scanner is not a legal compatibility engine. Exact LICENSE/NOTICE inspection for every locked npm tarball and release artifact verification remain outstanding; a green metadata audit alone does not satisfy those checks.

At the 2026-11-15 handoff, CI run [43712184333](https://github.com/iamjpsonkar/Wave/actions/runs/43712184333) for follow-up commit `61f7425c44e182780c5d6d97c30b03d41024a8d6` had passed the npm license audit step while functional tests/build/E2E and container build were still in progress. See [dev-build history](./etc/history/dev-build.md) and the PR for current exact-head status. #118 and PR #121 remain open until all scoped acceptance and verification requirements are dispositioned.

## Commit discipline — implementation and docs together

Wave uses **one cohesive commit per task by default**. Code, tests, configuration and the Markdown documentation/history that belongs to that implementation must be updated and committed together. Avoid separate documentation-only commits for the same task. Minimize commit count without combining unrelated work; split only genuinely independent, reviewable phases. Review the full diff before pushing and verify CI on the exact pushed SHA. Amend unshared commits where practical, but never rewrite shared main history. The detailed mandatory policy is in [AGENTS.md](./AGENTS.md).



## PR #121 review correction

Review [5910646985](https://github.com/iamjpsonkar/Wave/pull/121#pullrequestreview-5910646985) identified inaccurate package names for nested lockfile entries and a mismatched audit baseline SHA. Package-name normalization now uses the final `node_modules/` segment (including scoped names), with regression tests; the committed inventory has been regenerated and the notices baseline corrected to the PR base commit. Exact-head CI and outstanding release-artifact legal review remain required.


## License inventory regression test implementation note

Keep pure lockfile normalization helpers in `scripts/dependency-license-inventory.mjs` so unit tests can import them without executing the CLI audit. The CLI wrapper `scripts/check-dependency-licenses.mjs` should remain the command entry point. Regression tests cover nested unscoped and scoped package names plus root scoped packages.

## 2026-11-15 — Security program kickoff (#120)

Issue [#120](https://github.com/iamjpsonkar/Wave/issues/120) is the active consolidated security tracker. PR [#121](https://github.com/iamjpsonkar/Wave/pull/121) is merged into `main` at `04afcf448e0d45b743fd8324071b1339301904e2`; exact-head CI [43713585404](https://github.com/iamjpsonkar/Wave/actions/runs/43713585404) passed the functional and container jobs. Issue #118 is closed as a duplicate/consolidation pointer, not as a statement that every legal release check is complete.

The first #120 implementation slice is tracked on `WAVE-0120`: secure the existing CI workflow with read-only default/job permissions, full commit-SHA pins for third-party actions, explicit timeouts, and concurrency cancellation. Keep the existing npm license audit, canonical `./test.sh` functional gate, browser diagnostics and container checks intact. Scanner integrations and application security work are not implied complete by this foundation; all remaining #120 checklist items stay open.

The license audit remains a metadata/inventory guard, not a legal compatibility opinion. Exact package tarball LICENSE/NOTICE review, Apache NOTICE obligations and CC-BY attribution in the release artifact remain to be verified or explicitly dispositioned by the owner/legal reviewer.

## Mobile navigation reliability

The mobile drawer must expose a dedicated close control above the open sidebar. Keep the full-screen backdrop behind the sidebar and do not rely on clicking its center to dismiss the drawer: the sidebar intercepts pointer events by design. E2E coverage should open the drawer, activate the visible close control, and verify that the drawer is removed from its open state.

## Security program — issue #120

- Security automation is being added as separate workflows: Dependabot version updates, npm audit, OSV-Scanner, Gitleaks, CodeQL, Trivy and an explicitly configuration-gated Sonar job. All third-party actions/reusable workflows are SHA-pinned, workflows use least privilege, and CI validates workflow YAML/policy.
- Production static hosting now has a restrictive CSP/security headers; remote Google Fonts loading is removed. Markdown links use noopener noreferrer; attachment ingestion rejects known active/executable content and files larger than 25 MiB.
- Read docs/SECURITY_THREAT_MODEL.md for verified controls and explicit product limitations; read docs/SECURITY_OPERATIONS.md for scanner policy, triage, owner-side GitHub settings and Sonar configuration.
- Do not represent unimplemented vault encryption, key recovery, E2E sync, teams/permissions, plugin sandboxing, server-side sharing, audit logs or workspace malware scanning as shipped. No remote content scanning is permitted without product approval and user consent.
- Dependabot alerts/security updates and secret scanning/push protection require owner-side configuration; workflow files cannot enable these account/repository settings. Static code analysis uses credential-free OpenGrep and ESLint workflows; no Sonar account or token is required. Exact third-party tarball LICENSE/NOTICE and final release attributions still require manual legal review.
- Keep issue #120 open until each inherited acceptance item is implemented or explicitly owner-approved and documented. Green CI/scanners are evidence, not a security certification.

## 2026-11-15 — Two-edition architecture decision

Wave Personal is the local-only edition: no accounts, backend, server database, document uploads, remote sync or collaboration dependency. Wave Full adds optional identity, encrypted synchronization and collaboration while preserving local/offline workspace ownership. The approved architecture rejects mandatory server-side storage of readable user documents; local SQLite remains the planned canonical store and is not yet implemented.

Read [the edition architecture](etc/engineering/EDITIONS.md), [architecture](etc/engineering/ARCHITECTURE.md), and the threat-model extension in [SECURITY_THREAT_MODEL.md](docs/SECURITY_THREAT_MODEL.md). The work is tracked by [issue #135](https://github.com/iamjpsonkar/Wave/issues/135). Neither edition nor its future online services should be described as shipped until implementation and verification are complete.
