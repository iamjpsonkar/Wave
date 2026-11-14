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
