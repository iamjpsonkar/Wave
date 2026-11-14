# Wave roadmap

Wave is being developed as a user-owned workspace inspired by Notion and Quip. The product has an offline-capable personal core and an online layer for collaboration and connected features. The roadmap prioritizes storage integrity, portability and recovery before advanced collaboration.

## Release 0.1 — Foundation

- [x] React + TypeScript + Vite application
- [x] First-run directory selection
- [x] Initialize `.wave/` with manifest and settings
- [x] Markdown document creation and autosave
- [x] Local image uploads

## Release 0.2 — Usable writing workspace

- [x] Markdown formatting toolbar
- [x] Sanitized Markdown preview
- [x] Nested document folders
- [x] Search document titles and body text
- [x] Local image and attachment links in preview
- [x] Collision-safe asset naming
- [x] Local backup snapshots
- [x] Recoverable Trash with restore and permanent deletion
- [x] CI typecheck and production build

## Release 0.3 — Storage reliability and canonical data foundation

- [ ] Define the versioned SQLite workspace schema and storage adapter contract.
- [ ] Add a migration/import path from the current Markdown-folder MVP.
- [ ] Preserve original Markdown files until migration is verified.
- [ ] Add transactional persistence, integrity checks and restore verification.

- [x] Workspace reopen flow and permission recovery
- [ ] Backup browser and restore workflow
- [ ] Atomic writes and interrupted-save recovery
- [ ] Schema migration framework
- [x] Empty-folder persistence and navigation
- [ ] Folder rename/delete
- [ ] Document rename and move
- [ ] Automated storage-adapter tests

## Release 0.4 — Writing and block editor

- [x] Built-in templates: meeting notes, project brief, task list, weekly plan, research notes and decision record
- [ ] Block-based editor with paragraphs, headings, lists, quotes, dividers and callouts
- [ ] Drag-and-drop block ordering and block actions
- [ ] Slash-command menu and keyboard-first editing
- [ ] Tables, code blocks, images, files, bookmarks and embeds
- [ ] Comments, suggestions and page outline
- [ ] Markdown import/export without losing user files

## Release 0.5 — Knowledge management and databases

- [ ] Backlinks, internal page references and mentions
- [ ] Tags, page icons, covers and page properties
- [ ] Database engine and typed properties
- [ ] Table, board, list, gallery, calendar and timeline views
- [ ] Relations, rollups, formulas, filters and saved views
- [ ] Fast full-text search index (rebuildable from portable source files)
- [ ] Page history, revision comparison and restore points

## Release 0.6 — Projects and planning

- [ ] Task management with status, priority, assignee, due date and subtasks
- [ ] Kanban boards, project roadmaps and timeline views
- [ ] Calendar, recurring tasks and reminders
- [ ] Goals, milestones, dashboards and progress rollups
- [ ] Inbox, notifications and quick capture

## Release 0.7 — Collaboration and Quip workflows

- [ ] Inline comments, anchored discussions, mentions and reactions
- [ ] Suggesting mode and change review
- [ ] Live multi-user editing, cursors and presence
- [ ] Team spaces, shared folders and granular permissions
- [ ] Embedded spreadsheet grid with formulas, formatting and charts
- [ ] Document activity feed and team notifications
- [ ] Optional self-hosted or peer-to-peer collaboration transport

## Release 0.8 — Import, export and integrations

- [ ] Import from Notion, Quip, Evernote, Obsidian and Markdown folders
- [ ] Export to Markdown, HTML, PDF, DOCX and workspace archive
- [ ] Web clipper and browser capture
- [ ] Calendar and task integrations
- [ ] GitHub references, external embeds and link previews
- [ ] Public extension/API model and automation hooks

## Release 0.9 — Desktop and platform maturity

- [ ] Tauri desktop shell for macOS, Windows and Linux
- [ ] Native folder access and app-level permission UX
- [ ] Offline-ready bundled assets
- [ ] File watcher for external edits
- [ ] Conflict detection when a file changes outside Wave
- [ ] Encrypted workspace vault and optional encrypted sync

## Later — Advanced platform capabilities

- [ ] Plugin marketplace and custom block types
- [ ] Workflow automations and rules
- [ ] Advanced access auditing and organization controls
- [ ] AI-assisted search and writing with local/private processing options
- [ ] Mobile companion and capture workflows

## Product guardrails

- The personal core must remain useful offline and must not require sign-in.
- Online collaboration and connected features are optional and clearly identified.
- Durable workspace content remains user-controlled; no mandatory Wave-operated readable-content repository.
- Coordination/relay services may carry encrypted traffic but must not gain content access by default.
- A self-hosted Docker deployment is a planned option, not a prerequisite for the browser client.
- Keep the workspace format documented, portable and migratable.
- Backups, recovery and data integrity take priority over cosmetic features.
