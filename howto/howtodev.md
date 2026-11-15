# Developer Workflow

> Practical guide for contributing code to Wave.
>
> Repository: https://github.com/iamjpsonkar/Wave  
> Working branch for this contribution guide: `manager`  
> Product/default integration branch: `main`
>
> Read this guide together with [DEV_CONTEXT.md](../DEV_CONTEXT.md), [README.md](../README.md), and [WIKI.md](../WIKI.md). Those files describe the product, architecture, setup, and repository-wide engineering constraints.

## 1. Before you start

1. Read the project context and understand the issue before editing code.
2. Select an open, actionable issue from [GitHub Issues](https://github.com/iamjpsonkar/Wave/issues). Check for an existing issue before creating a new one.
3. Confirm the issue's acceptance criteria, scope, dependencies, and expected behavior. Ask for clarification when the issue is ambiguous.
4. Inspect the current implementation and tests. Documentation and previous AI summaries are not substitutes for source inspection.
5. Check the current branch and working tree. Never overwrite or discard somebody else's uncommitted work.

Useful commands:

```bash
git status --short --branch
git branch --show-current
git remote -v
git fetch origin --prune
git log -5 --oneline --decorate
```

## 2. Create an issue branch

Use the issue ID in every development branch name. Pad numeric IDs to four digits:

| Issue | Branch |
|---|---|
| WAVE-1 | `WAVE-0001` |
| WAVE-42 | `WAVE-0042` |
| WAVE-1234 | `WAVE-1234` |

Start from the latest `origin/main` unless the issue explicitly depends on another approved base:

```bash
git fetch origin --prune
git switch main
git pull --ff-only origin main
git switch -c WAVE-XXXX
```

If the branch already exists, inspect it and check whether it contains work before switching to it. Do not reset, force-push, or rebase a shared branch without coordinating with its owner.

If your task is explicitly assigned to another integration branch, follow that instruction and record the intended PR base. Do not silently change the target branch.

## 3. Understand the architecture before changing it

Wave is a local-first Markdown workspace. The user's documents and assets live in the selected local workspace; do not introduce a backend, telemetry, remote processing, account requirement, or upload without an explicit product decision.

Key boundaries:

- `src/App.tsx`: React UI, editor lifecycle, navigation, and user interactions.
- `src/storage.ts`: filesystem operations, workspace data, collision handling, backups, Trash, validation, and concurrency.
- `src/workspaceRegistry.ts`: browser-local recent-workspace handle registry.
- `src/draftJournal.ts`: temporary browser-local unsaved-draft recovery.
- `src/safety.ts`: shared reliability and concurrency primitives.
- `src/markdown.tsx`: Markdown preprocessing and safe rendering extensions.
- `src/templates.ts`: built-in document templates.
- `src/styles.css`: application styling and responsive behavior.
- `tests/storage.test.js`: storage, integrity, and concurrency tests.
- `tests/e2e/workspace.spec.ts`: Playwright browser journeys.
- `.github/workflows/ci.yml`: continuous integration.

Read [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) and [docs/MARKDOWN_SUPPORT.md](../docs/MARKDOWN_SUPPORT.md) when your change touches those areas. Check the current source and `package.json` before relying on this map or on remembered commands.

## 4. Engineering principles

### Preserve user data

- Never silently overwrite documents, assets, backups, or restore destinations.
- Validate workspace-relative paths and reject traversal or unsafe names.
- Preserve the original error when a write fails; close or abort streams correctly.
- Keep destructive operations recoverable where the existing product contract requires it.
- Consider backup, restore, export, migration, and recovery whenever persisted data changes.

### Preserve the product contract

- Keep the app local-first and usable without an account.
- Keep Markdown and ordinary asset files portable and inspectable.
- Do not add network calls, analytics, remote media fetching, or third-party services without explicit approval and user-facing disclosure.
- Do not enable unrestricted raw HTML or script execution in Markdown.
- Do not silently remove, narrow, or mark planned product capabilities as cancelled.

### Keep changes maintainable

- Make the smallest cohesive change that solves the issue.
- Respect module boundaries; keep filesystem behavior out of React components.
- Prefer clear types, descriptive names, small functions, and explicit error states.
- Avoid unnecessary dependencies and unrelated refactors.
- Handle empty, loading, failure, permission-denied, conflict, and recovery states.
- Preserve keyboard access, focus behavior, semantic labels, contrast, responsive layouts, and reduced-motion preferences.

## 5. Implement and test

Add or update tests with the implementation. Cover normal behavior and meaningful edge cases, especially failure handling, concurrency, stale async work, path validation, and data integrity.

Install dependencies and run the project checks:

```bash
npm ci
npm test
npm run typecheck
npm run build
```

For browser-visible behavior, run the E2E suite using the Playwright version and browser setup used by CI. Check `package.json`, `config/playwright.config.ts`, and `.github/workflows/ci.yml` for the current setup:

```bash
npm install --no-save --package-lock=false @playwright/test@1.55.0
npx playwright install chromium
npm run test:e2e
```

Do not weaken or delete a meaningful assertion just to make CI green. If a test is incorrect, explain the mismatch and replace it with a test that verifies the actual acceptance criteria.

## 6. Keep project documentation in sync

Update only the canonical documents relevant to the change:

| Change | Documentation to consider |
|---|---|
| User-visible capability | `FEATURES.md`, `docs/ROADMAP.md`, and the relevant feature catalogue |
| Architecture or data contract | `docs/ARCHITECTURE.md`, `DEV_CONTEXT.md` |
| Markdown syntax or rendering | `docs/MARKDOWN_SUPPORT.md`, Markdown gap tracker |
| Confirmed bug fix | `bugs.md`, `fixed-bugs.md`, `dev-fixed.md` |
| Build, test, or CI change | `dev-build.md` |
| New or moved documentation | `docs/README.md` and affected links |
| QA disposition or test inventory | `QA_CONTEXT.md` |

Important distinctions:

- `upcoming-features.md` is the complete product scope catalogue. Do not prune it to make progress appear higher.
- `priority-features.md` is a prioritization plan, not a shipped-status report.
- `bugs.md` tracks current open findings; `fixed-bugs.md` preserves resolved findings and regression scenarios.
- `dev-fixed.md` and `dev-build.md` are separate implementation and verification histories.
- Keep stable issue IDs and historical evidence intact.

Always update `DEV_CONTEXT.md` as the final documentation step for a development task. Record the resulting revision, files changed, decisions, unresolved bugs, and exact verification evidence. Do not invent a commit SHA or CI result.

## 7. Commit conventions

Use focused commits with clear, imperative messages. Include the issue ID and the completion metadata in the project's established format:

```text
ID: WAVE-XXXX; DONE: 100; HOURS: 2; fix workspace restore collision handling
```

Guidance:

- `ID`: the tracked issue identifier.
- `DONE`: honest completion percentage for the issue, not an estimate of effort.
- `HOURS`: actual time spent, not a fabricated value.
- Message: concise description of the change.

Do not use `DONE: 100` while acceptance criteria, required tests, or documentation remain incomplete. If work is partial, report the actual percentage and explain what remains.

Before committing:

```bash
git diff --check
git status --short
git diff
```

Never commit secrets, credentials, local workspace data, generated build output, or unrelated changes.

## 8. Open a pull request

Push your issue branch and open a PR against the intended integration branch (normally `main`):

```bash
git push -u origin WAVE-XXXX
```

Create the PR at [GitHub Pull Requests](https://github.com/iamjpsonkar/Wave/pulls).

A useful PR description includes:

1. **Summary:** what changed and why.
2. **Issue:** link the relevant `WAVE-XXXX` issue.
3. **Acceptance criteria:** show how each criterion is addressed.
4. **Implementation:** key files, design decisions, and data/security implications.
5. **Verification:** exact commands and results; distinguish not run, failed, skipped, and passed.
6. **Limitations:** known gaps, follow-up work, and manual checks still required.

Keep the PR focused. Do not merge unrelated issues into one PR unless their dependency makes that necessary and the scope is agreed.

## 9. Respond to review

- Read every review comment and resolve the underlying concern, or explain why a change is not appropriate.
- Add regression tests for review-discovered defects.
- Push follow-up commits to the same branch and keep the PR description current.
- Resolve a review thread only after its concern has been addressed.
- Do not dismiss, hide, or bypass required review.
- Never approve your own PR or merge it to bypass repository protection. Wait for an authorized reviewer and required CI checks.

## 10. Definition of done

- [ ] Acceptance criteria are met without removing existing agreed functionality.
- [ ] Relevant regression and failure-path tests are added or updated.
- [ ] `npm test` passes.
- [ ] `npm run typecheck` passes.
- [ ] `npm run build` passes.
- [ ] `npm run test:e2e` passes when browser behavior is affected.
- [ ] Security, privacy, accessibility, and data-integrity implications are reviewed.
- [ ] Relevant product docs and trackers are updated.
- [ ] `DEV_CONTEXT.md` is updated last.
- [ ] PR includes verification evidence and remaining limitations.
- [ ] Required review and CI checks are complete before merge.

A feature is not complete merely because it works on the happy path or appears in the UI. Report evidence honestly and leave unresolved work visible.
