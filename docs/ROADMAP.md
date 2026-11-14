# Wave roadmap

Wave is being developed as a local-first alternative to hosted workspaces. The roadmap prioritizes ownership, portability and safe local storage before collaboration.

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

## Release 0.3 — Storage reliability

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

- Local storage remains the default and does not require sign-in.
- Cloud sync, if ever offered, must be opt-in and clearly separate.
- Keep workspace files open and documented.
- Never make the server a prerequisite for reading or editing a local workspace.
- Backups and recovery are more important than adding cosmetic features.
