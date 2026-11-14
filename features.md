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

Wave's bigger ambition includes a rich block editor, internal page links and backlinks, page history, database views, kanban boards, calendar and timeline views, reminders, collaborative editing, comments, Quip-style spreadsheets, imports and exports, plugins and optional encrypted sync. These are **planned capabilities, not current features**. Track their status in the [feature map](docs/FEATURES.md).

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
