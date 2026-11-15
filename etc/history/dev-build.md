# Wave — Development Build and CI Log

> Branch: `main`  
> Updated: 2026-11-14  
> Purpose: track build, typecheck, unit-test, browser-test and CI outcomes for development commits.

## Latest development verification

<badge>Success</badge>

- Commit: `09021ed224f739fd66325bb8f6cc8f1bcca5b142`
- Change: corrected newline literals in the new cross-tab recovery E2E test.
- Workflow run: [43604242348](https://github.com/iamjpsonkar/Wave/actions/runs/43604242348)
- Final result: **success**.
- The previous run on commit `3fcea5ca05f1bda3894262cc94a9999a6340a0ab` passed install, 30 Node tests, TypeScript typecheck and production build, but failed one of ten Playwright scenarios because the new test expected literal backslash-n text instead of actual newlines.

## Recent CI history

| Workflow run | Commit | Result | Evidence |
|---|---|---|---|
| [43604242348](https://github.com/iamjpsonkar/Wave/actions/runs/43604242348) | `09021ed224f739fd66325bb8f6cc8f1bcca5b142` | Success | Corrected cross-tab recovery E2E newline expectations; all 10 browser scenarios passed |
| [43604083783](https://github.com/iamjpsonkar/Wave/actions/runs/43604083783) | `3fcea5ca05f1bda3894262cc94a9999a6340a0ab` | Failed | 30 Node tests, typecheck and production build passed; 9/10 browser tests passed; new test failed on incorrect expected newline escaping |
| [43604046025](https://github.com/iamjpsonkar/Wave/actions/runs/43604046025) | `ec50e76948ec1c16ea189f8ca9927a6d1fe94749` | Failed | Typecheck caught missing `tabId` in the local recovery-draft TypeScript shape; fixed in a subsequent commit |
| [43604040043](https://github.com/iamjpsonkar/Wave/actions/runs/43604040043) | `f8812c8b91f9143a718febb7d7b51e19e36542cd` | Failed | Typecheck caught the same recovery-draft TypeScript shape issue; 30 Node tests passed |
| [43603278555](https://github.com/iamjpsonkar/Wave/actions/runs/43603278555) | `b11b46eebc1558de9910d8523cdaa027817b087d` | Passed | 30 Node tests, 9 Chromium E2E tests, typecheck and production build passed |

## Current automated suite

Latest successful run (commit `09021ed224f739fd66325bb8f6cc8f1bcca5b142`):
- Node storage/concurrency tests: **30 passed**.
- Playwright Chromium E2E: **10 passed**.
- TypeScript typecheck: passed.
- Production build: passed.

The cross-tab recovery prompt scenario brings the browser suite to **10 scenarios**; all 10 passed in run 43604242348.

## Verification policy

- Record the exact commit SHA with every CI result.
- Distinguish queued/in-progress, failed and successful runs.
- A passing unit suite does not imply browser tests passed.
- A passing browser suite does not establish native picker, external-editor, accessibility or OS process-termination behavior unless those scenarios are explicitly included.
- Do not treat an earlier successful run as verification of later commits.


## 2026-11-14 — Markdown preview extension changes (awaiting CI)

- Source additions: MathML subset, simple Mermaid flowchart SVG, heading anchors, Markdown showcase template and E2E regression scenario.
- Current test source count: 30 Node tests and 14 Playwright Chromium scenarios.
- **Latest attempted run:** [43612461372](https://github.com/iamjpsonkar/Wave/actions/runs/43612461372) on `7c901be191fbceb05c0c7458925ed3088bfe660b` passed `npm ci` and all **30 Node tests**, then failed typecheck because the shared Markdown component props omitted `className`. The type definition was corrected in `035e442a90d7e8cb48b88e4e9df93971a1bcaa24`. Follow-up run [43612488927](https://github.com/iamjpsonkar/Wave/actions/runs/43612488927) passed `npm ci`, all 30 Node tests, typecheck and production build; Playwright browser installation/E2E was still in progress at the latest check. The newer run [43612554015](https://github.com/iamjpsonkar/Wave/actions/runs/43612554015), on the documentation/priority checkpoint commit `983055ca882936345a37abbf8de5b9a90a0ea9fc`, had passed install, Node tests and typecheck; build and E2E were still in progress. Do not mark the feature fully verified until the latest run completes successfully.


## 2026-11-14 — Markdown showcase gap audit

- Compared the complete user-provided 20-section Markdown Feature Showcase with the current renderer, preview integration, styles, templates, compatibility guide and E2E test source.
- Created [features-gap.md](../product/markdown-coverage.md) as the canonical remaining-scope checklist. It distinguishes shipped syntax, partial support, missing renderer capabilities, deliberate HTML/media security boundaries and missing conformance/accessibility coverage.
- This was a source/documentation audit. No application code changed and no local test suite was run for this audit. Existing historical CI results do not establish that the Markdown showcase is fully implemented.


## 2026-11-14 — Markdown preview capability expansion

- Current source adds unique heading IDs, safe inline formatting shorthands, DETAILS disclosure blocks, common emoji shortcodes, lightweight local syntax coloring, recursive MathML for a limited TeX subset, and local Mermaid sequence/pie rendering.
- Added two Playwright E2E scenarios. Current browser suite source now contains **17 scenarios**; Node test source remains **30 tests**.
- Workflow [43613680208](https://github.com/iamjpsonkar/Wave/actions/runs/43613680208), commit `679b9eef2b14272356d245553abd218612fd92ce`: npm ci, 30 Node tests, TypeScript typecheck and production build passed. Browser dependency install/E2E were still in progress at last inspection.
- Earlier workflow [43613444479](https://github.com/iamjpsonkar/Wave/actions/runs/43613444479), commit `3ca2155da1f9eb3a9e6419923f9971d05713b9a4`, passed Node tests/typecheck/build but failed 3 E2E scenarios while the inline preprocessing helper was missing from that intermediate commit. The helper was added afterwards; use the newer run for final browser verification.
- Do not claim E2E passed until a workflow containing the corrected source and the added scenarios completes successfully.


### CI follow-up and corrections
- [43613680208](https://github.com/iamjpsonkar/Wave/actions/runs/43613680208), commit `679b9eef2b14272356d245553abd218612fd92ce`: Node tests, typecheck and build passed; E2E failed 4 scenarios. Failures exposed heading IDs being applied at the wrong rendering stage, DETAILS summary extraction edge cases, and a sidebar list timing assumption in the existing wiki-link journey. Fixes were made in `3def36d`, `4f9a52f` and `161127f` and await a fresh full run.
- [43613868330](https://github.com/iamjpsonkar/Wave/actions/runs/43613868330), commit `ec4214d1de13e0f8a8195e5ed9186564db2084a0`: 30 Node tests passed; typecheck caught an incorrectly escaped source newline in the MathML parser. Corrected in `b8c7d550f1b56b66687e7c1b2833386f5f23d179`.
- [43614011077](https://github.com/iamjpsonkar/Wave/actions/runs/43614011077), commit `4f9a52f275aba0ae70d6add8e89bbeb6e1fcd8d5`: 30 Node tests passed; typecheck caught a duplicate `neq` key in the math command map. Corrected in `1df330599916a9d657e83838b03231bd39296ae5`.
- The newest full CI run for commit `1df330599916a9d657e83838b03231bd39296ae5` is queued/in progress; do not claim a complete pass until it finishes.

- Added the final Markdown conformance scenario for hard breaks, reference links/images, title/alt retention, escaped table pipes, nested lists and unsafe URL sanitization; browser suite count is now 17.


### Latest Playwright feedback and follow-up
- Workflow [43614071812](https://github.com/iamjpsonkar/Wave/actions/runs/43614071812), commit `1df330599916a9d657e83838b03231bd39296ae5`: all 30 Node tests, typecheck and production build passed; **14/17 Playwright scenarios passed**. Three E2E failures were: wiki-link scenario assumed a document title would remain in the sidebar after creating another page; DETAILS summary parsing included the marker/body in the summary; and a reference-link selector matched both the text link and linked image.
- Follow-up changes: DETAILS now extracts the first line as the disclosure summary; wiki-link E2E uses the page's stable workspace path rather than depending on the transient title label; reference-link assertion selects the first matching link. Commits: `9648f202c23d5771799dd3f59e30800ce20df6c0`, `d3c4da59c8796a42e7e3acc378a5bdac53e99c8b`.
- These corrections require the latest workflow to complete before the browser suite can be considered passing.


## 2026-11-14 — Markdown gap recheck

- Source revision audited: `186e7ec3dd817a42a610e51c6a3c4a3d8b3d8f19`.
- Workflow [43616005399](https://github.com/iamjpsonkar/Wave/actions/runs/43616005399): install passed; **30/30 Node tests passed**; TypeScript typecheck passed; production build passed; Playwright E2E **failed with 20 passed / 3 failed**.
- Remaining E2E failures:
  1. Wiki-link journey asserts the serialized `wave.invalid` URL, but the rendered wiki link is a Wave button. Assert the actual accessible button behavior instead.
  2. Syntax-highlighting test applies a strict assertion to multiple `.syntax-keyword` spans. Narrow the locator to the expected token or assert the collection.
  3. Mermaid flowchart test expects `polygon` and `ellipse` elements, but the current local renderer uses different SVG primitives. Assert the intended labels/edges and actual output shape.
- The same run passed the supplied math, local DOT/PlantUML/Vega-Lite/D2/AsciiDoc, local audio/video, and additional Mermaid-family fixtures. These tests validate only their examples, not full spec compatibility.
- Browser suite source contains **23 unique scenarios** (the run executed 20 successfully and 3 failed). Node suite contains **30 tests**.
- The gap audit is updated in [features-gap.md](../product/markdown-coverage.md); the compatibility contract is aligned in [docs/MARKDOWN_SUPPORT.md](../engineering/MARKDOWN_SUPPORT.md). No application code or failing E2E assertions were changed in this recheck.
- Do not call the Markdown showcase complete. Remaining work includes fixing the three E2E failures, expanding accessibility/conformance/round-trip/browser coverage, and documenting the strict limits of the local TeX/Mermaid/other-format renderers.


## 2026-11-14 — Markdown gap remediation CI checkpoint

- Source changes: technical learning-notes template now uses real newline separators; a new template-selection/preview E2E scenario was added; the three known stale/strict Markdown E2E assertions were revised to test rendered user-visible behavior.
- Browser test source now defines **24 scenarios** (23 existing scenarios plus the new template regression). Node test source remains **30 tests**.
- Relevant code/test commits: `b8e936b707d9f8c2d78a88991943b7a57c705689`, `65f62060152596d160f66effebcf17a274edc80b`, `f633ccc75c9afb9d3ab7529b489e557d7ae9f8c8`, `5d6b16d18e552c79f11dd6471c47aeab54662f47`.
- No local test execution was possible in this session. The GitHub workflow run for these commits has not yet been retrieved, so install, Node tests, typecheck, build and all 24 E2E scenarios are **unverified**. Do not infer success from the commits or test definitions.
- The three old E2E assertion blockers have been corrected in source, but a fresh green browser run is required. WAVE-052 remains in `bugs.md` until the new regression scenario passes.
- This is an initial remediation checkpoint, not completion of `features-gap.md`. Full TeX/Mermaid/other-language compatibility, accessibility, cross-browser, visual, malformed-input/resource-limit and source-round-trip work remain open.


## 2026-11-14 — URL and local media security matrix (awaiting CI)

- Added one Playwright E2E scenario covering allowed HTTPS/mailto links, unsafe URL schemes (including mixed-case JavaScript), and local media path traversal/absolute/Windows/remote path rejection.
- Browser test source count: **25 scenarios**. Node test source remains **30 tests**.
- Updated the Markdown compatibility guide with the intended URL sanitization and local-asset resolution contract.
- No local execution or CI run for this commit has been inspected. Treat the new scenario as defined, not passed. No application runtime code changed in this step.


## 2026-11-14 — Preview/source round-trip coverage (awaiting CI)

- Added one Playwright E2E scenario that asserts exact Markdown equality across preview toggling, completed save, on-disk file read and workspace reload/reopen.
- Fixture covers hard breaks, links/wiki links, inline and fenced code, escaped table pipes, fenced math, callouts and raw-HTML source text.
- Browser test source count: **26 scenarios**; Node test source remains **30 tests**.
- No local test execution or CI run for this change has been inspected. Treat the scenario as defined, not passed.

- Follow-up test-fixture correction: the round-trip test's array join now uses an actual newline separator (not a literal backslash-n). Corrected in `031a0e2427a6669312d643e14275a3ebd1ce04db`; fetched source was rechecked to confirm `.join('\n')`.


## 2026-11-14 — Multiline code blocks and accessibility tests (awaiting CI)

- Runtime change: `src/App.tsx` adds an accessible **Insert code block** toolbar action that wraps selected multiline text in fenced Markdown, or inserts a selected placeholder when no text is selected.
- Added two Playwright scenarios: multiline insertion/render/copy fidelity, and accessibility semantics/keyboard-operable disclosure coverage.
- Browser test source count: **28 scenarios**; Node test source remains **30 tests**.
- No local test execution or CI run has been inspected. Treat these scenarios as authored, not passed. The accessibility check is a focused smoke test, not full WCAG conformance.


## 2026-11-14 — CI failure triage and Playwright assertion corrections

- Inspected failed Actions run `43617787871` (`91e9ffb8`). Node tests, TypeScript typecheck and production build all passed; the Playwright step failed.
- Root causes were test-side assumptions/selectors, not build or runtime errors:
  - Syntax-highlighting assertion matched four keyword spans instead of selecting the exact Python `def` token.
  - Template picker assertion matched both the sidebar template and a second button; scoped it to `.sidebar-templates`.
  - Template source assertions expected literal backslash-n text rather than actual newline characters.
  - Mermaid ER label assertion matched both the CUSTOMER entity label and its attribute-block source label; narrowed to exact text.
  - Accessibility smoke test now inspects the actual `thead th` header cells rather than relying on Playwright's columnheader role mapping in this environment.
- Correction commit: `44d78ebc1ba6734caa75cb52d20bbb1ee1a5e6d8`.
- New CI run: https://github.com/iamjpsonkar/Wave/actions/runs/43618259567. At log update time it was queued; no passing result is claimed.


- Follow-up run `43618259567` on correction commit `44d78ebc`: Node tests, typecheck and production build passed; Playwright improved to **27/28 passed**. The only remaining failure was another strict-mode locator in the template scenario: the test searched all H2 elements when it meant to find the named Introduction heading.
- Fixed by selecting level-2 headings by accessible name (Introduction and Open questions) in commit `026b0bdee17d05278dbf616afd4b4a323df264cd`.
- New verification run: https://github.com/iamjpsonkar/Wave/actions/runs/43618423075 (queued at time of update). Pipeline is not yet confirmed green.


## Markdown diagram accessibility follow-up — 2026-11-14

- Implementation commit: `052840f834f879e54ac32567aecc3e4c7a0cad13` (15 diagram SVGs now own their image role and accessible name; disclosure controls remain outside the image role).
- Regression test commit: `ed34c50b6f21c134d762786f869801785b2452d3` (sequence-diagram accessible name plus keyboard-operated source disclosure and source text assertion).
- Updated `docs/MARKDOWN_SUPPORT.md` and `features-gap.md`; development fix recorded in `dev-fixed.md`.
- The preceding baseline workflow [43618454015](https://github.com/iamjpsonkar/Wave/actions/runs/43618454015) passed all CI steps, including Playwright. It predates these changes and is not verification of this patch.
- **Current patch status:** no local test execution available through the GitHub repository connection; new CI run must pass before this accessibility correction is treated as verified.


## QA register reconciliation and diagram accessibility CI — 2026-11-14

- Reconciled `bugs.md` to only the two remaining open findings: WAVE-031 and WAVE-039. Corrected current suite counts to 30 Node tests and 28 Playwright scenarios; separated native permission/lifecycle coverage gaps from completed simulated coverage.
- Reconciled `fixed-bugs.md`: retained all 50 historical WAVE IDs and their recheck scenarios; added an authoritative current verification addendum. WAVE-052 remains fixed based on the successful 28-scenario baseline.
- Rebuilt `features-gap.md` as one current Markdown acceptance checklist. All 16 topic groups and original requirement families remain; stale contradictory audit snapshots were consolidated, not used to drop scope.
- Diagram accessibility CI runs [43618788566](https://github.com/iamjpsonkar/Wave/actions/runs/43618788566) and [43618840380](https://github.com/iamjpsonkar/Wave/actions/runs/43618840380) failed the newly added accessibility assertion: sequence SVG accessible name was generic rather than using its Mermaid title.
- Corrected in source commit `268de12338bce554f18e5feef27acbb5e9ea45fe` by using the sequence diagram's `title` directive as its SVG accessible name.
- Verification run [43619577306](https://github.com/iamjpsonkar/Wave/actions/runs/43619577306) is in progress; Node tests, typecheck and production build have passed, while Playwright was still running at the time of this log. Do not mark the accessibility correction fully verified until E2E and the current-main workflow pass.
- Tracker commits: bugs `5e8e6963c49d3163405ffc267a1504b04bb5a7eb`; fixed bugs `54fb999bc97a784d13dbecdc8ff3981f1684ba02`; features gap `13aecf6eec05fc62710bbe338204f35c5114d558`.

 
## 2026-11-14 — Image accessibility implementation and CI repair

- Latest-main CI run [43619707243](https://github.com/iamjpsonkar/Wave/actions/runs/43619707243) passed install, all 30 Node tests, TypeScript typecheck and production build, but Playwright failed **27/28** because the accessibility smoke test used a broad `details summary` selector that matched both the DETAILS block and Mermaid source disclosure. This was a test-selector issue, not an application runtime failure.
- The selector now targets `.markdown-details > summary`. The same change adds image accessibility behavior and regression coverage: meaningful missing images expose a named image fallback; explicit empty alt text remains decorative; reference-style linked images retain their accessible name/title and keyboard focus.
- New E2E source count: **29 scenarios**; Node source remains **30 tests**. CI for this commit is pending; no pass is claimed.


## 2026-11-14 — Math parser input and complexity hardening

- Added explicit math-renderer limits: 8192 source characters, 48 recursive nesting levels and 2048 parser steps; unbalanced braces now return an accessible readable source fallback.
- Added Playwright regression coverage for malformed, deeply nested and oversized expressions.
- Fixed the remaining broad DETAILS-summary selector in the accessibility smoke test. Latest image-accessibility CI exposed this second occurrence after the first selector had been narrowed; it now targets `.markdown-details`.
- Current source inventory: 30 Node tests and 30 Playwright Chromium scenarios. The image-accessibility and math-hardening changes are awaiting CI; no passing result is claimed.


## 2026-11-14 — UI Settings implementation (UI-001 / UI-012)

- Added one Playwright scenario covering Settings dialog, theme/font/size/line-height/content-width/reduced-motion controls, `.wave/settings.json` persistence and recent-workspace reopen.
- E2E source inventory increases from 30 to 31 scenarios; Node suite source remains 30 tests.
- Implementation and regression are committed together; CI is pending. No local test runner was available through the repository connector. Do not report browser, typecheck or production-build success until Actions completes.

- Follow-up regression also checks focus wrapping, applied editor font size/line height and shared preview content width. The test waits for the persisted-preference completion state before reading `settings.json` to avoid an asynchronous-write race.

- Added the final keyboard regression for Escape dismissal; UI-001/012 are recorded as implemented pending CI, while UI-003 remains partial pending responsive/wide-content verification.


## 2026-11-14 — UI-004 code toolbar and dark-theme regressions

- Added two Playwright scenarios: distinct inline/fenced code icon, accessible name, tooltip and insertion behavior; system-dark Markdown Preview heading, fenced/inline code, segmented controls, wordmark and Backup surface colors.
- Source E2E inventory increases from 31 to 33 scenarios; Node suite remains 30 tests.
- Full Light/Dark/System × Edit/Preview × desktop/mobile visual regression matrix remains unimplemented. CI verification pending.

- Test review follow-up: toolbar regression selects text before invoking the two wrapping actions, so it verifies actual inline/fenced wrapping rather than an empty-selection placeholder.


## 2026-11-14 — UI-020 theme and responsive regression foundation

- Current-main implementation commits: styles `cfb73c72ae17671e893e564688a2324180cbbb6e`; Playwright matrix `b729eea18aa7f9297bd977110837c58c6a6ef03f`.
- Added dark/system-dark styles for Markdown alerts, disclosures, math/fallback surfaces, diagram surfaces, syntax/diff tokens, missing-image fallbacks, copy controls and Settings dialog controls.
- Added one Playwright test that exercises 12 combinations: Light/Dark/System × Edit/Preview × desktop/mobile. It verifies representative Markdown rendering, computed styles and horizontal overflow.
- E2E source inventory: **34 scenarios** (previously 33); Node test source remains **30 tests**.
- No local test runner is available through this repository connection. No test, typecheck or production-build pass is claimed. Check the workflow for the latest main commit before marking UI-020 verified.
- Scope limitations: computed-style and interaction assertions are included; screenshot baseline/diff review, a full WCAG contrast audit, tablet/320px breakpoints, and broader dialog/popover/navigation review remain open.

- Test-source follow-up commit: `5b110945a45596de28c13f34435816a87907089f` simplifies the overflow assertion in the UI-020 matrix. Latest combined status was not exposed by the repository connector; no CI pass is claimed. Recheck the Actions run on this commit.
 
## 2026-11-14 — Remaining UI implementation batch

- Added a new editor enhancement component with undo/redo, find/replace, heading outline and document statistics; wired changes through the existing recovery-aware editor change handler.
- Added folder breadcrumbs, live save-status semantics, searchable template gallery and a preview-before-create dialog; toolbar actions now have explicit accessible names.
- Improved functional text sizing, focus visibility, mobile layout, dark/system-dark secondary surfaces and System-light color corrections.
- E2E additions: editor productivity workflow, searchable template preview, nested folder breadcrumbs. UI-020 now exercises 3 themes × 2 modes × 5 viewport widths = **30 states**, with body/heading contrast ratio checks and horizontal page-overflow assertions.
- Source inventory: **37 Playwright scenarios**, **30 Node tests**. This is a source count, not a run result.
- No local project dependencies/test runner are available through this repository connection. The GitHub connection did not expose a push-triggered Actions run or combined status for these commits. **No tests, typecheck, production build or CI pass is claimed.**
- UI-002 remains open for a real optional block editor. Full WCAG review, screenshot-diff baselines, focus-return audit, long-content/table/diagram review and Settings/backup failure-state visual QA remain open. Do not close UI gaps before CI and evidence review.

 
## 2026-11-14 — UI-002 optional block mode follow-up

- Added an optional source-preserving Markdown block editor for headings, paragraphs, lists, quotes/callouts, fenced code, tables, dividers, image lines and attachment links.
- Each block edits its original Markdown source slice; the existing source textarea and Preview remain available. Added a regression that edits one paragraph and asserts exact full-source preservation for untouched list/callout/code blocks.
- Latest source/test commits: block parser `cc6809086922947ae4f32e4eaf47257f93c66073`; E2E `e0d901711430355b06f7c870453484d88099a886`; block-mode history shortcut follow-up `760ec73b51361826be00ee653c441d72bca65e28`.
- E2E source inventory is now **38 scenarios**; Node test source remains **30 tests**. No execution result is available; no test/typecheck/build/CI pass is claimed.
- Remaining UI-002 scope: block reordering/drag-drop, handles, slash menu, bookmarks/embeds and rich inline editing. The full UI register remains open for its stated CI/manual QA items.

 
- Block-mode follow-up added Undo/Redo assertions to the block editor scenario and improved outline navigation within block mode. E2E source remains **38 scenarios**; CI still not exposed and no test pass is claimed. Latest regression commit: `30be50f3afae887386eba1f86faf2d855207c925`.

 
- Contrast-test follow-up: corrected the RGB channel matcher in the UI-020 computed-contrast helper to parse numeric CSS channels. Test-source commit: `ffc3be4ae9026ce76148ce3fbcaa86b4be0e0f73`. The 38-scenario source inventory is unchanged; execution and CI remain unverified.


## 2026-11-14 — UI block controls and dialog focus regression source

- Added E2E source coverage for block keyboard reorder, drag-and-drop, common-block insertion and template dialog focus wrapping.
- Playwright source inventory: **39 scenarios**; Node test source inventory: **30 tests**. Counts do not indicate execution.
- Latest code/test/style commits: 9e4f29390447dcdbd43f80098da522385a270448, 7057ce25861bffce43ee05ce5f8afb305ae1d0e8, 290f926c92caffe64d2ac34f1eea483df015f464, 8bb74c69ec4c9adad7d59c0e34e869224742fa42, f292e32e853fce640d44f05f554ee4bce1cbba72, b90369be8ef6ba66ab95f84f5e609b406afd87f7, 6bbd015307f55a0e385b6f041d383bdb07e6e87c, 93bdd45f2fe17bda2375cb0a41c8f2f7f9e6ca62.
- Checked combined status and commit-associated workflow runs for 93bdd45f2fe17bda2375cb0a41c8f2f7f9e6ca62: both returned empty arrays. No current CI evidence is available. No tests, typecheck or production build are claimed to have passed.

## 2026-11-15 — Inline color formatting regression (CI pending)

- Added foreground/background toolbar color pickers and safe Markdown preview support; added one Playwright scenario covering both directives, inline-code non-transformation and Edit/Preview source preservation.
- Browser E2E source inventory: **40 scenarios** (previously 39); Node test source remains **30 tests**. These are source counts, not execution results.
- Source commits: App `4df616fee1cbdcd80e878e422bc0ecc264c2c02e`; Markdown renderer `4f68b91243e17a2a2642961ec45c01550893aaa4`; CSS `3464fd936b96bd280db1794f230a378041945a07` and system-light follow-up `53779f8f9705c1b78195761c794935e7aa1c6230`; E2E `323f49e33ab59f38cb2790628d83630f934d6282` and locator follow-up `48af3998748b51779a0abe75ca5853dd80fa03b1`.
- No local test/typecheck/build runner was executed. No CI result or screenshot review is claimed. Wait for the workflow on the latest main commit before treating the regression as passed.


- Color E2E follow-ups now cover native color input change events, invalid hex values remaining literal, and preservation of the inline-code example. Latest test-source commit: `81f819653e5f766670e51b783edacb1fa39c41b5`. The suite count remains **40 E2E scenarios** and **30 Node tests**; execution, typecheck, build and CI are still unverified.

- Documentation follow-up aligned the Markdown compatibility contract, feature-gap list and UI color backlog with the shipped six-digit-hex syntax and remaining palette/block-fill work. Commits: `bf5d455c2012fa9750f585eb104a03ecf0b6b9ec`, `99007028e8f9c98de8baa5d32d55ce97d346d183`, `bd27ca629c7556b3f2fbeac75e3b600b976365b9`.


## 2026-11-15 — Color palette, reset and block fill

- Toolbar now includes six curated text-color swatches, remove-color-formatting, and a block background color picker. Added a Markdown quote directive for block fills and preview rendering with validated six-digit hex.
- Added one E2E scenario for swatch application, reset, block fill source and preview. E2E source inventory: **41 scenarios**; Node source remains **30 tests**. These are source counts only.
- Commits: App `25fa032884d8cf6f1356f20ebe0e9ffc0bd5e381`, renderer `08cf36f8b9b29295c52b883b56a0559f85592e4a`, styles `7020028201eeee4be404a003b4e2c2abc7925c9a`, E2E `76a55e006b00513e21a1a5ef406645a55339a762`.
- CI, typecheck, build and screenshot review have not been confirmed. Nested ranges and Blocks-mode selection remain open.


## 2026-11-15 — Blocks-mode background color controls

- Added an accessible per-block native color picker to every Markdown block in Blocks mode. Applying a color adds the safe quote marker; changing an existing color block updates its marker in place. The block editor classifies color directives as callouts.
- Added an E2E source scenario for applying, changing and previewing a block fill. E2E source inventory: **42 scenarios**; Node test source remains **30 tests**. Counts describe source definitions, not execution.
- Commits: `b191a2759ff917c0ab1ed0ebb333b828b035a9b3`, `93bf0eb5dc809e373292570d900066161f6e7be3`, `0cf474ff0d0765f882916c04efbb69e49c95cb85`.
- Typecheck, build, browser execution, screenshot review and CI are not yet verified.


## 2026-11-15 — Wave Complete Feature Test template

- Added a new **Wave Complete Feature Test** entry to the existing template gallery; the original Markdown feature showcase and all existing templates remain unchanged. The template contains practical examples for headings/inline formatting, nested lists, GFM tables/tasks/footnotes, reference and wiki links, alerts/disclosures, foreground/inline/block colors, code/diff blocks, math, Mermaid and local diagram subsets, local image/file/audio/video references, emoji, navigation/search/backlinks, an editor/workspace QA checklist and safe-rendering checks.
- Added a Playwright E2E scenario covering gallery discovery, template preview/create, source content, color and diagram preview, and Edit/Preview source round-trip. Browser E2E source inventory is now **43 scenarios**; Node test source remains **30 definitions**. These counts do not represent executed tests.
- Source commits: template `f7a11993e821cf8cac77b34bc2f593217f8979b7`; color marker correction `b1c65d2f0d2893056ae7e75483023eae657bcf74`; E2E `1e7558de59c360532101004695d12b12c1ea1155`.
- No local tests, typecheck, production build, screenshot review or CI result have been run/confirmed for this batch. Do not claim verification until the latest main-branch workflow completes.


## 2026-11-15 — Export rendered Preview as PDF

- Added a Preview-only **Export PDF** action. It invokes the browser print dialog on the rendered Markdown preview and temporarily sets the document title as the suggested PDF filename. The `afterprint` event restores the Wave tab title.
- Added print styles so exported pages contain the rendered preview only; workspace navigation, editor toolbar, document metadata, backlinks, status bar and controls are hidden. Print styling preserves colors where supported, keeps headings with following content, avoids splitting common blocks and wraps long code lines. Local audio/video controls are omitted from print output.
- Added Playwright E2E source coverage for button action, title restoration and print-media visibility. E2E source inventory: **44 scenarios**; Node test source remains **30 definitions**. These are source counts, not executed results.
- Scope: browser print dialog → Save as PDF; this is not a direct PDF download engine. Pagination, headers/footers and background-color inclusion depend on browser print settings.
- Commits: App `e6800b1725f1471fcd56a403e001ff7fa7302cbb`; print CSS `26dc983d85a531e4a1431624ec7558b5b5dcb2b2`; E2E `8608f04f7c4347d4f59dff4016d45b52db15219b`.
- No local tests, typecheck, build or screenshot review have been performed for this batch. CI status must be checked before claiming verification.
## 2026-11-15 — PDF export UI bug remediation (UIB-001–UIB-006)

- Print mode now applies a deterministic white-page print palette with dark text, normalized component surfaces, table-cell visibility/layout, and collapsed DETAILS body visibility. Custom validated Wave foreground colors are retained through a dedicated print CSS token.
- Fixed the inline color renderer regex so the full label after `wave-color:#RRGGBB:` / `wave-bg:#RRGGBB:` is rendered as styled text rather than visible serialization.
- Updated the Complete Feature Test summation to the documented `$$` display delimiter and added a print E2E fixture for the table Priority value `1`, custom color, rendered MathML and collapsed disclosure content.
- Expanded the existing PDF export E2E scenario; it remains **44 Playwright scenario definitions** and **30 Node test definitions**. These are source counts, not run results.
- Commits: renderer `05275f7c18594918a64e19ab5166300c5cab6424`, `b68d2a0a43e918fa52f9ebeeb87ef1d3e8676f5b`; CSS `27678927380002a17400697bb6a6f890032063be`, `33bbcfdcf00f5200c2f1bd125573d0596d94b188`; template `d4049b2e5228b77b8befd7e989252d8b81eed201`, `6f594bab5e4e6e503a77023ca7cac2089e678349`; E2E `2c34b20ad21b930be260f84bcf463075dff4f6d8`, `45c9cd0e2e43a57252f734bb4cfa40a4f085c823`; `UI_BACKLOG.md` `2942b71734064433f9816caca86ab2ba452e749e`.
- CI run `43630578833` for the defect-register commit was **in progress** at the time of inspection. Subsequent commits trigger their own CI runs. No local test, typecheck, production build or screenshot review was run; do not claim a pass. UIB-005 still requires a fresh PDF visual check to establish whether the missing `1` is fully resolved.
- Follow-up E2E assertions now cover all three showcase foreground colors (blue/green/red), inline yellow background and normalized print table-header surface. Commit: `dabe21bcf587f84835b3b5b2a5c90295686ebcf1`. Scenario count remains 44; this is source coverage only.
- CI follow-up: run `43630578833` completed Node tests, TypeScript typecheck and production build successfully, but Playwright could not parse `tests/e2e/workspace.spec.ts` because a pre-existing UI-020 fixture omitted a comma after a closing code fence. Added the missing comma without changing the fixture content. Fix commit: `56e9eb2d638cbe9a8883c3c5cbc16cc3fc40e94e`. The corrected commit's CI is pending.

## 2026-11-15 — Contextual Markdown sample library and list continuation

- Added a right-side **Sample library** with 21 searchable Markdown examples, eight category filters, rendered preview, visible source and insert action. Insertion replaces the current editor selection; with Preview/Blocks active it appends to the current document. Implemented in `src/SnippetLibrary.tsx` and integrated into `src/App.tsx`; responsive light/dark styling in `src/styles.css`.
- Markdown Enter now continues unordered, ordered and task lists; increments ordered markers; preserves indentation; starts a fresh unchecked task; and exits an empty item on the next Enter. Fenced code is excluded.
- Added two Playwright scenarios for sample preview/selection insertion and ordered/bullet/task list continuation.
- Commits: component `65fb14ba86541accb9a36617588dbd80b9c65b99`; App `148fc99d14bfbc792e4be0a830938cbf001a791e`, `40ca59461ae6cab5c2b772f4e11b32d07d55e26f`, `e55a34748dcf02c1ec6ae2c87aa27afadb7aa664`; styles `6ffe152c88fec619cca223871d51086894ebe408`, `c1f7265ed48cafe50dc9fab2fb8975c59aa0700b`; tests `4c616bba1d7c3e37408834b8fdba117918f4e321`, `81261223084692acf14486db9d937cd77238e055`.
- Documentation commits: `UI_BACKLOG.md` `4e0fbdfb5b2db775bab0e13e771246909e797cc6`; `UI_BACKLOG.md` `9ee90e20791c53ca78ca075a36fc87430943279b`; `features.md` `225a700a24ddfef166681c74b2528819465dcbdf`; `FEATURES.md` `d8d4ca732010eb56b1ce54a4d2468ab46922e354`.
- CI run `43632920367` completed Node tests, typecheck and production build successfully, but E2E failed to parse the file due to a stray suite-closing token. Removed the token; fresh run `43633086687` is queued. Do not claim E2E pass until this run completes. No local tests or screenshot review were performed.
- Regression follow-up: expanded the list Enter scenario to verify nested indentation and that Enter inside a fenced code block remains a normal newline. The empty-task-item expectation now explicitly checks the blank line that terminates the list. Test commit `757d8edba0925432bf8c5027924074ee8331a1eb`; CI run `43633137209` is in progress. Earlier run `43633086687` passed Node tests, typecheck and production build; Playwright execution was still running at the last check.
## 2026-11-15 — Repository navigation, contributor workflow and Docker static hosting

- Added a multi-stage Dockerfile: Node 22 builds the existing Vite app and an unprivileged Nginx image serves only the generated static site on port 8080.
- Added .dockerignore, compose.yaml, .env.example and docker/nginx.conf. Compose uses a read-only root filesystem, a bounded temporary filesystem, dropped capabilities, no-new-privileges, restart policy and HTTP health check. Nginx provides SPA fallback, hashed asset caching, app-shell revalidation, dotfile denial and browser security headers.
- Added npm run docker:build, npm run docker:up and npm run docker:down shortcuts. Added docs/DOCKER.md, including standalone Docker, Compose, HTTPS/reverse-proxy, storage boundaries and troubleshooting.
- Rewrote README.md around the current product, capabilities, three run modes, browser/storage requirements and project map. Added docs/README.md as a documentation index and CONTRIBUTING.md for development setup, checks and non-negotiable engineering invariants.
- Updated architecture and roadmap docs, feature inventory and docs index. Corrected a stale feature-showcase sentence that described wiki links/backlinks as wholly unshipped even though a basic implementation exists. Existing root-level registers and the complete product blueprint were retained; no feature catalogue was deleted or consolidated.
- Clarification: this Docker image is static frontend hosting only. It does not create an API, account system, shared server-side workspace, collaboration layer, database or remote document storage. Browser folder selection continues to refer to each browser user's own device.
- Key commits: Dockerfile dd84539048e1940ccbfcc36aed4ac74896f2cf1d; .dockerignore 47480ff31f297a8b21ff2e1d7fc3bd282b8fab95; Compose dd8a768f942a5e4e8c9b837232e08418f4a4d12f; Nginx f92b4e6cd41c1fe29dbc682f928a3a76f57a96ae9, security-header follow-up fd079922cb11afa19bdbcc8cbc2f56f75f4ca8a9; Docker guide bea010588e8b58dd559d0a0caa32d7dd728f270a, command/env follow-up dae8f36383c7bf54210dff33501b0700365baea8; README d84ddc4c68451020ff45364f4910640cb7c4af1e; docs index a2b1d12b9df7fb195d503e890d81e84f7edecb39, contributor link 341780fc9ab00f63baa6f967b3fc86c0e65891fa; contributor guide a3d4e74ed9443310ce8e4cbcd1db0273cfb7b6f3; package scripts 5ba31caa80bf1730ce52c98301e963787d895ce4; architecture 5f67383cef1dd8a535ac7958039113bc233510f5; roadmap 98d0ecde1e2b386d5508d0eb4667f50f1b153f52; CI container job 4040584de2a82005e24ba1619886ff2784f7cc2f, Compose validation follow-up 7406267fe7d09c230df4ae1f3d99b02138204a31; feature inventory f98639a8c5d7f8fd97e38179c7b42ca6c8f84ce0, feature-map update 7bd7ef523b55a6d40785c664fc674ed0eda8fba4, stale wording correction cf0fd17be1ad261b54cad9d08e5067471f6b7995.
- CI evidence: workflow run 43634056269 completed the dedicated Docker image build successfully; its Node tests, typecheck and Vite build also passed, while Playwright browser installation was still in progress at inspection. A later run 43634100390 was rebuilding the updated Nginx configuration; the final CI workflow after Compose validation still needs to complete. No local Docker build, Compose runtime test, browser E2E pass or manual visual review is claimed.


- CI follow-up: the initial container-job edit added image construction; a subsequent review caught that the Compose validation step had not been inserted by the first text update. Corrected the workflow to run `docker compose config -q` before `docker build --pull -t wave:ci .`. Workflow-file correction commit: b41adbeb2ea68fd1632975ca1275c01f6e9b87dd. Verify the new run for both steps; the earlier Docker image builds passed but do not prove Compose validation.


## 2026-11-15 — Comprehensive Wave wiki and AI-agent guide

- Added root `wiki.md` as the main orientation document for developers and AI agents.
- Consolidated durable product-owner directions from the available Wave project conversation context: preserve all agreed scope, keep the full catalogue separate from priority order, implement requested behavior with regression tests, retain development histories, and update `DEV_CONTEXT.md` last.
- Documented product constitution, offline/online modes, current stack/source map/workspace layout, reliability invariants, Markdown/editor behavior, UI requests, Docker boundary, QA evidence limits, roadmap coverage, documentation map and recommended improvements.
- Added direct discovery links from `README.md` and `docs/README.md`.
- Verification: GitHub repository contents were fetched and reviewed; no local test/build or CI run was performed for this documentation-only change.


## 2026-11-15 — Markdown documentation consolidation and per-task enforcement

- Created `QA_CONTEXT.md` by combining the current QA disposition/test inventory from the former `qa-context.md` with substantive audit history/evidence from `QA-CONTEXT.md`.
- Created `UI_BACKLOG.md` by combining export/print UI bugs (UIB-001..006), UI gaps (UI-001..024) and UI feature proposals (UIF-001..021). Stable identifiers and source-register content were retained.
- Created root `FEATURES.md` by combining the shipped-feature showcase and detailed feature map formerly split across `features.md` and `docs/FEATURES.md`.
- Verified that each consolidated target contains the source documents' meaningful content, including the relevant IDs and QA findings, before deleting the seven redundant source files.
- Removed: `QA-CONTEXT.md`, `qa-context.md`, `ui-bug.md`, `ui-gaps.md`, `ui-features.md`, `features.md`, `docs/FEATURES.md`.
- Updated the wiki, README, contributor guidance, developer handoff, roadmap/issue references and documentation index. Added a mandatory per-task Markdown review/enforcement section to `wiki.md`: update authoritative docs, preserve IDs/history, avoid duplicate sources, validate links and update `DEV_CONTEXT.md` last.
- Preserved as separate files: `upcoming-features.md`, `priority-features.md`, `dev-fixed.md`, `dev-build.md`, `bugs.md`, `fixed-bugs.md`, `features-gap.md`, `diagram-features.md`, and the architecture/deployment/Markdown/roadmap guides.
- Verification: fetched and compared source/destination contents before deletion; confirmed UIB-001..006, UI-001..024, UIF-001..021 and WAVE-031/WAVE-039/WAVE-042 are present in the consolidated destinations. Checked navigation and corrected stale links in the consolidated feature guide. No application code changed; no local tests/build or CI run was performed.


## 2026-11-15 — WAVE-0001 verification additions (CI pending)

- Branch: `WAVE-0001` (issue #1).
- Added two Playwright scenarios: recent-workspace permission reauthorization from the prompt state, and editor conflict handling after an external filesystem edit.
- Current source inventory after the additions: 30 Node test definitions and 48 Playwright E2E scenarios.
- Existing Node coverage includes conditional-save external-change rejection and backup snapshot mutation/fault checks.
- CI: pending PR workflow. Record the exact workflow run, commit SHA and each suite outcome after GitHub Actions completes. No new test/build pass is claimed yet.
- Native OS picker/revocation, external-process race scheduling, full accessibility audit and actual process termination remain manual/platform verification requirements.



## 2026-11-15 — WAVE-0001 CI remediation (in progress)

- Investigated failed workflow `43682365587`: Node tests, typecheck, production build and container build passed; Playwright had 15 failures / 33 passes.
- Corrected invalid external-edit fixture newlines and current error-surface selector; repaired ambiguous/stale selectors and template-preview flow; corrected local-image, diagram and PDF fixture expectations.
- Fixed application defects discovered during triage: empty task-list item continuation, block-color newline parsing/serialization, and editor selection preservation for color actions.
- Branch `WAVE-0001`, PR [#101](https://github.com/iamjpsonkar/Wave/pull/101). Remediation CI [run 43683698072](https://github.com/iamjpsonkar/Wave/actions/runs/43683698072) was still running when this entry was written. Do not claim pass until its final result is checked.
- No local execution was available; use CI logs to identify and fix remaining failures. Keep #1 open for native picker, external-process race, accessibility and lifecycle acceptance evidence.


## 2026-11-15 — second WAVE-0001 CI triage pass

- Rechecked latest completed workflow [43683760674](https://github.com/iamjpsonkar/Wave/actions/runs/43683760674): Playwright 39 passed / 9 failed; Node tests, typecheck, production build and container job passed.
- Remaining categories: settings dialog Escape handling; icon class expectation; strict locators for code/diagram/template/color spans; color-toolbar event/state application; block-callout classification.
- Follow-up changes pushed: allow Escape to close settings, align icon expectation with rendered Lucide class, scope template search and narrow code/diagram/color selectors, route color edits through controlled content change, and correct block-color callout classifier. Verify current PR head's next CI run before marking complete.


## 2026-11-15 — WAVE-0001 consolidated CI remediation

- Rechecked latest head run [43684569184](https://github.com/iamjpsonkar/Wave/actions/runs/43684569184): Playwright 42 passed / 6 failed; container passed. Node tests, typecheck and production build passed.
- Fixed stale editor content usage in inline/background color actions by reading `contentRef.current`; route mutations through `handleEditorChange` to update recovery journal and visible state.
- Fixed block background updates to replace the source range from the current block editor render, not rely on outdated offsets or bypass the draft update path.
- Fixed Settings test modal ordering and Lucide file-code SVG class assertion.
- Fresh CI required. No local test/build is claimed. WAVE-031 manual/native checks remain open.

## 2026-11-15 — Local run/test scripts and CI parity

- Replaced the misleading `run.sh` sequence (which attempted typecheck/build only after the long-running dev server had already started) with a fail-fast development launcher. It validates Node.js 22.6+, installs locked dependencies only when needed, supports `--install`, and exposes host/port through `WAVE_HOST` / `WAVE_PORT`.
- Added executable `test.sh`: Node tests, typecheck, production build and Playwright Chromium E2E in one local command. It bootstraps missing npm dependencies, the same pinned Playwright version used by CI, and Chromium; supports no-E2E and pre-provisioned dependency flags.
- Added `npm run test:local` alias. CI now provisions Chromium with OS dependencies and invokes the same script with setup skipped, keeping the actual check sequence shared.
- Updated README, QA context, WIKI and developer handoff. No local execution was available through the GitHub-only editing workflow; the new CI run must validate shell syntax/behavior and test suite outcome. Developers can immediately run `./test.sh` after pulling the branch.


## 2026-11-15 — Workspace UI regression follow-up

- Corrected color-picker initial values so applying the toolbar's default highlight/block colors is an actual color change and triggers formatting.
- Exposed Settings directly in the mobile top bar.
- Aligned the narrow-width E2E check with the product contract: configured width is a maximum, not a promise to overflow its available editor column.
- CI verification pending; no local run claimed.


## 2026-11-15 — CI follow-up: Markdown directives and E2E stability

- Run `43687589347` failed only in Playwright; Node tests, typecheck, production build and container build passed. The suite reported 44 passes, two deterministic failures and two flaky scenarios (cross-tab recovery and list typing).
- Fixed malformed `[[color:red|...]]`-style directives being mistaken for unresolved wiki links: invalid `color:`/`bg:` directives now remain literal text, while valid six-digit hex directives retain their existing rendering path.
- Corrected the block-background E2E assertion to compare the browser-computed RGB CSS value rather than expecting the source hex serialization. Removed an unnecessary frozen clock from the second cross-tab page, asserted the dialog source before checking the declined-recovery result, and made list continuation tests wait for focus/caret restoration before typing the next item.
- Verification is pending on the new commit. No local browser run is claimed. Native OS picker/permission, external-process race, accessibility and process-termination checks remain outstanding; issue #1 stays open and PR #101 stays unmerged.


## 2026-11-15 — Cross-tab recovery CI follow-up

- Workflow `43688050754` passed 47 of 48 Playwright tests; Node tests (30), typecheck, production build and container image passed. The remaining failure was the cross-tab recovery test: after removing the fake clock from both pages, the source tab's 600ms autosave committed the changed Markdown before the second tab opened it, so no recovery dialog was expected and the prompt assertion received an empty string.
- Corrected the test to freeze only the source tab's clock after workspace/page setup and before editing. Draft-journal writes remain immediate; only the delayed Markdown autosave is held. The second tab remains on real time so navigation and recovery interaction are not blocked.
- Fresh CI is pending. No local browser execution is claimed. Outstanding manual OS picker/permission, external-process race, accessibility, and process-termination criteria remain tracked; issue #1 and PR #101 remain open.


## 2026-11-15 — Cross-tab recovery E2E clock lifecycle

- Run `43688362527` completed with container success and 47/48 Playwright tests passing; 30 Node tests, typecheck and production build passed. The remaining test did not observe the cross-tab recovery prompt.
- Corrected the E2E fixture to install the source page's clock only after workspace setup and baseline page save, immediately before creating the unsaved recovery draft. Removed the earlier duplicate installation before setup; the second tab remains on real time.
- The change is limited to regression-test setup. A new PR workflow must confirm the outcome. No local tests are claimed.


## Cross-tab recovery diagnostics
- Added source-tab and second-tab IndexedDB inspections before recovery is attempted.
- Assertions cover exact unsaved text, matching workspace handle identity, source tab ownership, and distinct tab session IDs.
- Kept the actual cross-tab prompt assertion and the declined-draft-retention assertion unchanged.
- Next CI result should identify whether the draft is absent at write time, invisible/mismatched in the second tab, or lost later in `open()`.


## Cross-tab recovery — CI #918 diagnosis
- Confirmed source tab journal record is present with exact draft text, source session ID, and matching workspace handle.
- The diagnostic test failed because expected content encoded `\\n` rather than newline characters. Corrected both diagnostic expectations.
- Next gate checks second-tab journal visibility and the actual recovery prompt/decline behavior. No production fix is claimed from this run.
- Completion plan: isolate the first failing boundary, fix only that boundary, preserve strong assertions, then require the complete local/CI script and container job to pass.

## WAVE-031 follow-up issue decomposition — 2026-11-15

- Created [#104 — WAVE-031A](https://github.com/iamjpsonkar/Wave/issues/104) for native folder picker, cancellation, real browser/OS permission revocation and reauthorization verification.
- Created [#105 — WAVE-031B](https://github.com/iamjpsonkar/Wave/issues/105) for external filesystem read/save races and backup/restore fault injection.
- Created [#106 — WAVE-031C](https://github.com/iamjpsonkar/Wave/issues/106) for controlled browser-process termination and IndexedDB recovery-draft commit-boundary verification.
- Reused existing [#3](https://github.com/iamjpsonkar/Wave/issues/3) for keyboard/focus, screen-reader and contrast audit; linked that scope to parent #1 rather than creating a duplicate.
- Parent #1 remains open. The latest previously verified PR CI recorded on main is run [43690301741](https://github.com/iamjpsonkar/Wave/actions/runs/43690301741), 48/48 Playwright plus all other workflow jobs passing.
- This reconciliation does not run tests.

## 2026-11-15 — Main synchronization verification and future workflow documentation

- The product owner manually synchronized `main` into `manager` and then force-pushed the feature branch. PR [#107](https://github.com/iamjpsonkar/Wave/pull/107) was closed unmerged and is abandoned for main synchronization.
- Verified GitHub refs after the operation: `main` = `c421f7bcf40ec430eda90fe0a57e98464762e68f`; `manager` = `6747efdf0204c1cded75fd03475a75d0cbdef60b`.
- GitHub commit metadata shows the manager tip is a merge commit with parents `d87f3e63872dc0f281b29dd37679297e62369660` and the current main SHA. GitHub compare reports `main...manager` as ahead by 2, behind by 0. This confirms the current main history is included in manager; the branch retains two manager-only commits.
- The compare reports only two files changed relative to main: added `etc/howtodev.md` and `etc/howtoqa.md`. No other file differences were reported by the compare endpoint. The remote tree and commit metadata were inspected; no local checkout or test execution was performed for this verification.
- Added a mandatory main-to-feature sync procedure to `etc/howtodev.md` and linked the policy from `WIKI.md`. It covers clean-tree checks, fetch, fast-forward-only main update, feature-branch merge, careful conflict resolution, ancestry/diff/test/CI verification, normal push and exceptional force-with-lease safeguards.
- Verification is repository-metadata/source inspection only. No tests, build, local Git status, or CI run was executed for the manual merge. Check CI on the current manager head before relying on runtime behavior.

## Historical feature-gap audit notes retained during documentation reorganization

- Created [features-gap.md](../product/markdown-coverage.md) as the canonical remaining-scope checklist. It distinguishes shipped syntax, partial support, missing renderer capabilities, deliberate HTML/media security boundaries and missing conformance/accessibility coverage.
- The gap audit is updated in [features-gap.md](../product/markdown-coverage.md); the compatibility contract is aligned in [docs/MARKDOWN_SUPPORT.md](../engineering/MARKDOWN_SUPPORT.md). No application code or failing E2E assertions were changed in this recheck.

## Automated test suite organization issue — 2026-11-15

- Created [#111 — restructure automated tests into feature-based suites and scenarios](https://github.com/iamjpsonkar/Wave/issues/111).
- Current source inspection confirmed Node tests are discovered through the flat `tests/*.test.js` package script, while Playwright coverage is concentrated in `tests/e2e/workspace.spec.ts`. The issue requests an inventory-first migration into meaningful unit/integration/E2E feature directories, focused files and scenarios.
- Acceptance criteria explicitly preserve all existing assertions and guarantees, maintain complete discovery through `test.sh` and CI, support focused runs, and avoid test-order coupling.
- Coordinated scope with [#100](https://github.com/iamjpsonkar/Wave/issues/100): duplicate cleanup must retain distinct coverage; #111 is the broader organizational restructuring.
- This was issue creation and documentation only. No test files, application code or test commands were changed/run.


## 2026-11-15 — Complete Markdown inventory and navigation audit

- Audited all **33 Markdown files** present on the manager branch against the repository tree. Checked relative Markdown links using exact, case-sensitive repository paths; the final pass found **zero broken relative Markdown links**.
- Repaired migrated documentation references in the README, wiki, developer handoff, contributor guide, product feature/priority catalogues, open-bug register, development history and team/ownership guides. Kept the full product catalogue and historical implementation records intact.
- Reconciled the QA operating contract across `AGENTS.md`, `WIKI.md`, `howto/howtoqa.md`, `howto/engineering-rules.md` and the legacy QA entry point: QA is read-only in the repository; actionable findings go to GitHub issues and PR review comments; developers own fixes; QA does not approve or merge without explicit authorization.
- Source inventory checked against current test files and `package.json`: 30 Node test definitions in `tests/storage.test.js` and 48 Playwright Chromium test definitions in `tests/e2e/workspace.spec.ts`. These are definitions, not a claim that tests were run in this documentation-only task.
- Verification scope: GitHub repository tree and Markdown content inspection only. No local test, typecheck, production build, browser run or CI result is claimed.
