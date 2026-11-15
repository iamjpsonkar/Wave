# Quality Assurance Workflow

> Practical guide for reviewing Wave changes, validating releases, and reporting defects.
>
> Repository: https://github.com/iamjpsonkar/Wave  
> Working branch for this guide: `manager`  
> Product/default integration branch: `main`
>
> Read [QA_CONTEXT.md](../QA_CONTEXT.md), [DEV_CONTEXT.md](../DEV_CONTEXT.md), [README.md](../README.md), and [WIKI.md](../WIKI.md) before starting. Refresh branch, source, issue, and CI state; the dates and counts in handoff documents are snapshots, not live status.

## 1. QA mission

QA protects the user's data and verifies that Wave behaves as specified—not merely that the page renders or the build succeeds.

Prioritize:

1. Data integrity, recovery, backup, restore, and destructive operations.
2. Privacy, local-first behavior, path validation, and Markdown sanitization.
3. Core editing, autosave, navigation, search, attachments, and workspace lifecycle.
4. Concurrency, multi-tab behavior, external edits, and permission changes.
5. Accessibility, keyboard operation, responsive layouts, and visual consistency.
6. Performance, compatibility, and documentation accuracy.

Wave is a local-first workspace. A test must not assume that documents are uploaded to a server or that IndexedDB is the canonical document store.

## 2. Before testing

1. Identify the exact PR, issue, branch, and target base branch.
2. Fetch the latest repository state and record the commit SHA under test.
3. Read the PR description and acceptance criteria.
4. Read the current open findings in `bugs.md` and the related regression scenarios in `fixed-bugs.md`.
5. Read `QA_CONTEXT.md` and inspect relevant source, tests, package scripts, and CI configuration.
6. Check whether the same defect or feature is already tracked. Preserve existing WAVE/UI/UIB IDs and avoid duplicate issues.
7. Prepare a clean test workspace with disposable data. Never run destructive tests against a user's real workspace.

Record the environment: operating system, browser and version, Node version, commit SHA, test data, and any relevant permissions or feature flags.

## 3. Test strategy

Use risk-based testing. Test the changed behavior first, then related workflows and regression scenarios.

### A. Functional testing

Verify:

- Workspace creation, reopening, and permission-denied recovery.
- Page creation, editing, autosave, reload, rename, duplicate, and deletion.
- Nested folders, navigation, search, favorites, templates, and command palette.
- Markdown preview, links, attachments, and relative asset paths.
- Trash, restore, permanent deletion, backup, integrity verification, and restore to a separate workspace.
- Settings and responsive/mobile interactions where affected.

For every feature, cover the happy path, empty state, invalid input, cancellation, failure, and recovery path where applicable.

### B. Data integrity and filesystem safety

Check:

- Existing files are never silently overwritten.
- Path traversal, absolute paths, invalid separators, unsafe names, and case-insensitive collisions are rejected or safely handled.
- Failed writes close/abort streams correctly and preserve the original error.
- Trash verifies the recoverable copy before removing the original.
- Interrupted Trash operations can be reconciled safely.
- Backups have unique destinations and are not marked complete before integrity verification.
- Incomplete or corrupt backups/restores are refused as valid.
- Restore uses a separate unique destination and preserves the source backup.
- External edits are detected before an overwrite.
- Large files, Unicode names, and nested paths behave consistently on supported platforms.

Use disposable fixtures and inspect resulting files—not just success messages in the UI.

### C. Concurrency and lifecycle

Exercise relevant cases with:

- Two tabs editing the same workspace or document.
- Rapid edits while autosave is pending.
- Workspace switching while asynchronous reads/writes are in flight.
- External filesystem edits during active reads, saves, backup, or restore.
- Lock contention and fallback behavior when Web Locks are unavailable.
- Permission denial and revocation.
- Reload, tab close, navigation, hidden-page transitions, and controlled browser-process termination.

Do not equate a simulated permission result or a successful reload with a native OS permission test or a process-kill durability test.

### D. Markdown and input security

Verify:

- Raw HTML and scripts cannot execute in preview.
- Dangerous URL schemes are rejected.
- External links use safe navigation behavior.
- Local images and attachments resolve without unexpected network fetches.
- Malformed, deeply nested, and oversized Markdown does not freeze or crash the UI.
- Diagram, math, code, and media extensions respect their documented supported subsets and safety limits.
- Unsupported syntax is handled predictably and does not corrupt the source document.

Use [docs/MARKDOWN_SUPPORT.md](../docs/MARKDOWN_SUPPORT.md) as the compatibility contract. Do not report partial parser support as full language compliance.

### E. Accessibility and UX

Review:

- Keyboard-only operation and logical tab order.
- Visible focus, focus restoration, and dialog focus management.
- Accessible names, roles, labels, and screen-reader announcements.
- Text and control contrast in light and dark themes.
- Responsive behavior at desktop, tablet, and mobile widths.
- Reduced-motion preferences and non-color status cues.
- Error messages and recovery actions that are understandable and actionable.

Automated accessibility checks are useful but do not replace manual keyboard and assistive-technology review.

## 4. Run the automated checks

Use the versions and scripts declared by the current branch's `package.json` and CI workflow.

```bash
npm ci
npm test
npm run typecheck
npm run build
```

For browser tests, install the CI-matched Playwright package and Chromium if needed:

```bash
npm install --no-save --package-lock=false @playwright/test@1.55.0
npx playwright install chromium
npm run test:e2e
```

Inspect `.github/workflows/ci.yml` for the authoritative CI commands and supported runtime.

Report each result independently:

| Check | Report |
|---|---|
| Node tests | Passed / Failed / Not run |
| Typecheck | Passed / Failed / Not run |
| Production build | Passed / Failed / Not run |
| Browser E2E | Passed / Failed / Not run |
| Manual checks | List exact scenarios and environment |
| CI | Link the exact workflow run and commit |

A test definition is not evidence that the test passed. A green historical run does not verify a newer commit. A source-only review must be labelled source-only.

## 5. Review pull requests

For each PR:

1. Confirm the PR targets the intended base branch and addresses a tracked issue.
2. Read the full diff, not only the PR summary.
3. Check for scope creep, unrelated changes, generated files, secrets, and dependency changes.
4. Evaluate data migrations, backwards compatibility, backup/restore, and failure behavior for persisted data changes.
5. Check that tests verify the acceptance criteria and do not merely mirror implementation details.
6. Run or inspect required CI checks for the exact head SHA.
7. Review documentation and tracker updates.
8. Leave specific, actionable comments with file/line references and explain the risk or expected behavior.

### Review outcomes

- **Approve:** acceptance criteria are met, important risks are addressed, and required checks pass.
- **Request changes:** a correctness, security, data-loss, regression, or required-verification issue blocks merge.
- **Comment:** clarification or a non-blocking suggestion is useful, but no approval decision is being made.

Never approve your own PR. Never merge around required review, failing checks, or branch protection. Only an authorized maintainer should merge after the repository's required conditions are satisfied.

## 6. Create high-quality bug reports

Search [existing issues](https://github.com/iamjpsonkar/Wave/issues) before creating a new one. Reuse the existing issue ID if a known defect regresses.

A useful report contains:

- **Title:** concise symptom and affected workflow.
- **Environment:** OS, browser/version, commit SHA, and relevant configuration.
- **Preconditions:** workspace state and test data.
- **Steps to reproduce:** minimal, numbered, deterministic steps.
- **Expected result:** observable intended behavior.
- **Actual result:** exact observed behavior and error output.
- **Reproducibility:** frequency and whether it reproduces on a clean workspace.
- **Impact:** data loss, security/privacy, blocked workflow, or cosmetic issue.
- **Evidence:** screenshots, logs, test output, and sanitized sample files.
- **Scope:** affected versions/branches and any known workaround.

Do not attach real user documents, private workspace paths, tokens, credentials, or personal data. Redact sensitive details.

### Severity guidance

| Severity | Meaning |
|---|---|
| Critical | Data loss/corruption, serious security or privacy breach, or a release-blocking failure with no safe workaround |
| High | Core workflow blocked, major regression, or recovery/backup behavior unsafe |
| Medium | Important feature degraded with a reasonable workaround |
| Low | Minor usability, visual, or documentation issue |

Severity describes impact; priority describes when the team should address it. Do not inflate severity to attract attention.

## 7. Bug lifecycle and evidence

- Add only reproducible or source-supported findings to the active bug register.
- A failing test is a blocker to investigate; it is not automatically proof of a product defect.
- Keep current open findings in `bugs.md`.
- Move an issue to `fixed-bugs.md` only after the fix is implemented and the relevant regression scenario passes.
- Preserve the original issue ID, reproduction steps, and regression coverage.
- If a fixed issue regresses, reopen or update the original ID instead of creating a duplicate.
- Keep feature proposals and coverage gaps distinct from confirmed product bugs.
- Never delete historical evidence to make the current status look cleaner.

## 8. Wave-specific QA watchlist

Refresh this list from the current `bugs.md`, `fixed-bugs.md`, and `QA_CONTEXT.md` before each QA task. The following items are recorded in the current handoff snapshot and must not be treated as freshly verified:

- **WAVE-031 — partial QA coverage:** native folder-picker permission prompt/revocation, external filesystem races during operations, comprehensive accessibility, and actual browser-process termination remain areas requiring evidence.
- **WAVE-039 — recovery-draft durability window:** IndexedDB writes are asynchronous. Strict durability requests and lifecycle retries do not guarantee that an edit survives process termination before transaction commit.

Do not close these findings based only on source inspection, simulated permissions, or a successful reload after a committed draft.

## 9. Keep QA documentation accurate

After every QA task:

1. Update `bugs.md` only when the current finding status or evidence changes.
2. Update `fixed-bugs.md` only when a fix and its regression evidence are established.
3. Update `QA_CONTEXT.md` with the branch, inspected commit, files reviewed, test inventory, exact test/CI outcomes, limitations, and next actions.
4. Update `github-issues.md` when GitHub issues are created, closed, or materially reconciled.
5. Update `DEV_CONTEXT.md` when the implementation baseline or developer handoff changes.
6. Preserve historical audit notes and stable IDs; append a dated addendum rather than erasing useful history.

Do not claim a fresh pass if only an old CI run is available. Include the exact workflow URL and commit SHA.

## 10. QA completion checklist

- [ ] Correct repository, branch, PR, and commit SHA identified.
- [ ] Acceptance criteria and existing issue history reviewed.
- [ ] Relevant source and tests inspected.
- [ ] Existing open-bug and fixed-bug regression scenarios checked.
- [ ] Functional and failure paths tested.
- [ ] Data integrity, privacy, and security implications reviewed.
- [ ] Concurrency and lifecycle cases considered where relevant.
- [ ] Keyboard, accessibility, theme, and responsive behavior reviewed where relevant.
- [ ] Automated checks and CI outcomes recorded accurately.
- [ ] Findings are reproducible, actionable, and non-duplicative.
- [ ] Bug registers and QA handoff updated without losing history.
- [ ] Remaining gaps and unverified scenarios are explicit.

**Quality gate:** do not recommend merge while a known critical/high-risk defect, data-integrity concern, security issue, or required CI failure remains unresolved. If evidence is incomplete, state exactly what is missing and leave the PR unapproved when that gap blocks acceptance.


## 11. Evidence quality and risk-based release recommendation

Every finding must distinguish observation from inference. Label whether it is:
- Reproduced in a running build.
- Confirmed by an automated test.
- Supported by source inspection only.
- Reported by a user but not independently reproduced.
- Historical and not rechecked on the current commit.

A screenshot proves only the visible state captured; it does not establish hidden interactions, keyboard behavior, responsive states or underlying data integrity. A simulated browser permission API does not establish native OS permission behavior. A successful reload does not establish process-kill durability.

For each high-risk finding, record affected versions/commit, impact, likelihood, reproducibility, workaround, data at risk and required regression evidence. Recommend no-go for unresolved data-loss, security/privacy or release-blocking defects. Any accepted exception must have an authorized owner, explicit rationale, mitigation and expiry/review point.

## 12. Test design quality

- Prefer deterministic fixtures and isolated temporary workspaces.
- Assert user-visible outcomes and persisted filesystem state where relevant.
- Avoid tests that depend on timing alone; use controlled promises, barriers or fault injection for race conditions.
- Test both success and failure cleanup, including stream closure, locks and partial operations.
- Ensure tests are independent, repeatable and meaningful; remove duplication only when distinct guarantees remain covered.
- Keep native-browser/OS limitations explicit instead of treating mocks as equivalent.
- Record flaky tests and investigate root causes; do not hide flakes with arbitrary retries.

## 13. QA handoff format

For each QA pass, report:
- Target branch, exact commit and environment.
- Scope and acceptance criteria reviewed.
- Test cases and exact commands run.
- Passed, failed, blocked, skipped and not-run counts.
- Findings with stable IDs, severity, reproduction and evidence.
- CI workflow URL and tested SHA, if available.
- Limitations, residual risks and release recommendation.
- Tracker/context files updated.

Do not change a finding to fixed until the implementation exists and its relevant regression evidence passes on the intended commit.