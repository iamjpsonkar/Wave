# Wave — Upcoming Features & Product Blueprint

> **Vision:** a local-first workspace where documents, knowledge, data and work live together — combining Notion's flexible workspace, Quip's document-led collaboration, Coda's interactive workflows, Obsidian's file ownership and Anytype's offline-first principles.

**Status:** Product vision and planning document  
**Research date:** 14 November 2026  
**Important:** This is a plan, not a claim that unchecked features exist.

- [Current shipped features](FEATURES.md)
- [Priority features and delivery plan](priority-FEATURES.md)
- [Detailed feature status](FEATURES.md)
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

- The essential personal workspace must work offline after the app is available.
- Advanced online capabilities may require a network connection, but must remain optional and must not silently transfer workspace content to a Wave-operated readable data store.
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
- Offline mode remains useful for personal writing, organization and locally available structured data.
- Online mode unlocks collaboration, sharing, remote integrations and other network-dependent workflows.
- Sync, collaboration, AI and integrations are optional modules with explicit permissions.
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

### A4. Markdown compatibility and rendering — P0 (first editor priority)

**Goal:** make Markdown a dependable, portable authoring and interchange format. Implement in layers so the core editor ships quickly while advanced syntax remains explicit and safely degradable. Support must be documented per renderer; never imply that every Markdown extension works identically everywhere.

#### A4.1 Core CommonMark authoring and rendering — P0

- [ ] Parse and render CommonMark using a maintained, standards-tested parser.
- [ ] Text formatting: bold, italic, bold+italic, strikethrough, inline code and escaped literal characters.
- [ ] Six heading levels (H1–H6), paragraphs, blank-line separation and soft/hard line breaks.
- [ ] Ordered, unordered and nested lists; mixed lists; indentation and continuation.
- [ ] Blockquotes, nested blockquotes and formatted blockquotes.
- [ ] Fenced code blocks with language identifiers, syntax highlighting and copy action; support indented code blocks on import.
- [ ] Inline links, links with titles, reference-style links and automatic URL/email links.
- [ ] Images with alt text and optional title; linked images; preserve relative asset paths.
- [ ] Horizontal rules using supported Markdown forms.
- [ ] Tables with header rows and left/center/right alignment.
- [ ] Markdown escaping for punctuation and syntax characters so literal text is not accidentally formatted.
- [ ] Live preview and readable rendered mode with predictable cursor/selection behavior.
- [ ] Import and export without silently dropping unsupported content.

#### A4.2 GitHub Flavored Markdown (GFM) — P0

- [ ] Task lists/checklists with checked and unchecked states.
- [ ] Pipe tables and alignment markers.
- [ ] Strikethrough and autolinks.
- [ ] Footnotes.
- [ ] GitHub-style alerts/admonitions: NOTE, TIP, IMPORTANT, WARNING and CAUTION.
- [ ] Collapsible sections using `<details>` and `<summary>`, where safe and supported.
- [ ] Emoji shortcodes and GitHub-specific references (mentions and issue/PR references) as portable text when Wave cannot resolve them.
- [ ] Clear behavior for GFM extensions when exporting to CommonMark or another renderer.

#### A4.3 Rich content and advanced syntax — P1

- [ ] Inline and block LaTeX math; support common delimiters and normalize them on export.
- [ ] Mermaid diagrams, including flowcharts, sequence, class, ER, state, Gantt, pie, git graph, mindmap and timeline diagrams.
- [ ] Safe diagram rendering with no arbitrary script execution; preserve source when rendering is unavailable.
- [ ] Additional visualization formats (Graphviz, PlantUML, Vega/Vega-Lite, MathJax and KaTeX) only through reviewed, optional extensions.
- [ ] HTML inside Markdown with a documented allowlist and sanitization policy.
- [ ] Common safe HTML elements: details/summary, underline, superscript, subscript, keyboard input and line breaks.
- [ ] Handle div/span/image/video and other renderer-dependent HTML conservatively; block scripts, event handlers, unsafe URLs and active content.
- [ ] Image sizing/captions and embedded media only where the renderer and security model support them.

#### A4.4 Editing, conversion and interoperability — P0/P1

- [ ] Markdown shortcuts while typing and predictable conversion between Markdown syntax and editor formatting.
- [ ] Paste Markdown as formatted content; paste rich text from web pages, Word and Google Docs with cleanup.
- [ ] Preserve code fences, language labels, nested list structure, link titles, image alt text, table alignment and footnotes through round trips.
- [ ] Rich editor ↔ Markdown conversion with stable, documented serialization rules.
- [ ] Round-trip tests for every supported syntax feature; explicitly document lossy conversions.
- [ ] Unsupported syntax must be preserved as source or a safe fallback block, not silently deleted.
- [ ] Relative image/attachment references must survive folder import, workspace move and export.
- [ ] Provide a Markdown compatibility report when importing or exporting content with unsupported extensions.

#### A4.5 Compatibility and validation — P0/P1

- [ ] Publish a compatibility matrix for CommonMark, GFM, HTML, math and diagram extensions.
- [ ] Test representative documents against the chosen CommonMark/GFM specifications and GitHub rendering behavior.
- [ ] Treat renderer support as implementation-specific: footnotes, LaTeX, Mermaid and HTML must not be assumed universal.
- [ ] Add fixtures for headings, formatting, paragraphs/line breaks, lists, links, images, code, blockquotes, tables, rules, math, HTML, alerts, footnotes, diagrams and escaping.
- [ ] Add malformed-input, unsafe-HTML, unsafe-link and large-document tests.
- [ ] Ensure keyboard navigation, screen-reader output, focus behavior and accessible diagram fallbacks.
- [ ] Keep Markdown source exportable even when a richer Wave block has no Markdown equivalent.

#### A4.6 Recommended delivery sequence

1. **First:** CommonMark parsing, rendering, editing shortcuts and safe Markdown import/export.
2. **Next:** GFM task lists, tables, strikethrough, autolinks, footnotes and alerts.
3. **Then:** math/LaTeX and Mermaid with source-preserving fallbacks.
4. **Then:** sanitized HTML and carefully reviewed custom extensions.
5. **Throughout:** rich editor ↔ Markdown round-trip conversion, compatibility fixtures and export-loss reporting.

**Acceptance criteria:** a user can create or import a technical document containing the supported syntax, edit it in Wave, close/reopen it, export it, and retain the supported structure and meaning. Unsupported constructs remain recoverable and are reported rather than silently discarded.


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
- [FEATURES.md](FEATURES.md) remains the showcase of capabilities that exist today.
- [FEATURES.md](FEATURES.md) remains the detailed shipped/planned feature-status map.
- [docs/ROADMAP.md](docs/ROADMAP.md) remains the concise release sequence.
- When a planned feature ships, update all relevant status documents in the same change.
- Never mark a feature shipped based only on a plan, mockup or partial UI.
- Revisit competitor research and priorities periodically; do not let competitor checklists dictate Wave's product direction.

**The goal is not to become a copy of Notion or Quip. The goal is to make Wave the most trustworthy, capable local-first workspace for writing, knowledge and work.**


---

# 11. Expanded competitive landscape — additional products

The first comparison covered the closest document/workspace products. This extension adds adjacent products that reveal important workflows Wave should consider. The aim is broad coverage, not a commitment to build every category.

| Product | Additional capabilities worth studying | Potential Wave direction |
|---|---|---|
| **Microsoft Loop** | Portable synchronized components, pages, workspaces, tasks and components embedded in Teams, Outlook and Microsoft 365 | Reusable live components that can be embedded in multiple Wave pages; later, cross-app sharing |
| **Confluence** | Team spaces, page trees, whiteboards, databases, macros, page analytics, content permissions, templates, page versioning, team calendars and knowledge workflows | Whiteboards, page/space analytics, macros/embeds, trusted documentation and team knowledge governance |
| **ClickUp** | Tasks, sprints, goals, milestones, custom task types/statuses, docs, whiteboards, forms, workload, dashboards and extensive views | Connect documents to tasks and projects; provide whiteboards and dashboards as first-class workspace surfaces |
| **Airtable** | Relational databases, interfaces, forms, automations, synced data, extensions and app-like views | Database interfaces, data-entry forms, reusable views and external data connectors |
| **Linear** | Issue tracking, cycles, projects, roadmaps, initiatives, triage, labels, workflows, project updates and developer integrations | A focused software/project workflow module with issue-to-document links and GitHub integration |
| **Slite** | Knowledge base, verified documents, review cycles, question answering, analytics and stale-document detection | Verification dates, content owners, knowledge health dashboard and AI-proposed updates with human approval |
| **Joplin** | Notebooks, Markdown notes, tags, attachments, web clipper, offline-first sync, encryption, plugins and themes | Notebook-like organization, robust import, web capture and optional encrypted sync |
| **Logseq** | Outliner-first blocks, journals, block/page references, queries, tasks, whiteboards, PDF highlights, flashcards and plugins | Outliner mode, block references, query builder, spaced repetition and research workflows |
| **Capacities** | Typed objects, custom object types, properties, collections, daily notes, backlinks, graph, calendar and API/MCP | Object-type templates, custom schemas, date-centric navigation and API access |
| **Trello** | Boards, cards, lists, labels, checklists, due dates, power-ups and Butler automation | A simple board/card experience that can be generated from Wave databases and tasks |
| **Asana** | Goals, portfolios, projects, task dependencies, workload, approvals, forms, rules and status reporting | Portfolio/goal rollups, approvals and project reporting |
| **Monday.com** | Work boards, custom columns, dashboards, forms, automations, workload and cross-board connections | Cross-database dashboards, visual workflow automation and customizable work views |
| **Basecamp** | Message boards, to-dos, schedules, docs/files, chat, check-ins and project home pages | Lightweight project communication bundles without trying to become a full chat platform |
| **Milanote** | Visual boards, notes, images, links, files, columns and freeform spatial organization | Visual research boards, moodboards and spatial canvases |
| **Craft** | Polished documents, nested pages, collections, cards, daily notes, backlinks, publishing and offline workflows | High-quality document presentation, shareable exports and polished page layouts |
| **Evernote** | Web clipping, OCR, notebooks, tags, scans, tasks, reminders and document search | Searchable captures, OCR, inbox workflows and migration compatibility |
| **Google Docs/Sheets** | Suggesting, comments, version history, pageless docs, smart chips, tables, formulas, collaboration and file interoperability | High-quality review flows, spreadsheet interoperability and reliable document export |
| **Microsoft Word/Excel** | Advanced formatting, tracked changes, references, mail merge, formulas, pivot tables, charts and data validation | Interoperability and import/export first; only adopt advanced office features where they add clear value |
| **Dropbox Paper** | Collaborative documents, task assignments, media embeds, comments and lightweight project notes | Lightweight action assignment and clean embedded media experiences |

### Additional lessons

- **Portable components (Loop):** the same task list, table or status component should be able to appear in multiple places without creating divergent copies. Define a canonical component and explicit embed/reference semantics.
- **Whiteboards (Confluence, ClickUp, Milanote):** a freeform canvas is a distinct interaction model, not just a page with a drawing widget. It should support sticky notes, shapes, connectors, images, text and conversion of selected items into pages/tasks.
- **Data interfaces (Airtable, Monday):** databases need role- and task-oriented interfaces, not only generic tables. A form, dashboard or curated interface should be able to expose a safe subset of data.
- **Software delivery (Linear):** issue workflows benefit from cycles, triage, initiatives, release tracking, project updates and developer integrations.
- **Knowledge maintenance (Slite, Confluence):** a wiki needs owners, verification dates, stale-content detection, usage analytics and review queues—not just page creation.
- **Outliner and research workflows (Logseq, Joplin, Evernote):** block references, daily journals, web clipping, PDF annotations, OCR and flashcards support serious personal knowledge management.
- **Object-centric knowledge (Capacities):** custom object types and date-centric navigation can complement folders and Markdown pages, provided data remains exportable.
- **Office interoperability (Google/Microsoft):** Wave should prioritize accurate import/export and collaboration-friendly review over trying to reproduce every advanced word processor or spreadsheet feature.

---

# 12. Additional feature catalogue — capabilities to include

The following capabilities expand the original catalogue. They are deliberately separate to make omissions visible and avoid hiding important product ideas inside broad headings.

## Q. Whiteboards, canvas and visual thinking

- [ ] Infinite canvas with pan, zoom, minimap and fit-to-content.
- [ ] Sticky notes with colors, labels and markdown-like text.
- [ ] Text, shapes, connectors, arrows and freehand drawing.
- [ ] Images, files, web links and embedded pages on the canvas.
- [ ] Frames/sections to group related ideas.
- [ ] Alignment, distribution, snapping and grid guides.
- [ ] Multi-select, group, lock, duplicate and arrange layers.
- [ ] Convert sticky notes into pages, tasks or database records.
- [ ] Convert tasks/pages into canvas cards with live references.
- [ ] Link canvas objects to one another and to workspace objects.
- [ ] Templates for brainstorming, mind maps, retrospectives, user journeys and architecture diagrams.
- [ ] Presentation mode to walk through frames/sections.
- [ ] Export canvas as PNG, SVG and PDF.
- [ ] Real-time collaborative cursors and editing (after collaboration foundation).
- [ ] Whiteboard comments and reactions.
- [ ] Local/offline whiteboards with portable canvas schema.

## R. Dashboards, reporting and analytics

- [ ] Custom dashboard pages with movable/resizable widgets.
- [ ] Widgets for metrics, charts, tables, task lists and calendar summaries.
- [ ] Charts based on database views and spreadsheet ranges.
- [ ] Cross-database dashboard filters.
- [ ] Global filters for project, owner, status and date range.
- [ ] KPI cards, targets and progress indicators.
- [ ] Project portfolio dashboard.
- [ ] Team workload and capacity dashboard.
- [ ] Personal productivity dashboard.
- [ ] Saved dashboard layouts and reusable dashboard templates.
- [ ] Scheduled report generation (local or explicitly connected delivery).
- [ ] Export dashboard as PDF, image or presentation.
- [ ] Content analytics: page views, edits, searches and unanswered queries (only where collection is enabled and disclosed).
- [ ] Search analytics to identify missing documentation.
- [ ] Database and automation execution metrics.
- [ ] Analytics retention controls and privacy-preserving aggregation.

## S. Advanced knowledge and research workflows

- [ ] Outliner mode with nested bullets as first-class blocks.
- [ ] Block references and transclusions.
- [ ] Page embeds and block embeds with source indicators.
- [ ] Query builder for tasks, tags, properties, links and dates.
- [ ] Saved dynamic queries and live query blocks.
- [ ] Daily journal with automatic links to created/edited objects.
- [ ] Weekly/monthly/yearly notes.
- [ ] PDF viewer with highlights and anchored annotations.
- [ ] Link PDF highlights to pages, blocks and references.
- [ ] Citation manager and bibliography export (BibTeX/RIS).
- [ ] Zotero integration and reference metadata.
- [ ] Research source library with author, URL, publication date and notes.
- [ ] Web page reader mode and metadata extraction.
- [ ] OCR for scanned documents and images (optional/local where practical).
- [ ] Flashcards from selected blocks and database records.
- [ ] Spaced-repetition scheduling and review statistics.
- [ ] Math notation and calculation scratchpad.
- [ ] Whiteboard and diagram links from research notes.

## T. Publishing, sharing and document delivery

- [ ] Publish selected pages as a static site.
- [ ] Publish a page collection with navigation and search.
- [ ] Custom domain support for hosted publishing (optional service).
- [ ] Public read-only share links with expiry and revocation.
- [ ] Password-protected exports or share packages.
- [ ] Downloadable page bundles with assets.
- [ ] Print-friendly page themes and page breaks.
- [ ] Document cover pages, headers, footers and page numbers.
- [ ] Export selected pages as one combined PDF.
- [ ] Export a database view as a static snapshot.
- [ ] Embed a read-only published view in another site.
- [ ] Publishing preview and link checker.
- [ ] SEO metadata and social preview cards for published sites.
- [ ] Explicit warning and confirmation before publishing private content.
- [ ] Unpublish and revoke all public access in one action.

## U. Advanced task and operations management

- [ ] Multiple assignees and watcher/follower lists.
- [ ] Custom task types (bug, feature, request, incident, decision).
- [ ] Custom status workflows per project/database.
- [ ] Task triage inbox and intake queues.
- [ ] Sprint/cycle planning with capacity estimates.
- [ ] Backlog prioritization and ranking.
- [ ] Initiatives and portfolio-level project grouping.
- [ ] Release/version tracking and changelog generation.
- [ ] Goal hierarchy: objectives, key results, projects and tasks.
- [ ] Goal progress rollups and check-in history.
- [ ] Approvals and sign-off steps.
- [ ] Workload balancing and resource capacity.
- [ ] Time estimates, actuals and optional time tracking.
- [ ] Dependencies, blockers and critical path.
- [ ] Project status update templates and history.
- [ ] Cross-project task views and custom work queues.
- [ ] Incident/runbook templates and postmortems.
- [ ] Service request and bug intake forms.

## V. Reusable components and connected work

- [ ] Canonical synced blocks with backlinks to every embed.
- [ ] Reusable tables, task lists, callouts and page sections.
- [ ] Live references to a database view in multiple pages.
- [ ] Portable components that can be shared into documents and messages.
- [ ] Component permissions and source ownership.
- [ ] Component version history and change notifications.
- [ ] Embed preview and refresh policy for external content.
- [ ] Linked project status, KPI and task summary components.
- [ ] Cross-workspace references with explicit access boundaries.
- [ ] Component library and reusable team snippets.

## W. Knowledge quality and governance

- [ ] Verified/trusted page badge with owner and expiry date.
- [ ] Scheduled content review and reminder queue.
- [ ] Stale-page detection based on age and linked source changes.
- [ ] Duplicate/overlapping page detection.
- [ ] Broken link, missing owner and orphan page reports.
- [ ] Knowledge health dashboard.
- [ ] Page feedback: helpful/not helpful and report outdated.
- [ ] Unanswered search/query report.
- [ ] Glossary and acronym dictionary.
- [ ] Content lifecycle and retention rules.
- [ ] Bulk archive and bulk ownership reassignment.
- [ ] Audit trail for changes to critical documentation.
- [ ] AI-assisted update proposals with human review and approval.
- [ ] Document owner and reviewer escalation when review is overdue.

## X. Advanced forms and data collection

- [ ] Multi-step forms and progress indicators.
- [ ] Conditional fields and branching logic.
- [ ] Repeating sections and line-item inputs.
- [ ] Form prefill from URL or existing record.
- [ ] Anonymous and authenticated response modes.
- [ ] Form scheduling, close dates and response limits.
- [ ] Draft response save/resume.
- [ ] Confirmation email through a connected provider.
- [ ] Form analytics and conversion metrics.
- [ ] Approval/review queue for submissions.
- [ ] Create multiple related records from one submission.
- [ ] Webhook actions after form submission.
- [ ] QR code for local or published form access.
- [ ] Offline form submission queue for local workspace use.

## Y. Advanced integrations and interoperability

- [ ] Microsoft 365/Teams/Outlook integration.
- [ ] Microsoft Loop component import/reference where supported.
- [ ] Google Docs/Sheets/Drive integration.
- [ ] Atlassian Confluence/Jira integration.
- [ ] Linear issue and project integration.
- [ ] ClickUp, Asana, Trello and Monday import/connectors.
- [ ] Airtable CSV/API import and sync connector.
- [ ] Slack/Teams notifications and action links.
- [ ] GitHub/GitLab issue, PR, commit and release integration.
- [ ] Figma, Miro, Loom and diagramming embeds.
- [ ] Zotero and citation-manager integration.
- [ ] Email-to-inbox and calendar-to-meeting-notes workflows.
- [ ] Generic OAuth2 connector framework.
- [ ] Generic webhook and REST API connector.
- [ ] Integration health status, reconnect and token revocation.
- [ ] Field mapping, sync direction and conflict policy per connector.

## Z. AI knowledge operations — explicit opt-in

- [ ] Ask questions over one page, selected sources or the full workspace.
- [ ] Show citations, source snippets and freshness information.
- [ ] Distinguish source facts from generated suggestions.
- [ ] Draft page summaries, project updates and meeting recaps.
- [ ] Extract tasks, decisions, risks and owners from documents.
- [ ] Suggest links, tags, aliases and page properties.
- [ ] Detect contradictions and outdated instructions.
- [ ] Propose documentation updates based on changed source material.
- [ ] Human-reviewed triage queue for all proposed edits.
- [ ] AI-generated database views and formula suggestions (preview first).
- [ ] Natural-language query builder for databases.
- [ ] Meeting transcription with consent and local storage.
- [ ] Provider choice, local model support and per-workspace settings.
- [ ] Per-page AI exclusion and sensitive-content controls.
- [ ] Cost/token usage visibility for remote providers.
- [ ] AI prompt history and action audit log.
- [ ] No autonomous publishing, sharing or destructive edits without approval.

## AA. Administration, observability and supportability

- [ ] Workspace health and integrity report.
- [ ] Storage usage by documents, assets, backups and trash.
- [ ] Orphaned asset cleanup preview.
- [ ] Duplicate page and duplicate record report.
- [ ] Backup schedule, retention and last-verified status.
- [ ] Import/export job history and diagnostics.
- [ ] Sync health, device status and conflict queue.
- [ ] Plugin/integration permission inventory.
- [ ] Workspace event log and user-visible diagnostics.
- [ ] Crash recovery and safe-mode startup.
- [ ] Feature flags for experimental modules.
- [ ] Privacy-preserving bug report export with user review.
- [ ] Admin policies for team workspaces.
- [ ] Data retention, export and account/workspace offboarding.

---

# 13. Product coverage checklist

Use this checklist to check that the plan considers the major product categories across the wider market.

- [ ] Document editor and wiki (Notion, Confluence, Slite, Craft).
- [ ] Real-time modular components (Microsoft Loop).
- [ ] Interactive docs and no-code workflows (Coda).
- [ ] Spreadsheet/database app builder (Airtable).
- [ ] Project and task management (ClickUp, Asana, Monday).
- [ ] Software issue tracking and cycles (Linear, Jira).
- [ ] Kanban boards and lightweight planning (Trello).
- [ ] Team communication and project hubs (Basecamp, Quip).
- [ ] Visual whiteboards and spatial thinking (Milanote, Miro, FigJam).
- [ ] Local-first notes and file ownership (Obsidian, Joplin).
- [ ] Outliner, block references and journals (Logseq).
- [ ] Object-based personal knowledge management (Capacities, Anytype).
- [ ] Web clipping, OCR and research capture (Evernote, Joplin).
- [ ] Publishing and knowledge portals (Outline, Confluence).
- [ ] Forms, dashboards and automation (Airtable, ClickUp, Monday).
- [ ] AI-assisted knowledge discovery and maintenance (Slite and current workspace assistants).
- [ ] Desktop, mobile, offline and accessibility.
- [ ] Security, permissions, governance and portability.

**Coverage does not mean feature parity.** Each capability still needs a clear Wave use case, a local-first data contract, a priority and a maintenance cost estimate.


---

# 14. Additional specialist products and workflows

The previous comparison covers broad workspace products. This section adds specialist tools whose workflows are easy to overlook when designing an all-purpose workspace. Wave should borrow the useful primitives, not attempt to replace every specialist application.

## 14.1 Local-first and open-source all-in-one workspaces

**Reference products:** AppFlowy, AFFiNE, SiYuan, Trilium Notes, Standard Notes.

- [ ] **Local-first document model:** workspace remains readable and editable without an account or network.
- [ ] Explicit distinction between source files, metadata, indexes, caches and generated previews.
- [ ] Rebuildable indexes with integrity checks and deterministic re-indexing.
- [ ] Safe migration between workspace schema versions, with backup and rollback.
- [ ] Optional self-hosted sync service, separate from the local-only core.
- [ ] Offline-first operation with a visible sync state when sync is enabled.
- [ ] User-controlled encryption, key recovery guidance and clear threat model.
- [ ] Workspace portability: copy the directory to another machine and recover content.
- [ ] Open export format and documented storage schema.
- [ ] Plugin/theme extensions with permission boundaries and compatibility checks.
- [ ] Local API/CLI for scripting and automation.
- [ ] Recovery tools for damaged manifests, missing assets and stale indexes.

**Wave-specific design rule:** Markdown and ordinary asset files should remain recoverable without running Wave. Structured features may add sidecar metadata, but must not silently make the workspace dependent on a proprietary database.

## 14.2 Typed knowledge graphs and object-centric workspaces

**Reference products:** Tana, Capacities, Anytype, Logseq.

- [ ] User-defined object types such as Person, Project, Meeting, Book, Topic, Task and Decision.
- [ ] Type schemas with required/optional fields, validation and default values.
- [ ] Apply a type to an existing block or page without losing its original content.
- [ ] Object templates and reusable field groups.
- [ ] Relations between objects with explicit relation names and cardinality.
- [ ] Backlinks and relation navigation in both directions.
- [ ] Query all objects of a type, including objects embedded inside other pages.
- [ ] Saved queries that can be displayed as tables, lists, boards or calendars.
- [ ] Schema evolution: rename, merge, deprecate or migrate types and fields safely.
- [ ] Graph view with filters, clusters and a way to avoid overwhelming hairballs.
- [ ] Daily notes and automatic capture of dated events.
- [ ] Block-level references, embeds and transclusion.
- [ ] Reference integrity report for missing, orphaned or deleted targets.

**Important distinction:** tags classify content; object types define a schema. Wave should support both instead of treating every tag as a database type.

## 14.3 Research library, reading and reference management

**Reference products:** Zotero, Readwise Reader, Raindrop.io, Omnivore-style read-it-later workflows, DEVONthink, Eagle.

- [ ] Unified inbox for URLs, PDFs, EPUBs, files, screenshots and copied text.
- [ ] Browser capture and share-sheet capture, with source URL and capture date.
- [ ] Read-it-later queue with unread, reading, completed and archived states.
- [ ] Reader mode for saved web articles, preserving source attribution.
- [ ] PDF viewer with highlights, comments, bookmarks and page references.
- [ ] EPUB reader and annotations where supported by the chosen rendering library.
- [ ] OCR for scanned PDFs and images, with local processing option.
- [ ] Metadata extraction: title, author, publication, date, DOI, ISBN and URL.
- [ ] Reference collections, nested folders, tags and smart collections.
- [ ] Duplicate detection by DOI, ISBN, normalized URL, file hash and title similarity.
- [ ] Citation records and bibliography generation using CSL styles.
- [ ] Citation insertion into documents with a stable reference identifier.
- [ ] Bidirectional links between a source, its highlights and Wave notes.
- [ ] Highlight review queue and resurfacing of saved passages.
- [ ] Export citations and annotations to BibTeX, RIS, CSL JSON and Markdown.
- [ ] Preserve original files and never silently rewrite imported source material.
- [ ] Batch import/export and a clear report for unsupported metadata.

**Wave boundary:** Wave can provide a useful research inbox and connected reading notes; advanced reference-library management should remain interoperable with Zotero rather than reimplementing every scholarly workflow.

## 14.4 Visual thinking, diagrams and technical architecture

**Reference products:** Miro, FigJam, Excalidraw, tldraw, draw.io/diagrams.net, Lucidchart, Whimsical, Eraser, IcePanel, Mermaid.

- [ ] Infinite canvas with pan, zoom, selection, grouping, layers and alignment guides.
- [ ] Sticky notes, shapes, connectors, freehand drawing and text.
- [ ] Mind maps, concept maps, user journeys and storyboards.
- [ ] Flowcharts, sequence diagrams, ER diagrams, UML and network diagrams.
- [ ] Software architecture diagrams with reusable icon libraries.
- [ ] Mermaid and other text-based diagrams rendered from source.
- [ ] Import/export common formats such as SVG, PNG, PDF and supported editable formats.
- [ ] Embed a diagram in a document while retaining a link to its editable source.
- [ ] Convert selected outline/list content into mind-map nodes or sticky notes.
- [ ] Convert canvas objects into tasks or database records.
- [ ] Board templates, presentation mode and frame-based walkthroughs.
- [ ] Version history and recovery for diagram edits.
- [ ] Keyboard-first drawing and accessible object labels.
- [ ] Large-board performance, virtualization and autosave safeguards.
- [ ] Optional real-time cursors, comments and voting when collaboration is enabled.

**Engineering constraint:** diagram source should be stored in a documented, exportable format. Mermaid text is especially valuable because it can live beside Markdown in Git.

## 14.5 Publishing, documentation sites and knowledge portals

**Reference products:** Ghost, Docusaurus, MkDocs, GitBook, Read the Docs, Helpjuice, Outline.

- [ ] Publish a selected page or collection without exposing the entire workspace.
- [ ] Static-site export from Markdown and local assets.
- [ ] Documentation navigation tree, breadcrumbs and previous/next links.
- [ ] Versioned documentation for multiple product or API versions.
- [ ] Search index generated locally during static export.
- [ ] Custom themes, logo, favicon, typography and code highlighting.
- [ ] Custom domain configuration for an optional hosted deployment.
- [ ] Draft, review, scheduled and published states.
- [ ] Preview builds before publishing.
- [ ] Redirect mapping when a published page slug changes.
- [ ] SEO metadata, canonical URLs, Open Graph metadata and sitemap.
- [ ] RSS/Atom feeds for published updates.
- [ ] Localization and language-version relationships.
- [ ] Public/private page access rules for hosted deployments.
- [ ] Downloadable offline documentation bundle.
- [ ] Export a complete site that can be hosted on ordinary static hosting.
- [ ] Content freshness, broken-link and missing-image checks before release.

**Wave boundary:** static publishing should work without a Wave account or hosted service. Hosted publishing, memberships and newsletters are optional services, not prerequisites for owning content.

## 14.6 Workflow automation and event-driven operations

**Reference products:** Zapier, Make, n8n, Power Automate, Airtable Automations, Coda Automations.

- [ ] Trigger/action automation builder with a readable execution graph.
- [ ] Triggers for page created/updated, property changed, task due, form submitted and scheduled time.
- [ ] Conditions, filters, branching, delays and multi-step actions.
- [ ] Local event hooks and command-line scripts for offline workflows.
- [ ] Webhooks and API actions only when the workspace owner enables network access.
- [ ] Retry policy, idempotency keys and duplicate-event protection.
- [ ] Execution history, logs, error details and manual retry.
- [ ] Dry-run mode and sample payload inspection.
- [ ] Per-automation permissions and explicit approval for destructive actions.
- [ ] Secret storage that never writes credentials into Markdown or exported files.
- [ ] Automation import/export as a portable declarative file.
- [ ] Pause all automations instantly and show which ones can access the network.

## 14.7 Personal productivity, journaling and habit systems

**Reference products:** Day One, Journey, Todoist, TickTick, Amazing Marvin, Habitica.

- [ ] Daily journal and dated note templates.
- [ ] Calendar timeline for notes, tasks, meetings and milestones.
- [ ] Habit definitions, schedules, streaks and completion history.
- [ ] Recurring tasks with clear handling of missed occurrences.
- [ ] Focus sessions, lightweight time tracking and activity summaries.
- [ ] Weekly/monthly review templates and reflection prompts.
- [ ] Goals with measurable outcomes and linked projects.
- [ ] Private journal areas and optional encryption boundary.
- [ ] Export personal history in readable Markdown/CSV/JSON.
- [ ] No guilt-oriented streak mechanics; allow pauses and retrospective edits.

## 14.8 Knowledge capture and asset libraries

**Reference products:** Evernote, Eagle, Raindrop.io, DEVONthink.

- [ ] Universal capture inbox with source, timestamp and capture method.
- [ ] Drag-and-drop ingestion for files, folders, URLs and images.
- [ ] Local full-text indexing for supported document types.
- [ ] OCR and metadata extraction with a review step for uncertain results.
- [ ] Image/video/audio preview and metadata panels.
- [ ] Tags, collections, ratings and smart filters for assets.
- [ ] Similar-image and duplicate-file detection.
- [ ] Backlinks from assets to every page that references them.
- [ ] Bulk rename, move and tag operations with undo.
- [ ] Missing-file detection and relink workflow.
- [ ] Asset usage report before deleting or replacing a file.

## 14.9 Forms, surveys and lightweight CRM

**Reference products:** Typeform, Tally, Jotform, Airtable Forms, HubSpot CRM.

- [ ] Contact/person/company records with customizable fields.
- [ ] Lead, opportunity and interaction history as optional object types.
- [ ] Relationship timeline and linked meeting notes.
- [ ] Form builder with validation, conditional logic and response review.
- [ ] CSV import/export with field mapping and duplicate handling.
- [ ] Local-only forms for data entry inside the workspace.
- [ ] Hosted forms only through an explicitly configured publishing service.
- [ ] Consent, retention and deletion controls for collected personal data.
- [ ] Avoid turning Wave into a full marketing automation or sales platform by default.

## 14.10 Enterprise content governance and records management

**Reference products:** Confluence, SharePoint, Slite, Notion Enterprise, Microsoft Purview.

- [ ] Document owner, reviewer, classification and retention metadata.
- [ ] Review intervals and verification expiry.
- [ ] Page lifecycle: draft, active, deprecated, archived and superseded.
- [ ] Legal hold and protected records mode for deployments that require it.
- [ ] Exportable audit history for access and content changes.
- [ ] Workspace-level retention and deletion policies.
- [ ] Permission inheritance visualization and access review.
- [ ] Redaction workflow for exported or shared documents.
- [ ] Policy acknowledgement and approval records.
- [ ] Governance features must be clearly scoped; local personal mode should not inherit enterprise complexity.

---

# 15. Cross-cutting capabilities that are easy to miss

These are not standalone modules. They are quality requirements that should apply across the product.

## 15.1 Editing and content integrity

- [ ] Reliable undo/redo across block operations, not just text input.
- [ ] Autosave state with last-saved timestamp and unsaved-change indicator.
- [ ] Crash recovery and restore of the last valid editor state.
- [ ] Conflict-safe editing when the same workspace is opened in multiple windows.
- [ ] Atomic writes, temporary files and recovery after interrupted writes.
- [ ] Stable block/page IDs that survive rename and move.
- [ ] Schema validation and migration tests for every persisted data format.
- [ ] Unicode, emoji, RTL and multilingual text support.
- [ ] Copy/paste fidelity from browsers, office suites and Markdown sources.
- [ ] Import preview, warnings and rollback for bulk operations.

## 15.2 Findability and navigation

- [ ] Global command palette and keyboard shortcut discovery.
- [ ] Quick switcher across pages, blocks, objects and recent searches.
- [ ] Search filters for type, path, tag, date, author and file kind.
- [ ] Search operators and saved searches.
- [ ] Backlinks, forward links, breadcrumbs and recently visited history.
- [ ] Broken-link and orphan-page reports.
- [ ] Context-aware navigation for large workspaces.
- [ ] Search result snippets with highlighted matches and file paths.

## 15.3 Data portability and long-term durability

- [ ] Documented workspace format and compatibility policy.
- [ ] Full-fidelity export, including metadata, relationships and assets.
- [ ] Round-trip tests: export, re-import and compare content.
- [ ] Stable IDs and deterministic filenames where practical.
- [ ] No hidden dependency on a proprietary cloud service for local reading.
- [ ] Clear policy for unknown fields so newer metadata is not destroyed by older clients.
- [ ] Backup verification by actually restoring into a temporary workspace.
- [ ] Workspace migration report listing converted, skipped and failed items.

## 15.4 Performance and scale

- [ ] Virtualized page tree, tables, search results and long documents.
- [ ] Incremental indexing rather than rescanning the entire workspace on every edit.
- [ ] Background thumbnail and preview generation.
- [ ] Debounced search with cancellation of stale queries.
- [ ] Large-file and large-attachment safeguards.
- [ ] Performance budgets for startup, typing latency, search and page switching.
- [ ] Benchmark fixtures with thousands of pages and large asset libraries.
- [ ] Memory usage monitoring and cleanup of unused object URLs/resources.

## 15.5 Accessibility and usability

- [ ] Complete keyboard-only navigation and editing.
- [ ] Screen-reader semantics for editor blocks, tables, dialogs and menus.
- [ ] Visible focus indicators and predictable focus restoration.
- [ ] High contrast, reduced motion and scalable typography.
- [ ] Accessible color choices and non-color status indicators.
- [ ] Touch-friendly controls for tablet layouts.
- [ ] Localization-ready dates, numbers, time zones and pluralization.
- [ ] Onboarding that explains workspace location, permissions and backup behavior.

## 15.6 Security and privacy

- [ ] Threat model for local workspace, browser storage, plugins and optional sync.
- [ ] Safe Markdown/HTML rendering and sanitization tests.
- [ ] Strict Content Security Policy and dependency review.
- [ ] Validate file types, sizes and paths during import and attachment handling.
- [ ] Prevent path traversal and unsafe archive extraction.
- [ ] Plugin capability permissions and sandbox boundaries.
- [ ] Network access indicator and per-feature opt-in.
- [ ] No secrets in logs, URLs, workspace exports or crash reports.
- [ ] Security review for public publishing and share links.
- [ ] Clear deletion semantics for trash, backups, caches and synced replicas.

---

# 16. Additional competitor coverage checklist

Use this list to identify specialist workflows that were not explicit in the earlier matrix.

- [ ] Local-first all-in-one workspace: AppFlowy and AFFiNE.
- [ ] Block-based privacy-first knowledge base: SiYuan.
- [ ] Typed knowledge graph and supertags: Tana.
- [ ] Object-centric personal knowledge management: Capacities and Anytype.
- [ ] Outliner and block-reference workflows: Logseq.
- [ ] Academic reference management: Zotero.
- [ ] Read-it-later and annotation workflows: Readwise Reader.
- [ ] Digital asset management: Eagle and DEVONthink.
- [ ] Bookmark and web collection management: Raindrop.io.
- [ ] Visual workshops and collaborative canvases: Miro, FigJam and Mural.
- [ ] Sketch-based diagrams: Excalidraw and tldraw.
- [ ] Structured diagrams and technical architecture: draw.io, Lucidchart, Eraser and IcePanel.
- [ ] Static documentation and versioned docs: Docusaurus, MkDocs and Read the Docs.
- [ ] Publishing, subscriptions and newsletters: Ghost.
- [ ] Enterprise portals and records governance: SharePoint and Confluence.
- [ ] Workflow automation: n8n, Make, Zapier and Power Automate.
- [ ] Personal journaling and habit tracking: Day One, Journey and Habitica.
- [ ] Forms and lightweight CRM: Tally, Typeform, Jotform and HubSpot.
- [ ] Cross-cutting requirements: reliability, accessibility, security, performance and portability.

---

# 17. Prioritization: what Wave should actually build

A comprehensive catalogue is a research inventory, not a commitment to implement every feature. Prioritize based on user value, local-first fit, implementation cost and long-term maintenance.

| Priority | Capability | Why it belongs |
|---|---|---|
| P0 | Storage integrity, backups, recovery, migrations | Protects user data and every later feature |
| P0 | Block editor, keyboard UX, undo/redo | Core writing experience |
| P0 | Search, links, backlinks, navigation | Makes a growing workspace usable |
| P1 | Typed objects, properties and saved views | Adds structured knowledge without abandoning documents |
| P1 | Tasks, calendar and project views | Makes notes actionable |
| P1 | Research inbox, attachments and PDF annotations | High-value capture and learning workflow |
| P1 | Import/export and static publishing | Keeps content portable and useful outside Wave |
| P2 | Whiteboard and diagram embeds | Complements writing and technical documentation |
| P2 | Templates, reusable blocks and automation | Reduces repeated work |
| P2 | Local API, CLI and plugin framework | Makes Wave extensible |
| P3 | Optional sync and real-time collaboration | Valuable, but introduces major conflict and infrastructure complexity |
| P3 | AI workflows | Only after source attribution, permissions and review are reliable |
| P3 | Enterprise governance and hosted publishing | Serve explicit team/organization use cases |

## 17.1 Explicit non-goals unless validated

- Rebuilding a full office suite or spreadsheet engine.
- Replacing specialist citation managers, design tools or project trackers.
- Mandatory account creation, cloud storage or telemetry.
- A proprietary-only document format.
- Autonomous AI edits, publishing or destructive actions.
- Enterprise administration in the default personal workspace.
- Feature parity checklists that encourage shallow, unfinished implementations.

---

# 18. Research references for the additional coverage

The following references informed the additional categories. Product capabilities change, so validate exact behavior and licensing before implementation.

- [AFFiNE — local-first docs and whiteboards](https://affine.pro/)
- [AFFiNE — page docs](https://affine.pro/pagedoc)
- [SiYuan — project features and storage overview](https://github.com/siyuan-note/siyuan)
- [SiYuan — workspace file-system layout](https://github.com/siyuan-community/siyuan/blob/master/docs/WORKSPACE.md)
- [SiYuan — document format and mutation guidance](https://github.com/siyuan-community/siyuan/blob/master/docs/SY-FORMAT.md)
- [Tana — Supertags](https://outliner.tana.inc/learn/features/supertags)
- [Tana — knowledge graph concepts](https://outliner.tana.inc/help/knowledge-graph-concepts)
- [Zotero — documentation](https://www.zotero.org/support/)
- [Zotero — collections and tags](https://www.zotero.org/support/collections_and_tags/)
- [Readwise Reader — documentation](https://docs.readwise.io/reader)
- [Figma — visual collaboration tools](https://www.figma.com/resource-library/visual-collaboration-tools/)
- [Excalidraw — project](https://github.com/excalidraw/excalidraw)
- [Docusaurus — documentation](https://docusaurus.io/docs)
- [Ghost — product manual](https://ghost.org/help/manual/)

---

# 19. Final completeness and implementation rule

Before adding a capability to the active roadmap, answer all of these questions:

1. What user problem does it solve in Wave?
2. Which specialist product demonstrates the workflow well?
3. Does it work offline and preserve local ownership?
4. What is the source of truth: Markdown, a sidecar file, or a derived index?
5. How will it migrate, export, recover and interoperate?
6. What happens when the feature is disabled or removed?
7. What are the accessibility, privacy and security implications?
8. What is the smallest useful vertical slice?
9. What tests prove correctness and prevent data loss?
10. What maintenance burden does it add?

A feature is not complete when its UI exists. It is complete when its data model, recovery behavior, keyboard/accessibility experience, tests, documentation and export story are also in place.


---

# 20. Wave product constitution — decisions based on the product owner's answers

This section records the product direction supplied by the owner and turns the open design questions into engineering decisions. If another section conflicts with this constitution, this section takes precedence until the owner changes it.

## 20.1 Product promise

Wave aims to cover the important problems solved by Notion and Quip, and extend beyond them, while keeping durable user content under the user's control.

- Deliver a broad, modular workspace rather than a notes-only application.
- Keep durable workspace content on storage controlled by the user.
- Minimize mandatory infrastructure by making the client responsible for editing, rendering and local persistence.
- Make the product useful offline, while allowing the full collaborative and connected experience online.
- Offer a self-hosted Docker deployment so users can run online services on infrastructure they control.
- Treat Notion and Quip as primary workflow references; use specialist tools to guide individual capabilities.

This is a product ambition, not a claim of current feature parity. Delivery must be incremental and tested.

## 20.2 Two operating modes

Wave has two complementary modes, not two separate products.

### Offline Core

The offline core supports essential personal work:

- Open and edit locally stored pages and blocks.
- Create folders, documents and local assets.
- Search locally available content.
- Use local databases, properties, relations and views where supported by the local engine.
- Manage personal tasks, calendars and templates stored in the workspace.
- Import, export, back up and restore workspace data.
- Read and edit content without sign-in or network access.

A network outage must never make local content inaccessible.

### Online Workspace

Online mode adds features that need communication between devices or people:

- Real-time multi-user editing, cursors, presence and comments.
- Shared workspaces, invitations, permissions and access control.
- Notifications, mentions and activity feeds.
- Remote integrations, webhooks and hosted forms.
- Cross-device synchronization and conflict resolution.
- Optional AI providers and other external services.
- Hosted publishing or sharing when enabled by the owner.

If the connection drops, local editing continues and pending operations are queued safely for later synchronization.

### Online does not mean Wave owns the user's data

The default architecture must not require a Wave-operated database containing readable document contents. Clients own durable content; network services coordinate access and delivery.

Preferred deployment model:

1. **Client:** editor, rendering, local database, local search, permissions UX, encryption and offline queue.
2. **Coordination service:** authentication/session establishment, workspace discovery, presence, signaling, notifications and sync coordination.
3. **Peer-to-peer transport:** WebRTC or another secure direct transport where practical.
4. **Relay fallback:** TURN or equivalent may forward encrypted traffic when direct connections fail. Relaying bytes is not the same as storing readable content.
5. **Optional self-hosted services:** Docker can run coordination, relay, integration and explicitly configured encrypted backup services on user-controlled infrastructure.
6. **Optional hosted service:** if Wave ever provides one, disclose exactly what metadata/content it can access, retention, encryption boundaries and export/deletion controls.

Do not promise zero infrastructure for real-time internet collaboration. Signaling, identity, NAT traversal and notifications require services somewhere. The goal is minimal infrastructure, user choice and no mandatory central readable content repository.

## 20.3 Source of truth — chosen storage architecture

**Decision: use a versioned, directory-based Wave workspace with SQLite as the canonical transactional data store and ordinary files for binary assets and exports.**

This is preferred over Markdown, independent JSON sidecars or a derived search index as the canonical store.

Why SQLite:

- Databases, relations, comments, permissions, tasks and collaborative edits need transactions and referential integrity.
- One database avoids partial writes across many independent records.
- SQLite is portable, inspectable with standard tools and supported by browser/WASM, desktop and server runtimes.
- It supports migrations, indexes, constraints, rollback and consistent snapshots.
- The same logical schema can be used by browser, desktop and user-managed Docker runtimes.

### Proposed workspace layout

    MyWorkspace/
    └── .wave/
        ├── manifest.json       # format version, workspace ID and capabilities
        ├── workspace.sqlite   # canonical pages, blocks, objects, relations, metadata
        ├── assets/            # original images, files and media
        ├── exports/           # user-requested Markdown/HTML/CSV/JSON exports
        ├── backups/           # verified, restorable workspace snapshots
        ├── trash/             # recoverable deleted records/assets
        ├── cache/             # disposable previews and thumbnails
        └── logs/              # bounded, user-visible diagnostic logs

Exact names may evolve, but canonical data, original assets, exports, backups and disposable cache must remain separate.

### Data rules

- workspace.sqlite is the source of truth for structured workspace content and metadata.
- Assets remain ordinary files. SQLite stores stable asset IDs, relative paths, hashes, media types and metadata; large binary assets do not go into database rows by default.
- Markdown is a first-class import/export format, not the canonical representation for every feature. Export must preserve supported constructs and report unsupported/lossy conversions.
- JSON/CSV exports must be documented and stable for external tooling.
- Search indexes, thumbnails, embeddings and previews are derived data and rebuildable.
- Browser IndexedDB may cache handles, credentials/tokens and transient state, but must not become the only copy of user content.
- Never maintain two independently editable canonical copies of the same page.

### Migration from the current MVP

The current MVP stores Markdown files under .wave/documents/. Do not abruptly replace or delete them.

- Keep the current Markdown workspace readable.
- Add a versioned migration that imports pages, folder paths, settings, favorites, trash metadata and assets into the new schema.
- Preserve original files in a pre-migration snapshot until the user verifies the result.
- Produce a migration report with counts, warnings, skipped files and failures.
- Make migration repeat-safe and rollback-capable.
- Retain Markdown import/export after migration so users are never locked into SQLite.

## 20.4 Migration, export, recovery and interoperability

The workspace directory is the portable unit. A user must be able to copy it, back it up, move it to another machine or mount it into a Docker deployment.

- Version every schema and file-format change.
- Run migrations transactionally, with a verified pre-migration backup.
- Maintain stable IDs for pages, blocks, objects, relations and assets.
- Use SQLite integrity checks and foreign keys where appropriate.
- Use atomic database transactions and safe asset-write protocols.
- Maintain a recovery journal or equivalent for interrupted multi-step asset operations.
- Verify backups by restoring them into a temporary workspace and checking integrity.
- Export complete workspaces with database, assets and manifest.
- Export readable content to Markdown and structured data to JSON/CSV.
- Provide import preview, mapping report and rollback for external imports.
- Detect missing assets, orphan records, broken relations and unsupported schema versions.
- Never let an older app silently destroy fields written by a newer schema.
- Provide a documented read-only inspection path for users and third-party tools.

## 20.5 Security, privacy and accessibility

### Privacy defaults

- Workspace content stays local unless a user explicitly enables a feature that transmits it.
- No analytics or telemetry containing workspace content by default.
- Label network-dependent features and show which service/provider receives data.
- AI processing is opt-in, provider-specific and configurable per workspace/page.
- Diagnostics exclude document text unless the user explicitly reviews and includes it.
- Provide session revocation, export and deletion controls for optional hosted identity services.

### Security model

- Encrypt network traffic in transit with modern TLS.
- Prefer end-to-end encryption for collaboration/sync so coordination and relay services cannot read content.
- Keep identity, workspace authorization and encryption keys conceptually separate.
- Never store plaintext passwords or long-lived secrets in the workspace database.
- Use OS/browser secure credential storage where available; document browser-only limitations.
- Validate inputs, paths, archive extraction limits and sanitize rich content.
- Treat plugins, embeds, imported files and integrations as untrusted.
- Use least-privilege plugin/integration permissions and show grants to the user.
- Threat-model public sharing, multi-user permissions and plugin execution before release.
- Define key-loss and recovery behavior before claiming end-to-end encryption.

### Accessibility

- Keyboard-first editing and complete keyboard navigation.
- Screen-reader semantics for blocks, tables, dialogs and navigation.
- Visible focus, predictable focus management and accessible errors.
- Contrast, zoom, reduced motion and scalable typography support.
- Never communicate state by color alone.
- Provide accessible alternatives to drag-and-drop and visual-only canvas workflows.
- Combine automated checks with manual keyboard and screen-reader testing.

## 20.6 Smallest useful vertical slice

Do not start by building every module or real-time collaboration. The smallest meaningful foundation is one complete, safe document workflow using the future storage architecture.

### Vertical slice A — local workspace foundation

1. Create/open a workspace directory.
2. Initialize manifest and SQLite database.
3. Define schema versioning and migrations.
4. Create, edit, rename, move and delete a page containing stable-ID blocks.
5. Autosave transactionally and recover after an interrupted write.
6. Store an image/file asset and reference it from a page.
7. Search pages locally using a rebuildable index.
8. Export a page to Markdown and the workspace to a portable archive.
9. Back up and restore the workspace with integrity verification.
10. Test migration from the existing Markdown MVP without deleting the original.

This proves the core promise: create useful content, keep it locally, recover it and take it elsewhere.

### Vertical slice B — first online collaboration workflow

1. Connect two clients to a user-managed collaboration server.
2. Invite the second client to a workspace/page.
3. Exchange encrypted edits and presence events.
4. Persist changes locally on both clients.
5. Reconcile concurrent edits deterministically or present conflicts for review.
6. Disconnect the network, continue editing, reconnect and converge.
7. Prove the coordination service cannot decrypt end-to-end encrypted content.

Only after these slices are reliable should Wave expand into full database views, spreadsheets, automation, AI and enterprise controls.

## 20.7 Tests that prove correctness and prevent data loss

### Unit and schema tests

- Schema constraints, indexes, foreign keys and migration paths.
- Stable ID generation and relation integrity.
- Serialization/deserialization round trips for every block/object type.
- Markdown import/export round trips with documented loss boundaries.
- Asset path validation, hashing and duplicate detection.
- Query/filter/formula correctness for structured data.

### Storage integration tests

- Create, edit, rename, move, trash, restore and permanently delete.
- Concurrent reads/writes from multiple app windows.
- Simulated failure before, during and after database transactions.
- Interrupted asset writes and cleanup of orphaned temporary files.
- Disk-full, permission-revoked and unavailable-folder scenarios.
- Backup creation, verification and full restore.
- Migration from every supported prior schema version.
- Workspace copy/move to another directory or machine.

### Collaboration tests

- Multiple clients editing same and different blocks.
- Simultaneous edits, reorder, delete-vs-edit and relation changes.
- Offline edits followed by reconnect and conflict resolution.
- Duplicate, delayed and out-of-order message delivery.
- Client crash/restart during synchronization.
- Unauthorized access, revoked sessions and expired credentials.
- Encryption tests proving relays cannot decrypt payloads.

### End-to-end and quality tests

- Browser first-run, permission recovery and workspace reopen.
- Accessibility keyboard flows and screen-reader smoke tests.
- Large-workspace benchmarks: thousands of pages, large assets and tables.
- Security tests for XSS, unsafe Markdown, path traversal and malicious archives.
- CI runs typecheck, unit, integration and production build.
- A release passes a restore-from-backup test, not merely a successful backup.

**Release gate:** no data-loss bug, failed migration, failed restore or unresolved critical security issue may be waived as cosmetic.

## 20.8 Maintenance and complexity budget

A broad workspace can become expensive to maintain. Control that cost through architecture and product boundaries.

- Build a modular monolith first: one client, one storage contract and a small number of deployable services.
- Avoid microservices until measured scale or team boundaries justify them.
- Keep one canonical schema and versioned migration path.
- Introduce a plugin API only after stable extension points exist.
- Prefer established libraries and open standards for Markdown, SQLite, CRDTs, charts, diagrams and citations.
- Do not build a full office suite, video platform or CRM unless usage validates the investment.
- Make modules optional and lazy-load expensive capabilities.
- Maintain compatibility tests across browser, desktop and Docker runtimes.
- Track bundle size, startup time, query performance and memory usage.
- Review dependency ownership, licenses and security advisories.
- Treat format documentation, migration tests and export tests as permanent maintenance work.
- Every feature proposal documents storage impact, offline behavior, network requirements, permissions, migration/export and tests.

The main maintenance risk is not the number of UI controls; it is overlapping data models, synchronization rules and deployment combinations. Keep those foundations small and consistent.

## 20.9 Docker and deployment direction

Docker is a planned deployment target for users who want online functionality under their own control.

- Provide a documented Docker image and Compose example.
- Persist server-managed data, configuration and keys in explicitly mounted volumes.
- Support health checks, structured logs, backup/restore and versioned upgrades.
- Document reverse-proxy and TLS setup.
- Keep the server stateless where practical; persist only what the selected mode requires.
- Separate coordination/relay metadata from encrypted workspace payloads.
- Allow users to disable public registration and restrict access to their network.
- Provide upgrade/rollback procedures and a compatibility matrix.
- Ship secure defaults and document exposed ports, secrets and network boundaries.

The browser-only MVP remains the first delivery target. Docker is a later deployment adapter over the same workspace format and protocol, not a reason to delay the local product.

## 20.10 Product decision summary

| Decision | Chosen direction |
|---|---|
| Product scope | Notion + Quip workflows and additional specialist capabilities |
| Primary references | Notion and Quip |
| Offline behavior | Essential personal workspace works offline |
| Online behavior | Collaboration and connected features when online |
| Data ownership | User-controlled workspace; no mandatory Wave readable-content repository |
| Canonical store | Versioned SQLite database inside a portable .wave directory |
| Binary assets | Ordinary files with stable IDs and database metadata |
| Markdown | Supported import/export and readable interchange format |
| Search/indexes | Derived and rebuildable |
| Collaboration | Encrypted peer-to-peer where practical, relay/coordination fallback |
| Deployment | Browser client first; desktop and user-managed Docker later |
| First vertical slice | Local page/block storage, migration, backup, restore and export |
| Release quality | Integrity, migration, recovery, security and accessibility tests |



## 20.8 Two editions from one codebase — approved decision (2026-11-15)

Wave will be released as **Wave Personal** and **Wave Full**, preserving the data-ownership and offline-first decisions above.

- **Personal:** local-only; no account, backend dependency, server database, document upload, remote sync, collaboration service or telemetry. Static hosting may deliver application assets only.
- **Full:** retains local/offline workspaces and adds optional identity, device enrollment, encrypted synchronization, collaboration and permission-scoped integrations. It supports both hybrid/offline and cloud-connected workflows.
- “Cloud-connected” does not mean cloud-first canonical document storage. The local workspace remains durable and usable offline. Hosted services coordinate identity, authorization, discovery, signaling, presence and notifications. Sync payloads must be end-to-end encrypted before leaving a client.
- Optional relay/object storage may forward or retain ciphertext only when separately enabled, disclosed and consented. Services must not receive plaintext workspace keys or readable canonical documents.
- The planned canonical local store remains versioned SQLite plus ordinary asset files under section 20.3. The current Markdown MVP must remain readable and be migrated repeat-safely; SQLite and the two editions are not yet implemented.
- Personal and Full require separate build targets and dependency/import boundaries. Personal must exclude Full network clients, auth, sync workers and credentials; a runtime feature flag alone is insufficient.
- Before Full sync release, specify cryptographic protocol, key recovery/loss/rotation, device revocation, authorization, conflict resolution, replay protection, deletion propagation, ciphertext retention, export and account offboarding.
- Full architecture and release gates: [EDITIONS.md](../engineering/EDITIONS.md). Tracking: [issue #135](https://github.com/iamjpsonkar/Wave/issues/135).

This decision rejects a mandatory server-side database of readable user documents. Any future proposal to change that boundary requires a separate explicit product-owner decision and privacy/security review.
