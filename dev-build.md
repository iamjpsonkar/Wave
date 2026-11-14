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
- **Status: not yet verified.** No local install, typecheck, build, Node test run or Playwright run was performed in this task. Earlier CI entries above predate these changes and do not verify them. Record the exact new commit and result after CI completes.
