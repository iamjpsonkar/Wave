# Wave — Diagram features and diagrams.net capability analysis

> Research date: 2026-11-14  
> Reference product: [diagrams.net](https://app.diagrams.net/) (draw.io)  
> Research basis: official diagrams.net/draw.io feature overview, editor guide, technical reference, layer documentation and integration documentation.  
> Wave baseline reviewed: current `src/markdown.tsx`, `docs/MARKDOWN_SUPPORT.md`, `features-gap.md`, `src/App.tsx` and `src/styles.css`.  
> Purpose: define a feature-complete, phased diagramming direction for Wave without dropping its existing Markdown diagram capabilities or local-first principles.

---

## 1. Executive summary

diagrams.net is a full visual diagram editor, not merely a text-to-SVG renderer. Its value comes from the complete authoring loop:

1. Create a canvas and configure its page.
2. Find shapes in libraries or templates.
3. Place, resize, rotate and edit shapes.
4. Connect objects with attached connectors and routing.
5. Style objects and text with contextual controls.
6. Organize complex diagrams using groups, layers, tags and pages.
7. Navigate large diagrams with zoom, pan, rulers, grid, guides and outline.
8. Import existing diagrams and export/share editable results.
9. Generate diagrams from text, Mermaid, CSV or SQL, and use automatic layouts.
10. Store diagrams in a location chosen by the user, with offline and integration options.

Wave currently has a substantial set of **read-only local Markdown diagram renderers**. It does not yet have the visual canvas, direct manipulation, reusable shapes, connector editing, page/layer management or diagram file workflows that make diagrams.net a diagramming application.

**Product direction:** evolve from Markdown diagram preview to a native visual diagram workspace, while retaining source-based diagrams as a first-class, portable authoring path.

Do not attempt to recreate every diagrams.net feature in one release. Build a stable diagram document model and editing canvas first; advanced libraries, layouts and import/export can build on that foundation.

## 2. Reference product capability map

The following is based on official diagrams.net documentation, not assumptions about undocumented behavior.

### 2.1 Editor and canvas

- Large/infinite drawing canvas with pan and zoom.
- Page-oriented diagram settings and page setup.
- Grid, rulers, positioning guides and alignment assistance.
- Fit-to-page and zoom controls.
- Outline/navigation for large diagrams.
- Multiple editor layouts/themes, including reduced-distraction and whiteboard-like layouts.
- Context-sensitive toolbar, menus and format panels.
- Keyboard shortcuts and tooltips.
- Dark mode with adaptive diagram colors.

### 2.2 Shapes and libraries

- Drag-and-drop shape placement.
- Expandable, searchable shape libraries.
- Broad technical and general-purpose shape sets.
- Custom shape libraries and reusable templates.
- Shape text labels and editable text.
- Shape resizing, rotation and positioning.
- Grouping and ungrouping.
- Images, icons and visual assets.
- Tables, swimlanes and specialized diagram components.

### 2.3 Connectors and relationships

- Connect shapes with connectors attached to source/target shapes.
- Fixed and floating connection points.
- Drag connector endpoints to attach or reattach.
- Straight, orthogonal/right-angle and curved connector styles.
- Manual connector routing and waypoints.
- Arrowheads, line styles, line jumps and connector labels.
- Connectors can link shapes on different layers.
- Connectors can be styled independently from shapes.

### 2.4 Formatting and object properties

- Context-sensitive format panel for selected shapes, connectors, text or the whole diagram.
- Fill, stroke, line width, opacity and color palettes.
- Fonts, text size, alignment, spacing and text formatting.
- Shape and connector style presets.
- Arrange, align, distribute, resize, rotate and layer-order controls.
- Copy/paste styles.
- Hyperlinks and editable object metadata.
- Tooltips, tags, placeholders, translation-related metadata and interactive actions.
- HTML text and mathematical typesetting in labels.

### 2.5 Organization and navigation

- Multiple pages within one diagram document.
- Layers with add, duplicate, rename, show/hide and ordering operations.
- Tags and metadata for organizing complex diagrams.
- Grouped objects.
- Scratchpad for temporarily reusing shapes.
- Outline dialog for navigating large canvases.
- Search across shape libraries and diagram content.

### 2.6 Automation and diagram generation

- Automatic layouts for flows, trees and other graph arrangements.
- Generate diagrams from Mermaid source.
- Generate diagrams from CSV data and formatting information.
- Generate diagrams from SQL.
- AI-assisted generation from a natural-language description.
- Templates for common diagram structures.
- Customizable generation/configuration options.

### 2.7 Import, export and interoperability

- Import existing diagram files and continue editing them.
- Official documentation identifies import support for formats including VSDX, Gliffy and Lucidchart.
- Export/publish diagrams as PNG, SVG, PDF, HTML and URL-based shares.
- Diagram data can be embedded in exported PNG, SVG and PDF so a recipient can reopen an editable copy in draw.io.
- File-based workflows and multiple storage-provider integrations.
- The editor can be used online or in a standalone offline desktop app.
- Supported storage/integration examples include local device/browser storage, Google Drive, OneDrive, GitHub/GitLab and Atlassian products.
- Real-time collaboration/shared cursors are documented for supported Google Drive, OneDrive and Confluence workflows; do not assume every storage backend supports live collaboration.

### 2.8 Security and data ownership

- The online editor and integrations are designed so users choose where diagram files are stored.
- No account is required for the basic online editor.
- A standalone offline desktop app is available.
- Integrations and collaboration may involve external services and their permissions; storage-provider authorization should be explicit.

## 3. Current Wave baseline — verified source review

### 3.1 What Wave already has

Current `src/markdown.tsx` contains hand-built local SVG renderers for these Mermaid subsets:

- Flowchart
- Sequence
- Pie
- Class
- Entity relationship (ER)
- State
- Gantt
- Git graph
- Mindmap
- Timeline
- Quadrant
- Requirement
- Architecture-beta

Other fenced source formats have lightweight local subset renderers:

- Graphviz/DOT
- PlantUML
- Vega and Vega-Lite
- D2
- AsciiDoc

Existing behavior also includes:

- Diagram source disclosure through a keyboard-operable “View diagram source” control.
- SVG image semantics and accessible names for rendered diagrams.
- Readable source fallback for unsupported or invalid syntax.
- Local rendering without sending document contents to a third-party diagram service.
- Input-size and item-count limits in selected renderers.
- Diagram renderer examples and regression coverage in the Markdown feature tests.

See `docs/MARKDOWN_SUPPORT.md` for the current supported syntax boundary.

### 3.2 What Wave does not currently have as a visual diagram editor

The current renderers are not a canvas-based diagram editor. The reviewed source does not establish:

- Directly selecting, dragging, resizing or rotating rendered diagram nodes.
- Drag-and-drop shape creation from libraries.
- A general-purpose graph object model with persistent node/edge IDs.
- Editable connection points, connector routing and waypoints.
- Context-sensitive shape/connector format panel.
- Group/ungroup and multi-selection editing.
- Diagram layers, tags, multiple pages or scratchpad.
- Canvas zoom/pan/grid/rulers/guides/outline as diagram authoring tools.
- Reusable shape libraries and custom shapes.
- Dedicated diagram documents with editable native graph structure.
- General diagram import/export workflows comparable to diagrams.net.
- CSV/SQL/AI diagram generation workflows.
- Live multi-user diagram editing.

Important distinction: existing Mermaid/DOT/PlantUML/Vega/D2/AsciiDoc previews are useful capabilities and must be retained. They should not be described as equivalent to a full graphical editor.

## 4. Wave product principles for diagramming

1. **Local-first by default:** diagram content is stored in the selected Wave workspace; no remote renderer is required.
2. **Editable source stays valuable:** Markdown fenced diagrams continue to work. Visual editing should not silently destroy the original source.
3. **Native graph model:** visual diagrams need stable IDs and structured objects rather than treating SVG output as the editable source.
4. **Round-trip safety:** import, edit, save, reopen and export must preserve supported properties. Unsupported constructs need explicit warnings and source preservation.
5. **Progressive complexity:** common shapes and connectors first; advanced technical libraries and automation later.
6. **Accessible authoring:** keyboard alternatives, focus states, non-visual object navigation and text/source alternatives.
7. **Performance limits:** large graph rendering, selection, layout and serialization need measurable limits and safe fallback.
8. **Interoperability:** use documented open formats where practical; do not lock diagrams into an opaque proprietary format.
9. **Clear separation:** diagram source, diagram model, renderer and canvas interaction are distinct layers in the architecture.
10. **No premature collaboration:** build reliable local editing and file integrity before multi-user synchronization.

## 5. Proposed Wave diagram feature catalogue

Status legend:
- **Existing** — current source already provides a constrained version.
- **Planned** — not currently established by the reviewed implementation.
- **Research/decision** — needs a product or technical decision before commitment.

### 5.1 Diagram documents and canvas

- [ ] Create a new visual diagram document from the workspace.
- [ ] Open and edit a saved diagram document.
- [ ] Infinite canvas with pan, zoom and fit-to-content.
- [ ] Page canvas mode with configurable page size/orientation.
- [ ] Grid with configurable spacing and snap-to-grid.
- [ ] Alignment guides and smart snapping.
- [ ] Rulers and coordinate display.
- [ ] Canvas background and page color.
- [ ] Zoom percentage control and fit-selection.
- [ ] Minimap/outline for large diagrams.
- [ ] Canvas selection, marquee selection and panning tool.
- [ ] Touch and stylus-friendly interactions.
- [ ] Full-screen/focus diagram mode.
- [ ] Diagram title, description and metadata.
- [ ] Document autosave, dirty state and recovery.
- [ ] Undo/redo history for every graph mutation.
- [ ] Diagram duplication and workspace Trash/restore integration.

### 5.2 Shapes and shape libraries

- [ ] Basic shape library: rectangle, rounded rectangle, ellipse, diamond, triangle, cylinder, parallelogram, hexagon, document, cloud, actor and text.
- [ ] Flowchart-specific shape library.
- [ ] General arrows, lines, callouts and containers.
- [ ] Drag/drop from shape palette to canvas.
- [ ] Shape search and category filters.
- [ ] Custom shape libraries.
- [ ] Reusable saved shapes and personal shape palette.
- [ ] Shape text editing in place.
- [ ] Resize handles, rotation handles and aspect-ratio constraints.
- [ ] Shape fill, stroke, opacity, radius and shadow.
- [ ] Image/icon insertion and crop/fit controls.
- [ ] Tables and swimlane shapes.
- [ ] Group and ungroup.
- [ ] Duplicate, copy, paste and delete.
- [ ] Multi-select and bulk style changes.
- [ ] Lock/unlock and prevent accidental movement.
- [ ] Bring forward/send backward and z-order.
- [ ] Align and distribute objects.
- [ ] Keyboard nudge and modifier-key constrained movement.
- [ ] Shape-specific properties and custom metadata.

### 5.3 Connectors and edges

- [ ] Draw connector between two shapes.
- [ ] Attach connector endpoints to stable shape connection points.
- [ ] Support fixed and floating connection points.
- [ ] Connector reattachment when a node moves.
- [ ] Straight, orthogonal and curved routing.
- [ ] Manual bend points/waypoints.
- [ ] Automatic rerouting where possible.
- [ ] Start/end arrowhead selection.
- [ ] Solid, dashed, dotted and bold line styles.
- [ ] Connector labels and inline editing.
- [ ] Connector color, width and opacity.
- [ ] Edge labels with placement/rotation options.
- [ ] Bidirectional, undirected and specialized relationship types.
- [ ] Parallel edges and self-loops.
- [ ] Avoid or minimize connector/node overlap.
- [ ] Connection validation and dangling-edge indication.
- [ ] Keyboard-accessible connector creation and endpoint selection.

### 5.4 Text and annotation

- [ ] Text-only objects.
- [ ] In-place shape and connector labels.
- [ ] Font family, size, weight, color and alignment.
- [ ] Paragraph alignment, line spacing and text margins.
- [ ] Bulleted/numbered lists in text objects.
- [ ] Hyperlinks and link target editing.
- [ ] Tooltips and notes.
- [ ] Math labels (scope and safe implementation to be decided).
- [ ] Markdown/text import into diagram annotations.
- [ ] Freehand pen, highlighter and sketch shapes.
- [ ] Sticky notes and comments/annotations (local-only first).
- [ ] Text overflow, wrapping and fit-to-shape options.

### 5.5 Organization and navigation

- [ ] Multiple pages per diagram document.
- [ ] Rename, duplicate, reorder and delete pages.
- [ ] Layers with add, duplicate, rename, reorder, hide/show and lock.
- [ ] Move selected objects between layers.
- [ ] Layer-aware connector behavior.
- [ ] Groups and nested groups.
- [ ] Tags and object metadata.
- [ ] Object outline/tree navigator.
- [ ] Search objects by label, ID or metadata.
- [ ] Scratchpad/reusable object collection.
- [ ] Diagram notes and legend.
- [ ] Page thumbnails and navigation.
- [ ] Cross-page links/navigation.

### 5.6 Styling and themes

- [ ] Context-sensitive format panel for selection type.
- [ ] Global diagram/page style panel.
- [ ] Theme presets and reusable style palettes.
- [ ] Light/dark/system editor theme.
- [ ] Diagram colors independent of editor theme when desired.
- [ ] Adaptive diagram colors with explicit opt-out.
- [ ] Custom colors and color picker.
- [ ] Copy/paste style.
- [ ] Shape/connector style presets.
- [ ] Text style presets.
- [ ] Consistent focus, hover, selection and disabled states.
- [ ] Theme-aware exported output.
- [ ] High-contrast palette and color-independent status cues.

### 5.7 Layout and alignment automation

- [ ] Manual alignment/distribution.
- [ ] Snap-to-grid and smart guides.
- [ ] Hierarchical/tree layout.
- [ ] Directed flowchart layout.
- [ ] Layered/DAG layout.
- [ ] Force-directed/organic layout.
- [ ] Circular/radial layout.
- [ ] Horizontal/vertical layout direction.
- [ ] Layout spacing and node separation controls.
- [ ] Preserve manually positioned nodes when requested.
- [ ] Preview layout changes before applying.
- [ ] Undo/redo automatic layout.
- [ ] Layout for swimlanes and grouped nodes.
- [ ] Large graph performance and cancellation.

### 5.8 Diagram types and domain libraries

The catalogue below is a target capability list, not a claim that every diagram type must ship in the first version.

**General purpose**
- [ ] Flowcharts and process maps.
- [ ] Mind maps and concept maps.
- [ ] Org charts and hierarchy diagrams.
- [ ] Swimlane and cross-functional process diagrams.
- [ ] Timelines and roadmaps.
- [ ] Decision trees.
- [ ] Value-stream/process maps.
- [ ] Infographics and story maps.
- [ ] Wireframes and UI mockups.
- [ ] Floor plans and site layouts.

**Software and systems**
- [ ] UML class diagrams.
- [ ] UML sequence diagrams.
- [ ] UML use-case diagrams.
- [ ] UML activity diagrams.
- [ ] UML state diagrams.
- [ ] UML component diagrams.
- [ ] UML deployment diagrams.
- [ ] C4 architecture diagrams.
- [ ] System architecture and deployment maps.
- [ ] Network topology diagrams.
- [ ] Cloud infrastructure diagrams.
- [ ] Database schema and ER diagrams.
- [ ] Data-flow diagrams.
- [ ] API/service dependency maps.
- [ ] Package/module dependency graphs.
- [ ] CI/CD and Git branching diagrams.
- [ ] BPMN process diagrams.
- [ ] Event-driven architecture diagrams.

**Project and operations**
- [ ] Gantt charts.
- [ ] Kanban boards.
- [ ] Project dependency maps.
- [ ] RACI/responsibility matrices.
- [ ] Risk matrices and decision matrices.
- [ ] Org charts and team maps.
- [ ] Incident and runbook flows.

**Engineering and specialist**
- [ ] Circuit/electrical diagrams.
- [ ] Rack and server diagrams.
- [ ] Electronics and logic diagrams.
- [ ] Mechanical/process diagrams.
- [ ] Attack trees and threat models.
- [ ] Security/network zones.
- [ ] Fishbone/cause-and-effect diagrams.
- [ ] P&ID and industrial process diagrams.
- [ ] Geographic/site maps (scope to be decided).

### 5.9 Source-based and data-based generation

- [x] Existing constrained Mermaid Markdown preview renderers (preserve and expand).
- [x] Existing constrained DOT/Graphviz, PlantUML, Vega/Vega-Lite, D2 and AsciiDoc preview renderers (preserve).
- [ ] Mermaid source import into native graph model where conversion is safe.
- [ ] Export native diagram to Mermaid for supported subset.
- [ ] CSV-driven diagram generation.
- [ ] SQL schema-to-ER diagram generation.
- [ ] JSON graph data import/export.
- [ ] Text-to-diagram natural language generation (local/provider strategy to be decided).
- [ ] AI generation preview with explicit apply/accept action.
- [ ] AI edits as reversible graph patches, not destructive whole-document replacement.
- [ ] Source and visual representations shown side-by-side when useful.
- [ ] Unsupported source syntax preserved with an explicit conversion warning.
- [ ] Deterministic conversion tests and round-trip fixtures.

### 5.10 Import and export

- [ ] Native Wave diagram format with versioned schema.
- [ ] Import/export SVG.
- [ ] Export PNG with transparent/background options and scale.
- [ ] Export PDF with page sizing and multipage support.
- [ ] Export JPEG/WebP (decision based on user demand).
- [ ] Export print-ready pages.
- [ ] Export HTML/static interactive view.
- [ ] Import diagrams.net/draw.io XML (.drawio/.xml).
- [ ] Export diagrams.net-compatible XML where supported.
- [ ] Import SVG as image and optionally convert editable primitives where safe.
- [ ] Import Mermaid, DOT, PlantUML and D2 source.
- [ ] Import CSV and SQL for diagram generation.
- [ ] Import VSDX, Gliffy and Lucidchart (research compatibility, do not promise parity).
- [ ] Preserve original source and provide conversion report on import.
- [ ] Export selected objects, page or entire document.
- [ ] Clipboard copy as SVG/image and object copy/paste.
- [ ] Embedded editable source in supported image exports where safe.
- [ ] Font embedding/substitution behavior documented.
- [ ] Export security review for links, metadata and embedded content.

### 5.11 Collaboration and integrations

- [ ] Local single-user editing as baseline.
- [ ] Explicit share/export package.
- [ ] Read-only presentation/view mode.
- [ ] Comments and annotations stored locally.
- [ ] Change history and restore points.
- [ ] Conflict detection for external file changes.
- [ ] Optional encrypted sync architecture (separate product decision).
- [ ] Multi-user presence and cursors (later phase).
- [ ] Concurrent graph editing and conflict resolution (later phase).
- [ ] GitHub/GitLab storage/import integration (later phase).
- [ ] Notion/Confluence/Google/Microsoft integrations (later phase).
- [ ] Plugin/custom library extension API (later phase).

### 5.12 Accessibility, reliability and performance

- [ ] Keyboard-only shape creation, movement, resizing and connector editing.
- [ ] Screen-reader accessible object list/tree.
- [ ] Accessible names/roles for canvas objects and controls.
- [ ] Text alternative/diagram description.
- [ ] Focus visibility and predictable keyboard navigation.
- [ ] High-contrast mode.
- [ ] Avoid color-only relationship/state encoding.
- [ ] Reduced motion and disable animation option.
- [ ] Large graph performance budgets.
- [ ] Safe parser limits for imported files and source diagrams.
- [ ] XML/HTML/SVG sanitization and external-resource restrictions.
- [ ] Malformed-file recovery and readable import errors.
- [ ] Autosave/recovery and process-termination tests.
- [ ] Cross-browser and touch-device testing.
- [ ] Visual regression for light/dark, large diagrams and export output.
- [ ] Deterministic graph serialization and stable object IDs.
- [ ] Migration tests for every native schema version.

## 6. Proposed native diagram architecture

The following is a Wave design recommendation, not a description of diagrams.net internals.

### 6.1 Separate the representations

Use three distinct representations:

1. **Source representation:** Mermaid/DOT/PlantUML/etc. text from Markdown fences.
2. **Native diagram model:** structured nodes, edges, pages, layers, groups and styles with stable IDs.
3. **Rendered representation:** SVG/canvas output for preview and export.

Do not use generated SVG as the only editable representation.

### 6.2 Suggested model

A versioned model should conceptually contain:

- Document metadata: ID, title, schema version, timestamps, default page.
- Pages: stable ID, name, dimensions, background and view settings.
- Nodes: stable ID, shape type, position, size, rotation, label, style, metadata and layer ID.
- Edges: stable ID, source/target node IDs, connection points, waypoints, label and style.
- Layers: stable ID, name, visibility, lock state and ordering.
- Groups: stable ID and member IDs.
- Assets: workspace-relative local references with integrity metadata.
- Diagram settings: grid, snapping, theme, default styles and layout options.

### 6.3 Storage recommendation

- Store native diagram documents as versioned files under a dedicated workspace path such as `.wave/diagrams/`.
- Store images and other assets in the existing local asset area.
- Use atomic/revision-guarded writes and the existing workspace operation queues.
- Keep diagram metadata and assets within the selected local workspace.
- Integrate with existing Trash, backup, restore, conflict detection and recovery mechanisms.
- Add schema migrations before changing the persistent graph model.
- Never silently overwrite an unsupported imported file; preserve the original and produce a conversion report.

The exact extension and serialization format should be selected after a small prototype and round-trip compatibility test. JSON is a reasonable initial native model for inspectability, but a compact or compressed format may be evaluated later.

### 6.4 Rendering and interaction strategy

- Prototype an SVG-based interactive canvas first for accessibility and vector export.
- Evaluate Canvas/WebGL only if measured graph sizes justify it.
- Keep hit testing, selection, keyboard navigation and graph mutations in a dedicated interaction layer.
- Separate layout algorithms from graph persistence.
- Treat source conversion as an adapter, not as the graph model itself.
- Add resource limits and cancellation for parsing, layout and export.

## 7. Phased implementation roadmap

### Phase 0 — Product and architecture foundation

- [ ] Define diagram document schema and migration policy.
- [ ] Prototype canvas pan/zoom, coordinate system and viewport transforms.
- [ ] Define stable node/edge IDs and graph mutation commands.
- [ ] Define undo/redo transaction model.
- [ ] Define SVG sanitization and import threat model.
- [ ] Decide native file extension and asset reference strategy.
- [ ] Add test fixtures for empty, small, medium and large diagrams.

**Exit criteria:** create, save, reopen and render a minimal diagram with stable IDs and no data loss.

### Phase 1 — MVP visual editor

- [ ] Create/open/rename/duplicate diagram documents.
- [ ] Canvas with pan, zoom, fit and grid.
- [ ] Basic shape palette and shape search.
- [ ] Add/select/move/resize/delete shapes.
- [ ] Edit shape labels.
- [ ] Add connectors between shapes.
- [ ] Basic straight/orthogonal edges and arrowheads.
- [ ] Basic color/fill/stroke/text style panel.
- [ ] Undo/redo, copy/paste and duplicate.
- [ ] Autosave, recovery, conflict handling and local asset support.
- [ ] Keyboard accessibility for basic object operations.

**Exit criteria:** a user can create a readable flowchart visually, save it locally, close Wave, reopen it and continue editing.

### Phase 2 — Practical diagram editor

- [ ] Connector waypoints, reattachment and routing.
- [ ] Multi-select, grouping, alignment and distribution.
- [ ] Context-sensitive format panel.
- [ ] Layers and multiple pages.
- [ ] Grid, guides, snap and outline.
- [ ] More shape libraries and reusable templates.
- [ ] Tables and swimlanes.
- [ ] Dark/light theme quality and accessible contrast.
- [ ] Export PNG/SVG/PDF.
- [ ] Import/export JSON and Mermaid-supported subset.

**Exit criteria:** support day-to-day process, architecture and planning diagrams without needing an external editor for common operations.

### Phase 3 — Technical diagram coverage and interoperability

- [ ] UML, ER, network, cloud, C4, BPMN and specialist libraries.
- [ ] CSV and SQL generation.
- [ ] Mermaid/DOT/PlantUML/D2 import adapters.
- [ ] Draw.io XML import/export prototype and conversion report.
- [ ] Advanced layouts and diagram templates.
- [ ] Object metadata, links, tooltips and tags.
- [ ] Multi-page print and export.
- [ ] Comprehensive parser, round-trip and large-graph tests.

**Exit criteria:** import and edit common technical diagram sources with clearly documented fidelity boundaries.

### Phase 4 — Advanced productivity

- [ ] Freehand drawing, comments and scratchpad.
- [ ] Custom shape libraries and custom templates.
- [ ] Advanced layout controls.
- [ ] Presentation/view mode and interactive links.
- [ ] AI diagram generation with reviewable graph patches.
- [ ] Advanced export and embedded editable data.
- [ ] Diagram version history and visual diff.

**Exit criteria:** polished power-user workflows, while retaining local ownership and reversible edits.

### Phase 5 — Optional collaboration and integrations

- [ ] Encrypted sync design.
- [ ] Multi-user presence and cursors.
- [ ] Concurrent editing and conflict resolution.
- [ ] GitHub/GitLab and documentation platform integrations.
- [ ] Plugin/custom library APIs.

**Exit criteria:** collaboration remains opt-in and does not make the local workspace dependent on a mandatory cloud content store.

## 8. Acceptance criteria for the core visual editor

A release should not be considered a usable diagram editor until all of the following are true:

1. A user can create a diagram without writing Mermaid or another source language.
2. Shapes can be placed, selected, moved, resized and labeled.
3. Connectors attach to nodes and remain attached as nodes move.
4. The user can change fill, stroke, text and connector styles.
5. Undo/redo correctly reverses graph mutations.
6. Save, close, reopen and continue editing preserves the diagram.
7. Diagram files are included in workspace backup and restore.
8. Unsupported/imported features are never silently discarded.
9. Keyboard users can create and edit a basic flowchart.
10. SVG/PNG export matches the visible canvas within documented limits.
11. Dark and light themes preserve diagram readability.
12. Large or malformed input is bounded and fails safely.

## 9. Testing strategy

### Unit tests
- Graph model validation and stable IDs.
- Node/edge creation, deletion and mutation.
- Connection integrity and dangling-edge detection.
- Undo/redo command stack.
- Layout determinism.
- Serialization/deserialization and schema migrations.
- Import conversion and unsupported-feature reports.
- Asset path validation and SVG sanitization.

### Playwright tests
- Create diagram from workspace.
- Add and label shapes.
- Connect two shapes.
- Move a connected node and verify edge attachment.
- Change style and text.
- Undo and redo.
- Save, reload and reopen.
- Duplicate and Trash/restore diagram.
- Switch light/dark themes.
- Keyboard-only create/select/move/connect.
- Export PNG/SVG and verify output.
- Import a valid and malformed fixture.

### Visual regression
- Light/dark themes.
- Small and large diagrams.
- Long labels and overlapping connectors.
- Multiple pages/layers.
- Dense technical diagrams.
- Mobile and tablet canvas.
- Exported SVG/PNG/PDF.
- Theme-aware code/source previews.

### Performance targets to define
Set explicit budgets after prototype measurements for:
- First render time.
- Pan/zoom frame responsiveness.
- Selection and drag latency.
- Layout completion/cancellation.
- Save serialization time.
- Memory use for large diagrams.
Do not claim a fixed node-count limit until it is measured on supported hardware.

## 10. Product decisions still required

- Should visual diagrams be separate documents, embedded page blocks, or both?
- Should Markdown fenced diagrams be convertible into native diagrams, and which syntax subsets are safe for round-trip?
- Should native files use JSON, XML or a compressed container?
- Should the first editor use SVG, Canvas or a hybrid rendering model?
- Which diagram libraries are MVP versus later domain packs?
- Which draw.io XML constructs can be imported/exported with reliable fidelity?
- Should AI generation be local, user-configured or an opt-in external provider?
- Which exports are required for the first public release?
- What collaboration model is compatible with Wave's local-first product promise?

## 11. Official research sources

All capability claims about diagrams.net in sections 1–2 are based on the following official documentation pages:

1. [An overview of draw.io's features](https://www.drawio.com/docs/features/) — storage, collaboration, editor tools, libraries, advanced features, generation and diagram categories.
2. [The draw.io diagram editor](https://www.drawio.com/docs/getting-started/) — editor layout, menus, toolbar, shape libraries and contextual format panel.
3. [Introduction to the draw.io user manual](https://www.drawio.com/docs/manual/) — creation, connectors, tables, swimlanes, layouts, export/import, multiple pages and generation.
4. [Using the draw.io editor](https://www.drawio.com/docs/manual/editor/) — themes, canvas navigation, shape panel and format panel.
5. [How layers work in draw.io](https://www.drawio.com/docs/manual/layers/how-layers-work/) — layer model and cross-layer connector behavior.
6. [Using layers in draw.io](https://www.drawio.com/docs/manual/layers/) — layer operations and controls.
7. [Share diagrams in a URL and edit in draw.io](https://www.drawio.com/docs/manual/collaboration/share-to-edit-diagram/) — embedded editable diagram data in shared formats.
8. [Configure the draw.io editor](https://www.drawio.com/docs/reference/configure-diagram-editor/) — editor configuration, fonts, palettes, shape libraries, templates and AI configuration.
9. [draw.io integrations](https://www.drawio.com/docs/integrations/) — desktop/offline, online editor and storage/integration choices.
10. [Official app.diagrams.net](https://app.diagrams.net/) — product identity and top-level format/import claims.

## 12. Evidence boundaries

- This is a feature and product analysis, not a pixel-by-pixel UI audit or an exhaustive hands-on test of every diagrams.net command.
- Official documentation is the source for reference-product capabilities. Feature availability can differ by integration, storage provider, configuration and editor version.
- The Wave baseline is a source review. A renderer's presence does not establish full language compatibility or successful conformance for all syntax.
- The roadmap is a proposed Wave scope. It is not a claim that Wave already implements the planned features.
- No Wave application source or tests were changed as part of creating this document.
