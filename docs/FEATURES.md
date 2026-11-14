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
