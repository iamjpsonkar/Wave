# Wave — Markdown Feature Gaps

> Audit date: 2026-11-14  
> Source of truth for this gap list: the user-provided **Markdown Feature Showcase** (20 sections), compared with the current default-branch renderer, preview wiring, styles, showcase template, compatibility guide and E2E test source.  
> Status: Wave has useful CommonMark/GFM support, but **Markdown showcase parity is not complete**. This file records the remaining work; it does not remove or replace any requirements.

## Status legend

- [x] Implemented and documented in the current renderer.
- [~] Partial implementation, restricted subset, or insufficient regression coverage.
- [ ] Not implemented.
- [!] Deliberately disabled for safety; only reconsider with an explicit safe allowlist and sanitization design.

## 1. Text formatting and inline elements

- [x] Bold, italic, nested emphasis, strikethrough and inline code.
- [~] Underline, highlight, subscript, superscript and keyboard-key styling through HTML tags are not supported as a safe Markdown extension.
- [ ] Add safe Markdown-native equivalents or an explicitly allowlisted/sanitized inline syntax for underline, mark/highlight, subscript, superscript and kbd.
- [~] Emoji entered as Unicode works; GitHub emoji shortcodes such as `:smile:` and `:rocket:` are not documented as supported.

## 2. Headings, paragraphs and anchors

- [x] Six heading levels, Setext headings, paragraphs and ordinary Markdown line-break parsing are supported by the Markdown parser.
- [~] Heading anchors are generated, but duplicate headings do not receive unique suffixes. Add deterministic duplicate-slug handling and tests for punctuation, Unicode, repeated headings and links to repeated headings.
- [~] Hard line breaks using two trailing spaces and backslash need explicit regression coverage across editor save/reopen and preview.

## 3. Lists

- [x] Ordered, unordered, nested and mixed lists, GFM task lists and lists containing paragraphs/code are supported by the configured Markdown/GFM parser.
- [~] Add broader rendering/accessibility regression coverage for deeply nested lists, list continuation paragraphs, nested fenced code and ordered-list numbering edge cases.

## 4. Links and images

- [x] Inline, titled, reference-style and automatic URL/email links are supported by the Markdown/GFM parser.
- [x] Heading links and Wave wiki links/backlinks have implementation and E2E coverage.
- [~] Reference-style linked images and image titles need explicit preview regression coverage.
- [~] Local image assets are supported; remote images are intentionally not fetched by preview. Verify broken/missing assets, alt text, decorative empty alt text, image title behavior and keyboard/screen-reader output.
- [~] Link safety and local/remote path handling need a broader security regression matrix, including unsafe schemes and malformed/encoded paths.

## 5. Code blocks

- [x] Inline code, fenced blocks, tilde fences, indented code and copyable code blocks are present.
- [~] Language labels do not currently provide syntax highlighting. Add language-aware highlighting with safe rendering, a language allowlist/fallback, copy fidelity and tests.
- [~] Diff-style highlighting is not implemented.
- [~] Longer/nested fence markers and code containing fence markers need explicit regression coverage.
- [~] Verify common language identifiers (text, Python, JavaScript/TypeScript, shell, JSON, YAML, SQL and diff) and preserve source exactly when copied.

## 6. Blockquotes, tables and horizontal rules

- [x] Basic, nested and formatted blockquotes are supported by the Markdown parser.
- [x] GFM tables, column alignment and inline formatting in cells are supported by remark-gfm.
- [~] Escaped pipe characters in table cells need explicit regression coverage.
- [x] Thematic breaks using hyphens, asterisks or underscores are supported by the Markdown parser.

## 7. Escaping and literal characters

- [x] Standard Markdown escaping and code-span/fenced-code literal preservation are supported by the parser.
- [~] Add regression cases for the full escapable punctuation set, backslashes, escaped pipes in tables, and Markdown syntax inside nested code fences.

## 8. HTML in Markdown

- [!] Raw HTML is currently disabled deliberately; arbitrary HTML, scripts, event handlers and embedded frames must not become executable.
- [ ] If product requirements call for HTML-like formatting, design a small explicit allowlist for safe inline tags: strong, em, u, mark, sup, sub, kbd, abbr and br. Sanitize attributes and URL schemes; do not enable unrestricted raw HTML.
- [ ] Add safe, accessible collapsible sections for details/summary if desired, implemented as a controlled feature rather than enabling arbitrary HTML.
- [ ] Add safe HTML table support only if needed; Markdown/GFM tables already cover the common table use case.
- [!] Video/audio tags, picture/source, arbitrary div/span styling and iframe embeds remain disabled/not supported. Any future media support must use explicit safe components and a clear local-vs-remote loading policy.

## 9. GitHub Flavored Markdown and GitHub-specific syntax

- [x] GFM strikethrough, task lists, tables, autolinks and footnotes are supported by remark-gfm.
- [x] GitHub-style NOTE, TIP, IMPORTANT, WARNING and CAUTION callouts are implemented.
- [~] GitHub mention syntax (`@username`) and issue/PR references (`#123`, `owner/repo#123`) are not implemented as GitHub-aware links or notifications. Decide whether Wave should support inert local links or keep them plain text; do not imply GitHub notification behavior.
- [~] Emoji shortcodes are not implemented.
- [~] Add coverage for multiple footnotes, repeated references, backlinks, footnotes inside complex blocks and alert formatting variants.

## 10. Math and LaTeX

- [x] Inline dollar-delimited and display math delimiters/fenced math blocks have a renderer path.
- [~] Current MathML is only a small subset: basic tokens, selected Greek/operators, simple fractions/roots and a single superscript/subscript. It is not a full TeX/LaTeX engine.
- [ ] Support nested expressions, grouped terms, multi-character scripts, aligned equations, matrices, cases, sums, integrals, limits, functions, spacing commands, symbols and the broader LaTeX math grammar shown in the reference.
- [ ] Add a robust parser/renderer strategy and regression suite for malformed input, escaping, delimiter conflicts and large expressions. Keep rendering local/offline and do not execute arbitrary TeX.
- [~] The showcase's quadratic formula and matrix examples are not currently covered by the supported subset; add them when the full math implementation lands.

## 11. Mermaid diagrams

- [~] Only simple flowcharts with `flowchart` direction, simple `-->` edges and square-bracket labels render as SVG.
- [ ] Support Mermaid sequence diagrams.
- [ ] Support Mermaid class diagrams.
- [ ] Support Mermaid entity-relationship diagrams.
- [ ] Support Mermaid state diagrams.
- [ ] Support Mermaid Gantt charts.
- [ ] Support Mermaid pie charts.
- [ ] Support Mermaid git graphs.
- [ ] Expand flowchart syntax: alternate edge types, branches, multiple node shapes, subgraphs, labels, styling, directions, comments and robust layout.
- [ ] Evaluate other useful Mermaid families (mindmaps, timelines, quadrant, requirement and architecture diagrams) and define a supported version/compatibility contract.
- [~] Unsupported Mermaid source currently falls back to readable text; preserve this fallback for invalid/unsupported diagrams and add tests for each supported family and failure path.
- [ ] Add diagram accessibility: meaningful accessible name/description, scalable layout, overflow handling and a non-visual source alternative.

## 12. Other diagram and visualization languages

- [ ] Graphviz / DOT renderer.
- [ ] PlantUML renderer.
- [ ] Vega and Vega-Lite renderers.
- [ ] D2 renderer.
- [ ] AsciiDoc diagram/toolchain support.
- [ ] Define local/offline execution, resource limits, sanitization and fallback behavior for each. These are separate renderer integrations, not core Markdown syntax.

## 13. Emoji and special symbols

- [x] Direct Unicode emoji and special symbols render as ordinary text.
- [~] Emoji shortcode conversion and a documented supported shortcode set are missing.

## 14. Reusable Markdown document template

- [x] A Markdown feature showcase starter template exists.
- [~] The current template demonstrates only a subset of the reference. Expand it after the relevant features ship so it demonstrates all supported syntax and clearly labels unsupported/partial examples.
- [ ] Add a reusable technical learning-notes template matching the reference's introduction, prerequisites, architecture, concepts, implementation, configuration, common issues, best practices and references structure.

## 15. Compatibility, quality and test coverage

- [~] The current E2E suite covers GFM tables/tasks/footnotes/alerts, unsafe HTML handling, simple math, simple Mermaid flowcharts and heading anchors. This is not comprehensive conformance testing.
- [ ] Add a structured compatibility fixture suite covering every example in the supplied showcase, with expected preview DOM and security assertions.
- [ ] Add accessibility checks for headings, anchors, tables, task lists, code controls, images, callouts, math and diagrams.
- [ ] Add cross-browser checks for supported Chromium versions and a documented fallback for browsers without the File System Access API.
- [ ] Add visual regression coverage for long tables, wide code, large diagrams, math overflow, mobile preview and dark/light themes if both are supported.
- [ ] Add round-trip tests proving preview transformations never modify the original Markdown source.
- [ ] Publish a feature-by-feature compatibility matrix that distinguishes CommonMark, GFM, Wave extensions and deliberately unsupported renderer-specific syntax.

## 16. Implementation order proposal

1. Close core compatibility and security test gaps: escaping, links/images, nested lists/fences, duplicate heading IDs, accessibility.
2. Add syntax highlighting and safe inline HTML-like elements only if the allowlist can be kept secure.
3. Replace the limited math token renderer with a complete local math parser/renderer and full regression fixtures.
4. Expand Mermaid coverage across the named diagram families with safe local rendering and accessible fallbacks.
5. Decide whether GitHub-specific mentions/issue references and emoji shortcodes belong in Wave's product contract.
6. Evaluate Graphviz, PlantUML, Vega/Vega-Lite, D2 and AsciiDoc as separately scoped integrations.
7. Add controlled media embeds only with an explicit trust, privacy, offline and accessibility design.
8. Expand the showcase template and complete compatibility/accessibility/browser test coverage.

## Audit conclusion

Wave already has a useful Markdown foundation; it does **not** yet have full parity with the supplied showcase. The largest functional gaps are full LaTeX, advanced Mermaid, syntax highlighting, safe HTML-style presentation/collapsible content, emoji shortcodes, GitHub-specific references, other diagram languages and media embeds. Several already-supported core syntax areas also need broader regression and accessibility coverage.

Do not mark the Markdown feature set complete until each applicable gap is either implemented and tested or explicitly accepted as an intentional product boundary. Keep the full user-provided showcase as the acceptance checklist.


---

## Recheck snapshot — 2026-11-14

Rechecked the current default-branch source at commit `186e7ec3dd817a42a610e51c6a3c4a3d8b3d8f19`. This is a source review plus CI inspection, **not a completed acceptance run**. The implementation has advanced substantially since the original audit, so the original checklist above should be read with this status addendum.

### Present in source now (still subject to regression verification)

- Safe inline presentation shorthands, emoji shortcode conversion, DETAILS disclosure syntax and deterministic duplicate heading IDs.
- Lightweight token coloring for a limited language list and line-based diff coloring; neither is a full grammar-based highlighter.
- A recursive local MathML parser with grouped expressions, fractions, roots, script groups, common operators/functions and selected matrix/cases environments. This remains a TeX subset, not full LaTeX.
- Local SVG renderers for Mermaid flowchart, sequence, pie, class, ER, state, Gantt, git graph, mindmap, timeline, quadrant, requirement and architecture-beta subsets.
- Limited local renderers for Graphviz/DOT, PlantUML, D2, Vega/Vega-Lite and AsciiDoc. These are hand-built subsets, not complete compatible engines.
- Controlled local-workspace audio/video embeds for allowlisted file extensions and MIME checks; remote media is not loaded.
- A technical learning-notes template has been added alongside the Markdown showcase template.
- Markdown preprocessing now protects fenced code while handling wiki links and the explicit local-media syntax; GitHub-style @mentions and issue references are intentionally left as inert text, with no GitHub notification/link behavior.

### Still pending or only partially satisfied

1. **Full syntax/highlighter parity:** the language token highlighter is heuristic; it does not parse language grammars, nested lexical states, or all syntax. Diff coloring is line-prefix based and needs edge-case fixtures.
2. **Full LaTeX compatibility:** the local MathML parser covers useful constructs but not the full TeX grammar, macro system, arbitrary environments, extensible delimiters, broad symbol packages, or all malformed-input cases. The checklist's "complete parser" requirement remains open.
3. **Full Mermaid compatibility:** the added family renderers parse constrained syntax and use simple layouts. They do not establish compatibility with Mermaid's full grammar, styling, all node/edge forms, layout semantics or accessibility behavior. Keep the source fallback.
4. **Other renderer compatibility:** DOT, PlantUML, Vega/Vega-Lite, D2 and AsciiDoc support is deliberately narrow and must not be described as full language support. Add parser/security/limit fixtures for each before considering those entries complete.
5. **HTML policy:** unrestricted raw HTML remains deliberately disabled. Safe Wave shorthands and DETAILS are available, but a general allowlisted HTML-tag parser and HTML-table support are not implemented. This is a product/security boundary, not a bug to bypass.
6. **Media policy:** only supported local asset files are eligible for the controlled audio/video components. Remote media, iframe embeds and arbitrary HTML media remain disabled.
7. **Quality coverage:** accessibility checks, visual regression, cross-browser compatibility, broad Markdown fixture coverage, malformed/oversized renderer input tests, and preview/source round-trip checks remain incomplete.
8. **GitHub references:** mentions and issue/PR references remain intentionally inert plain text. If product behavior changes, define link targets and privacy semantics first.

### CI and regression evidence

- Current browser test source defines **23 Playwright scenarios**; Node test source defines **30 tests**.
- Workflow [43616005399](https://github.com/iamjpsonkar/Wave/actions/runs/43616005399), commit `186e7ec3dd817a42a610e51c6a3c4a3d8b3d8f19`: `npm ci`, all 30 Node tests, TypeScript typecheck and production build passed. Playwright E2E completed with **20 passed and 3 failed** (23 unique scenarios total).
- The three current browser failures are confirmed: (1) the wiki-link test still expects an internal `wave.invalid` href although the renderer produces a `.wiki-link` button; (2) the code-highlighting test calls `toContainText` on a strict locator matching multiple `.syntax-keyword` spans; (3) the Mermaid extended-flowchart test expects `polygon`/`ellipse` SVG elements that the renderer does not emit. These are test/expectation mismatches, not evidence that all related features are correct; the assertions must be corrected and the suite rerun.
- The same run passed the new math examples, the local DOT/PlantUML/Vega-Lite/D2/AsciiDoc renderer scenario, the local-only audio/video scenario and the mindmap/timeline/quadrant/requirement/architecture scenario. These passing scenarios establish only the supplied fixtures, not full language compatibility.
- Do not infer full Markdown showcase parity from the passing typecheck/build or the 20 passing browser scenarios.

### Next acceptance sequence

1. Correct the three known stale/strict E2E assertions against actual rendered behavior and rerun the full browser suite.
2. Resolve every remaining failure in the local media, DOT/PlantUML/Vega/D2/AsciiDoc and extended Mermaid scenarios; require all 23 scenarios to pass.
3. Add dedicated malformed-input, limits, accessibility, preview/source round-trip and cross-browser fixtures.
4. Expand the renderer subsets only where the original showcase acceptance examples still fail; retain explicit fallback/security boundaries.
5. Update this checklist item-by-item only after the corresponding behavior and regression evidence pass.


---

## Current verified status override — 2026-11-14

> This section supersedes stale status statements in sections 1–16 above. The original requirements are retained as acceptance scope; do not interpret the old checkboxes as current implementation status. Status below is based on source review and the checked-in 23-scenario Playwright suite. It is not a claim that the latest CI run has passed.

### Implemented and demonstrated by current source/tests

- [x] CommonMark/GFM baseline: headings, paragraphs, emphasis, inline/fenced/indented code, lists, blockquotes, links, images, thematic breaks, tables, task lists, autolinks and footnotes.
- [x] Hard line breaks, reference links, image alt/title fallback, escaped table pipes, nested list continuation and unsafe javascript: link sanitization have a browser regression scenario.
- [x] Deterministic duplicate heading IDs, Unicode/punctuation heading normalization, safe inline mark/underline/sup/sub/kbd shorthand, emoji shortcode conversion, and preservation of inline/fenced code literals.
- [x] GitHub-style NOTE/TIP/IMPORTANT/WARNING/CAUTION callouts and keyboard-operable DETAILS disclosure blocks.
- [x] Common emoji shortcodes in an explicit small map. Unknown shortcode names remain unchanged.
- [x] Copyable fenced code blocks; source-preserving copy behavior is asserted for the tested Python fixture.
- [x] Line-based diff coloring for added, removed, hunk, header and context lines.
- [x] Local MathML output for the tested quadratic formula, matrices, cases, sums, integrals and limits.
- [x] Local SVG subset renderers for Mermaid flowchart, sequence, pie, class, ER, state, Gantt, git graph, mindmap, timeline, quadrant, requirement and architecture-beta.
- [x] Local subset renderers for DOT/Graphviz, PlantUML, Vega/Vega-Lite, D2 and AsciiDoc.
- [x] Local-only audio/video embeds with extension/MIME checks; remote media paths are rejected by the E2E scenario.
- [x] Local image assets and readable fallback for remote/missing images; external images are not fetched.
- [x] Markdown feature showcase and technical learning-notes template entries exist in src/templates.ts.

### Implemented but only partially satisfied

- [~] Syntax highlighting is heuristic token coloring for a fixed language allowlist, not a real grammar-based parser. Multiline/nested lexical states, language completeness and exact token semantics are not guaranteed.
- [~] Diff highlighting classifies lines by prefix; it is not a complete unified-diff parser.
- [~] Math is a hand-built TeX subset. It handles the tested examples but does not implement arbitrary macros, custom commands, complete aligned environments, full extensible delimiter behavior or the full TeX grammar.
- [~] Each Mermaid family is a constrained parser with simple hand-built layout, not the official Mermaid grammar/layout engine. Passing fixtures prove only those examples.
- [~] DOT, PlantUML, Vega/Vega-Lite, D2 and AsciiDoc are hand-built subsets, not full language/toolchain compatibility.
- [~] The renderer source is retained in a readable fallback for unsupported diagram syntax. More malformed/oversized-input and layout edge-case testing is still needed.
- [~] The Markdown showcase template exists, but it does not yet demonstrate every supported renderer family or every showcase requirement.
- [~] The technical learning-notes template exists, but its current src/templates.ts implementation uses a literal backslash-n join separator rather than real newlines. It is therefore not functionally complete; see WAVE-052 in bugs.md. There is no template-selection E2E test yet.
- [~] Browser coverage currently defines 23 Playwright scenarios. This is useful regression coverage, not a full CommonMark/GFM conformance suite.

### Not implemented or intentionally excluded

- [ ] Full TeX/LaTeX grammar, macro system, arbitrary environments and broad package/symbol compatibility.
- [ ] Full Mermaid syntax, complete layout engine, all node/edge/style directives and specification compatibility.
- [ ] Full Graphviz/DOT, PlantUML, Vega/Vega-Lite, D2 or AsciiDoc implementations.
- [ ] Grammar-based syntax highlighting and robust unified-diff parsing.
- [ ] GitHub @mentions and issue/PR references as actionable links. They are intentionally inert plain text; Wave does not emulate GitHub notifications.
- [ ] General allowlisted raw HTML parsing and HTML-table support. Raw HTML remains disabled; safe Wave-native shorthands and DETAILS are the supported alternative.
- [ ] Remote audio/video, iframe embeds, arbitrary HTML media and remote image loading. Current media support is restricted to local workspace assets.
- [ ] Full accessibility audit for all Markdown elements/diagram types, screen-reader verification, keyboard/focus review and diagram long-description behavior.
- [ ] Cross-browser renderer/preview coverage beyond the current Chromium E2E target.
- [ ] Visual regression coverage for large diagrams, math overflow, wide tables/code, mobile preview and themes.
- [ ] Broad malformed-input, adversarial-size/resource-limit and parser-fuzz coverage for every custom renderer.
- [ ] Dedicated preview/source round-trip tests proving every transformation preserves original Markdown through save/reopen.
- [ ] An exhaustive fixture suite covering every example in the supplied Markdown Feature Showcase.

### Regression evidence and current CI state

- Current test source defines 23 Playwright Chromium scenarios and 30 Node tests.
- The suite includes separate scenarios for CommonMark hard breaks/reference links/escaped tables/safe image fallback; inline extensions and duplicate slugs; quadratic formula/matrices/cases/sums/integrals/limits; multiple Mermaid families; local DOT/PlantUML/Vega-Lite/D2/AsciiDoc; local audio/video; and additional Mermaid families.
- The latest inspected application/source CI run [43616302974](https://github.com/iamjpsonkar/Wave/actions/runs/43616302974), on source HEAD a9dc70170bcbac21bdb7634edbcf63567d34342a, completed with npm ci, all 30 Node tests, typecheck and production build passing; Playwright completed with **20 passed and 3 failed** out of 23 scenarios.
- The three failures are all currently test/expectation blockers, not established renderer defects: (1) wiki-link E2E expects the internal wave.invalid href to remain in preview HTML, but the custom React component correctly renders a button.wiki-link; (2) code-highlighting E2E applies a strict text assertion to a locator matching four .syntax-keyword spans; (3) Mermaid E2E expects polygon/ellipse SVG shapes while the current renderer emits a different SVG structure. The failures reproduced on retry. Update assertions to test user-visible behavior and then rerun; do not weaken feature acceptance criteria.
- Documentation-only commits after a9dc updated the gap and bug registers. Their CI state is separate and must not be treated as a fresh application-source run. No full green browser run is established by this audit.
- No local browser execution was performed during this audit. Source presence and a test definition are not equivalent to a passing test on current HEAD.

### Required follow-up

1. Fix WAVE-052 and add template selection/preview regression coverage.
2. Wait for and inspect CI run 43616302974; fix any remaining failures against actual behavior and rerun.
3. Add accessibility, cross-browser, visual, malformed-input/resource-limit and preview/source round-trip coverage.
4. Keep full language compatibility explicitly partial unless an actual compatible parser/renderer and broader conformance fixtures are adopted.
5. Preserve all original showcase requirements and security boundaries. Do not remove features from the acceptance checklist merely because they are not implemented yet.


---

## Remediation checkpoint — 2026-11-14

The first code/test remediation pass has been committed, but is **awaiting CI verification**:

- [~] WAVE-052 template defect: `src/templates.ts` now joins technical learning-notes sections with actual newlines. A new Playwright scenario selects the template and checks editor line breaks plus preview headings, code fence, table and operational notes. Keep this item partial until CI passes.
- [~] Wiki-link E2E assertion now checks the rendered button and absence of an internal URL anchor.
- [~] Syntax-highlighting E2E assertion now narrows to the expected keyword token.
- [~] Mermaid flowchart E2E assertion now checks visible node labels rather than SVG primitive implementation details.
- Browser suite source now defines 24 scenarios; Node suite source remains 30 tests.
- No local tests were run and no CI result for the new commits has been verified. The previous 20/23 E2E result remains the last verified run.
- This does not close full compatibility or quality gaps. Full TeX/Mermaid and external-renderer compatibility, grammar-based highlighting/diff parsing, comprehensive accessibility, cross-browser/visual checks, malformed/oversized-input limits and preview/source round-trip coverage remain open. Raw HTML and remote media remain deliberate security boundaries; GitHub references remain inert pending a product decision.


## Security regression expansion — 2026-11-14

- Added a Playwright security-matrix scenario covering safe HTTPS/mailto links, mixed-case and unsafe `javascript:`, `data:`, `vbscript:`, and `file:` link schemes.
- The same scenario seeds a local `secret.mp3` fixture and verifies that parent traversal, encoded traversal, absolute paths, Windows-style paths and remote media references never create playable audio/video elements.
- This expands the core link/image/local-media security acceptance coverage; it does **not** establish a complete URL/path security audit or close the remaining compatibility and accessibility gaps.
- Browser suite source now defines **25 scenarios**. No execution result for this new scenario has been verified yet.


## Preview/source round-trip regression — 2026-11-14

- Added an E2E scenario that captures a Markdown source fixture containing hard breaks, links/wiki links, inline and fenced code, escaped table pipes, fenced math, callouts and raw-HTML text.
- The scenario toggles Preview → Edit and asserts the editor value is byte-for-byte identical, reads the saved Markdown file and compares it exactly, then reloads/reopens the workspace and checks the same source again.
- Updated the compatibility guide to describe this regression contract.
- This adds direct coverage for the no-source-rewrite invariant. It does not prove every renderer extension or every malformed input is covered, and it remains unverified until CI executes the scenario.
- Browser suite source now defines **26 scenarios**; Node suite source remains **30 tests**.


## Accessibility and multiline code editor pass — 2026-11-14

- Implemented a **Code block** toolbar action. It wraps selected multiline source in a fenced Markdown block, preserves the selected text, and selects the inserted code; without a selection it inserts a selectable placeholder.
- Added Playwright coverage for multiline code insertion, rendered code contents and clipboard fidelity.
- Added an accessibility smoke scenario for heading levels, named links, table/column headers, task-list checkbox roles, NOTE callout semantics, DETAILS disclosure, and keyboard focus/activation.
- Updated the compatibility guide with the editor action.
- This is focused semantic/keyboard regression coverage, not a complete WCAG audit, automated axe scan, or screen-reader certification. E2E scenarios are defined but not yet run in CI.
- Browser test source now defines **28 scenarios**; Node suite source remains **30 tests**.
