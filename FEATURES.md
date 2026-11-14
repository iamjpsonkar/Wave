# Wave — Feature Overview and Detailed Feature Map

> Consolidated from the former root `features.md` and `docs/FEATURES.md`. The overview distinguishes currently available capabilities from the detailed product-area feature map. Planned work must not be represented as shipped.

## Part I — Shipped-feature overview

# Wave — Features

> **Your thoughts. Your space.** A private, local-first workspace for writing, organizing and keeping your ideas.

Wave takes inspiration from the flexibility of Notion and the document-first collaboration feel of Quip, with one important difference: **your workspace lives in a folder you choose on your own device.**

This page is the showcase of features that are implemented today. For the complete product vision, competitor analysis and upcoming feature catalogue, see [upcoming-features.md](upcoming-features.md). For implementation status, see [the detailed feature map](docs/FEATURES.md) and [roadmap](docs/ROADMAP.md).

## What Wave can do today

### ✍️ Write and create
- **Markdown documents** — create, open and edit portable `.md` pages.
- **Autosave** — edits are saved back to your selected workspace folder automatically, with revision-ordered writes.
- **Draft recovery** — unsaved text is journaled in browser-local IndexedDB, serialized across tabs where Web Locks are available, and the newest recovery record is selected. Clearing browser site data removes this recovery copy.
- **Formatting toolbar** — headings, bold, italic, strikethrough, lists, quotes, inline code and links.
- **Live preview** — switch between editing Markdown and a sanitized rendered preview.
- **Export preview as PDF** — print the rendered document without Wave workspace chrome; use the browser print dialog’s Save as PDF destination. Exports stay on-device.
- **Markdown compatibility** — CommonMark and GFM, wiki links/backlinks, alerts and collapsible DETAILS blocks, unique heading anchors, safe inline formatting shorthands, common emoji shortcodes, lightweight local code coloring, recursive MathML for a documented TeX subset, and local Mermaid family previews (flowchart, sequence, pie, class, ER, state, Gantt, git graph, mindmap, timeline, quadrant, requirement and architecture-beta), plus constrained DOT/PlantUML/Vega/D2/AsciiDoc renderers. Raw HTML stays disabled; advanced diagram and math syntax remain partial. See [the compatibility contract](docs/MARKDOWN_SUPPORT.md).
- **File attachments** — add images and other files; Wave copies them into your local assets folder and inserts a Markdown reference.
- **Starter templates** — create a blank page, meeting notes, project brief, task list, weekly plan, research notes, decision records an expanded Markdown feature showcase, technical learning notes, or the Wave Complete Feature Test template.

### 🗂️ Organize your knowledge
- **Nested folders** — create folders and organize pages into a hierarchy.
- **Empty-folder discovery** — folders remain visible even before they contain a page.
- **Full-text page search** — search document titles and content in the current workspace.
- **Favorites** — pin frequently used pages and access them from a dedicated sidebar section.
- **Duplicate pages** — make an independent copy of a page while keeping the original intact.
- **Trash and recovery** — move pages to Trash, restore them without overwriting existing files, or permanently delete them. Interrupted operations are journaled and safely reconciled when possible; ambiguous states are surfaced for inspection.
- **Recent workspace** — reopen the last selected folder with a permission check.
- **Workspace Settings** — choose system/light/dark theme, writing font, text size, line spacing, content width and reduced motion; preferences stay in the workspace settings file.
- **Nested navigation** — browse a recursive folder tree and scope the page list to a selected folder.
- **Search navigation** — view path context and matching snippets, then move through results with arrow keys and Enter.

### 💾 Own your data
- **Local-first storage** — your selected folder is the source of truth. Workspace-generation guards prevent late async actions from publishing stale state, and editor transitions persist newer revisions before switching pages.
- **No account required** — the current app has no application backend.
- **Portable Markdown** — page content remains readable and editable in any Markdown editor.
- **Ordinary asset files** — images and attachments are stored as regular files.
- **Local backups** — create timestamped snapshots of documents, assets and workspace settings. Wave checks SHA-256 content snapshots before and after copying, allocates collision-safe restore folders, and marks incomplete restores so they cannot be opened accidentally.
- **Workspace settings** — favorites and workspace preferences are stored in `.wave/settings.json`; malformed settings are preserved and can be backed up before resetting defaults.
- **No silent sync** — Wave does not upload your workspace to a Wave server.
- **External edit protection** — Wave checks the saved version before writing and offers reload or save-as-copy when it detects an outside change.
- **Collision-safe writes** — concurrent page and attachment creation uses serialized allocation and avoids case-only filename collisions.

### ⌨️ Designed for a focused workflow
- `⌘/Ctrl + N` — create a new page.
- `⌘/Ctrl + K` — open or close search.
- `⌘/Ctrl + S` — save the current page immediately.
- **Responsive layout** — compact navigation and editor controls on smaller screens.
- **Quiet interface** — a minimal workspace with clear document, folder, favorite and recovery navigation.

## Workspace structure

When you select a folder, Wave creates and manages this directory:

```text
<your-folder>/
└── .wave/
    ├── manifest.json
    ├── settings.json
    ├── documents/
    │   └── *.md
    ├── assets/
    ├── backups/
    └── trash/
```

You can inspect, copy and back up these files yourself. Do not delete the `.wave` folder while Wave is using it.

## Browser support and privacy

- The current workspace picker uses the **File System Access API** and is intended for Chromium-based browsers such as Chrome and Edge.
- Run Wave on HTTPS or localhost and grant access to the folder you choose.
- The browser stores a workspace directory handle and unsaved recovery drafts in IndexedDB. Saved documents and assets remain in your selected folder; drafts are only a recovery safety net.
- Wave currently has no server-side collaboration, cloud sync, account system or analytics.
- The interface loads its typography from Google Fonts; the core app does not require a Wave application server.

## What's not shipped yet

Wave's bigger ambition includes a rich block editor, richer internal references, mentions and link previews, page history, database views, kanban boards, calendar and timeline views, reminders, collaborative editing, comments, Quip-style spreadsheets, imports and exports, plugins and optional encrypted sync. These are **planned capabilities, not current features**. Track their status in the [feature map](docs/FEATURES.md).

## Run locally

Requires Node.js 22.6+ and a supported Chromium browser.

```bash
npm install
npm run dev
npm run typecheck
npm run build
```

---

**Wave is early software.** Keep independent backups of important files. Recovery drafts are browser-local, and verified workspace backups should be copied to a separate location.


### Accessible Markdown images
- Informative images retain accessible alt text, decorative empty-alt images remain hidden from assistive technology, and missing informative local images display a named fallback.

 
### Discover features while writing
- **Right-side sample library** — browse searchable examples grouped by Text, Blocks, Lists, Data, Code, Advanced and Media. Select an example to see a rendered preview and its Markdown source, then insert the source at the current cursor/selection.
- **List continuation** — press Enter in a Markdown bullet, numbered or task list to create the next item automatically. Numbered lists increment, nested indentation is retained and a second Enter on an empty item exits the list.


### 🐳 Deployment choices
- **Docker static hosting** — multi-stage production image, unprivileged Nginx, SPA fallback, health check and Compose deployment. This hosts the frontend only; local browser-selected workspace storage remains unchanged. See the [Docker guide](docs/DOCKER.md).


---

## Part II — Detailed feature map and status

# Wave feature map

Wave aims to cover the useful workspace capabilities found in Notion and Quip while preserving local-first ownership. This is a product scope, not a claim that every feature is already implemented.

Legend: [x] shipped · [~] in progress · [ ] planned · [—] intentionally different

## 1. Documents and writing

- [x] Markdown pages, nested folders, autosave, preview and page duplication
- [x] CommonMark writing syntax and GFM tables, task lists, strikethrough, autolinks and footnotes
- [x] GitHub-style alerts and safe collapsible disclosures, unique heading anchors, safe inline formatting shorthands, emoji shortcodes, lightweight local code highlighting, recursive MathML for a documented TeX subset, and Mermaid flowchart/sequence/pie previews
- [~] Full Markdown compatibility: raw HTML remains disabled for safety; advanced TeX environments, Mermaid families, full grammar-based highlighting and external diagram languages need dedicated renderers
- [x] Formatting toolbar, headings, lists, quotes, code and links
- [x] Local images and file attachments
- [x] Starter templates: meeting notes, project brief, task list, weekly plan, research notes and decision record
- [x] Built-in page templates for meetings, projects, task lists, weekly plans, research and decision records, plus Markdown feature showcase, technical learning notes and the comprehensive Wave Complete Feature Test QA template
- [~] Optional source-preserving Markdown block mode for headings, paragraphs, lists, quotes/callouts, code, images, attachments, tables and dividers; keyboard/drag reorder, handles, deletion and common-block insertion are implemented; slash menu, bookmarks/embeds and rich inline editing remain planned
- [ ] Drag-and-drop blocks, multi-select, duplicate, turn-into, block handles and slash menu
- [ ] Inline formatting, text colors, highlights, comments and suggestions
- [~] Heading outline and in-page navigation implemented; page icons, cover images and richer TOC presentation remain planned
- [~] Nested folders, clickable folder breadcrumbs and favorites implemented; recent pages/history enhancements remain planned
- [~] Wiki links and backlinks are implemented for Markdown pages; mentions and rich link previews remain planned
- [ ] Page history, restore points and compare revisions
- [~] PDF export of the rendered Preview via the browser print/save-as-PDF dialog is implemented; direct PDF generation, Markdown/HTML/DOCX import/export and portable workspace archive remain planned

## 2. Databases and structured knowledge

- [ ] Database pages and inline databases
- [ ] Properties: text, number, select, multi-select, status, date, person, checkbox, URL, email, relation and formula
- [ ] Table, board, list, gallery, calendar and timeline views
- [ ] Sorting, filters, grouping, saved views and per-view layouts
- [ ] Relations, rollups, formulas and linked database views
- [ ] Database templates, CSV import/export and bulk editing
- [ ] Full-text indexing with a rebuildable local index

## 3. Tasks and project management

- [ ] Tasks with assignee, status, priority, due date and dependencies
- [ ] Kanban boards, project roadmaps and timeline/Gantt views
- [ ] Calendar with day/week/month views and drag-to-reschedule
- [ ] Recurring tasks, reminders, inbox and notifications
- [ ] Task comments, subtasks, checklists and project dashboards
- [ ] Goals, milestones, progress rollups and workload view

## 4. Quip-style team documents

- [ ] Live collaborative editing with cursors and presence
- [ ] Inline comments, anchored discussions, mentions and reactions
- [ ] Suggesting mode and change review
- [ ] Team spaces, shared folders and permission management
- [ ] Document activity feed and notifications
- [ ] Embedded spreadsheets with formulas, cell formatting, charts and references
- [ ] Action items inside documents and decision logs
- [ ] Templates for meeting notes, project briefs, specs and team updates

## 5. Workspace and productivity

- [x] Local folder workspace and recent-workspace reopening
- [x] Search titles and page content
- [x] Recoverable trash and local snapshot backups
- [x] Search snippets, path context and keyboard result navigation
- [ ] Command palette, customizable shortcuts and quick switcher
- [x] Favorite pages pinned in the sidebar and persisted in workspace settings
- [ ] Recent history and workspace home
- [x] Recursive folder tree, folder-scoped page lists and mobile navigation drawer
- [ ] Customizable sidebar, drag/drop and multiple workspaces
- [~] Workspace Settings for theme, typography, content width and reduced motion; local storage/recovery information (broader diagnostics and accessibility review remain open)
- [ ] Notifications center, inbox and reminders
- [ ] Universal import, export and workspace portability tools

## 6. Local-first security and reliability

- [x] User-selected folder is the source of truth
- [x] Markdown documents and ordinary local assets
- [x] Local Trash, backup snapshots and recent folder handle
- [x] Revision-stable editor flushes, workspace-generation guards, per-workspace favorite queues, Trash operation journal and serialized restore, external-edit detection and recoverable local drafts
- [x] Backup content-integrity snapshots and collision-safe restore folders with failed-restore protection
- [x] Verified backup browser and restore to a separate workspace folder with unique destination allocation and incomplete-restore markers
- [ ] Restore diff/preview and scheduled local backups
- [ ] Workspace schema migrations and integrity checker
- [ ] Encryption-at-rest option for private workspace vaults
- [ ] Offline operation and cross-browser/desktop storage adapters
- [ ] Optional encrypted sync, disabled by default
- [ ] Explicit sharing/export packages with permission controls

## 7. Integrations and extensibility

- [ ] Calendar and task integrations
- [ ] GitHub issue/PR references and developer-oriented embeds
- [ ] Web clipper and browser capture
- [ ] API, plugin/extension model and automation hooks
- [ ] Embed previews for supported external services
- [ ] Import from Notion, Quip, Evernote, Obsidian and generic Markdown folders

## Product boundaries

- Wave will not silently upload workspace content.
- The personal workspace core must remain usable offline without an account.
- Full collaboration, sharing and connected integrations may require online mode and an explicit opt-in.
- Durable workspace content remains user-controlled; coordination services must not become a mandatory readable content store.
- Peer-to-peer transport and encrypted relay fallback are preferred for collaboration; user-managed Docker deployment is a planned option.
- Feature parity means comparable workflows, not copying proprietary UI or undocumented behavior.
- All database, task and collaboration features must have documented portable data formats and recovery paths.

 
## Editor productivity and navigation

- [x] In-memory undo/redo controls and keyboard shortcuts for the current page
- [x] Document-local find, case matching, next/previous, replace and replace-all
- [x] Heading outline with Edit/Preview jump navigation
- [x] Live word count, Unicode character count and estimated reading time
- [x] Workspace/folder breadcrumbs and live save-status announcement
- [x] Searchable template gallery with preview before page creation
- [~] Responsive/theme regression coverage across five viewport widths and three appearance modes; CI and manual visual review pending
- [~] Optional source-preserving Markdown block editor: editable blocks, keyboard/drag reorder, delete and common-block insertion; slash menu, bookmarks/embeds and rich inline editing remain

 
- [x] Searchable template gallery with preview-before-create workflow
- [x] Page-local undo/redo, find/replace, heading outline and word/character/reading-time statistics


## Editor formatting additions

- [x] Selection-based foreground text color and inline background color with custom HEX pickers, curated quick swatches and remove-formatting action; values are restricted to six-digit hexadecimal tokens.
- [x] Block background fill using a safe Markdown quote directive and the same six-digit HEX restriction, available from the source toolbar and per-block controls in Blocks mode.
- [~] Nested inline color ranges, portable non-Wave fallback and contrast guidance for arbitrary custom colors remain future work.

 
## In-editor feature discovery and list editing

- [x] Searchable right-side Markdown sample library with category filters, live rendered preview and visible source.
- [x] Insert a sample's Markdown source at the current editor selection; append to the document when Preview/Blocks mode has no source textarea.
- [x] Enter continues unordered, ordered and task lists; ordered numbering increments, nested indentation and task markers are preserved, and empty items exit the list.
- [~] Broader keyboard, mobile and screenshot-based visual review of the sample library and complex list edge cases remains pending CI/manual QA.


## Deployment and operations

- [x] Multi-stage Docker image for production static hosting.
- [x] Docker Compose service with configurable host port, health check and restart policy.
- [x] Unprivileged Nginx runtime, read-only container root, dropped capabilities and no-new-privileges.
- [x] SPA fallback, hashed-asset cache policy and browser security headers.
- [ ] Server-side workspace storage, accounts, collaboration API and shared data services — explicitly not provided by the static container.
