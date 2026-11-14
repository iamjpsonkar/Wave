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
