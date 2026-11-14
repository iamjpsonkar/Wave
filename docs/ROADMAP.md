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

- [ ] Workspace reopen flow and permission recovery
- [ ] Backup browser and restore workflow
- [ ] Atomic writes and interrupted-save recovery
- [ ] Schema migration framework
- [ ] Empty-folder persistence and folder rename/delete
- [ ] Document rename and move
- [ ] Automated storage-adapter tests

## Release 0.4 — Block editor

- [ ] Block-based editor with paragraphs, headings, lists and quotes
- [ ] Drag-and-drop block ordering
- [ ] Slash-command menu
- [ ] Tables, callouts and code blocks
- [ ] Markdown import/export without losing user files
- [ ] Keyboard-first editing and command palette

## Release 0.5 — Knowledge management

- [ ] Backlinks and internal page references
- [ ] Tags and page properties
- [ ] Fast full-text search index (rebuildable from Markdown)
- [ ] Templates
- [ ] Revision history and restore points

## Release 0.6 — Desktop

- [ ] Tauri desktop shell for macOS, Windows and Linux
- [ ] Native folder access and app-level permission UX
- [ ] Offline-ready bundled assets
- [ ] File watcher for external edits
- [ ] Conflict detection when a file changes outside Wave

## Later — Optional collaboration

- [ ] Peer-to-peer collaboration exploration with Yjs
- [ ] Explicit opt-in signaling/discovery service
- [ ] Conflict resolution and offline merge strategy
- [ ] No hosted document store by default

## Product guardrails

- Local storage remains the default and does not require sign-in.
- Cloud sync, if ever offered, must be opt-in and clearly separate.
- Keep workspace files open and documented.
- Never make the server a prerequisite for reading or editing a local workspace.
- Backups and recovery are more important than adding cosmetic features.
