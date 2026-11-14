# Wave — UI Feature Backlog

> Created: 2026-11-14  
> Source: user-provided spreadsheet toolbar screenshot, compared with the current Wave editor UI and product priorities.  
> Purpose: capture useful interaction and toolbar ideas as additive UI features. This file is a proposal/backlog, not a claim that these features are implemented. It does not replace `ui-gaps.md`, `features-gap.md`, `priority-features.md` or the complete `upcoming-features.md` catalogue.

## Product-fit rules

- Keep Wave's default experience a focused, fast Markdown writing workspace.
- Prefer Markdown-native formatting where it can round-trip to source without loss.
- Do not show spreadsheet-only controls (currency, percent, decimal precision, cell borders, formulas) in the Markdown editor.
- Put advanced or context-specific commands in compact menus; preserve a small primary toolbar.
- Every command must have a tooltip, accessible name, keyboard operation, disabled/selection state and undo/redo behavior where applicable.
- Preserve local-first operation, safe preview rendering and exact Markdown source. Do not add remote services or silently introduce a rich-text format.
- Spreadsheet controls belong to the separately scoped spreadsheet-block/sheet experience in `priority-features.md` P2.3, not the current page editor.

## Priority legend

- **P0** — foundational editor usability; consider for the next UI iteration.
- **P1** — valuable editing and productivity enhancement after P0.
- **P2** — advanced or context-specific experience; requires a dedicated product surface or dependency.
- **Exploratory** — retain as an idea until product/data-model decisions are made.

## P0 — Core toolbar and editing

### UIF-001 — Undo and redo controls

- **Inspiration:** visible undo/redo toolbar actions.
- **Current state:** not visible in the inspected editor toolbar; keyboard/history behavior needs source verification before implementation.
- **Proposal:** add undo and redo buttons with disabled states and keyboard shortcuts (Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z; support platform redo convention).
- **Acceptance:**
  - Undo/redo restores editor text and selection reliably.
  - Autosave does not erase or corrupt the undo history while the editor remains open.
  - Buttons expose accessible names and tooltips; disabled state reflects history availability.
  - Workspace/page switching cannot apply history entries to the wrong document.
- **Dependencies:** editor history model; selection-safe state transitions.

### UIF-002 — Find in current document

- **Inspiration:** toolbar search icon.
- **Current state:** workspace search/command palette exists; an editor-local find workflow is not confirmed.
- **Proposal:** add find-in-page with next/previous, match count, current-match highlight and Escape dismissal. Keep workspace-wide search distinct.
- **Acceptance:**
  - Searches current document without modifying its source.
  - Supports case sensitivity and next/previous navigation; regex is optional and must be safely bounded if added.
  - Keyboard shortcut Ctrl/Cmd+F opens editor find; focus is managed and returned appropriately.
  - No matches, empty query and large documents have clear behavior.

### UIF-003 — Toolbar grouping, overflow and command discoverability

- **Inspiration:** visually grouped toolbar actions and dropdowns.
- **Current state:** current toolbar has heading, emphasis, lists, quote, code and link actions; no responsive overflow behavior is confirmed.
- **Proposal:** group commands by structure, inline formatting, blocks and insert; show the most-used commands directly and move less-used actions into an accessible More menu on narrow widths.
- **Acceptance:**
  - No duplicate icons for semantically different actions.
  - Every icon-only action has a unique accessible name and useful tooltip.
  - Toolbar remains usable at mobile/tablet widths without horizontal page overflow.
  - Overflow menu is keyboard navigable and closes on Escape/outside interaction.

### UIF-004 — Heading and paragraph style menu

- **Inspiration:** paragraph-style dropdown.
- **Current state:** Heading 1 and Heading 2 actions exist; broader heading/paragraph selection is not present in the inspected toolbar.
- **Proposal:** one compact menu for Paragraph, Heading 1–6, Quote and Code block, with the active block style indicated.
- **Acceptance:**
  - Applies Markdown prefixes/fences rather than hidden rich-text styling.
  - Selection and cursor behavior is predictable for empty lines, multiline selections and nested lists.
  - Existing content is not silently rewritten beyond the selected block.
  - Preview/source round-trip remains exact.

### UIF-005 — Keyboard shortcut hints

- **Inspiration:** familiar spreadsheet toolbar affordances.
- **Proposal:** display platform-appropriate shortcut hints in tooltips and command menus for common actions (bold, italic, link, find, undo/redo, save, command palette).
- **Acceptance:** hints match actual registered shortcuts on macOS and Windows/Linux; no shortcut is advertised unless implemented and tested.

## P1 — Formatting and insertion

### UIF-006 — Text color and highlight palette (Markdown-safe)

- **Inspiration:** text color and fill-color controls.
- **Status:** Partially implemented in source. The toolbar now exposes native foreground and background color pickers. Selected text is stored as `[[color:#RRGGBB|text]]` or `[[bg:#RRGGBB|text]]`; existing `==highlight==` remains supported.
- **Proposal:** extend this foundation with accessible preset swatches, remove/reset formatting, nested color ranges and block-level fills after the portable syntax and selection model are validated.
- **Acceptance:**
  - Highlight syntax is documented, sanitized and round-trips exactly.
  - Native color inputs have accessible labels and keyboard operation; a curated swatch palette and selected-state styling remain future work.
  - No arbitrary CSS, HTML style attributes or unsafe rendering is introduced.
  - Color values accept only six-digit hexadecimal tokens; no raw CSS or HTML style attributes are accepted.
  - Markdown source remains exact across Edit/Preview; non-Wave readers see the explicit Wave directive syntax as plain text.

### UIF-007 — Alignment and indentation controls

- **Inspiration:** left/center/right alignment and indent controls.
- **Proposal:** provide Markdown-native list indent/outdent and quote nesting actions. Paragraph alignment is exploratory because standard Markdown has no portable alignment syntax.
- **Acceptance:**
  - Indent/outdent preserves list numbering, task markers and nested content.
  - Alignment is not represented through unsafe raw HTML or lossy hidden metadata.
  - Unsupported selection shapes have a safe no-op or clear feedback.

### UIF-008 — Insert menu

- **Inspiration:** link, comment, chart and filter insert actions.
- **Proposal:** a single insert menu for link, image/file attachment, table, horizontal rule, callout, collapsible details and supported diagram/math templates.
- **Acceptance:**
  - Inserted syntax is supported by the current Markdown compatibility contract or clearly labelled partial.
  - Cursor lands at a useful editing position; placeholders are selected where appropriate.
  - Attachment insertion uses local workspace assets and collision-safe paths.
  - No remote media fetching or arbitrary HTML is enabled.

### UIF-009 — Table editing helpers

- **Inspiration:** spreadsheet grid and table controls.
- **Proposal:** add Markdown table insertion and lightweight row/column editing helpers, without turning the page editor into a spreadsheet.
- **Acceptance:**
  - Supports header row, alignment markers, escaped pipes and multiline-safe editing guidance.
  - Existing cell content is preserved when rows/columns are inserted or removed.
  - Large/wide tables remain readable and horizontally navigable on narrow screens.
  - CSV import/export and formulas remain separate, future spreadsheet features.

### UIF-010 — Link editing and link preview

- **Inspiration:** visible link action.
- **Current state:** link insertion action exists.
- **Proposal:** improve it with a small edit-link interaction for selected text, URL validation feedback and a preview/open action for safe external links.
- **Acceptance:**
  - Existing link text and destination can be edited without corrupting adjacent Markdown.
  - Unsafe schemes are rejected or rendered inert.
  - External navigation remains explicit and safe; local wiki links retain current behavior.

## P1 — Reading and document productivity

### UIF-011 — Word, character and reading-time statistics

- **Inspiration:** spreadsheet status/summary affordances.
- **Proposal:** show unobtrusive document statistics in the status area, with optional selection counts.
- **Acceptance:** counts update without blocking typing; Markdown syntax treatment is documented; no content leaves the local workspace.

### UIF-012 — Zoom and focus mode

- **Inspiration:** zoom dropdown.
- **Proposal:** add editor/preview zoom levels and a distraction-free focus mode that hides nonessential navigation while preserving save status and exit controls.
- **Acceptance:**
  - Zoom changes presentation only, not stored document content or configured base font preference.
  - Focus mode is reversible, keyboard accessible and responsive.
  - Reduced-motion preference is respected.

### UIF-013 — Alignment-aware reading layout

- **Inspiration:** alignment and spacing controls.
- **Proposal:** improve preview layout controls for readable measure, table overflow, code wrapping/scrolling and image sizing; avoid per-paragraph alignment until portable syntax exists.
- **Acceptance:** respects existing content-width settings and works in light/dark/system themes and narrow viewports.

### UIF-014 — Contextual formatting state

- **Inspiration:** active bold/italic/alignment controls in rich editors.
- **Proposal:** show active formatting/block context based on cursor or selection where this can be derived reliably from Markdown source.
- **Acceptance:** state is accurate for nested formatting and multiline selections; ambiguous states are shown as mixed/neutral rather than guessed.

## P2 — Dedicated spreadsheet and data UI (future scope)

These items are inspired by spreadsheet-specific controls in the screenshot. They should be implemented only inside the planned spreadsheet block/sheet experience, not added to the current Markdown toolbar.

### UIF-015 — Spreadsheet number formats

- Currency, percentage, decimal precision, thousands separators and date/time formats.
- Acceptance: locale-aware display, explicit underlying value semantics, predictable CSV/XLSX import/export and no silent precision loss.

### UIF-016 — Spreadsheet cell formatting

- Font family/size, bold, italic, underline, strikethrough, text color, fill color, borders and cell alignment.
- Acceptance: selection-aware formatting, keyboard operation, accessible state, undo/redo and portable export.

### UIF-017 — Spreadsheet grid controls

- Row/column sizing, insert/delete, hide/show, freeze panes, merge cells and range selection.
- Acceptance: keyboard and screen-reader navigation, stable references, large-sheet performance and explicit behavior for merged cells.

### UIF-018 — Spreadsheet formulas and data operations

- Formula bar, cell references, formula autocomplete, sort/filter, validation, named ranges and charts.
- Acceptance: deterministic safe formula engine, dependency tracking, error states, import/export fidelity and tests before shipping.

## Exploratory — advanced editor affordances

### UIF-019 — Comments and review actions

- Inline/page comments, suggestion mode and anchored threads.
- Dependency: stable block IDs, revision semantics, collaboration/review model and privacy decisions. Do not imply real-time collaboration exists.

### UIF-020 — Reusable toolbar customization

- Pin/reorder favorite commands and restore defaults.
- Dependency: stable command registry, accessible customization and workspace preference schema.

### UIF-021 — Context menu and command palette parity

- Offer relevant formatting/insertion actions on right-click and expose the same commands through the command palette.
- Acceptance: no action is available only through pointer interaction; avoid duplicate command definitions.

## Suggested delivery order

1. Verify existing undo/redo and editor-local find behavior in source before implementing UIF-001/UIF-002.
2. Implement toolbar grouping/overflow and shortcut discoverability (UIF-003/UIF-005), keeping current actions intact.
3. Add heading-style menu and safe insert menu (UIF-004/UIF-008).
4. Improve table and link workflows (UIF-009/UIF-010).
5. Add document statistics and focus/zoom (UIF-011/UIF-012).
6. Extend the shipped Markdown-safe inline color foundation with presets/reset and decide portable semantics before paragraph alignment (UIF-006/UIF-007).
7. Build spreadsheet-specific controls only with the planned spreadsheet data model and dedicated sheet UI (UIF-015–UIF-018).
8. Defer comments, toolbar customization and collaboration-dependent actions until their prerequisites are stable (UIF-019/UIF-020).

## Relationship to existing planning documents

- `ui-gaps.md`: observed UI defects and incomplete existing behavior. Do not move proposed features here unless an existing shipped UI fails its acceptance criteria.
- `features-gap.md`: Markdown syntax/rendering compatibility gaps, not the general UI feature backlog.
- `priority-features.md`: product-level delivery sequence; this file adds editor/sheet UI detail and does not override it.
- `upcoming-features.md`: complete scope catalogue; this file is additive and must not be used to remove or downgrade existing requirements.
- `DEV_CONTEXT.md`: update the handoff whenever this backlog or its relationship to product scope changes.

## Status

All UIF items are **proposed / not implemented by this document**. Existing toolbar actions mentioned as current state are observations from source inspection; verify current behavior and tests before changing their status.
