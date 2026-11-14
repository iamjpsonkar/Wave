# Wave feature map

Wave aims to cover the useful workspace capabilities found in Notion and Quip while preserving local-first ownership. This is a product scope, not a claim that every feature is already implemented.

Legend: [x] shipped · [~] in progress · [ ] planned · [—] intentionally different

## 1. Documents and writing

- [x] Markdown pages, nested folders, autosave and preview
- [x] Formatting toolbar, headings, lists, quotes, code and links
- [x] Local images and file attachments
- [x] Starter templates: meeting notes, project brief, task list, weekly plan, research notes and decision record
- [ ] Rich block editor with paragraph, heading, list, quote, divider, callout, code, image, file, bookmark, embed and table blocks
- [ ] Drag-and-drop blocks, multi-select, duplicate, turn-into, block handles and slash menu
- [ ] Inline formatting, text colors, highlights, comments and suggestions
- [ ] Page icons, cover images, page outline and table of contents
- [ ] Nested pages, breadcrumbs, favorites and recent pages
- [ ] Internal links, backlinks, mentions and link previews
- [ ] Page history, restore points and compare revisions
- [ ] Import/export: Markdown, HTML, DOCX, PDF and portable workspace archive

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
- [ ] Global search with filters, snippets and keyboard navigation
- [ ] Command palette, customizable shortcuts and quick switcher
- [ ] Favorites, pinned pages, recent history and workspace home
- [ ] Customizable sidebar, page tree drag/drop and multiple workspaces
- [ ] Settings for appearance, typography, editor behavior and privacy
- [ ] Notifications center, inbox and reminders
- [ ] Universal import, export and workspace portability tools

## 6. Local-first security and reliability

- [x] User-selected folder is the source of truth
- [x] Markdown documents and ordinary local assets
- [x] Local Trash, backup snapshots and recent folder handle
- [ ] Atomic writes, recovery journal and conflict detection
- [ ] Backup manager, restore preview and scheduled local backups
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
- Collaboration and sync require an explicit transport and opt-in; local editing must work without an account.
- A self-hosted or peer-to-peer collaboration mode may be explored, but it must be clearly separated from the local-only mode.
- Feature parity means comparable workflows, not copying proprietary UI or undocumented behavior.
- All database, task and collaboration features must have documented portable data formats and recovery paths.
