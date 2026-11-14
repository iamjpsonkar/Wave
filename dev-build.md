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
- Added two Playwright E2E scenarios. Current browser suite source now contains **16 scenarios**; Node test source remains **30 tests**.
- Workflow [43613680208](https://github.com/iamjpsonkar/Wave/actions/runs/43613680208), commit `679b9eef2b14272356d245553abd218612fd92ce`: npm ci, 30 Node tests, TypeScript typecheck and production build passed. Browser dependency install/E2E were still in progress at last inspection.
- Earlier workflow [43613444479](https://github.com/iamjpsonkar/Wave/actions/runs/43613444479), commit `3ca2155da1f9eb3a9e6419923f9971d05713b9a4`, passed Node tests/typecheck/build but failed 3 E2E scenarios while the inline preprocessing helper was missing from that intermediate commit. The helper was added afterwards; use the newer run for final browser verification.
- Do not claim E2E passed until a workflow containing the corrected source and the added scenarios completes successfully.


### CI follow-up and corrections
- [43613680208](https://github.com/iamjpsonkar/Wave/actions/runs/43613680208), commit `679b9eef2b14272356d245553abd218612fd92ce`: Node tests, typecheck and build passed; E2E failed 4 scenarios. Failures exposed heading IDs being applied at the wrong rendering stage, DETAILS summary extraction edge cases, and a sidebar list timing assumption in the existing wiki-link journey. Fixes were made in `3def36d`, `4f9a52f` and `161127f` and await a fresh full run.
- [43613868330](https://github.com/iamjpsonkar/Wave/actions/runs/43613868330), commit `ec4214d1de13e0f8a8195e5ed9186564db2084a0`: 30 Node tests passed; typecheck caught an incorrectly escaped source newline in the MathML parser. Corrected in `b8c7d550f1b56b66687e7c1b2833386f5f23d179`.
- [43614011077](https://github.com/iamjpsonkar/Wave/actions/runs/43614011077), commit `4f9a52f275aba0ae70d6add8e89bbeb6e1fcd8d5`: 30 Node tests passed; typecheck caught a duplicate `neq` key in the math command map. Corrected in `1df330599916a9d657e83838b03231bd39296ae5`.
- The newest full CI run for commit `1df330599916a9d657e83838b03231bd39296ae5` is queued/in progress; do not claim a complete pass until it finishes.
