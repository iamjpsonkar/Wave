# Wave — Priority Features & Delivery Plan

> **Purpose:** decide what Wave should build first, next and later without deleting, shrinking or abandoning any feature already captured in the product blueprint.

**Source of truth:** [upcoming-FEATURES.md](upcoming-FEATURES.md) is the complete feature catalogue and product constitution. This file is only the delivery-order view. If a feature is not scheduled in an early phase, it remains planned in the complete catalogue.

**Non-negotiable rule: NO FEATURE DROPS.** No idea, feature, workflow, integration, platform target, or capability already recorded in `upcoming-FEATURES.md` may be removed because it is not an immediate priority. Defer, split, redesign or mark as not yet validated—but preserve it and its rationale.

**Planning status:** priorities are sequencing guidance, not implementation claims. Update checkboxes only after implementation and verification.

---

## 1. Priority model

| Priority | Meaning | Scheduling rule |
|---|---|---|
| **P0 — Safety and foundations** | Prevent data loss; establish dependable storage, editing, portability and security boundaries | Must precede major feature expansion |
| **P1 — Daily-use workspace** | Make Wave valuable for writing, finding, organizing and personal work | Build after the foundations are proven |
| **P2 — Advanced workflows** | Databases, project operations, spreadsheets, visual tools, forms and collaboration | Build on stable P0/P1 models |
| **P3 — Platform and ecosystem** | Integrations, extensibility, AI, administration and broad deployment | Add incrementally with explicit permissions and maintenance budgets |

A priority does not mean that lower-priority features are optional or cancelled. It only describes implementation order.

## 2. Immediate priorities — complete before broad feature expansion

### P0.1 — Reliability and data safety

- [ ] Finish the remaining browser-level verification recorded in [bugs.md](bugs.md), including multi-tab editing, browser permission revocation, backup fault-injection and real-browser recovery flows.
- [ ] Add browser end-to-end tests for first run, workspace reopen, editor save/recovery, Trash, backups and permission errors.
- [ ] Test large Markdown documents, large assets and large workspaces; define measurable performance budgets.
- [ ] Verify cross-tab document editing and uploads, conflict handling and external file modifications.
- [ ] Verify supported-browser behavior and document the browser/filesystem compatibility matrix.
- [ ] Test Unicode names, case-only collisions and platform-specific filesystem behavior.
- [ ] Preserve the current local-first MVP while introducing future storage changes through repeat-safe migrations.
- [ ] Maintain backup/restore verification, recovery journals, integrity diagnostics and safe failure behavior.
- [ ] Keep security, privacy, accessibility and data ownership as release gates.

**Exit gate:** no known critical data-loss issue; browser-level tests cover the critical local workflows; backup restore and interrupted-operation recovery are verified.

### P0.2 — Markdown compatibility and rendering (first editor priority)

The Markdown feature specification is maintained in [upcoming-FEATURES.md, A4](upcoming-FEATURES.md).

- [ ] **CommonMark:** parser, renderer, six heading levels, paragraphs, line breaks, formatting, lists, blockquotes, code, links, images, rules, escaping and tables.
- [ ] **GFM:** task lists, tables, strikethrough, autolinks, footnotes, alerts, collapsible sections and portable handling of GitHub-specific references.
- [ ] **Safe rich content:** sanitized HTML, safe links, safe image/media handling and source-preserving fallbacks.
- [ ] **Advanced syntax:** LaTeX/math and Mermaid diagrams, followed by carefully reviewed optional diagram/visualization extensions.
- [ ] **Editing:** Markdown shortcuts, live/read preview, paste cleanup and predictable keyboard behavior.
- [ ] **Interoperability:** rich editor ↔ Markdown round trips, relative asset preservation, import/export compatibility reports and no silent loss of unsupported syntax.
- [ ] **Quality:** fixtures, malformed-input tests, unsafe HTML/link tests, large-document tests and accessibility coverage.

**Delivery order:** CommonMark → GFM → math/Mermaid → sanitized HTML/extensions. Round-trip correctness and source preservation apply throughout.


**Implementation checkpoint — 2026-11-14:** Wave now has the first renderer slice in source: existing CommonMark/GFM support, task lists/tables/strikethrough/autolinks/footnotes, alert callouts, heading anchors, a limited MathML/LaTeX subset, and simple Mermaid flowchart rendering. The **Markdown feature showcase** template and [renderer compatibility matrix](docs/MARKDOWN_SUPPORT.md) are available. This does not close P0.2: sanitized raw HTML/collapsible content, full LaTeX, advanced Mermaid, optional diagram renderers, syntax highlighting, full source-preserving import/export and broader compatibility fixtures remain planned. Do not mark P0.2 complete until its full exit gate is met.

**Exit gate:** users can author/import, edit, reopen and export supported Markdown without losing structure or silently discarding unsupported constructs.

### P0.3 — Storage and workspace architecture

- [ ] Keep the current MVP workspace readable and provide a versioned migration path to the chosen portable workspace architecture.
- [ ] Implement the canonical versioned data model and schema migrations before database UI.
- [ ] Preserve stable IDs, referential integrity, rebuildable indexes and documented serialization.
- [ ] Define asset storage, hashes, metadata and safe multi-step writes.
- [ ] Provide workspace diagnostics, repair, verified backups, restore preview and rollback.
- [ ] Keep Markdown, HTML, CSV and JSON import/export paths documented.
- [ ] Make workspace copy/move, migration and recovery repeat-safe and testable.

**Architecture decision:** follow the product constitution in section 20 of the complete blueprint. Do not silently replace or reinterpret those decisions; propose an explicit amendment if evidence requires a change.

## 3. Core workspace priorities

### P1.1 — Editor and page experience

- [ ] Complete the block editor foundation: stable block IDs, editing, selection, keyboard shortcuts, undo/redo, block operations, attachments and accessible interactions.
- [ ] Page experience: metadata, icons/covers, nested pages, breadcrumbs, outline, internal links, aliases, synced/reusable blocks, templates, archive/restore and page history.
- [ ] Writing quality: word/character count, reading time, find/replace, spellcheck/grammar assistance, citations, math, diagrams, image captions, typography and layout.
- [ ] Ensure all editor/page capabilities have a durable serialization, export and recovery story.

### P1.2 — Search, navigation and knowledge management

- [ ] Fast local search, indexing, snippets, filters and keyboard navigation.
- [ ] Workspace navigation, folders, breadcrumbs, command palette and quick capture.
- [ ] Wiki links, backlinks, unlinked mentions, aliases, broken-link detection and graph views.
- [ ] Tags, saved searches, smart collections, knowledge inbox, daily/periodic notes and review workflows.
- [ ] Wiki spaces, collections, documentation templates, glossary, page ownership, review cycles and stale-content reports.

### P1.3 — Personal productivity and reusable content

- [ ] Tasks, subtasks, statuses, priorities, dates, recurrence, inbox and personal task views.
- [ ] Personal planning, daily agenda, calendar foundations, reminders and time-zone correctness.
- [ ] Templates, template variables, starter packs, sample workspace and onboarding walkthrough.
- [ ] Preserve the richer task, project and calendar requirements in sections D, O and U of the complete catalogue.

## 4. Structured workspace priorities

### P1.4 — Data model and first database release

- [ ] Stable IDs and versioned schema for databases, rows, properties and views.
- [ ] Typed properties, validation, record pages and stable relations.
- [ ] Table view with inline editing, filtering, sorting and grouping.
- [ ] CSV import/export, bulk paste and record templates.
- [ ] Schema validation, repair diagnostics and migration tests.

### P2.1 — Full database experience

- [ ] Complete property types, two-way relations, rollups and safe formulas.
- [ ] Board, list, gallery, calendar, timeline/Gantt and chart views.
- [ ] Named views, per-view filters/sorts/groups, conditional formatting and linked database views.
- [ ] Formula parser, functions, dependency tracking, deterministic evaluation and test documentation.
- [ ] Database permissions and advanced data interfaces when collaboration is ready.

## 5. Work management and document-app priorities

### P2.2 — Projects, calendars and operations

- [ ] Project home pages, goals, milestones, deliverables, risks, issues and decision logs.
- [ ] Kanban, timeline/Gantt, roadmap, sprint/cycle planning, backlog and workload/capacity.
- [ ] Recurring tasks, dependencies, critical path, estimates, optional time tracking and progress rollups.
- [ ] Calendar day/week/month/agenda views, multiple calendars, recurring events, ICS and optional provider integration.
- [ ] Advanced operations: triage queues, custom task types/statuses, initiatives, releases, goals/OKRs, approvals, incident/runbook and service-request workflows.

### P2.3 — Quip/Coda interactive documents and spreadsheets

- [ ] Spreadsheet blocks, sheets/tabs, cell navigation, formulas, references, formatting, sorting/filtering and validation.
- [ ] Charts, freeze panes, Excel/CSV import/export, protected ranges and named ranges.
- [ ] Connect spreadsheet data with database records and embed live ranges/charts in pages.
- [ ] Interactive controls, buttons and explicitly configured local actions.
- [ ] Formula and action execution must be safe, deterministic, permission-scoped and testable.

### P2.4 — Forms and automation

- [ ] Form builder, field types, validation, conditional logic, multi-step flows and response management.
- [ ] Offline submission queue for local workflows.
- [ ] Automation triggers, conditions, actions, schedules, logs, retries and failure handling.
- [ ] Approval queues, webhooks and connected-provider actions only with explicit user authorization.
- [ ] Human confirmation for destructive, external or irreversible actions.

### P2.5 — Whiteboards, dashboards and visual thinking

- [ ] Infinite canvas, sticky notes, shapes, connectors, freehand drawing, frames, snapping, grouping and layers.
- [ ] Link canvas objects to pages, tasks and database records; convert between these object types.
- [ ] Brainstorming, mind-map, retrospective, user-journey and architecture templates.
- [ ] Dashboard widgets, metrics, charts, task/calendar summaries, cross-database filters and reusable layouts.
- [ ] Export whiteboards and dashboards to suitable portable formats.
- [ ] Keep visual workflows accessible and usable offline where applicable.

## 6. Collaboration and sharing priorities

### P2.6 — Review and collaboration foundation

- [ ] Page/block comments, anchored threads, replies, mentions, reactions, notifications and action assignment.
- [ ] Suggesting mode, accept/reject, reviewer roles, approvals, revision comparison and decision logs.
- [ ] Sharing, access revocation, workspace invitations, role-based permissions and audit history.
- [ ] Version history and conflict-safe data operations before concurrent editing.

### P2.7 — Real-time and team collaboration

- [ ] Multi-user editing, cursors, presence and concurrent block operations.
- [ ] Offline edits, reconnect reconciliation, conflict visibility and recovery.
- [ ] Shared spaces/folders, guest access, expiring links, access requests and team roles.
- [ ] Team spaces/channels, document-linked discussions, chat where justified, activity feeds and notifications.
- [ ] Encrypted transport and the user-controlled data model described in the product constitution.

## 7. Portability, publishing and platform priorities

### P2.8 — Import, export and publishing

- [ ] Markdown folder/ZIP, HTML, CSV, DOCX and supported Notion, Obsidian, Evernote and Quip imports.
- [ ] Import previews, field mapping, validation, conflict handling and rollback.
- [ ] Page exports to Markdown, HTML, PDF and DOCX; structured exports to CSV/JSON; spreadsheet XLSX/CSV.
- [ ] Full workspace archives with assets, manifest, schema and integrity report.
- [ ] Static documentation publishing, collections, public read-only links, custom domains where supported, embed views, SEO metadata and revocation.
- [ ] Print layouts, combined exports, page bundles and explicit confirmation before public publishing.

### P2.9 — Desktop, mobile and accessibility

- [ ] Desktop application and native filesystem/file-watcher behavior.
- [ ] Multiple windows, workspace tabs, file associations, drag/drop and offline installers.
- [ ] Mobile companion, capture inbox, reading/editing, share-sheet capture and tablet layouts.
- [ ] Keyboard and screen-reader support, contrast, scalable typography, reduced motion and accessible alternatives to visual-only workflows.
- [ ] Localization, international date/number/time-zone formats and right-to-left layouts.

## 8. Platform and ecosystem priorities

### P3.1 — Integrations and developer platform

- [ ] Calendar, GitHub/GitLab, Slack/Teams, Google/Microsoft storage, Figma, Loom and other integrations listed in the full catalogue.
- [ ] Import/connectors for Confluence/Jira, Linear, ClickUp, Asana, Trello, Monday, Airtable and Microsoft Loop where supported.
- [ ] Generic OAuth2, REST API, webhooks, field mapping, sync direction, conflict policies and connection health.
- [ ] Public/local APIs, CLI, plugin manifest/SDK, custom blocks/properties/views, themes and marketplace after security review.
- [ ] MCP server and API tokens with explicit permissions and audit trails.

### P3.2 — AI-assisted workspace (always opt-in)

- [ ] Bring-your-own-provider and local model support.
- [ ] Source-grounded Q&A with citations and freshness indicators.
- [ ] Summaries, drafting, translation, extraction of tasks/decisions/risks and suggestions for tags/links/properties.
- [ ] Semantic search, contradiction/staleness detection and natural-language database queries.
- [ ] Meeting transcription only with explicit consent.
- [ ] Per-page/workspace exclusions, provider disclosure, usage visibility, activity logs and human approval.
- [ ] No autonomous publishing, sharing, destructive changes or background processing without explicit configuration.

### P3.3 — Administration, governance and operations

- [ ] Workspace health, integrity, storage usage, orphan cleanup and duplicate detection.
- [ ] Backup schedules/retention, import/export job history, sync health and diagnostics.
- [ ] Plugin/integration permission inventory, event logs, crash recovery and safe mode.
- [ ] Team policies, retention, offboarding and privacy-preserving bug report export.
- [ ] Self-hosted Docker deployment, health checks, logs, persistent volumes, TLS/reverse proxy, upgrade/rollback and secure defaults.

## 9. Full feature coverage — nothing is removed

Every item below remains in scope as described in the complete catalogue. The priority phases above only assign a delivery order.

| Catalogue area | Preserved scope |
|---|---|
| A | Writing, pages, block editor, writing quality **plus Markdown compatibility A4** |
| B | Knowledge graph, wiki and documentation |
| C | Data model, database properties/views, formulas and calculations |
| D | Tasks, projects, calendar and time |
| E | Comments, review, real-time collaboration, team communication |
| F | Spreadsheet blocks and interactive document controls |
| G | Forms, workflows and automation |
| H | Search, navigation and workspace productivity |
| I | Files, media and content capture |
| J | Import, export and portability |
| K | Local-first storage, privacy, reliability, security, sync and offline |
| L | Integrations and developer platform |
| M | AI-assisted workspace |
| N | Desktop, mobile, accessibility and localization |
| O | Templates, examples and onboarding |
| P | Team administration and governance |
| Q | Whiteboards, canvas and visual thinking |
| R | Dashboards, reporting and analytics |
| S | Advanced knowledge and research workflows |
| T | Publishing, sharing and document delivery |
| U | Advanced task and operations management |
| V | Reusable components and connected work |
| W | Knowledge quality and governance |
| X | Advanced forms and data collection |
| Y | Advanced integrations and interoperability |
| Z | AI knowledge operations |
| AA | Administration, observability and supportability |

In addition, preserve every specialist workflow in sections 14–16, every cross-cutting requirement in section 15, the product constitution in section 20, and all competitive research references. These are not separate optional ideas to prune; they inform design, validation and future releases.

## 10. Dependency rules

1. Data integrity, migration, recovery and export precede features that create more user data.
2. The canonical data model precedes database UI, formulas, relations and cross-feature workflows.
3. Stable block IDs and revision semantics precede comments, backlinks to blocks and collaborative editing.
4. Permission and threat models precede sharing, plugins, automations and external integrations.
5. Local/offline behavior must remain functional when online services are unavailable.
6. Advanced features must not make the default writing experience slower or more complex.
7. Every feature needs tests, documentation, accessibility review, migration behavior and export/recovery semantics.
8. When a feature is deferred, record why and what dependency or evidence will unblock it.

## 11. Definition of done and change control

A feature can be marked shipped only when:
- Its user workflow works end to end.
- Data survives reload, restart, backup and restore where relevant.
- Keyboard and accessibility behavior is tested.
- Security/privacy boundaries are reviewed.
- Import/export and migration behavior are documented.
- Automated tests and CI cover critical behavior.
- Documentation and the complete catalogue are updated.

**Change-control rule:** never delete a catalogue item from `upcoming-FEATURES.md` to make a priority plan shorter. If scope changes, retain the original item and append a decision note explaining the proposed change, evidence, impact and owner approval. Only the product owner can approve dropping a feature—and the default is to keep it.

---

## 12. Planning references

- [Complete product blueprint and feature catalogue](upcoming-FEATURES.md)
- [Current shipped features](FEATURES.md)
- [Detailed implementation status](FEATURES.md)
- [Delivery roadmap](docs/ROADMAP.md)
- [Bug and reliability tracker](bugs.md)
