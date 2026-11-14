# Wave — Markdown Feature Gaps and Acceptance Checklist

> Reviewed: 2026-11-14  
> Basis: the user-provided Markdown Feature Showcase (20 sections), current renderer/preview source, templates, compatibility guide and checked-in tests.  
> Purpose: one canonical record of implemented subsets, partial compatibility and remaining requirements. This checklist preserves the full agreed scope; implementation order does not authorize dropping requirements.

## Status legend

- [x] Implemented with representative regression coverage in the current source/test suite.
- [~] Implemented as a constrained subset, or present but requiring broader regression/accessibility coverage.
- [ ] Not implemented.
- [!] Deliberately disabled as a security boundary; only reconsider with an explicit allowlist and sanitization design.

## 1. Text formatting and inline elements

- [x] Bold, italic, nested emphasis, strikethrough and inline code.
- [x] Wave-native safe inline shorthands for underline, highlight/mark, subscript, superscript and keyboard-key styling.
- [~] Inline foreground/background colors use six-digit-hex directives and safe React spans; quick presets and remove-formatting are implemented. Block background fills use a safe quote directive. Nested color ranges, Blocks-mode selection and non-Wave rendering remain open.
- [~] These are Wave shorthands, not general HTML-tag support; expand syntax and edge-case coverage only with a safe parsing contract.
- [~] Unicode emoji works; a small explicit emoji-shortcode map is implemented. Unknown shortcode names remain literal.

## 2. Headings, paragraphs and anchors

- [x] Six heading levels, Setext headings, paragraphs and ordinary Markdown line breaks.
- [x] Deterministic heading IDs, including duplicate suffixes and normalization for punctuation/Unicode, with regression coverage.
- [x] Hard line breaks, reference links and preview/source round-trip behavior have representative E2E coverage.
- [~] Expand edge cases for backslash breaks, repeated Unicode/punctuation headings and links targeting duplicate headings.

## 3. Lists

- [x] Ordered, unordered, nested and mixed lists, GFM task lists, list paragraphs and lists containing code are supported by the configured parser.
- [~] Broader regression/accessibility coverage is still needed for deeply nested lists, continuation paragraphs, nested fenced code and ordered-list numbering edge cases.

## 4. Links and images

- [x] Inline, titled, reference-style and automatic URL/email links.
- [x] Heading links, Wave wiki links/backlinks and reference-style link examples.
- [x] Local image assets; readable fallback for remote/missing images; image alt/title fallback.
- [x] Decorative empty-alt images remain hidden from assistive technology; missing informative images expose a named image fallback. Reference-style and linked images preserve alt/title semantics and keyboard-operable links.
- [x] URL-scheme security matrix includes HTTPS/mailto and unsafe javascript/data/vbscript/file schemes; local media path tests include traversal and remote-path rejection.
- [x] E2E coverage verifies decorative empty alt text, named missing-image fallback, real local images, reference-style linked images and keyboard focus. Remote image fetching remains disabled intentionally.

## 5. Code blocks

- [x] Inline code, fenced blocks, tilde fences, indented code and copyable code blocks.
- [x] Editor **Code block** action wraps selected multiline source in a fenced block; without a selection it inserts a selectable placeholder. Regression coverage checks preview and clipboard fidelity.
- [~] Syntax highlighting is heuristic token coloring for a fixed language allowlist, not a grammar-based highlighter. Nested lexical states, complete language coverage and exact token semantics remain incomplete.
- [~] Diff coloring classifies lines by prefix; it is not a complete unified-diff parser.
- [~] Expand coverage for long/nested fence markers, code containing fence markers, common language identifiers (text, Python, JavaScript/TypeScript, shell, JSON, YAML, SQL, diff), and byte-exact copying.

## 6. Blockquotes, tables and horizontal rules

- [x] Basic, nested and formatted blockquotes.
- [x] GFM tables, column alignment and inline formatting in cells.
- [x] Escaped pipe characters in table cells have regression coverage.
- [x] Thematic breaks using hyphens, asterisks or underscores.

## 7. Escaping and literal characters

- [x] Standard Markdown escaping and code-span/fenced-code literal preservation.
- [~] Expand regression coverage to the full escapable punctuation set, backslashes, escaped pipes and Markdown syntax inside nested code fences.

## 8. HTML in Markdown

- [!] Arbitrary raw HTML remains disabled; scripts, event handlers, embedded frames and arbitrary HTML must not execute.
- [x] Safe Wave-native inline shorthands provide mark/underline/sup/sub/kbd presentation without enabling raw HTML.
- [x] Controlled, keyboard-operable DETAILS disclosure syntax is implemented.
- [ ] A general allowlisted/sanitized HTML inline-tag parser for strong, em, u, mark, sup, sub, kbd, abbr and br is not implemented as HTML syntax. Any proposal must sanitize attributes and URL schemes.
- [ ] Safe HTML table support is not implemented; Markdown/GFM tables remain the supported alternative.
- [!] Arbitrary video/audio tags, picture/source, div/span styling and iframe embeds remain disabled. Wave supports controlled local-workspace media components instead; remote media is not loaded.

## 9. GitHub Flavored Markdown and GitHub-specific syntax

- [x] GFM strikethrough, task lists, tables, autolinks and footnotes.
- [x] GitHub-style NOTE, TIP, IMPORTANT, WARNING and CAUTION callouts.
- [~] Multiple footnotes, repeated references, footnotes in complex blocks and alert variants need broader fixtures.
- [~] GitHub @mentions and issue/PR references remain inert plain text; Wave does not create GitHub notifications or actionable GitHub references. Product behavior requires a separate privacy/linking decision.
- [~] Emoji shortcode support is a small explicit map, not GitHub's complete shortcode catalogue.

## 10. Math and LaTeX

- [x] Inline dollar-delimited math, display delimiters and fenced math blocks have a local MathML rendering path.
- [~] The recursive hand-built MathML parser supports tested grouped expressions, fractions, roots, scripts, selected Greek/operators/functions and examples including quadratic formula, matrices, cases, sums, integrals and limits.
- [ ] Full TeX/LaTeX grammar, arbitrary macros/custom commands, complete aligned environments, broad symbol packages, extensible delimiters and package compatibility are not implemented.
- [~] The local math renderer now rejects unbalanced grouping, caps source at 8192 characters, nesting at 48 levels and generated nodes at 2048, with readable source fallbacks and E2E regression coverage. Broader parser-fuzzing, escaping, delimiter-conflict and resource-limit tests remain open. Keep rendering local/offline; never execute arbitrary TeX.

## 11. Mermaid diagrams

- [~] Local constrained SVG renderers exist for flowcharts, sequence, class, entity-relationship, state, Gantt, pie, git graph, mindmap, timeline, quadrant, requirement and architecture-beta examples.
- [~] Flowchart syntax includes selected directions, edge types and node shapes; full branches, subgraphs, styling, comments, layout and grammar compatibility are not implemented.
- [~] Unsupported/invalid syntax retains a readable source fallback.
- [~] Diagram SVGs expose image semantics and source disclosures remain separate keyboard-operable controls. The latest sequence-title accessible-name correction is in commit `268de12338bce554f18e5feef27acbb5e9ea45fe` and awaits CI verification.
- [ ] Full Mermaid grammar/layout compatibility, complete accessibility descriptions, scalable/overflow behavior and comprehensive non-visual alternatives remain open.

## 12. Other diagram and visualization languages

- [~] Local constrained subsets exist for Graphviz/DOT, PlantUML, Vega/Vega-Lite, D2 and AsciiDoc.
- [ ] Full compatibility with those languages/toolchains is not implemented.
- [ ] Add parser/security/resource-limit fixtures and define local/offline execution, sanitization, deterministic fallback and supported-version contracts for each.

## 13. Emoji and special symbols

- [x] Direct Unicode emoji and special symbols render as text.
- [~] A limited explicit shortcode map exists; expand only with a documented supported set and tests.

## 14. Reusable Markdown document template

- [x] Markdown feature showcase starter template exists.
- [x] Technical learning-notes template exists and uses real newline separators. Its selection/preview regression passed in CI run [43618454015](https://github.com/iamjpsonkar/Wave/actions/runs/43618454015).
- [~] Expand the showcase template to demonstrate every supported renderer family and clearly label unsupported/partial syntax.
- [~] Continue aligning the technical-notes template with the full requested structure: introduction, prerequisites, architecture, concepts, implementation, configuration, common issues, best practices and references.

- [~] Inline foreground/background colors use six-digit hex-only Wave directives and are rendered through React spans; palette presets, reset/remove formatting, nested color ranges, block fills and non-Wave rendering remain open.

## 15. Compatibility, quality and test coverage

- [x] Current test sources define 30 Node tests and 29 Playwright Chromium scenarios.
- [x] Representative fixtures cover GFM tables/tasks/footnotes/alerts, unsafe HTML and URL handling, local media path restrictions, math examples, Mermaid families, other local renderer subsets, template selection, multiline code insertion/copy, accessibility smoke behavior and preview/source round-trip.
- [~] Current accessibility tests are focused smoke/regression checks, not a full WCAG audit, axe scan or screen-reader certification. The latest diagram-title accessible-name fix awaits CI.
- [ ] Add a structured compatibility fixture suite for every example in the supplied showcase, with expected preview DOM and security assertions.
- [ ] Add full accessibility checks for headings, anchors, tables, task lists, code controls, images, callouts, math and every diagram family.
- [ ] Add cross-browser checks and document fallback behavior for browsers without File System Access API support.
- [ ] Add visual regression for long tables, wide code, large diagrams, math overflow, mobile preview and supported themes.
- [x] A preview/source round-trip E2E scenario checks exact source across preview toggle, save, disk read and workspace reopen for its fixture.
- [~] Expand round-trip fixtures across every Wave extension and malformed/edge-case input.
- [ ] Publish/maintain a feature-by-feature compatibility matrix distinguishing CommonMark, GFM, Wave extensions and deliberately unsupported renderer syntax.
- [ ] Add malformed/oversized-input, parser-fuzz and explicit resource-limit tests for all custom renderers.
- [ ] Add performance budgets for large Markdown documents/workspaces and complex diagrams.

## 16. Implementation order proposal

1. Complete core compatibility/security coverage: escaped syntax, links/images, nested lists/fences, duplicate anchors, source preservation and accessibility.
2. Improve grammar-based syntax highlighting and unified-diff parsing; preserve safe language allowlists and exact copy fidelity.
3. Expand the local math parser toward the full required TeX grammar, or explicitly document any accepted limits with owner approval.
4. Expand Mermaid family syntax/layout and diagram accessibility while retaining source fallback.
5. Decide whether GitHub mentions/issue references should remain inert or become local/actionable links; define privacy and notification boundaries first.
6. Evaluate Graphviz, PlantUML, Vega/Vega-Lite, D2 and AsciiDoc as separately scoped renderer integrations.
7. Preserve the safe HTML/media policy; only add explicit allowlisted HTML-like syntax or controlled media behavior after security, privacy, offline and accessibility design.
8. Expand the showcase template and complete conformance, accessibility, cross-browser, visual, malformed-input, performance and round-trip coverage.

## Current verification snapshot — 2026-11-14

- Current source/test inventory: 30 Node test definitions and 30 Playwright Chromium scenarios.
- Baseline CI run [43618454015](https://github.com/iamjpsonkar/Wave/actions/runs/43618454015) passed all 30 Node tests, typecheck, production build and all 28 Playwright scenarios. It predates the later diagram-accessibility patch.
- The diagram-accessibility test initially failed because the sequence renderer exposed a generic accessible name; the sequence SVG now uses its Mermaid `title` as its accessible name (commit `268de12338bce554f18e5feef27acbb5e9ea45fe`). Run [43619707243](https://github.com/iamjpsonkar/Wave/actions/runs/43619707243) passed Node, typecheck and build but exposed a stale strict-mode selector in the accessibility smoke test; that selector is narrowed in the current source. Image accessibility/fallback changes and the selector correction are under CI in run [43620153572](https://github.com/iamjpsonkar/Wave/actions/runs/43620153572).
- Source presence and a test definition are not proof of a passing test. Keep full TeX/Mermaid/other-renderer compatibility explicitly partial unless compatible engines and broad conformance fixtures are adopted.
- Security boundaries remain intentional: arbitrary raw HTML, iframe embeds, remote media and remote image fetching stay disabled; local-only controlled media is supported.
