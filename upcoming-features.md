# Wave — Upcoming Features & Product Blueprint

> **Vision:** a local-first workspace where documents, knowledge, data and work live together — combining Notion's flexible workspace, Quip's document-led collaboration, Coda's interactive workflows, Obsidian's file ownership and Anytype's offline-first principles.

**Status:** Product vision and planning document  
**Research date:** 14 November 2026  
**Important:** This is a plan, not a claim that unchecked features exist.

- [Current shipped features](features.md)
- [Detailed feature status](docs/FEATURES.md)
- [Delivery roadmap](docs/ROADMAP.md)

---

## 1. Product direction

Wave should grow from a Markdown workspace into a complete personal and team workspace without sacrificing its defining promise: **the user's data remains accessible, portable and under their control**.

### Product pillars

1. **Write:** a fast, expressive editor for notes, documents, specifications, meeting notes and long-form writing.
2. **Connect:** pages, tasks, databases, people, files and decisions form a navigable knowledge graph.
3. **Organize:** flexible databases, views, folders, tags and workspaces support different ways of thinking.
4. **Execute:** tasks, projects, calendars, dashboards, forms and lightweight automations turn information into action.
5. **Collaborate:** comments, discussions, shared documents, presence and optional real-time co-editing.
6. **Own:** local-first storage, open formats, offline access, transparent backups and user-controlled sync.
7. **Extend:** integrations, APIs, plugins, embeds and optional AI tools.

### What Wave should be

- A personal knowledge base and second brain.
- A document and wiki workspace.
- A lightweight project and task manager.
- A structured database and no-code workspace.
- A collaboration space for teams.
- A local-first platform that can be extended.

### Product boundaries

- No account or network connection should be required to open and edit a local workspace.
- No silent upload, telemetry, AI processing or sync.
- Markdown remains a supported interchange format, but should not be forced to represent every structured object.
- Every first-class data type needs a documented export path.
- Collaboration, sync, AI providers and integrations are explicit opt-ins.
- Simple notes workflows must remain simple; advanced modules should not clutter the default experience.
- Build workflows, not feature parity for its own sake.

## 2. Competitive research and lessons

This is a workflow-oriented comparison, not an attempt to reproduce proprietary implementations.

| Product | Strongest ideas to learn from | What Wave should adopt |
|---|---|---|
| **Notion** | Block editor, flexible pages, databases, relations/rollups, multiple views, wikis, forms, charts, templates, search, automations and AI | Flexible blocks, connected databases, useful views, reusable templates, navigation and optional automation |
| **Quip** | Documents and spreadsheets in context, comments on content, chat, tasks, mentions, live data and team workflows | Document-first collaboration, spreadsheet blocks, contextual discussions and action items |
| **Coda** | Documents that behave like applications, tables, formulas, buttons, controls, forms, Packs and automations | Formula engine, interactive controls, buttons, forms and a safe extension model |
| **Obsidian** | Local Markdown vaults, backlinks, graph, properties, templates, command palette, plugins, canvas and file ownership | Plain-file ownership, fast linking, local indexing, extensibility and external file change detection |
| **Anytype** | Offline-first objects, relations, collections, database views, local encryption and peer-to-peer sync | Local-first object model, typed relations, offline reliability and optional encrypted device sync |
| **Outline** | Structured team knowledge base, collections, fast Markdown editing, slash commands, permissions, comments, integrations and search | Excellent wiki navigation, collections, permissions and high-quality search |

### Research observations

- **Notion** spans docs, databases, wikis, projects, forms, charts, synced blocks, version history, search, integrations and AI agents. Wave should prioritize connected workspace foundations rather than chase every AI capability.
- **Quip's** enduring lesson is that documents should be places where teams discuss and complete work, not just static files. Its spreadsheet-in-document and contextual collaboration patterns are especially relevant. Salesforce has announced Quip product retirement for non-renewal after 1 March 2027; Wave should learn from Quip's workflows rather than depend on its ecosystem.
- **Coda** demonstrates that tables, formulas, buttons, controls and integrations can turn a document into a small application. This is a valuable later-stage direction once Wave has a dependable data model.
- **Obsidian** demonstrates the value of local Markdown files and a folder-based vault that can be edited by other tools. External edits and file portability should be first-class Wave behaviours.
- **Anytype** demonstrates that local-first does not have to mean single-device forever: local storage, offline operation, encryption and peer-to-peer sync can coexist, but require deliberate architecture.
- **Outline** demonstrates that a knowledge base succeeds through excellent navigation, search, permissions and predictable editing—not just a large feature list.

### Product decisions

- Keep a documented, versioned local data model for blocks, databases, relations and metadata.
- Keep a readable Markdown/HTML/CSV/JSON export path for user content.
- Local-only mode remains complete and useful.
- Sync, collaboration, AI and integrations are optional modules.
- Features should be modular so Wave can remain a simple notes app when that's all a user needs.

## 3. Status and priority conventions

- [ ] Planned — scoped but not implemented.
- [~] In progress — implementation has started; not complete.
- [x] Shipped — implemented and verified in the application.
- **P0 — Foundation:** required for safe, dependable use.
- **P1 — Core workspace:** high-value capabilities for daily use.
- **P2 — Advanced workspace:** structured, project and collaboration capabilities.
- **P3 — Platform:** integrations, extensibility, AI and organization features.

Priorities are recommendations, not delivery promises. Dependencies matter: database views depend on a stable object/property model; collaborative editing depends on versioning and conflict-safe storage.

---

# 4. Complete feature catalogue

## A. Writing, pages and block editor

### A1. Block-based editor — P0

- [ ] Structured blocks with stable IDs.
- [ ] Paragraph, headings H1–H6, bullet list, numbered list and checklist blocks.
- [ ] Quote, callout, divider, toggle/collapsible and table blocks.
- [ ] Code blocks with language selection, syntax highlighting and copy action.
- [ ] Image, video, audio, file, bookmark and attachment blocks.
- [ ] Embedded page, database, chart and supported external embed blocks.
- [ ] Block insertion menu and slash commands.
- [ ] Keyboard-first editing, predictable shortcuts and accessible focus states.
- [ ] Drag-and-drop block reordering with visible drop targets.
- [ ] Block handles and context menu: duplicate, delete, move, turn into and copy link.
- [ ] Multi-block selection, cut/copy/paste and bulk actions.
- [ ] Undo/redo history with reliable transaction boundaries.
- [ ] Paste cleanup for Word, Google Docs, web pages and Markdown.
- [ ] Markdown shortcuts while typing and Markdown import/export.
- [ ] Inline formatting: bold, italic, underline, strikethrough, code, links, highlights and text color.
- [ ] Nested lists, indentation, list continuation and checklist completion.
- [ ] Tables with row/column insertion, resizing, cell navigation and spreadsheet paste.
- [ ] Block-level IDs to support stable links, comments and references.
- [ ] Drag files and images directly into the editor.
- [ ] Editor modes: edit, read, focus and distraction-free.
- [ ] Autosave indicator, save queue, retry and unsaved-change recovery.

### A2. Page experience — P1

- [ ] Page title, subtitle, icon/emoji and cover image.
- [ ] Page properties and metadata.
- [ ] Nested pages and page tree.
- [ ] Breadcrumb navigation and parent-page navigation.
- [ ] Page outline/table of contents generated from headings.
- [ ] Internal links to pages, headings and blocks.
- [ ] Backlinks and unlinked mentions.
- [ ] Hover/peek preview for internal page links.
- [ ] Page aliases and redirects when pages are renamed.
- [ ] Synced/reusable blocks with a clear source-of-truth relationship.
- [ ] Page-level tags, status, author and created/updated timestamps.
- [ ] Page templates and template variables.
- [ ] Duplicate page, duplicate section and turn page into template.
- [ ] Page lock/read-only mode for accidental-edit prevention.
- [ ] Archive, restore, move and delete actions.
- [ ] Page history, revision diff and restore.
- [ ] Page-level export and print layout.
- [ ] Page comments and activity timeline.

### A3. Writing quality — P1

- [ ] Word count, character count and reading time.
- [ ] Spellcheck and optional grammar assistance.
- [ ] Find/replace within the current page.
- [ ] Search across headings and block contents.
- [ ] Footnotes, citations and reference links.
- [ ] Math/LaTeX blocks and inline math.
- [ ] Mermaid diagrams and safe diagram rendering.
- [ ] Code block language detection and copy.
- [ ] Image captions, alt text and image resizing.
- [ ] Table of contents and document navigation.
- [ ] Page layout options: narrow, comfortable and full width.
- [ ] Typography, line height and editor density settings.

## B. Knowledge management and wiki

### B1. Knowledge graph — P1

- [ ] Wiki links using a stable internal-link syntax.
- [ ] Backlinks panel showing pages that link to the current page.
- [ ] Unlinked mention detection and convert-to-link action.
- [ ] Graph view of pages, tags and relationships.
- [ ] Local graph and global graph filters.
- [ ] Link types and typed relations between objects.
- [ ] Related pages and recommended connections.
- [ ] Broken-link detection and repair.
- [ ] Alias support and duplicate-title disambiguation.
- [ ] Tag manager, nested tags and tag pages.
- [ ] Saved searches and smart collections.
- [ ] Knowledge inbox for unprocessed notes, links and captures.
- [ ] Daily notes and periodic notes (weekly/monthly).
- [ ] Journal and knowledge-review workflows.
- [ ] Verified/official page status and review date.
- [ ] Page ownership and stale-content reminders for team workspaces.

### B2. Wiki and documentation — P1/P2

- [ ] Wiki spaces and collections.
- [ ] Collection home pages and landing pages.
- [ ] Table of contents and hierarchical navigation.
- [ ] Documentation templates and style guidelines.
- [ ] Page status: draft, in review, approved, archived.
- [ ] Review cycles and content freshness dates.
- [ ] Page owners and reviewers.
- [ ] Glossary and terminology database.
- [ ] FAQ and support knowledge base templates.
- [ ] Public documentation export/publishing (explicit opt-in).
- [ ] Internal documentation portal with search.
- [ ] Broken-link and stale-page reports.

## C. Databases and structured data

### C1. Data model — P0 before database UI

- [ ] Stable IDs for pages, blocks, databases, rows, properties and views.
- [ ] Versioned object schema and migration framework.
- [ ] Typed property definitions and validation.
- [ ] Portable serialization format with documented schema.
- [ ] Database records that can open as full pages.
- [ ] References between records without relying on display names.
- [ ] Referential integrity and safe deletion behaviour.
- [ ] Rebuildable indexes derived from source data.
- [ ] Schema validation and workspace repair diagnostics.

### C2. Database properties — P1

- [ ] Title and rich text.
- [ ] Number, currency, percent and progress.
- [ ] Select and multi-select.
- [ ] Status with configurable groups.
- [ ] Date, date range and time.
- [ ] Checkbox.
- [ ] URL, email and phone.
- [ ] Person/assignee (personal local identity first; team identities later).
- [ ] File and media.
- [ ] Relation to another database.
- [ ] Two-way relation.
- [ ] Rollup/aggregate from related records.
- [ ] Formula/computed property.
- [ ] Created time, last edited time and unique ID.
- [ ] Property defaults, required values and validation rules.
- [ ] Property descriptions, visibility and ordering.
- [ ] Bulk property editing and schema changes.

### C3. Database views — P1

- [ ] Table view with inline editing.
- [ ] Board/Kanban view grouped by select/status.
- [ ] List view.
- [ ] Gallery/card view.
- [ ] Calendar view.
- [ ] Timeline/Gantt view.
- [ ] Chart view: bar, line, area, pie/donut and number.
- [ ] Multiple named views for the same database.
- [ ] Per-view filters, sorting, grouping and sub-grouping.
- [ ] Property visibility and column widths per view.
- [ ] Row height and card layout settings.
- [ ] Conditional formatting.
- [ ] Saved filters and reusable view presets.
- [ ] Linked database views embedded inside pages.
- [ ] Open record in side panel, modal or full page.
- [ ] View-specific permissions in collaborative mode.
- [ ] CSV import/export and bulk paste.
- [ ] Database templates and record templates.

### C4. Formulas and calculations — P2

- [ ] Safe expression parser (never evaluate arbitrary JavaScript).
- [ ] Arithmetic, comparison and boolean operators.
- [ ] String, date, number and array functions.
- [ ] Conditional expressions.
- [ ] Property references and relation traversal.
- [ ] Formula editor with autocomplete and inline errors.
- [ ] Dependency graph and recalculation strategy.
- [ ] Deterministic formula results across devices.
- [ ] Rollup aggregations: count, sum, average, min, max and unique values.
- [ ] Formula documentation and test examples.

## D. Tasks, projects and planning

### D1. Task management — P1

- [ ] Tasks as first-class records and/or task blocks.
- [ ] Status, priority, due date, start date and assignee.
- [ ] Subtasks and nested checklists.
- [ ] Dependencies: blocked by, blocks and related tasks.
- [ ] Recurring tasks and recurrence rules.
- [ ] Task comments, activity and attachments.
- [ ] Task inbox and quick capture.
- [ ] My tasks and assigned-to-me views.
- [ ] Overdue, upcoming and completed task views.
- [ ] Task templates and bulk updates.
- [ ] Time estimate and optional time tracking.
- [ ] Completion metrics and progress calculation.

### D2. Project management — P1/P2

- [ ] Projects database and project home pages.
- [ ] Project goals, milestones and deliverables.
- [ ] Project status, owner, priority and dates.
- [ ] Kanban project board.
- [ ] Project timeline and Gantt chart.
- [ ] Dependencies and critical path (later).
- [ ] Project dashboard with linked tasks and docs.
- [ ] Project risks, issues and decision log.
- [ ] Sprint planning and backlog.
- [ ] Roadmap view by quarter/release.
- [ ] Workload and capacity view.
- [ ] Progress rollups from milestones and tasks.
- [ ] Project templates and status report templates.
- [ ] Retrospective and lessons-learned templates.

### D3. Calendar and time — P1/P2

- [ ] Calendar with day, week, month and agenda views.
- [ ] Drag-to-reschedule events and tasks.
- [ ] Start/end times and all-day events.
- [ ] Multiple calendars and overlays.
- [ ] Recurring events.
- [ ] Reminders and notification preferences.
- [ ] Time zone awareness.
- [ ] Calendar subscriptions/import (ICS).
- [ ] Optional Google/Outlook calendar integration.
- [ ] Daily agenda and weekly planning page.
- [ ] Meeting notes linked to calendar events.
- [ ] Focus sessions and time-blocking (optional).

## E. Quip-inspired collaboration

### E1. Comments and discussions — P1 for collaboration

- [ ] Page-level comments.
- [ ] Anchored comments on selected text or blocks.
- [ ] Threaded replies and resolve/reopen.
- [ ] @mentions for users and pages.
- [ ] Reactions and lightweight acknowledgements.
- [ ] Comment notifications and unread state.
- [ ] Assign a comment/action item to a person.
- [ ] Discussion panel with filters and search.
- [ ] Comment export and retention rules.

### E2. Suggestions and review — P2

- [ ] Suggesting mode for text changes.
- [ ] Accept/reject individual suggestions.
- [ ] Review all suggestions in a document.
- [ ] Reviewer roles and approval workflow.
- [ ] Document status and approval history.
- [ ] Compare revisions and attribute changes.
- [ ] Review request and due date.
- [ ] Decision log linked to the reviewed document.

### E3. Real-time collaboration — P2 (architecture-heavy)

- [ ] Multi-user editing with reliable conflict-free text/block operations.
- [ ] Live cursors and collaborator presence.
- [ ] Selection and active-user indicators.
- [ ] Concurrent block insertion, deletion and movement.
- [ ] Offline edits and reconnect reconciliation.
- [ ] Conflict visibility and recovery for unsupported conflicts.
- [ ] Presence-aware comments and mentions.
- [ ] Collaborative undo semantics.
- [ ] Document activity and version history.
- [ ] Explicit share links and access revocation.
- [ ] Shared folders, spaces and team workspaces.
- [ ] Permission roles: owner, admin, editor, commenter and viewer.
- [ ] Guest access and expiring share links.
- [ ] Access request workflow.
- [ ] Audit log for important access and content actions.

### E4. Team communication — P2/P3

- [ ] Team spaces and channels.
- [ ] Document-linked discussions.
- [ ] One-to-one and group chat (only if it adds value beyond integrations).
- [ ] Share pages, blocks, tasks and files in conversations.
- [ ] Searchable conversation history.
- [ ] Notifications inbox and mentions feed.
- [ ] Mute, snooze and notification preferences.
- [ ] Presence and availability indicators.
- [ ] Activity feed for pages, databases and projects.
- [ ] Meeting notes and action items connected to team spaces.

## F. Quip-style spreadsheets and interactive docs

### F1. Spreadsheet block — P2

- [ ] Embedded spreadsheet/grid block inside a document.
- [ ] Multiple sheets/tabs.
- [ ] Cell editing, selection and keyboard navigation.
- [ ] Rows, columns, ranges and cell formatting.
- [ ] Formulas and common functions (SUM, AVERAGE, COUNT, IF, MIN, MAX, etc.).
- [ ] Relative and absolute cell references.
- [ ] Cross-sheet references.
- [ ] Sorting and filtering.
- [ ] Data validation and dropdown cells.
- [ ] Conditional formatting.
- [ ] Charts that update from cell ranges.
- [ ] Freeze rows/columns.
- [ ] Copy/paste from Excel/Google Sheets/CSV.
- [ ] Import/export XLSX and CSV.
- [ ] Protected cells, ranges and sheets.
- [ ] Named ranges and reusable calculations.
- [ ] Link spreadsheet data to database records.
- [ ] Embed a range or chart into a page.
- [ ] Spreadsheet version history and collaborative editing (after core collaboration).

### F2. Interactive document controls — P2

- [ ] Buttons that run explicitly configured local actions.
- [ ] Checkboxes, dropdowns, date pickers and number controls in pages.
- [ ] Progress indicators and status controls.
- [ ] Formulas that reference database properties and document variables.
- [ ] Action blocks for approvals and task creation.
- [ ] Safe confirmation prompts for destructive actions.
- [ ] Execution history and clear failure feedback.

## G. Forms, workflows and automation

### G1. Forms — P2

- [ ] Build forms from database properties.
- [ ] Public or private form mode.
- [ ] Required fields and validation.
- [ ] Conditional questions and sections.
- [ ] File uploads with explicit storage location.
- [ ] Form response database.
- [ ] Response confirmation and export.
- [ ] Spam protection for published forms.
- [ ] Offline/local form capture.

### G2. Automation engine — P2/P3

- [ ] Trigger/action/condition model.
- [ ] Triggers: record created/updated, status changed, date reached, button clicked.
- [ ] Conditions and branching.
- [ ] Actions: update property, create page/task, move record, add comment, notify.
- [ ] Scheduled and recurring workflows.
- [ ] Workflow templates.
- [ ] Dry-run/test mode.
- [ ] Execution history, logs and retry.
- [ ] Loop prevention, rate limits and permission checks.
- [ ] Local automation runs without a cloud account.
- [ ] Optional remote triggers only when the user configures a connected service.
- [ ] Webhooks and API-triggered workflows.
- [ ] Human approval steps for sensitive actions.

## H. Search, navigation and workspace productivity

### H1. Search — P0/P1

- [ ] Global search across page titles, block text, properties, tasks and files.
- [ ] Fast local full-text index rebuildable from source data.
- [ ] Search snippets and highlighted matches.
- [ ] Search filters: type, folder, tag, date, status and property.
- [ ] Search within current page/database.
- [ ] Search operators and exact phrase search.
- [ ] Recent searches and saved searches.
- [ ] Search results keyboard navigation.
- [ ] Fuzzy matching and typo tolerance.
- [ ] Search attachments by filename and metadata.
- [ ] Optional OCR for image/PDF text (privacy-preserving and opt-in).

### H2. Navigation — P1

- [ ] Command palette.
- [ ] Quick switcher for pages, tasks and databases.
- [ ] Keyboard shortcut customization.
- [ ] Recent pages and recently edited items.
- [ ] Recently viewed history.
- [ ] Back/forward navigation history.
- [ ] Workspace home/dashboard.
- [ ] Customizable sidebar sections.
- [ ] Drag-and-drop page tree organization.
- [ ] Multiple workspaces and workspace switcher.
- [ ] Favorites for pages, databases, views and searches.
- [ ] Breadcrumbs and tabbed documents.
- [ ] Open multiple pages in tabs or split panes.
- [ ] Context-aware quick create.
- [ ] Keyboard shortcuts reference and discoverability.

### H3. Personal productivity — P1/P2

- [ ] Quick capture from anywhere in the app.
- [ ] Inbox for unprocessed ideas and tasks.
- [ ] Daily notes and daily dashboard.
- [ ] Weekly review and planning.
- [ ] Goals and habit tracking templates.
- [ ] Reminders and snooze.
- [ ] Notifications center.
- [ ] Recently deleted and recovery center.
- [ ] Workspace activity and usage insights (local, optional).
- [ ] Saved layouts/workspaces for different workflows.

## I. Files, media and content capture

- [ ] Drag-and-drop attachments and paste images.
- [ ] Asset manager with usage references.
- [ ] Rename, move and replace assets safely.
- [ ] Detect orphaned/unreferenced assets.
- [ ] Image preview, zoom, captions and alt text.
- [ ] PDF preview and annotation/highlights.
- [ ] Audio/video preview and transcripts (opt-in).
- [ ] Bookmark blocks with title, description and preview.
- [ ] Web clipper/browser extension.
- [ ] Save full article or clean reader view.
- [ ] Capture selected text, screenshots and URLs.
- [ ] Email-to-inbox capture (optional integration).
- [ ] Clipboard history for recent captures (opt-in).
- [ ] Import folders of existing Markdown and attachments.
- [ ] Duplicate asset detection and optional cleanup.
- [ ] File metadata and attachment search.

## J. Import, export and portability

### J1. Import — P0/P1

- [ ] Import existing Markdown folder without moving or rewriting originals.
- [ ] Import Markdown with relative asset links.
- [ ] Import ZIP workspace archive.
- [ ] Import CSV into databases.
- [ ] Import HTML.
- [ ] Import DOCX.
- [ ] Import Notion export (Markdown/CSV/ZIP) with pages, databases and assets.
- [ ] Import Evernote export (ENEX).
- [ ] Import Obsidian vault preserving wiki links, tags and attachments.
- [ ] Import Quip export where supported by available export formats.
- [ ] Import generic HTML/CSV and map fields interactively.
- [ ] Import preview, validation report and conflict handling.
- [ ] Never overwrite existing files without an explicit choice.

### J2. Export — P0/P1

- [ ] Export page to Markdown.
- [ ] Export page to HTML.
- [ ] Export page to PDF.
- [ ] Export page to DOCX.
- [ ] Export database to CSV/JSON.
- [ ] Export spreadsheet to CSV/XLSX.
- [ ] Export all workspace data to portable ZIP.
- [ ] Include assets and preserve relative paths.
- [ ] Export comments, history and metadata where format permits.
- [ ] Export selected pages, folders, collections or databases.
- [ ] Export a human-readable manifest and schema.
- [ ] Verify archive integrity and provide an export report.

## K. Local-first storage, privacy and reliability

### K1. Storage safety — P0 (must precede major feature expansion)

- [ ] Atomic file writes using temporary files and safe replacement where supported.
- [ ] Save queue to prevent overlapping writes to the same document.
- [ ] Recovery journal for interrupted writes.
- [ ] Unsaved-change detection and recovery after tab/browser crash.
- [ ] External file change detection and conflict UI.
- [ ] File watcher in desktop builds.
- [ ] Document rename/move with link and favorite updates.
- [ ] Folder rename/move/delete with safe recursive handling.
- [ ] Backup browser and restore preview.
- [ ] Scheduled local backups with configurable retention.
- [ ] Backup verification and integrity checks.
- [ ] Restore one page, folder or entire workspace.
- [ ] Schema migrations with backups and rollback.
- [ ] Workspace diagnostics and repair tool.
- [ ] Trash retention and cleanup settings.
- [ ] Storage quotas and large workspace performance.
- [ ] Automated tests for storage operations and failure paths.

### K2. Data ownership — P0

- [ ] Documented .wave workspace format.
- [ ] Stable and documented IDs.
- [ ] Human-readable metadata and versioned schemas.
- [ ] No hidden server dependency for local mode.
- [ ] User-controlled workspace location.
- [ ] External editor compatibility.
- [ ] Safe handling of symbolic links and invalid paths.
- [ ] Clear data deletion and export flows.
- [ ] No telemetry by default; opt-in diagnostics only.
- [ ] Privacy settings and data-processing disclosures.

### K3. Security — P1/P2

- [ ] Threat model for local workspace, browser permissions and imported files.
- [ ] Encryption-at-rest vault option.
- [ ] Password/key recovery design with clear warnings.
- [ ] Optional end-to-end encrypted sync.
- [ ] Key rotation and device revocation.
- [ ] Secure sharing links with expiry and revocation.
- [ ] Content Security Policy and dependency auditing.
- [ ] Sanitization for Markdown, HTML, SVG and embeds.
- [ ] Safe external link handling.
- [ ] Permission model for team spaces and documents.
- [ ] Audit log for sharing, access and admin events.
- [ ] Secret storage for integration credentials.
- [ ] Sandboxed plugin and automation execution.
- [ ] Malware scanning hooks for imported/shared files where appropriate.

### K4. Sync and offline — P2

- [ ] Fully usable local-only mode.
- [ ] Offline status and sync status indicators.
- [ ] Optional device-to-device sync.
- [ ] Peer-to-peer/local-network sync exploration.
- [ ] Optional self-hosted sync relay/server.
- [ ] End-to-end encryption with user-controlled keys.
- [ ] Conflict-free merge strategy for supported data types.
- [ ] Conflict copies and manual resolution for unsupported cases.
- [ ] Sync pause/resume and bandwidth controls.
- [ ] Selective workspace/folder sync.
- [ ] Device list, trust and revocation.
- [ ] Sync diagnostics and repair.
- [ ] Explicit sync opt-in, never automatic upload.

## L. Integrations and extensibility

### L1. First-party integrations — P2/P3

- [ ] Calendar providers (Google Calendar, Outlook, ICS).
- [ ] GitHub issues, pull requests, commits and repository links.
- [ ] GitHub project/issue dashboards.
- [ ] Slack and other team messaging notifications.
- [ ] Google Drive/OneDrive file references.
- [ ] Figma, Loom and common embed previews.
- [ ] Email and task-provider integration.
- [ ] Browser extension and web clipper.
- [ ] Import/export connectors.
- [ ] Integration connection manager and permission scopes.

### L2. Developer platform — P3

- [ ] Public read/write API.
- [ ] Local API for scripts and developer tools.
- [ ] Webhooks and event subscriptions.
- [ ] CLI for workspace search, export, backup and automation.
- [ ] Plugin manifest and capability permissions.
- [ ] Plugin SDK and example plugins.
- [ ] Custom block types and renderers.
- [ ] Custom property types and views.
- [ ] Theme and CSS customization with safe boundaries.
- [ ] Plugin directory/marketplace (only after security review).
- [ ] MCP server for user-authorized AI tools.
- [ ] API tokens and audit trail for integrations.
- [ ] Versioned APIs and backwards-compatibility policy.

## M. AI-assisted workspace — P3, always opt-in

- [ ] Bring-your-own-provider AI configuration.
- [ ] Local model/provider support where practical.
- [ ] Explain what content is sent before remote AI requests.
- [ ] Ask questions over selected pages or workspace search results.
- [ ] Source-grounded answers with links to source pages/blocks.
- [ ] Summarize pages, meetings, comments and project updates.
- [ ] Draft, rewrite, translate and improve selected text.
- [ ] Extract tasks, dates, decisions and action items from notes.
- [ ] Suggest tags, titles and links.
- [ ] Semantic search and related-page suggestions.
- [ ] Database property extraction and autofill.
- [ ] Meeting transcription and notes (explicit recording consent).
- [ ] AI workflows/agents with scoped permissions.
- [ ] Human approval before edits, external messages or destructive actions.
- [ ] AI activity log and undo/restore.
- [ ] Exclude selected folders/pages from AI indexing.
- [ ] No model training on user content by Wave.
- [ ] No background AI processing without explicit configuration.

## N. Desktop, mobile and accessibility

### N1. Platform support — P1/P2

- [ ] Tauri desktop application for macOS, Windows and Linux.
- [ ] Native filesystem access and reliable file watching.
- [ ] Native open-with, drag/drop and file associations.
- [ ] Multiple windows and workspace tabs.
- [ ] System tray/quick capture (optional).
- [ ] Offline installer and bundled assets.
- [ ] Mobile companion for iOS and Android.
- [ ] Mobile quick capture and inbox.
- [ ] Mobile reading and editing experience.
- [ ] Share-sheet capture from browser and other apps.
- [ ] Tablet layout and touch-friendly block interactions.
- [ ] Cross-device workspace handoff.

### N2. Accessibility and localization — P1

- [ ] Full keyboard navigation.
- [ ] Screen-reader semantics and announcements.
- [ ] Visible focus indicators.
- [ ] WCAG contrast and scalable typography.
- [ ] Reduced motion support.
- [ ] Accessible editor and database grid interactions.
- [ ] Light, dark and system themes.
- [ ] Custom accent colors and density.
- [ ] Localization and translation framework.
- [ ] International date, number and timezone formats.
- [ ] Right-to-left layout support.

## O. Templates, examples and onboarding

- [ ] Template gallery with categories and previews.
- [ ] User-created and reusable templates.
- [ ] Template variables and dynamic dates.
- [ ] Templates for meeting notes, 1:1s, project briefs, specs, PRDs and retrospectives.
- [ ] Templates for tasks, roadmaps, sprint planning and weekly reviews.
- [ ] Templates for CRM, content calendars, reading lists and personal finance.
- [ ] Database starter packs and linked example records.
- [ ] Importable workspace examples.
- [ ] First-run interactive walkthrough.
- [ ] Sample workspace with realistic content.
- [ ] Contextual tips and shortcut discovery.
- [ ] Migration assistant from other note/workspace tools.

## P. Team administration and governance

- [ ] Organization/team workspace model.
- [ ] Member invitations and deactivation.
- [ ] Groups and team roles.
- [ ] Granular page, folder, database and collection permissions.
- [ ] Guest access and external sharing controls.
- [ ] Organization-wide templates and settings.
- [ ] Workspace ownership transfer.
- [ ] Audit logs and exportable activity.
- [ ] Retention and deletion policies.
- [ ] SSO/OIDC and SCIM (enterprise stage).
- [ ] Device management and session revocation.
- [ ] Compliance and data residency controls (only if Wave becomes a hosted enterprise product).

---

# 5. Recommended delivery sequence

The order intentionally puts data safety and architecture ahead of complex UI. Release labels are suggested milestones, not calendar commitments.

## Release 0.3 — Reliability and workspace control (P0)

**Goal:** make existing Markdown workflows safe before adding more data types.

- [ ] Atomic writes and serialized save queue.
- [ ] Unsaved-change recovery.
- [ ] Backup browser, verification and restore preview.
- [ ] Document rename and move.
- [ ] Folder rename, move and delete.
- [ ] External file-change detection and conflict warning.
- [ ] Schema migration foundation.
- [ ] Storage adapter tests and failure-path tests.
- [ ] Workspace diagnostics and repair report.
- [ ] Update README and feature status after each shipped capability.

**Exit criteria:** no silent overwrite on conflict; backup can be verified and restored; common file operations are tested.

## Release 0.4 — Editor foundation (P0/P1)

**Goal:** replace the textarea-only editing experience with a dependable block editor.

- [ ] Select editor architecture and define a portable block schema.
- [ ] Migrate Markdown documents without losing content.
- [ ] Paragraph, headings, lists, quotes, code, divider and callout blocks.
- [ ] Slash menu, keyboard navigation and block actions.
- [ ] Drag-and-drop and multi-block operations.
- [ ] Tables, images, files and embeds.
- [ ] Page outline, page icons and page properties.
- [ ] Markdown import/export round-trip tests.

**Exit criteria:** users can edit existing Markdown and new block documents without data loss, with reliable undo/redo and keyboard operation.

## Release 0.5 — Knowledge graph and navigation (P1)

**Goal:** make information discoverable and connected.

- [ ] Internal links, backlinks and aliases.
- [ ] Quick switcher and command palette.
- [ ] Global full-text search and filters.
- [ ] Tags, daily notes and knowledge inbox.
- [ ] Graph view and related pages.
- [ ] Page history and restore.
- [ ] Collections/wiki navigation.

**Exit criteria:** every page can be found quickly and relationships survive rename, move, import and export.

## Release 0.6 — Database engine (P1)

**Goal:** add structured data without sacrificing portability.

- [ ] Stable object IDs and typed property schema.
- [ ] Database/record model and migration support.
- [ ] Table view and inline editing.
- [ ] Select, status, date, number, checkbox and text properties.
- [ ] Sorting, filtering, grouping and saved views.
- [ ] Database templates and CSV import/export.
- [ ] Relation and rollup foundation.

**Exit criteria:** database data round-trips through the documented workspace format and CSV/JSON export.

## Release 0.7 — Tasks, projects and calendar (P1/P2)

**Goal:** turn documents and databases into actionable work.

- [ ] Tasks, subtasks, priorities, owners and due dates.
- [ ] Kanban and calendar views.
- [ ] Project pages, milestones and dashboards.
- [ ] Timeline/Gantt view and dependencies.
- [ ] Reminders, recurring tasks and inbox.
- [ ] Weekly planning and review templates.

**Exit criteria:** a user can manage a small project from its brief through tasks, milestones and status reporting.

## Release 0.8 — Quip/Coda workflows (P2)

**Goal:** make documents collaborative work surfaces.

- [ ] Anchored comments and discussions.
- [ ] Mentions and action items.
- [ ] Suggesting and review mode.
- [ ] Embedded spreadsheet/grid with core formulas.
- [ ] Forms and interactive controls.
- [ ] Buttons and local automation engine.
- [ ] Activity feed and notifications.

**Exit criteria:** a project document can host discussion, structured data and actions without external tools.

## Release 0.9 — Collaboration and sharing (P2)

**Goal:** add optional team workflows on top of a reliable local data model.

- [ ] Define collaboration transport and threat model.
- [ ] Shared spaces, roles and permissions.
- [ ] Presence and real-time editing.
- [ ] Offline edits and reconnect reconciliation.
- [ ] Encrypted sharing and access revocation.
- [ ] Conflict resolution and audit trail.

**Exit criteria:** local-only remains fully functional; shared content has explicit access controls and a tested recovery path.

## Release 1.0 — Desktop, portability and integrations (P2/P3)

- [ ] Tauri desktop release.
- [ ] Robust file watching and external edits.
- [ ] Import from Notion, Obsidian, Quip and generic Markdown.
- [ ] Export workspace archive, HTML, PDF and DOCX.
- [ ] Browser clipper and GitHub integration.
- [ ] Public API/CLI and plugin foundations.
- [ ] Mobile capture companion.

**Exit criteria:** users can move their workspace in and out of Wave and use it across supported platforms.

## Later — Advanced platform (P3)

- [ ] Optional encrypted sync and peer-to-peer transport.
- [ ] AI search and writing with explicit provider/privacy controls.
- [ ] Workflow automations and integrations marketplace.
- [ ] Advanced formulas, spreadsheet and dashboard capabilities.
- [ ] Enterprise administration and governance.
- [ ] Advanced mobile and team communication.

---

# 6. Architecture decisions before implementation

These decisions prevent expensive rewrites later.

| Decision | Recommendation | Why it matters |
|---|---|---|
| Editor model | Structured blocks with stable IDs; Markdown import/export | Comments, drag/drop, embeds and history need block identity |
| Canonical storage | Versioned local workspace schema plus readable Markdown export | Markdown alone is not expressive enough for relations and databases |
| Database model | Typed records/properties with stable references | Enables multiple views, relations, formulas and migrations |
| Search | Rebuildable local index derived from workspace data | Fast search without making the index the source of truth |
| Undo/history | Transaction-based operations and immutable snapshots/diffs | Required for safe editing and restore |
| File operations | Atomic writes, operation queue and conflict detection | Prevents silent data loss |
| Sync | Separate transport layer; local mode never depends on it | Allows local-only, self-hosted or peer-to-peer options |
| Collaboration | Evaluate CRDT/OT after block and storage semantics are stable | Real-time editing is a major architectural commitment |
| Permissions | Capability-based access checks at the data/action boundary | UI hiding is not security |
| Plugins | Sandboxed, permission-scoped extension API | Prevents extensions from silently reading or changing everything |
| AI | Provider abstraction, explicit context selection and action confirmation | Protects private content and user control |
| Desktop/mobile | Storage adapter interface shared with core domain logic | Avoids coupling product logic to browser-only APIs |

### Possible future workspace layout

Keep the current .wave data readable and migrate incrementally. This is a design sketch, not a current implementation contract.

    <workspace>/
    └── .wave/
        ├── manifest.json
        ├── settings.json
        ├── documents/       # Markdown and/or exported page content
        ├── objects/         # Structured page, block and record metadata
        ├── databases/       # Database schemas and view definitions
        ├── assets/          # Ordinary files and media
        ├── indexes/         # Rebuildable local search indexes
        ├── history/         # Revision metadata and snapshots
        ├── backups/
        ├── trash/
        └── migrations/

Do not introduce this layout until migration design, compatibility policy and recovery behaviour are specified and tested.

## 7. Non-functional requirements and quality bar

Every major feature must meet these standards:

- **Data safety:** no silent data loss; failures are visible and recoverable.
- **Portability:** user data can be exported in documented, usable formats.
- **Offline:** local editing, search and core navigation work without internet.
- **Privacy:** no workspace upload, analytics or AI processing without explicit consent.
- **Performance:** large workspaces must not freeze the editor; indexes are incremental and rebuildable.
- **Accessibility:** keyboard and screen-reader use are supported for core workflows.
- **Consistency:** keyboard shortcuts, menus, dialogs and empty states behave predictably.
- **Testing:** unit, integration, migration and end-to-end tests cover critical workflows.
- **Documentation:** every shipped feature is reflected in README, current feature showcase and detailed status.
- **Migration:** upgrades preserve older workspaces and provide rollback/recovery when possible.

### Definition of done

A feature is not complete merely because its UI appears.

1. Data model and schema are documented.
2. Storage and failure behaviour are implemented.
3. Keyboard and accessibility behaviour are usable.
4. Empty, loading, error and success states exist.
5. Tests cover normal and failure paths.
6. Import/export and migration implications are considered.
7. README and feature documentation are updated.
8. CI typecheck and production build pass.
9. The feature is marked shipped only after verification.

## 8. What to build first — recommendation

The strongest next move is **not** databases, AI or multiplayer. It is to make the existing local workspace trustworthy, then establish the block/document foundation.

1. **Storage reliability:** atomic writes, save queue, backup restore and external-change conflicts.
2. **Workspace operations:** rename/move pages and folders, with safe link/favorite updates.
3. **Editor foundation:** choose a block editor and define a stable, portable block schema.
4. **Knowledge navigation:** internal links, backlinks, command palette and global search.
5. **Structured data:** database engine and table view.
6. **Execution layer:** tasks, project views and calendar.
7. **Collaboration layer:** comments, suggestions, spreadsheet blocks and optional real-time editing.

This sequence delivers value at every stage and avoids building advanced features on unstable storage.

## 9. Competitive reference links

These official product/help resources informed the comparison. Features and availability change; revisit sources when scoping an implementation.

### Notion
- [Product features](https://www.notion.com/product/features)
- [Database properties](https://www.notion.com/help/database-properties)
- [Database views, filters and sorts](https://www.notion.com/help/views-filters-and-sorts)
- [Relations and rollups](https://www.notion.com/help/relations-and-rollups)
- [Synced blocks](https://www.notion.com/help/synced-blocks)
- [Database buttons](https://www.notion.com/help/database-buttons)
- [Offline pages](https://www.notion.com/help/use-pages-offline)

### Quip / Salesforce
- [Quip product overview](https://quip.com/about/product)
- [Salesforce Quip feature guide](https://help.salesforce.com/s/articleView?id=xcloud.quip_use.htm&language=en_US&type=5)
- [Quip spreadsheets](https://help.salesforce.com/s/articleView?id=xcloud.quip_spreadsheets.htm&language=en_US&type=5)
- [Quip retirement notice](https://help.salesforce.com/s/articleView?id=005299603&language=en_US&type=1)

### Coda
- [Coda Help Center](https://help.coda.io/hc/en-us)
- [Coda roles and capabilities](https://help.coda.io/hc/en-us/articles/39556004184077-Roles-in-Coda-Doc-Makers-Admins-and-Editors)

### Obsidian
- [How Obsidian stores data](https://obsidian.md/help/data-storage)
- [Core plugins](https://obsidian.md/help/Plugins/Core%2Bplugins)
- [Sync notes across devices](https://obsidian.md/help/sync-notes)
- [Roadmap](https://obsidian.md/roadmap)

### Anytype
- [Anytype product overview](https://anytype.io/)
- [Anytype FAQ and local-first model](https://anytype.io/faq/)
- [Anytype technical repositories](https://tech.anytype.io/)

### Outline
- [Outline product overview](https://www.getoutline.com/)

## 10. Keeping this plan accurate

- This file is the **future product blueprint**, not the shipped-feature list.
- [features.md](features.md) remains the showcase of capabilities that exist today.
- [docs/FEATURES.md](docs/FEATURES.md) remains the detailed shipped/planned feature-status map.
- [docs/ROADMAP.md](docs/ROADMAP.md) remains the concise release sequence.
- When a planned feature ships, update all relevant status documents in the same change.
- Never mark a feature shipped based only on a plan, mockup or partial UI.
- Revisit competitor research and priorities periodically; do not let competitor checklists dictate Wave's product direction.

**The goal is not to become a copy of Notion or Quip. The goal is to make Wave the most trustworthy, capable local-first workspace for writing, knowledge and work.**
