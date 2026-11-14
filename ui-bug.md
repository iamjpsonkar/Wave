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
