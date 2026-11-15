# Wave — Consolidated UI Backlog

> Combines the former `ui-bug.md`, `ui-gaps.md` and `ui-features.md`. All UIB, UI and UIF identifiers are retained. Status and evidence must be refreshed against current source and CI before closure.

## Contents

- [Export/print UI bugs](#1-exportprint-ui-bugs)
- [UI gaps and audit findings](#2-ui-gaps-and-audit-findings)
- [UI feature requests](#3-ui-feature-requests)

---

# 1. Export/print UI bugs

# Wave UI Bugs — Exported Preview and Theme Rendering

> Review date: 2026-11-15  
> Evidence: the two user-provided 10-page PDFs named **Wave Complete Feature Test.pdf** (light export) and **Wave Complete Feature Test 1.pdf** (dark export). Both contain the same 17-section Markdown showcase and were generated from the Wave preview at approximately 00:32 on 2026-11-15.  
> Scope: visible defects in the exported PDFs. This is a separate UI/export defect register; it does not replace `ui-gaps.md`, `bugs.md` or `fixed-bugs.md`.

## Status legend

- **Observed** — directly visible in the supplied PDF.
- **Needs reproduction** — symptom is visible, but the responsible renderer/CSS/export path is not yet isolated.
- **Open** — not fixed or independently verified as fixed.
- Severity: P1 = blocks readability or trust in exported content; P2 = visible feature/content correctness issue; P3 = polish or lower-impact issue.

## Summary

| ID | Severity | Status | Finding |
|---|---|---|---|
| UIB-001 | P1 | Fix implemented — CI/visual verification pending | Dark-theme export produces very low-contrast text on a white PDF page |
| UIB-002 | P1 | Fix implemented — CI/visual verification pending | Dark component surfaces are exported onto a white page without a coherent print theme |
| UIB-003 | P2 | Fix implemented — CI/visual verification pending | Wave inline foreground/background color extensions appear as literal code-like text |
| UIB-004 | P2 | Fixture corrected — CI/visual verification pending | Display-style summation math remains literal Markdown in the exported PDF |
| UIB-005 | P2 | Regression guard added — CI/visual verification pending | First table row's Priority value (1) is absent in the exported table |
| UIB-006 | P2 | Print behavior implemented — CI/visual verification pending | Collapsed DETAILS disclosure content is not visible in the PDF export |

---

## UIB-001 — Dark-theme export has unreadable foreground text on a white page

- **Severity:** P1
- **Status:** Fix implemented in print CSS; automated and visual verification pending
- **Evidence:** Dark export PDF, pages 1–3 and 10. Headings, body text, list items, links, table body text and footer/test notes are rendered in very pale foreground colors while the PDF page itself remains white. Large portions of the content are difficult or impossible to read.
- **Expected:** Export must choose a complete output theme. A light/print PDF must use dark foreground text on a light page; a dark PDF must use a dark page background and appropriately light foreground text.
- **Impact:** The exported document is not reliably readable and is unsuitable for sharing or printing.
- **Reproduction:** Open the feature showcase, enable Wave dark appearance, export/print to PDF using the same workflow as the supplied file, then inspect pages 1–3 and 10.
- **Acceptance criteria:**
  1. The export flow offers an explicit Light, Dark and Print appearance, or clearly documents a single deterministic print appearance.
  2. Every Markdown element uses the selected export palette: body, H1–H6, lists, links, footnotes, tables, blockquotes, alerts, code, math and diagrams.
  3. Light/Print output has readable dark text on a light page; Dark output has readable light text on a dark page.
  4. Automated contrast checks cover representative foreground/background pairs; visual PDF regression covers the full feature showcase.
  5. Browser print settings do not silently produce near-white text on a white page.

## UIB-002 — Dark component surfaces are inconsistent with the exported page background

- **Severity:** P1
- **Status:** Fix implemented in print CSS; automated and visual verification pending
- **Evidence:** Dark export PDF, pages 1–3. The page remains white, while some components retain dark-theme styling: the introductory blockquote, table header, alerts/disclosure, inline code and highlighted text have dark surfaces. Other text remains pale on white. This produces a mixed theme rather than a coherent export.
- **Expected:** Export styling must be independent from editor chrome and resolve all page and component tokens together. A print export should normally normalize surfaces to print-friendly colors; a dark export should apply a dark page background consistently.
- **Impact:** Strong visual inconsistency, poor readability and excessive dark panels when printed.
- **Reproduction:** Export the same showcase while Wave is in dark appearance; inspect pages 1–3.
- **Acceptance criteria:**
  1. Editor theme tokens do not leak partially into print/PDF output.
  2. Page, code, inline-code, table, callout, disclosure, quote and highlight surfaces all use one coherent export theme.
  3. Print mode avoids large dark ink-heavy panels unless the user explicitly selects dark export.
  4. Export appearance is stable regardless of whether the editor is currently in Edit or Preview mode.

## UIB-003 — Wave inline color extensions are printed as literal code-like text

- **Severity:** P2
- **Status:** Renderer fix implemented; automated and visual verification pending
- **Evidence:** Page 2 of both PDFs. The showcase source uses `[[color:#365FBA|blue]]`, `[[color:#26734D|green]]`, `[[color:#C0392B|red]]` and `[[bg:#FFF0A8|highlighted background]]`. The exported page displays the `wave-color:...` and `wave-bg:...` forms as code-like literal text rather than showing the intended colored foreground/background labels.
- **Expected:** Supported Wave color extensions should render as styled text in Preview and export. If an export path cannot support them, it should preserve readable label text and provide an explicit fallback rather than printing internal transformed syntax.
- **Impact:** Wave-specific formatting appears broken in a showcase intended to demonstrate it.
- **Reproduction:** Open section 6 of the supplied feature showcase and export in both appearances.
- **Acceptance criteria:**
  1. Blue, green and red examples display their corresponding foreground colors.
  2. The highlighted-background example displays its intended background color.
  3. No internal `wave-color:` or `wave-bg:` serialization leaks into visible output.
  4. Light, dark and print exports retain readable contrast for custom colors.

## UIB-004 — Display-style summation math is not rendered in the exported PDF

- **Severity:** P2
- **Status:** Showcase fixture corrected to the documented display-math syntax; automated and visual verification pending
- **Evidence:** Page 3 of the light export. The fenced `math` expression above renders as a fraction, but the later standalone summation expression `$ ... $` is printed literally, including dollar delimiters and TeX commands.
- **Expected:** Every documented math delimiter form should either render consistently or remain a deliberately readable source fallback. A supported display-math form must not unexpectedly appear as raw TeX in the exported document.
- **Impact:** Mathematical content is inconsistent within the same showcase and exported notes look unfinished.
- **Reproduction:** Inspect section 8 of the showcase and export to PDF in light appearance.
- **Acceptance criteria:**
  1. Confirm and document the supported display-math delimiter syntax.
  2. If the supplied standalone-dollar form is supported, render the summation in Preview and exported PDF.
  3. If it is unsupported, update the showcase to use the documented supported syntax and retain a readable fallback.
  4. Add light/dark/print regression coverage for inline, fenced and display math.

## UIB-005 — First table row loses its Priority value in PDF output

- **Severity:** P2
- **Status:** Print table-cell preservation and regression assertions implemented; original PDF symptom still needs visual confirmation
- **Evidence:** Page 2 of the light export shows the Priority column values 2 and 3 for the second and third body rows, but the first body row ("Markdown preview", "Ready") appears to have a blank Priority cell even though the supplied Markdown source specifies `1`. The dark export shows the same missing first value.
- **Expected:** All source table cell values should be preserved in Preview and PDF export.
- **Impact:** Exported data is incomplete and can misrepresent feature status or priority.
- **Reproduction:** Inspect section 3 of the supplied showcase in Preview and exported PDF.
- **Acceptance criteria:**
  1. The first row's Priority value `1` is visible in Preview and PDF.
  2. No cell content is clipped, hidden by styling or lost during pagination/export.
  3. Regression test asserts the text content of every cell in the sample table in light, dark and print exports.

## UIB-006 — Collapsed DETAILS disclosure content is absent from PDF export

- **Severity:** P2
- **Status:** Print stylesheet now includes collapsed disclosure bodies; automated and visual verification pending
- **Evidence:** Page 2 of both PDFs shows the DETAILS summary row ("Expand for more information") but not the nested explanatory text or list items supplied inside the disclosure block.
- **Expected:** Define export behavior explicitly. Recommended default: include disclosure content in static PDF output, since the PDF cannot provide the same interactive expansion behavior as the live preview. Alternatively, offer an explicit "include collapsed content" export option.
- **Impact:** Important explanatory content may be omitted when users share or archive a PDF.
- **Reproduction:** Export the showcase with the DETAILS block collapsed and compare the PDF with the source.
- **Acceptance criteria:**
  1. PDF export includes the disclosure body by default, or exposes a clearly named include-collapsed-content option.
  2. The disclosure summary and body remain semantically associated.
  3. The live Preview remains interactive and preserves its current collapsed/expanded state.
  4. Tests cover both initially collapsed and expanded disclosure states.

---

## Cross-theme export regression matrix

| Fixture | Light | Dark | Print |
|---|---|---|---|
| Headings and body text | [ ] | [ ] | [ ] |
| Links, references and footnotes | [ ] | [ ] | [ ] |
| Lists and task lists | [ ] | [ ] | [ ] |
| Tables and all cell values | [ ] | [ ] | [ ] |
| Alerts, quotes and DETAILS | [ ] | [ ] | [ ] |
| Custom foreground/background colors | [ ] | [ ] | [ ] |
| Inline and fenced code | [ ] | [ ] | [ ] |
| Diff highlighting | [ ] | [ ] | [ ] |
| Inline, fenced and display math | [ ] | [ ] | [ ] |
| Mermaid and other diagram renderers | [ ] | [ ] | [ ] |
| Local image/audio/video fallbacks | [ ] | [ ] | [ ] |
| Page breaks, long blocks and footers | [ ] | [ ] | [ ] |

## Recommended fix order

1. Fix **UIB-001 and UIB-002** together by creating a dedicated export theme layer with explicit Light, Dark and Print palettes.
2. Fix **UIB-005** and verify table cell preservation in the export pipeline.
3. Fix **UIB-003** so Wave custom color extensions render as intended in export.
4. Confirm the supported math syntax and resolve **UIB-004**.
5. Decide and implement the disclosure export policy for **UIB-006**.
6. Add full showcase PDF regression tests for all three export appearances.

## Implementation update — 2026-11-15

The first remediation pass is committed to the application source. Findings remain open for verification until GitHub Actions and a real browser-generated PDF have been reviewed.

| ID | Source change |
|---|---|
| UIB-001 | Added a deterministic light print palette that forces readable dark text on a white page, including headings, body text, links, lists, tables and nested Markdown elements. |
| UIB-002 | Normalized print surfaces for code, inline code, table headers, alerts, quotes and disclosures so dark editor-theme panels do not leak into the print page. |
| UIB-003 | Corrected the inline Wave color renderer's content-matching expression; added dedicated classes and a print color token so validated foreground colors remain visible without exposing internal serialization. |
| UIB-004 | Corrected the Complete Feature Test fixture to use the documented `$` display-math delimiters. Added a regression fixture that checks the rendered MathML block. |
| UIB-005 | Added explicit print table layout/cell visibility rules and an E2E assertion that the first row's Priority value `1` remains present. The original PDF symptom still requires visual confirmation. |
| UIB-006 | Added print rules that reveal the body of collapsed `DETAILS` blocks while leaving live Preview disclosure interaction unchanged. |

Regression coverage now checks the white print page, dark readable heading text, preserved custom foreground color, first-row table value, rendered display math and collapsed disclosure body. The test also confirms that Wave chrome remains hidden. These are test assertions committed to source, not yet executed results.

The browser's print dialog is still responsible for PDF creation. Browser options such as page size, margins, headers/footers and background-graphics printing can still affect the final file. No claim of CI success or visual PDF sign-off is made in this update.

## Evidence boundaries

- Findings are based on the two supplied PDFs, not a live browser reproduction or inspection of the exact export CSS.
- The dark PDF's white page and pale text are directly visible; the precise stylesheet or print pipeline responsible is not yet isolated.
- The first table value, custom color extensions and display math now have targeted source fixes and regression assertions; the supplied PDF symptom still needs confirmation in a newly generated browser PDF.
- The alert examples in the source are written as consecutive markers inside one contiguous blockquote; their combined appearance may be caused by fixture structure rather than a renderer defect. This is deliberately not recorded as a confirmed bug.
- Missing image/audio/video examples are not treated as defects because the source explicitly says the user must add matching local assets first.
- Application source, the Complete Feature Test math fixture and the PDF export E2E scenario were changed in the remediation pass above.


---

# 2. UI gaps and audit findings

# Wave — UI gaps register

> Review date: 2026-11-15  
> Repository: https://github.com/iamjpsonkar/Wave  
> Evidence: user-provided 2048 × 1330 desktop Edit/Preview screenshots; current `main` source reviewed at `4713725f0e09efae0d0b8e6c9da880f5513e18ca`, including `src/App.tsx`, `src/styles.css`, `tests/e2e/workspace.spec.ts`, and `docs/FEATURES.md`.  
> Scope: UI/UX observations and product-facing interface gaps. This is not a claim that every gap is a confirmed functional bug.

## How to read this register

- **Observed** means directly visible in the supplied screenshot.
- **Source-confirmed** means the current UI source or feature map confirms the limitation.
- **Needs interaction review** means a static screenshot cannot establish whether the behavior is missing or merely not shown.
- Priorities: P0 = blocks safe/basic use; P1 = major usability/product gap; P2 = meaningful polish/productivity; P3 = refinement.
- Preserve every item and its ID when changing status. Do not mark a gap complete without implementation evidence and a regression check.

## Screenshot assessment

The desktop layout has a recognizable visual identity: persistent workspace sidebar, document toolbar, edit/preview switch, backlinks control, local-save indicator, backup action and a calm neutral palette. The local-first message is clear.

The screenshot is an editor state, not a full product walkthrough. It does not prove how preview, search, templates, Trash, backup restore, mobile navigation or dialogs behave. The following observations are limited to what is visible or confirmed in source.

## Priority gaps

### UI-001 — Settings dialog needs complete visual and accessibility QA

- Priority: **P1**
- Status: **Implemented in source — QA verification pending**
- Original evidence: the sidebar footer displayed “Settings” with “NOT AVAILABLE YET”; the inert placeholder is now an accessible, keyboard-operable Settings dialog with focus containment and Escape dismissal.
- Implemented scope: workspace-persisted theme, typography, content width and reduced-motion preferences; local storage/recovery explanation; save status and basic page/folder diagnostics. More advanced editor/privacy/diagnostic controls remain future scope.
- Regression coverage checks preference persistence in `.wave/settings.json`, application and reload/reopen behavior. Do not mark complete until CI passes.
- User impact: core appearance and typography preferences are now configurable; more advanced editor behavior, privacy controls and deeper diagnostics are not yet configurable.
- Target: extend the Settings destination only with controls that have real effects. Keep autosave/recovery and local-data explanations accurate, and add deeper diagnostics when supported by reliable workspace data.
- Acceptance: Settings opens by mouse and keyboard; focus remains within the dialog and Escape closes it; implemented preferences persist across reload/reopen; reset changes preferences only and preserves documents/recovery data.

### UI-002 — Editor is a plain-text surface rather than a rich writing experience

- Priority: **P1**
- Status: **Observed + source-confirmed**
- Evidence: screenshot shows raw Markdown source in a large textarea; source uses a textarea for edit mode and a separate rendered preview. The feature map lists a rich block editor and block interactions as planned.
- User impact: users must know Markdown syntax and mentally translate source into rendered output. The toolbar helps, but editing remains source-centric.
- Target: keep Markdown as the portable source of truth while progressively adding an optional block-oriented editing layer: paragraph, headings, lists, quote, divider, callout, code, image/file and table blocks. Avoid silently changing or corrupting source.
- Acceptance: existing Markdown opens without loss; editing and switching modes preserves source; unsupported blocks remain readable; keyboard navigation and undo behavior are defined.

### UI-003 — Writing canvas width needs responsive and long-content verification

- Priority: **P1**
- Status: **Core behavior implemented — responsive QA pending**
- Original evidence: the screenshot showed content starting near the left edge of a very wide pane without a centered measure or width control. The editor and preview now share a centered 860px default measure with narrow, wide and full-width preferences. Responsive review and specialized wide-content behavior remain open.
- User impact: long lines become difficult to scan and the document feels visually sparse on large displays.
- Target: introduce a comfortable default writing measure (for example, a centered 720–900px content column) with optional wider/full-width modes for tables, code and diagrams.
- Acceptance: normal text has a readable maximum line length on wide screens; wide content can intentionally expand; small screens retain usable horizontal padding; preview and edit modes share consistent alignment. Initial centered measure and width choices are implemented; responsive and wide-code/table behavior remain to verify.

### UI-004 — Toolbar actions need distinct icons and consistent accessible labels

- Priority: **P2**
- Status: **Partially implemented — regression pending**
- Evidence: source confirmed both adjacent code actions rendered the same `Code2` icon and the inline-code button had only the generic accessible name “Code”. The inline-code action now uses `Code2` with the explicit name/tooltip “Inline code”; fenced insertion uses the distinct `FileCode2` icon and “Code block” name/tooltip.
- User impact: users can now distinguish the two code actions by icon and accessible label; other icon-only toolbar controls still need a complete labeling/tooltip audit.
- Target: complete the toolbar-wide accessible-name and hover/focus tooltip audit, then consider grouping advanced actions in a responsive More menu.
- Acceptance: every toolbar action has a unique accessible name, visible tooltip on hover/focus, and keyboard-operable trigger; inline and fenced code actions use distinct visual icons and clear names. A Playwright regression asserts both icon identities, labels and insertion behavior.

### UI-005 — Small and low-emphasis interface text

- Priority: **P2**
- Status: **Observed**
- Evidence: screenshot uses very small muted text for document metadata, save status, sidebar helper labels and footer information.
- User impact: secondary information is hard to read, especially at normal laptop viewing distance and for users with low vision.
- Target: define a consistent type scale and minimum sizes for functional metadata; increase contrast for muted labels while retaining the quiet visual style.
- Acceptance: text and controls meet WCAG contrast requirements; essential status and navigation text remains legible at 100% zoom; browser zoom to 200% does not clip core controls.

### UI-006 — Document context and navigation hierarchy are weak

- Priority: **P2**
- Status: **Observed**
- Evidence: top breadcrumb displays workspace and current page, but the document metadata says only “Saved in .wave / documents”; folder context is not prominent in the document header. Sidebar shows a short page list and folder controls.
- User impact: in nested workspaces users may lose context about where a page lives, and it is harder to move or organize pages from the editing context.
- Target: strengthen breadcrumbs with clickable folder segments; provide clear move/organize actions; show parent folder context without duplicating noisy metadata.
- Acceptance: current path is understandable for root and nested documents; breadcrumb segments navigate to their folder; moving a page preserves links and does not overwrite existing files.

### UI-007 — No visible document outline or in-page navigation

- Priority: **P2**
- Status: **Needs interaction review**
- Evidence: no outline/table-of-contents panel is visible in the screenshot; the feature map lists page outline and table of contents as planned.
- User impact: long notes, specifications and technical documents become harder to navigate.
- Target: generate an outline from rendered headings, with collapsible panel and jump-to-heading behavior.
- Acceptance: heading levels are represented correctly; duplicate heading IDs remain stable; outline updates after edits; panel is keyboard accessible and does not steal editor focus.

### UI-008 — Backlinks are hidden behind a collapsed control

- Priority: **P2**
- Status: **Observed**
- Evidence: screenshot shows a “Backlinks 0” disclosure control; no backlinks are visible until expanded.
- User impact: graph/navigation context is not discoverable, especially for users unfamiliar with the feature.
- Target: retain the compact disclosure but provide clearer empty state, useful count and discoverability; consider a page relationship panel combining backlinks and outgoing links.
- Acceptance: disclosure state is keyboard accessible; empty and populated states are clear; selecting a linked page preserves a sensible return path.

### UI-009 — No visible undo/redo, find/replace or document-level productivity controls

- Priority: **P2**
- Status: **Needs interaction review**
- Evidence: the visible toolbar does not show undo/redo or find/replace. Source confirms command palette and page search shortcuts, but that is not equivalent to in-document find/replace.
- User impact: common editing workflows may require browser-native or manual workarounds.
- Target: provide editor undo/redo, find/replace within the current document, and clear shortcut discoverability. Avoid claiming these are absent until their keyboard behavior has been checked.
- Acceptance: edits can be undone/redone predictably across toolbar operations; find/replace supports next/previous and replace-all with selection-safe behavior.

### UI-010 — No visible word count, reading time or document statistics

- Priority: **P3**
- Status: **Observed**
- Evidence: screenshot footer shows Markdown and save shortcut but no document statistics.
- User impact: users writing reports, articles and notes cannot quickly assess document length.
- Target: optional unobtrusive word/character count and reading-time estimate, with a preference to hide it.
- Acceptance: counts update after edits, handle Unicode reasonably, and do not cause layout shifts.

### UI-011 — No clear page creation/empty-state onboarding once workspace is populated

- Priority: **P2**
- Status: **Needs interaction review**
- Evidence: screenshot shows existing pages and a “New from template” navigation action, but no visible contextual help, quick-start guidance or template preview.
- User impact: users may not understand which template to choose or how to structure a new page.
- Target: searchable template gallery with descriptions, preview, categories and a blank-page option; add concise first-use guidance without persistent clutter.
- Acceptance: template gallery can be searched and navigated by keyboard; preview does not create a page; selecting a template creates an editable copy and preserves its Markdown structure.

### UI-012 — Settings appearance and typography need visual/accessibility QA

- Priority: **P1**
- Status: **Implemented in source — QA verification pending**
- Original evidence: appearance and typography controls were planned and Settings was unavailable. A workspace Settings dialog now exposes working theme, font family/size, line spacing, content width and reduced-motion preferences. Privacy/local-storage and recovery explanations are informational rather than fictitious toggles.
- Preferences use the existing `.wave/settings.json` store and apply to editor/preview. Contrast and full component coverage still require accessibility review.
- User impact: users can now adapt theme and writing typography; complete visual consistency and contrast still need review.
- Target: maintain the implemented theme, font family/size, line height, content width and reduced-motion controls; expand only where a setting has a real, testable effect.
- Acceptance: preferences persist per workspace; theme and typography changes apply to editor and preview; contrast review across every component remains open.

### UI-013 — Backup action lacks visible context about backup history and safety

- Priority: **P2**
- Status: **Needs interaction review**
- Evidence: screenshot shows a top-level “Backup” button; source includes backup listing and restore-to-new-folder flows, but the screenshot does not show those states.
- User impact: users may not know when the last backup was created, what it includes or how restore behaves.
- Target: show last successful backup time and verified document/asset counts; make backup history and restore destination clear.
- Acceptance: incomplete backups are never shown as restorable; restore always explains that it creates a separate folder; no existing workspace is overwritten.

### UI-014 — Responsive behavior and mobile editor ergonomics need visual verification

- Priority: **P2**
- Status: **Needs interaction review**
- Evidence: source includes a mobile navigation drawer and CSS, but only a 2048px desktop screenshot was supplied.
- User impact: the screenshot cannot establish whether toolbar, sidebar, editor, dialogs and preview remain usable on phones/tablets.
- Target: capture and review 1440px, 1024px, 768px, 390px and 320px layouts; make toolbar overflow intentional and preserve access to primary actions.
- Acceptance: no unintended horizontal page overflow; editor remains usable; dialogs fit viewport; navigation can open/close with keyboard and touch; focus returns to the triggering control.

### UI-015 — No visible save history or recovery explanation

- Priority: **P2**
- Status: **Observed**
- Evidence: screenshot shows “Saved locally” and “Markdown · ⌘S to save”, but no last-saved time, recovery state explanation or document history. Source contains recovery drafts, but no user-facing version-history UI is shown.
- User impact: users may not understand what “Saved locally” guarantees or how to recover earlier versions.
- Target: explain local save and recovery draft states; show a timestamp or meaningful save state; consider page history/restore points as a separate planned capability.
- Acceptance: status distinguishes saving, saved, recovery-draft-only, conflict and error states; copy does not promise durability beyond what the storage implementation guarantees.

## Additional design-system work

1. Establish design tokens for spacing, typography, color, border, radius, focus ring and elevation.
2. Define consistent hover, focus-visible, active, disabled, loading, error and success states for every control.
3. Standardize icon sizes and button heights; avoid relying on color alone for selected/current states.
4. Ensure destructive actions (Trash, permanent deletion, reset) are visually distinct and have clear confirmation.
5. Keep the quiet, local-first visual identity; improve hierarchy and readability rather than adding decoration.

## Suggested implementation order

| Order | IDs | Work |
|---|---|---|
| 1 | UI-001, UI-012 | Make Settings real; theme and typography foundations |
| 2 | UI-003, UI-005, UI-004 | Readable canvas, type/contrast scale, toolbar clarity |
| 3 | UI-007, UI-008, UI-006 | Document outline, page relationships, navigation context |
| 4 | UI-009, UI-015, UI-013 | Editing productivity, save/recovery clarity, backup UX |
| 5 | UI-002, UI-011 | Block editing direction and template discovery |
| 6 | UI-014, UI-010 | Responsive visual QA and optional document statistics |

## Verification checklist

- [ ] Capture baseline screenshots at desktop, tablet and mobile breakpoints.
- [ ] Test keyboard-only navigation and visible focus for all controls.
- [ ] Run automated accessibility checks and manually inspect contrast and screen-reader output.
- [ ] Verify editor/preview alignment and long-line behavior with large Markdown documents.
- [ ] Verify nested-folder breadcrumbs and page move flows.
- [ ] Verify theme/typography persistence after reload and workspace switch.
- [ ] Verify undo/redo and find/replace do not interfere with autosave/recovery.
- [ ] Verify backup history and restore messaging with complete and incomplete snapshots.
- [ ] Add Playwright visual/interaction regressions for each completed UI gap.
- [ ] Update this register with implementation commit, test evidence and completion date; retain all IDs and history.

## Evidence limitations

- Only one desktop screenshot was provided. It shows one populated-workspace edit state.
- It does not show preview mode, open backlinks, search results, template gallery, backup history, Trash, dialogs, mobile/tablet breakpoints or keyboard/focus states.
- Do not infer that a feature is broken merely because its control is not visible in this screenshot.
- This review created a UI gap register only; no application UI code was changed.


## Implementation update — 2026-11-14

- UI-001 and UI-012: replaced the unavailable Settings footer placeholder with a keyboard-accessible dialog. Added workspace-scoped theme, font family, text size, line spacing, content width and reduced-motion preferences, persisted through the existing settings file. Added explicit local-storage, autosave/recovery and workspace-count information; no cloud or unsupported controls were introduced.
- Added a Playwright regression for preference persistence, application and workspace reopen. Status remains **Implemented — CI pending** until the full browser suite passes.
- All other UI gap IDs and acceptance criteria remain unchanged and open. This is the first implementation slice, not completion of the entire UI gap register.

---

## Updated UI review — dark theme and edit/preview screenshots — 2026-11-14

Two additional screenshots were supplied: a dark-theme editor state and a dark-theme Preview state. They show the same workspace/content at a 2048 × 1330 desktop viewport. The review is additive; all prior IDs and acceptance criteria remain preserved.

### Status changes based on current source and screenshots

- **UI-001 — Settings unavailable:** implementation now exists in current source. The sidebar Settings control opens a dialog with keyboard focus handling, close behavior, and workspace preference information. The implementation is recorded in the prior implementation update; its regression was still marked CI-pending at that point. New screenshots do not show the dialog, so visual quality of the settings dialog itself remains unreviewed.
- **UI-012 — Appearance and typography controls:** current source implements System/Light/Dark appearance, content width, font family, text size, line spacing and reduced-motion preferences, persisted in workspace settings. Treat this as **implemented in source; full visual/accessibility verification pending**, not as a fully QA-closed item.
- **UI-003 — Writing canvas width:** current CSS constrains editor and preview to a configurable width (comfortable default 860px; narrow 680px; wide 1100px; full width). The new screenshots visually show a centered writing column. Mark the original no-width-constraint gap **implemented in source and visually demonstrated**; retain responsive and long-content regression testing.
- **UI-005 — Typography/contrast:** still open. The dark screenshots show very small, muted metadata and footer text; dark theme also exposes additional contrast problems below.

### New findings

### UI-016 — Dark-theme Markdown preview code block has a mismatched light surface

- Priority: **P1**
- Status: **Dark-theme source mitigation added — visual regression pending**
- Evidence: the dark workspace Preview screenshot shows a large near-white code block surface against the dark editor canvas. The code text appears very pale, so the content is difficult to read.
- User impact: code samples become visually glaring and code text is low-contrast in the dark theme.
- Target: make code block background, foreground, border, inline code and copy control use coherent theme tokens. Preserve syntax-color contrast independently for light and dark themes.
- Acceptance: representative plain and syntax-highlighted code blocks pass contrast checks in light, dark and system themes; no unintended white panel remains in dark mode; copy control remains visible and keyboard accessible.

### UI-017 — Dark-theme heading/Markdown body contrast is inconsistent

- Priority: **P1**
- Status: **Dark-theme source mitigation added — visual regression pending**
- Evidence: the rendered “Hii” heading appears extremely dark and subdued against the dark canvas, while other interface controls remain bright. This suggests a heading or Markdown color token is not consistently applied in the shown preview.
- User impact: headings lose hierarchy and can become difficult to read, especially in longer documents.
- Target: define explicit theme-aware foreground tokens for all Markdown elements: body, headings, links, emphasis, blockquotes, tables, callouts, code and fallback content.
- Acceptance: H1–H6 and body text remain clearly readable in both themes; nested elements do not inherit inappropriate light-theme colors; automated contrast checks cover representative Markdown fixtures.

### UI-018 — Dark theme mixes dark workspace surfaces with light controls

- Priority: **P2**
- Status: **Partially mitigated in source — visual audit pending**
- Evidence: dark screenshots show the dark canvas and sidebar alongside bright white Edit/Preview segmented controls, Backup button and code block panel. Some light controls may be intentional emphasis, but their surface treatment is not visually integrated.
- User impact: inconsistent surfaces make the interface feel partially themed rather than intentionally designed; bright panels draw attention away from writing.
- Target: define theme-aware surface, raised-surface, border and selected-control tokens. Reserve high-contrast light surfaces for deliberate primary actions only.
- Acceptance: controls, popovers, dialogs, code blocks, toolbar, inputs and buttons have intentional light/dark states; selected state remains distinguishable without a large unrelated white panel.

### UI-019 — Brand wordmark and selected navigation need stronger dark-theme contrast

- Priority: **P2**
- Status: **Brand contrast mitigation added — visual regression pending**
- Evidence: in the dark screenshot, the “wave” wordmark beside the green icon is barely distinguishable from the sidebar background. Muted navigation and helper labels also appear subdued.
- User impact: brand identity and navigation affordances are harder to recognize in dark mode.
- Target: add theme-specific brand and navigation color tokens, preserving the quiet aesthetic without sacrificing legibility.
- Acceptance: wordmark, page titles, selected page, helper labels and navigation icons remain readable in light and dark themes; selected state is not conveyed by background alone.

### UI-020 — Preview-mode typography and code styling need dedicated visual regression coverage

- Priority: **P2**
- Status: **Partially implemented — theme coverage incomplete**
- Evidence: the paired screenshots show Edit and Preview states, but only one short heading and one code block. There is no evidence for tables, links, blockquotes, alerts, diagrams, math, long headings or nested lists in dark mode.
- User impact: theme regressions may remain hidden until users open real technical documents.
- Target: add a theme matrix of representative Markdown fixtures and screenshot tests for both Edit and Preview.
- Acceptance: capture Light/Dark/System × Edit/Preview at desktop and mobile widths; cover headings, paragraphs, links, inline code, fenced code, tables, alerts, blockquotes, diagrams, math and media fallbacks; review diffs rather than relying solely on snapshot pixel equality.

### Updated implementation order

1. Run and resolve the new UI-004 toolbar and system-dark theme regressions; do not close their IDs before CI passes.
2. Complete **UI-020** with the full Light/Dark/System × Edit/Preview × desktop/mobile fixture matrix.
3. Finish **UI-018/UI-019** by reviewing all dialogs, popovers, navigation states and selected controls in both dark modes.
4. Complete the **UI-005** typography/contrast audit and responsive **UI-014** verification.
5. Recheck **UI-001/UI-012** settings dialog appearance, focus management and preference persistence under all themes.
6. Preserve **UI-003** width choices and verify long tables, code, diagrams and narrow/mobile viewports.

### Updated evidence limitations

- The new evidence includes a dark-theme Edit screenshot and a dark-theme Preview screenshot at desktop size.
- No Settings dialog screenshot, mobile/tablet screenshot, light-theme Preview screenshot, accessibility tree, keyboard/focus recording or contrast measurements were supplied.
- The current source now contains explicit dark and system-dark selectors for Markdown and key controls; the added E2E scenario checks representative computed colors but is not a full WCAG contrast audit.
- No mobile/tablet screenshot, Settings-dialog screenshot, or full theme/mode screenshot matrix is available yet.


## Implementation update — toolbar distinction and dark-theme parity — 2026-11-14

- UI-004: separated the two code toolbar actions visually and semantically. Inline code uses `Code2` and the accessible label/tooltip `Inline code`; fenced code uses `FileCode2` and `Code block`. Playwright checks both icon identities, labels and insertion behavior. Other toolbar controls still need a complete accessible-name/tooltip audit.
- UI-016/UI-017: added explicit dark and system-dark preview styles for code surfaces, inline code, headings, links, blockquotes, table headers/borders and horizontal rules. Added system-dark E2E assertions for heading/code contrast and dark surfaces.
- UI-018/UI-019: brought Edit/Preview segmented controls, Backup, toolbar buttons and the sidebar wordmark into the dark theme. Remaining popovers/dialogs and the full navigation contrast matrix still need review.
- UI-020: the new test adds a representative system-dark Preview slice, not the full Light/Dark/System × Edit/Preview × desktop/mobile matrix. Keep the gap partially open until that matrix exists and is reviewed.
- UI-001/UI-012 are implemented in source; QA/visual verification remains pending. UI-003's centered width controls are implemented; responsive and long-content verification remains open. All other gap IDs and acceptance criteria are preserved.


## Implementation update — UI-020 theme and responsive matrix — 2026-11-14

- Added theme-aware dark/system-dark styling for Markdown callouts, disclosures, math fallback surfaces, diagram/fallback surfaces, syntax tokens, diff tokens, missing-image fallbacks, copy controls, and Settings dialog controls. Existing light-theme styling remains the default; explicit Light mode is not overridden by the OS dark preference.
- Added a Playwright matrix covering Light/Dark/System × Edit/Preview × desktop/mobile (12 states) using representative headings, links, inline/fenced code, tables, alerts, DETAILS disclosures, math, Mermaid diagrams and missing-image fallbacks.
- The regression checks key computed foreground/surface colors, rendered content and horizontal overflow at 1440px and 390px.
- **Status: implementation and test source added — CI pending.** UI-020 is not closed until the new main-branch workflow passes and the visual results are reviewed. This is computed-style/interaction coverage, not a complete screenshot-diff suite or WCAG contrast certification.
- All existing UI gap IDs and acceptance criteria remain preserved. UI-005 contrast audit, UI-014 broader responsive breakpoints, and UI-018/UI-019 dialog/popover/navigation audit remain open.

---

## Implementation update — remaining editor, navigation, templates and responsive UI — 2026-11-14

This is an additive status snapshot. All original UI-001–UI-020 IDs, original evidence and acceptance criteria remain intact. Statuses below describe source and regression coverage only; none is CI-verified in this update.

| ID | Latest implementation | Remaining acceptance / verification |
|---|---|---|
| UI-001 | Settings dialog, preference persistence, focus containment and Escape behavior already exist; system/theme matrix now exercises broader appearance surfaces. | Run Settings-specific visual/accessibility checks and CI; verify preference reset/reopen on latest code. |
| UI-002 | Added optional source-preserving Markdown block editing for headings, paragraphs, lists, quotes/callouts, code fences, tables, dividers, image and attachment lines. Blocks can now be reordered by keyboard controls or drag handle, deleted, and inserted from a common-block menu. | **Partial:** slash-triggered command menu, bookmark/embed blocks and richer inline formatting remain. CI and source-round-trip/reorder regression pending. |
| UI-003 | Centered configurable writing measure remains in place; responsive matrix now checks 320, 390, 768, 1024 and 1440 CSS-pixel widths. | Long table/code/diagram fixtures and visual review of wide/full-width modes remain. |
| UI-004 | Every primary formatting toolbar action now has an explicit accessible name and title; Inline code and Code block retain distinct icons and labels. | CI and keyboard/tooltip review remain. |
| UI-005 | Increased functional metadata/control text sizes; added 4.5:1 body and heading contrast assertions to the theme matrix. | **Partial:** audit all metadata, controls, disabled/error states and Settings surfaces; manual screen-reader/zoom review remains. Automated assertions are not a complete WCAG audit. |
| UI-006 | Added clickable workspace/folder breadcrumbs and live save-status announcement. | Nested folder breadcrumb regression added; CI and deeper move/rename navigation review remain. |
| UI-007 | Added collapsible heading outline with heading-level indentation and jump-to-heading in Edit/Preview. | Duplicate-heading anchor behavior and keyboard review remain. |
| UI-008 | Existing Backlinks disclosure retains populated links and a clear “No pages link here yet” empty state. | CI and usability review of the return path remain. |
| UI-009 | Added bounded in-memory undo/redo history, Ctrl/Cmd+Z and redo shortcuts, document-local find, case matching, next/previous, replace and replace-all. | CI; verify long-session history and page-switch isolation under browser interaction. |
| UI-010 | Added live word count, Unicode character count and estimated reading time. | CI and count-definition review for Markdown syntax/code blocks remain. |
| UI-011 | Template gallery now supports search and preview-before-create; Escape and outside-click dismiss the preview. | CI and keyboard focus-return audit remain. |
| UI-012 | Existing persisted theme, font, text size, line spacing, content width and reduced-motion controls retained; System-light preview colors explicitly corrected. | Settings-specific latest-main CI and full component contrast audit remain. |
| UI-013 | Existing verified backup history exposes timestamps and document/asset counts; restore creates a separate folder and explains the destination. | CI and visual review of failure/incomplete snapshot states remain. |
| UI-014 | Expanded theme/editor matrix to five responsive widths (320, 390, 768, 1024, 1440) with document horizontal-overflow checks; existing mobile drawer regression retained. | Actual browser CI, touch/focus-return and screenshot review remain. |
| UI-015 | Save/recovery states are announced through a polite live region; existing recovery-draft and autosave behavior remains unchanged. | User-facing version history/restore points remain a separate unimplemented capability. |
| UI-016 | Dark/system-dark code, syntax, copy and fallback surfaces are theme-aware. | Contrast and screenshot review on latest CI remain. |
| UI-017 | Dark/system-dark body and heading colors are explicit; matrix now asserts minimum 4.5:1 body/heading contrast against the resolved workspace surface. | Full semantic text/link/callout contrast audit remains. |
| UI-018 | Added theme parity for productivity panel, template preview, command palette, templates, backlinks, Trash, search, Settings and controls; System-light overrides prevent dark panels in light OS mode. Template preview and command palette now contain keyboard focus with Tab/Shift+Tab. | Review every popover/dialog/disabled/error state, focus restoration, and browser screenshots/CI. |
| UI-019 | Wordmark, folder navigation, selected folder, status and supporting labels receive stronger dark/system-dark contrast. | Full selected/current/focus state review and CI remain. |
| UI-020 | Matrix expanded to Light/Dark/System × Edit/Preview × 5 widths = **30 states**, including representative Markdown, computed colors, body/heading contrast and page overflow. | CI, screenshot-diff review and tablet/mobile visual inspection remain. |

### New code and regression files

- `src/EditorEnhancements.tsx`: document-local history, find/replace, outline and statistics.
- `src/MarkdownBlockEditor.tsx`: optional source-preserving block mode for Markdown headings, paragraphs, lists, quotes/callouts, code, tables, dividers, images and attachment links.
- `src/App.tsx`: mounts editor tools; adds folder breadcrumbs, live save status, searchable/preview-first templates, toolbar accessible names and Escape dismissal.
- `src/styles.css`: productivity panel, template preview, readable functional text, folder breadcrumbs, mobile widths, dark-theme parity and System-light corrections.
- `tests/e2e/workspace.spec.ts`: editor productivity, template preview and nested breadcrumb regressions; 30-state responsive/theme matrix with contrast assertions.

### Latest honest verification state

- E2E source inventory: **38 scenarios** (34 previous + editor productivity + template preview + nested breadcrumb + source-preserving block editing).
- Node test source inventory: **30 tests** (unchanged).
- GitHub repository connection did not provide a current push-triggered Actions run or combined status for the latest code commits. No local project dependencies/test runner are available in this repository connection.
- **No test, typecheck, production build, screenshot review or CI pass is claimed.** Treat all new work as implementation committed / CI pending.
- UI-002 is now partially implemented; drag/drop/reorder, block handles, slash menu, bookmark/embed blocks and richer inline formatting remain open. UI-001/003/005/007/008/011/012/013/014/015/018/019 also retain the specific QA or acceptance items stated above. No gap ID is deleted or marked fully complete merely because source code was added.

 
### UI-002 follow-up — optional Markdown block mode

- Added a separate **Blocks** mode alongside the original source editor. The mode classifies headings, paragraphs, lists, quotes, callouts, fenced code, tables, dividers, image lines and attachment links into editable block surfaces.
- Each block editor replaces only its original source slice. Untouched source, blank-line separators and Markdown syntax remain unchanged; the plain source editor and preview remain available.
- Added a regression that edits one paragraph block and verifies the exact full Markdown source after returning to source mode, including list, callout and fenced-code blocks.
- This is a source-preserving block layer, not full Notion-style block editing. Keyboard and drag/drop reordering, block handles, deletion and common-block insertion are now implemented; slash-triggered commands, bookmark/embed blocks and rich inline formatting remain open.
- **Status: source and E2E regression committed; CI pending.**


### UI implementation follow-up — block controls and dialog focus — 2026-11-14

- UI-002: added keyboard up/down reordering, a draggable block handle, deletion, and a common-block insertion menu (paragraph, heading, list, quote, callout, code fence, divider). Reordering retains source text and inter-block whitespace. Added E2E coverage for keyboard movement, drag-and-drop, insertion and exact source output.
- UI-018: template preview and command palette now trap keyboard focus; template preview initially focuses its close control. Added Shift+Tab/Tab wrap regression for the template dialog.
- E2E source inventory is now **39 scenarios**; Node source remains **30 tests**. These are source counts only.
- UI-002 remains partial: slash-triggered menu, bookmark/embed blocks and rich inline editing remain. UI-018 focus restoration and full dialog/popover visual/accessibility audit remain open.
- Latest source commits: block editor `9e4f29390447dcdbd43f80098da522385a270448`, drag reorder `7057ce25861bffce43ee05ce5f8afb305ae1d0e8`, App focus containment `290f926c92caffe64d2ac34f1eea483df015f464`; tests `8bb74c69ec4c9adad7d59c0e34e869224742fa42`, `f292e32e853fce640d44f05f554ee4bce1cbba72`, `b90369be8ef6ba66ab95f84f5e609b406afd87f7`; styles `6bbd015307f55a0e385b6f041d383bdb07e6e87c`, `93bdd45f2fe17bda2375cb0a41c8f2f7f9e6ca62`.
- No test, typecheck, build, screenshot review or CI pass is claimed. Latest checked combined status and workflow results were empty; verification remains pending.

## UI-021 — Selection-based text color controls — 2026-11-15

- **Priority:** P2
- **Status:** Expanded implementation in source — CI and visual verification pending
- Added native foreground and background color pickers to the Markdown toolbar. With a source-text selection, the controls wrap the selection in explicit Wave directives: `[[color:#RRGGBB|text]]` and `[[bg:#RRGGBB|text]]`.
- The preview accepts only six-digit hexadecimal values and renders React spans or a styled blockquote. Existing `==highlight==` remains available; raw HTML and arbitrary CSS are still disabled.
- Source remains Markdown and Preview → Edit does not rewrite it. The E2E source adds a regression for both color types, literal code-span preservation and exact source retention on return to Edit.
- Added a per-block background color picker in the optional Blocks editor. It wraps a block in the safe `> [!COLOR=#RRGGBB]` directive and updates an existing color marker without double-wrapping it; the block editor recognizes these as color callouts.
- Remaining scope: nested color spans, non-Wave reader fallback, accessibility/contrast checks for user-chosen colors and theme/visual review.
- Commits: App `4df616fee1cbdcd80e878e422bc0ecc264c2c02e`; renderer `4f68b91243e17a2a2642961ec45c01550893aaa4`; styles `3464fd936b96bd280db1794f230a378041945a07`, system-light follow-up `53779f8f9705c1b78195761c794935e7aa1c6230`; E2E `323f49e33ab59f38cb2790628d83630f934d6282`, locator follow-up `48af3998748b51779a0abe75ca5853dd80fa03b1`, invalid-value and literal-source follow-ups `80f7534927fa505f7e7ed00caceb6f0e47066517`, `2d054accda98ec95d32f3ef69decead9d39d789b`, `1da64359dfe02a51e96679fa282b011550f9a4b6`, `81f819653e5f766670e51b783edacb1fa39c41b5`, and palette/block-fill E2E `76a55e006b00513e21a1a5ef406645a55339a762`.
- Verification: no local test/typecheck/build or screenshot run was available. Do not mark as CI-passed until the workflow for the latest source completes. Existing UI IDs UI-001–UI-020 and their scope are preserved.


## UI-022 — Export rendered Preview as PDF — 2026-11-15

- **Priority:** P2
- **Status:** Implemented in source — CI and browser verification pending
- Added an **Export PDF** action visible in Preview mode. It opens the browser print dialog for the rendered Markdown preview, sets the document title as the suggested filename, and restores the app title after printing.
- Print styles hide Wave navigation, editor controls, toolbar, backlinks and workspace chrome; only the rendered preview is printed. Print rules preserve color where supported, keep headings with following content, avoid splitting common blocks and wrap long code lines.
- E2E regression source verifies the print action, document title restoration and print-only visibility. Existing UI-001–UI-021 records remain unchanged.
- Direct PDF file generation without the browser print dialog remains a future enhancement; browser PDF output and exact pagination vary by browser/printer settings.
- Commits: App `e6800b1725f1471fcd56a403e001ff7fa7302cbb`; print CSS `26dc983d85a531e4a1431624ec7558b5b5dcb2b2`; E2E `8608f04f7c4347d4f59dff4016d45b52db15219b`.
- Verification is pending; do not claim CI success until the latest workflow completes.
 
## UI-023 — Discoverable Markdown sample library — 2026-11-15

- **Priority:** P1
- **Status:** Implemented in source — E2E and visual verification pending
- **Problem:** Wave exposes many Markdown, formatting, data, code, diagram and media capabilities, but users must already know the syntax or discover each feature through documentation/templates.
- **Change:** Added a persistent right-side **Sample library** beside the current editor/preview. It includes searchable, categorized examples; selecting an example shows a rendered preview and the exact Markdown source. **Insert into document** places the source at the current editor selection, replacing selected text, or appends it when the editor is in Preview/Blocks mode.
- **Categories:** Text, Blocks, Lists, Data, Code, Advanced and Media. Examples include headings, emphasis, links, quotes, callouts, DETAILS, dividers, lists/tasks, tables, code/diff, math, Mermaid, Wave colors, wiki links and local media references.
- **Acceptance:** sample selection updates the preview; insertion adds Markdown rather than rendered HTML; source remains editable and autosave-aware; search/category filtering works; panel is keyboard accessible and responsive; light/dark themes remain readable.
- **Regression:** added Playwright coverage for selection-based insertion and sample preview. Browser CI and responsive visual review pending.

## UI-024 — Enter does not continue Markdown list items — 2026-11-15

- **Priority:** P1
- **Status:** Fixed in source — E2E and CI verification pending
- **Problem:** Pressing Enter at the end of a Markdown list item inserted a plain newline instead of starting the next item.
- **Change:** The source editor now continues unordered and ordered lists, increments ordered-list numbers, carries task-list checkboxes forward as unchecked, preserves nested indentation, and exits a blank list item when Enter is pressed again. The handler leaves ordinary paragraphs and fenced code behavior to the browser.
- **Acceptance:** ordered, unordered, nested and task lists continue with the correct marker; empty list items exit cleanly; selection-based editing and source round-trip remain intact; Enter inside fenced code does not trigger list continuation.
- **Regression:** added Playwright assertions for ordered, unordered and task-list continuation and exiting an empty task item. CI execution pending.


---

# 3. UI feature requests

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
- **Status:** Partially implemented in source. The toolbar exposes native foreground, inline background and block background color pickers, quick text-color swatches, and a remove-formatting action. Inline selections are stored as `[[color:#RRGGBB|text]]` or `[[bg:#RRGGBB|text]]`; block fills use `> [!COLOR=#RRGGBB]` quote directives. Existing `==highlight==` remains supported.
- **Proposal:** complete nested color ranges, selection support in Blocks mode, and accessibility/contrast feedback for arbitrary user-picked colors.
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


## Implemented color controls follow-up — 2026-11-15

- The selection-based color foundation now includes six quick foreground swatches, remove-formatting, source-toolbar block fills and per-block background color pickers in Blocks mode.
- Blocks-mode color actions preserve the original Markdown model by adding or updating `> [!COLOR=#RRGGBB]` directives. Nested inline color ranges, portable fallback rendering and custom-color contrast guidance remain open.
- UI-021 remains a tracked implementation item; no earlier UI feature proposal is removed or downgraded.

 
## Implemented follow-up — Contextual sample library and list continuation — 2026-11-15

- Added a right-side **Sample library** in the document editor. Users can search and filter Markdown examples by category, select one to see a live rendered preview and inspect its exact Markdown source, then insert that source at the current editor selection. If Preview or Blocks mode has no source textarea mounted, insertion appends to the current document instead.
- Initial sample set covers Text, Blocks, Lists, Data, Code, Advanced and Media: headings, emphasis, links, blockquotes, callouts, DETAILS, dividers, bullet/numbered/nested/task lists, tables, code/diff, math, Mermaid, Wave colors, wiki links and local asset references.
- Added automatic Enter continuation for Markdown ordered/unordered/task lists, numbering increments, nested indentation preservation and empty-item exit.
- Regression source covers preview/insert behavior and ordered, unordered and task list continuation. CI and responsive visual verification remain pending.
- This addition does not replace or downgrade UIF-001–UIF-021 or any existing product backlog item.
