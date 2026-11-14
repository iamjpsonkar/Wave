# Wave — Development Fix Log

> Branch: `main`  
> Updated: 2026-11-14  
> Purpose: record development fixes and code-level changes independently from the QA registers.

## 2026-11-14 — Cross-tab recovery draft provenance

### Problem identified
When a document had an unsaved recovery draft from another browser tab, opening the same document in a second tab could show a generic recovery confirmation. The draft was preserved per tab by the existing WAVE-042 isolation work, but the user was not told which tab owned the candidate draft.

### Changes made
- `src/draftJournal.ts`
  - Added `isCurrentTabDraft()` to identify whether a recovery record belongs to the current browser tab's session-scoped draft identity.
  - Kept existing per-tab write and clear behavior intact.
- `src/App.tsx`
  - Recovery confirmation now distinguishes a draft from **this tab** versus **another browser tab**.
  - The recovery content remains user-confirmed; it is not silently applied.
- `tests/e2e/workspace.spec.ts`
  - Added a cross-tab recovery scenario.
  - The scenario checks that the confirmation identifies the other tab and that declining the draft preserves the originating tab's record.

### Commits
| Change | Commit |
|---|---|
| Expose draft tab ownership | `dfe9f2f142f362cc29ee02b6a0f38a104bd74f11` |
| Identify cross-tab recovery source | `4c945049301ffc73e9059f89299c5a269152d897` |
| Add cross-tab recovery regression test | `2f697f7cc632022e89d5e9c08acd7a2961b0019d` |
| Fix recovery draft TypeScript shape | `3fcea5ca05f1bda3894262cc94a9999a6340a0ab` |
| Correct newline literals in the E2E assertions | `09021ed224f739fd66325bb8f6cc8f1bcca5b142` |

### Current status
- Existing nine browser scenarios passed in the first run of the new suite.
- The new tenth scenario initially failed because its expected test string contained literal backslash-n characters rather than newline characters. This was a test-fixture assertion defect, not evidence of a product failure.
- The test was corrected in commit `09021ed224f739fd66325bb8f6cc8f1bcca5b142`.
- Final CI for that corrected commit is tracked in [dev-build.md](./dev-build.md). Do not classify this change as fully CI-verified until that run succeeds.

### Remaining limitations
- IndexedDB is asynchronous; a process kill before a draft transaction commits can still lose the latest edit.
- Native folder picker permission prompts/revocation, external filesystem fault injection, comprehensive accessibility checks, and actual process termination remain outside current automated coverage.


## 2026-11-14 — Markdown preview extensions

### Scope
Implement a useful, local-first subset of the attached Markdown Feature Showcase while retaining Wave's sanitized preview and avoiding third-party render services.

### Changes
- `src/markdown.tsx`: added inline/display MathML rendering for a small documented LaTeX subset; added local SVG rendering for simple Mermaid flowcharts; added stable heading IDs; added math source preprocessing while keeping fenced code intact.
- `src/App.tsx`: connected heading IDs and custom code rendering to the ReactMarkdown component map.
- `src/styles.css`: added MathML, Mermaid diagram, heading-level, keyboard-key and preview styles.
- `src/templates.ts`: added a Markdown feature showcase starter template.
- `tests/e2e/workspace.spec.ts`: added a browser scenario for inline/display math, Mermaid flowchart rendering and heading anchors.
- Added `docs/MARKDOWN_SUPPORT.md` and updated README, feature map and shipped-features documentation.

### Deliberate boundaries
Raw HTML remains disabled. Advanced Mermaid syntax/diagram families and PlantUML, Graphviz, Vega, D2 and AsciiDoc are not rendered. The math renderer is a small MathML subset, not a complete TeX engine. No external rendering service or network dependency was added.

### Verification
Source changes and the regression scenario are committed, but no local typecheck/build/test run was available during this task. The new browser scenario and current source require a fresh CI run before being marked verified. No test pass is claimed.


## 2026-11-14 — Markdown preview capability expansion

### Implemented
- `src/markdown.tsx`
  - Added deterministic duplicate heading suffixes via per-preview heading counts.
  - Added a small explicit shortcode map for common emoji; unknown shortcodes remain unchanged and inline code is protected.
  - Added safe Markdown inline shorthands rendered as React elements (no raw HTML): `==highlight==`, `++underline++`, `^superscript^`, `~subscript~`, and `[[kbd:Ctrl+K]]`.
  - Added keyboard-operable `> [!DETAILS] Summary` disclosure blocks.
  - Expanded the recursive MathML parser for nested groups, nested fractions/roots, script groups, common Greek/operators and text groups. This remains a limited TeX subset.
  - Added lightweight local token coloring for common code-language identifiers.
  - Added local SVG rendering for basic Mermaid sequence diagrams and pie charts; retained simple flowcharts and safe source fallback for unsupported syntax.
- `src/App.tsx`: creates a fresh duplicate-heading slug counter for each render.
- `src/styles.css`: styles syntax tokens, diagrams, disclosure blocks and inline formatting.
- `src/templates.ts`: expanded the Markdown showcase template with new syntax and diagram examples.
- `tests/e2e/workspace.spec.ts`: added coverage for duplicate heading IDs, emoji, code token colors, sequence/pie diagrams, safe inline syntax, disclosure interaction and nested math.
- Updated `features.md`, `docs/FEATURES.md`, `docs/MARKDOWN_SUPPORT.md` and `README.md` to describe the actual shipped subset and remaining limits.

### Verification
- Workflow [43613680208](https://github.com/iamjpsonkar/Wave/actions/runs/43613680208), commit `679b9eef2b14272356d245553abd218612fd92ce`: `npm ci`, 30 Node tests, TypeScript typecheck and production build passed; Playwright E2E was still running at the time of this log update.
- An earlier E2E run [43613444479](https://github.com/iamjpsonkar/Wave/actions/runs/43613444479) failed while the inline converter function was not yet present in that commit. That failure is not being hidden; the later corrected source is being checked by the newer workflow.
- No full TeX engine, complete Mermaid implementation, PlantUML/Graphviz/Vega/D2/AsciiDoc renderer, unrestricted HTML, or arbitrary media embed was added. Raw HTML remains deliberately disabled.


### Follow-up conformance coverage
- Preserved Markdown image alt text/title and link titles through Wave's local asset/link components; remote images remain unrequested and use the missing-asset fallback.
- Added a Playwright scenario for CommonMark hard breaks, reference links, linked remote-image fallback, escaped table pipes, nested list rendering and unsafe `javascript:` link sanitization.


### CI-driven Markdown corrections
- Heading IDs now run as a rehype transformer after sanitization, so sanitized preview nodes receive stable unique IDs without enabling arbitrary HTML.
- DETAILS disclosure summary extraction now handles parser output where the marker and summary are split into separate child nodes.
- Corrected a malformed MathML parser newline and removed a duplicate math command key detected by CI typecheck.
- Adjusted the existing wiki-link E2E journey to wait for the asynchronous page-list refresh instead of reading the sidebar immediately.


### Final E2E-driven adjustments
- DETAILS disclosure now derives its summary from the first line after the marker and renders the remaining lines as the disclosure body.
- The wiki-link regression scenario now resolves the page by its stable workspace-relative path, avoiding dependence on a title label that can be refreshed separately from the page path.
- The linked-image/reference-link scenario scopes its title assertion to the first matching link because both the text link and linked image correctly share the same reference title.


## 2026-11-14 — Markdown gap remediation started

- Fixed the technical learning-notes template separator in `src/templates.ts`: the template now joins its retained sections with actual newline characters instead of literal backslash-n text.
- Added a dedicated Playwright scenario selecting **Technical learning notes**, asserting real editor line breaks, and checking that headings, the TypeScript code fence, troubleshooting table and operational notes render as separate preview content.
- Corrected three stale/overly strict E2E assertions: wiki links are checked as rendered buttons rather than serialized internal URLs; the syntax-token locator is narrowed; Mermaid flowchart assertions check the intended visible node labels rather than depending on SVG primitive types.
- Code/test commits: `b8e936b707d9f8c2d78a88991943b7a57c705689`, `65f62060152596d160f66effebcf17a274edc80b`, `f633ccc75c9afb9d3ab7529b489e557d7ae9f8c8`, `5d6b16d18e552c79f11dd6471c47aeab54662f47`.
- Verification status: **not yet verified**. No local test runner is available through this GitHub-only editing path, and no successful CI run for these commits has been inspected. Keep WAVE-052 in `bugs.md` until the new template E2E test passes in CI. The other remaining feature-gap items are still open.


## 2026-11-14 — Markdown URL and media path security regression

- Added a dedicated Playwright security matrix for HTTPS/mailto allow cases and unsafe `javascript:`, `data:`, `vbscript:`, `file:`, and mixed-case JavaScript schemes.
- Added local media path cases for parent traversal, percent-encoded traversal, absolute paths, Windows-style paths and remote URLs. The test creates a local sentinel media file to ensure rejected paths cannot expose it as playable media.
- Updated `docs/MARKDOWN_SUPPORT.md` to state the URL sanitization and single-filename local-assets contract.
- This is regression coverage, not a source-code security fix. Browser suite source now defines 25 scenarios. Execution and CI verification are pending; no bug is marked fixed by this change.


## 2026-11-14 — Preview/source round-trip regression

- Added an end-to-end source-preservation scenario in `tests/e2e/workspace.spec.ts`.
- The fixture includes hard breaks, ordinary and wiki links, inline/fenced code, escaped table pipes, fenced MathML input, a callout and raw-HTML text. It checks exact editor-source equality after Preview → Edit, exact saved-file bytes, and exact content after workspace reload/reopen.
- This is a test-coverage addition, not a runtime code change. The source round-trip invariant is not marked fully verified until the scenario passes in CI.


## 2026-11-14 — Multiline code blocks and accessibility smoke coverage

- Added a dedicated editor toolbar action, **Code block**, in `src/App.tsx`. With a selection it wraps the selected text (including multiple lines) in triple-backtick fences and keeps the code selected; without a selection it inserts a `Write code here` placeholder inside the fence.
- Added Playwright coverage for multiline TypeScript/JavaScript-style source insertion, preview rendering and exact clipboard contents.
- Added semantic accessibility coverage for heading levels, link names, table headers, task checkboxes, NOTE callout role/name, DETAILS disclosure, and keyboard focus/activation.
- Updated `docs/MARKDOWN_SUPPORT.md`. This is not a complete WCAG audit; runtime behavior remains pending CI execution.


## 2026-11-14 — CI Playwright assertion fixes

- Corrected strict-mode selectors in syntax highlighting and Mermaid ER diagram tests.
- Scoped the Technical Learning Notes template choice to the sidebar template list and corrected assertions to expect actual newline characters.
- Changed the accessibility table-header assertion to inspect rendered `thead th` elements directly; follow-up CI will determine whether any runtime semantic fix is needed.
- These changes repair test assumptions; they do not mark Markdown renderer features or accessibility gaps complete.


- CI follow-up: after the first selector fixes, Actions run `43618259567` passed Node, typecheck and build and reached **27/28 Playwright scenarios**. The remaining template failure was a strict locator across all H2 headings; changed the test to locate the two expected level-2 headings by accessible name. Commit: `026b0bdee17d05278dbf616afd4b4a323df264cd`. Final CI verification pending.


## Markdown diagram accessibility — 2026-11-14

- **Issue:** Diagram wrappers carried `role="img"` while also containing a keyboard-operable `<details>` source disclosure. The image role can flatten descendants in accessibility APIs and make the disclosure unavailable to assistive technology.
- **Change:** Moved `role="img"` and the accessible name onto the SVG for all 15 local diagram renderers. The wrapper remains a normal container; the visible source disclosure remains a separate semantic control.
- **Regression:** Extended the accessibility E2E scenario to verify a named sequence-diagram image, focus and Enter activation of **View diagram source**, and readable original source text.
- **Related behavior retained:** The Code block toolbar action already supports selected multiline text, a placeholder when no selection exists, fenced preview rendering and clipboard fidelity.
- **Verification:** Awaiting CI for the implementation and test commits. This is not a full WCAG audit or screen-reader certification.


## 2026-11-14 — Mermaid sequence accessible name correction

- Diagram SVG image semantics were moved off the wrapper so the separate **View diagram source** disclosure remains available to assistive technology.
- CI revealed that the sequence renderer still used a generic accessible name even when the Mermaid source supplied a `title`. Updated it to use `linesTitle(source)`, matching the other titled diagram families.
- Source commit: `268de12338bce554f18e5feef27acbb5e9ea45fe`.
- The regression scenario expects the title **Checkout sequence** and verifies that the source disclosure can be opened with the keyboard.
- Verification is pending the E2E result for [run 43619577306](https://github.com/iamjpsonkar/Wave/actions/runs/43619577306). Do not classify the accessibility improvement as CI-verified until that run passes.

 
## 2026-11-14 — Markdown image accessibility and fallback semantics

- **Issue:** A missing image rendered as an ordinary text span, so screen readers did not receive image semantics. Empty alt text was also replaced with a generic visible fallback, incorrectly turning decorative images into announced content.
- **Change:** `LocalMarkdownImage` now preserves explicit empty alt text, assigns image semantics and an accessible name to informative missing-image fallbacks, and keeps decorative missing images hidden from the accessibility tree. Loaded images use the Markdown alt text (or title only when alt is omitted).
- **Regression:** Added Playwright coverage for a real local image, empty-alt decorative image, missing informative/decorative images, reference-style linked image metadata and keyboard focus on the wrapping link. Also narrowed an existing DETAILS summary selector after CI exposed a strict-mode collision with the diagram source disclosure.
- **Verification:** Source and regression coverage committed; CI is pending. See `features-gap.md` and `dev-build.md` for the current acceptance and CI record.


## 2026-11-14 — Math parser malformed-input and resource limits

- **Issue:** The local recursive MathML parser accepted unbalanced grouping and had no explicit source-size, recursion-depth or generated-node budget.
- **Change:** Added preflight brace-balance validation, an 8192-character source limit, a 48-level nesting limit and a 2048-node generation budget. Invalid or over-limit expressions render a visible, bounded source fallback rather than attempting unbounded MathML construction.
- **Regression:** Added a Playwright scenario for unbalanced fractions, deeply nested groups and oversized expressions. Also tightened the existing DETAILS keyboard test selector to target Wave's own disclosure, and updated the linked-image assertion to inspect the accessible fallback element.
- **Verification:** CI pending for this change; see `dev-build.md`. This is targeted hardening, not complete TeX conformance or comprehensive parser fuzzing.


## 2026-11-14 — Settings and workspace appearance preferences

- **UI gaps addressed:** UI-001 (unavailable Settings destination) and UI-012 (appearance/typography controls).
- Replaced the inert sidebar Settings label with a dialog that opens/closes by keyboard and pointer. Added workspace-persisted system/light/dark theme, font family, text size, line spacing, content width and reduced-motion preferences using the existing `.wave/settings.json` store.
- Added local-first explanation, save/recovery status and basic workspace page/folder counts. Reset affects preferences only; document and recovery data are not touched.
- Editor and Markdown preview share the configured writing measure and typography. Added dark-theme and system-dark styling for core workspace surfaces.
- Added Playwright regression for control behavior, settings-file persistence and workspace reload/reopen.
- Files: `src/App.tsx`, `src/styles.css`, `tests/e2e/workspace.spec.ts`, `ui-gaps.md`, `docs/FEATURES.md`.
- Verification: awaiting GitHub Actions for this patch; no test pass is claimed. Full contrast review, broader workspace diagnostics and remaining UI gap IDs stay open.

- Follow-up hardening: Settings now contains keyboard focus while open, supports Escape dismissal, and reports preference-save completion/failure. The centered writing measure (860px default with width choices) also partially addresses UI-003; responsive and wide-content review remains open.

- Final register reconciliation: UI-001 and UI-012 now describe remaining scope without stale claims that Settings is wholly unavailable; UI-003 is explicitly partial. The Settings E2E also covers Escape dismissal.


## 2026-11-14 — Toolbar code icon distinction and dark-theme parity

- UI-004: changed inline-code and fenced-code controls from duplicate `Code2` icons to `Code2` and `FileCode2`; gave each a unique accessible name and title. Added E2E assertions for icon identity and insertion behavior.
- UI-016/UI-017: added explicit dark and system-dark Markdown preview colors for headings, fenced/inline code, links, blockquotes, tables and dividers.
- UI-018/UI-019: added dark styling for Edit/Preview segmented controls, Backup, toolbar controls and the sidebar wordmark.
- UI-020 remains partial: a system-dark Preview regression slice was added, not the complete theme/mode/viewport visual matrix. Other toolbar actions and remaining UI gaps remain open.
- Verification pending CI; no test pass claimed.


## 2026-11-14 — UI-020 theme and responsive regression foundation

- **Gap:** Dark-theme Markdown and workspace surfaces were only partially covered; there was no full Light/Dark/System × Edit/Preview × desktop/mobile regression matrix.
- **Change:** Added theme-aware styles for callouts, DETAILS disclosures, math/fallbacks, diagram surfaces, syntax/diff tokens, missing-image fallbacks, copy controls and Settings dialog controls. Light mode remains independent of the operating-system dark preference.
- **Regression:** Added a 12-state Playwright matrix using representative headings, links, inline/fenced code, tables, alerts, disclosures, math, Mermaid and missing-image fallback content. It checks computed colors/surfaces and horizontal overflow at desktop and mobile widths.
- **Files:** `src/styles.css`, `tests/e2e/workspace.spec.ts`, `ui-gaps.md`, `dev-fixed.md`, `dev-build.md`, `DEV_CONTEXT.md`.
- **Verification:** CI pending. This is not a full screenshot-diff or WCAG contrast audit; UI-005, UI-014 and remaining UI-018/UI-019 reviews remain open.

 
## 2026-11-14 — Editor productivity and remaining UI implementation batch

- Added `src/EditorEnhancements.tsx`: bounded per-page in-memory undo/redo history (200 snapshots), editor-local find with case matching and next/previous navigation, literal replace/replace-all, Markdown heading outline with Edit/Preview navigation, and live word/Unicode-character/reading-time statistics.
- Integrated the component through the existing autosave/recovery-aware `handleEditorChange` path. A follow-up corrected history bookkeeping after undo/redo and made replacement strings literal rather than interpreting replacement metacharacters.
- `src/App.tsx`: added clickable workspace/folder breadcrumbs, polite live save status, searchable template gallery, preview-before-create dialog, Escape dismissal and explicit accessible names for primary toolbar controls.
- `src/styles.css`: improved functional text sizing, visible focus rings, mobile layout at narrow widths, template preview surfaces, productivity panel styles, secondary-surface dark-theme parity and System-light overrides.
- `tests/e2e/workspace.spec.ts`: added regressions for editor productivity, template search/preview and nested folder breadcrumbs. Expanded UI-020 from 12 to 30 theme/mode/viewport states (320, 390, 768, 1024, 1440) and added 4.5:1 body/heading contrast assertions.
- UI-002 remains open: this batch does not pretend that a textarea plus Markdown insertion helpers is a full optional block editor. UI-005, UI-018/UI-019 and other visual/accessibility review items remain pending CI and manual audit.
- E2E source inventory: 37 scenarios; Node test source: 30 tests. No test/typecheck/build/CI pass is claimed.
- Relevant implementation commits include `103c0796e7816553b2864a639e132dd1edde2a35` (new editor component), `0e4bc6b89344f1a09c880322797eff8d9ff60f28` (integration), `2913af688afc024af3739b3980284e5476547273` (breadcrumbs/status), `cb278bce391d0c3a116724496bde88f385ef3a0c` / `ee9ba2c16d0c65e136b2e081c5545c75a0424d21` (template search/preview), and `a1ca18cbb2e987e2725de241e4807a7e01627bf8` (contrast regression).

 
## 2026-11-14 — Source-preserving Markdown block mode (UI-002)

- Added `src/MarkdownBlockEditor.tsx`, an optional Blocks mode alongside the existing source textarea and Preview.
- The parser identifies headings, paragraphs, lists, quotes, NOTE/TIP/IMPORTANT/WARNING/CAUTION/DETAILS callouts, fenced code, tables, dividers, image lines and attachment links.
- Editing a block replaces only its original source range. Untouched blocks, Markdown syntax and blank-line separators are retained. The original source editor and Preview remain available.
- `src/EditorEnhancements.tsx`: added a distinct Blocks control/icon; undo/redo keyboard shortcuts also work when focus is inside a block textarea.
- `src/App.tsx`: integrated block mode without changing the local Markdown storage format or the existing recovery-aware change handler.
- `src/styles.css`: added responsive block surfaces and light/dark/system styling, including a System-light correction.
- Added Playwright coverage that edits one paragraph block and checks the exact full source after switching back, including heading, list, callout and fenced code blocks.
- **Status: partial implementation; CI pending.** Drag/drop/reordering, block handles, slash menu, bookmarks/embeds and rich inline formatting remain open. This is not full feature parity with a rich block editor.
- E2E source inventory: **38 scenarios**; Node test source: **30 tests**. No test/typecheck/build/CI pass is claimed.
- Commits: component `78e2887d069b6471610b23f341d5178a02c3e12b`; App integration `15928f7956e2fae4934e730a4c99e0eee3cf97ea`; styling `5ff104ba9f1315b13cc5b40f4dad59f47ea4fcbe`; E2E `2c95631c21f27faad50f4f49bb038a4c7bdb1b1d`; parser fixes `4c418ae633bc7bb986469a88cfc2c60d4041368a` and `cc6809086922947ae4f32e4eaf47257f93c66073`.

 
- Follow-up: block grouping now keeps list and quote/callout blocks distinct; heading outline jumps to the corresponding block textarea; block mode uses a distinct Blocks icon and System-light block labels remain readable. Undo/redo shortcuts are enabled while a block textarea is focused.
- The block-mode E2E now also exercises Undo and Redo before asserting the exact Markdown source. Latest follow-up commits: `03c572edd64fb6924d0bbda706dbf840f44bef26` (outline navigation), `30be50f3afae887386eba1f86faf2d855207c925` (undo/redo regression), `6c9cb3f7b0862fd20253da75a10c263fe215add3` (icon), `41c8adefd98ef00d5ba38867a0e828cd626554a8` (System-light block styling).

 
- UI-020 regression follow-up: corrected the RGB channel parser used by the 4.5:1 computed body/heading contrast assertions. This repairs the test helper; it is not a claim that the contrast matrix passed. Commit: `ffc3be4ae9026ce76148ce3fbcaa86b4be0e0f73`.


## 2026-11-14 — UI-002 block controls and UI-018 focus containment

- src/MarkdownBlockEditor.tsx: added keyboard up/down reorder controls, draggable handles, delete controls and an Add block menu for paragraph, heading, list, quote, callout, fenced code and divider blocks. Reordering retains the original block Markdown and whitespace separators; source editor remains canonical.
- src/App.tsx: added Tab/Shift+Tab focus containment to template preview and command palette; template preview focuses its close button when opened.
- src/styles.css: added theme-aware block controls, drag affordance and focus-visible treatment.
- tests/e2e/workspace.spec.ts: added block keyboard/drag reorder and insertion coverage; extended template preview focus-wrap coverage. E2E source count is **39**, Node source count remains **30**.
- Commits: 9e4f29390447dcdbd43f80098da522385a270448, 7057ce25861bffce43ee05ce5f8afb305ae1d0e8, 290f926c92caffe64d2ac34f1eea483df015f464; tests 8bb74c69ec4c9adad7d59c0e34e869224742fa42, f292e32e853fce640d44f05f554ee4bce1cbba72, b90369be8ef6ba66ab95f84e5f609b406afd87f7; styles 6bbd015307f55a0e385b6f041d383bdb07e6e87c, 93bdd45f2fe17bda2375cb0a41c8f2f7f9e6ca62.
- Remaining: slash-triggered block menu, bookmarks/embeds, rich inline block editing, dialog focus restoration and comprehensive visual/accessibility audit.
- Verification: no local tests/typecheck/build/screenshot review. Combined status and associated workflow-run lookup for latest source commit returned empty arrays. **No pass is claimed.**
