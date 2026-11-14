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
- Created [features-gap.md](./features-gap.md) as the canonical remaining-scope checklist. It distinguishes shipped syntax, partial support, missing renderer capabilities, deliberate HTML/media security boundaries and missing conformance/accessibility coverage.
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
- The gap audit is updated in [features-gap.md](./features-gap.md); the compatibility contract is aligned in [docs/MARKDOWN_SUPPORT.md](./docs/MARKDOWN_SUPPORT.md). No application code or failing E2E assertions were changed in this recheck.
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
