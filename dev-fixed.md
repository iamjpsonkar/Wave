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
