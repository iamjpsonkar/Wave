# AGENTS.md — Wave Agent Operating Guide

> **Read this file first.** This is the single entry point for any human or AI agent asked to plan, build, fix, test, review, document, or maintain Wave.
>
> Repository: https://github.com/iamjpsonkar/Wave  
> Product: Wave — a local-first workspace for notes, documents and ideas.  
> Default integration branch: `main`. A task may explicitly target another branch (for example, `manager`); follow the user's stated target and never assume.  
> This guide is the operating contract. It is not a substitute for inspecting the current source, tests, issue, and CI evidence relevant to a task.

---

## 1. What Wave is

Wave is a local-first workspace. A user chooses a local folder; Wave creates and manages a portable `.wave/` workspace inside it. Documents are Markdown files and attachments are ordinary files that users own and can inspect outside Wave.

Current product capabilities include Markdown writing and preview, folders and navigation, templates, favorites, wiki links/backlinks, search, local attachments, autosave, external-edit conflict checks, unsaved-draft recovery, recoverable Trash, verified backups and restore. Consult the current [README](./README.md) and [FEATURES](./trash/FEATURES.md) for the verified shipped scope.

The broader agreed product scope is maintained in [upcoming-features.md](./trash/upcoming-features.md); [priority-features.md](./trash/priority-features.md) controls sequencing, not whether a feature may be forgotten. Do not silently remove, narrow, or mark an agreed feature as cancelled.

## 2. Why Wave has strict rules

Wave handles users' personal and potentially irreplaceable documents. A feature that looks correct but loses data, silently overwrites a file, leaks content, breaks portability, or makes recovery unreliable is not a successful feature.

Engineering priorities, in order:
1. User data integrity and recoverability.
2. Privacy, security and user control.
3. Correctness and backward compatibility.
4. Accessibility and usability.
5. Performance and maintainability.
6. Feature breadth and delivery speed.

### Non-negotiable product contract

- **Local-first:** saved documents and assets remain in the user-selected workspace.
- **Portable:** Markdown and ordinary assets remain usable outside Wave.
- **Private by default:** do not introduce accounts, backend services, uploads, analytics, remote processing, telemetry, remote media fetching or third-party services without explicit product approval, user-facing disclosure and appropriate consent.
- **Safe storage:** never silently overwrite user content, backups or restore destinations.
- **Safe Markdown:** do not enable unrestricted raw HTML or script execution; sanitize rendered content and validate URLs.
- **Preserve scope:** existing functionality, accepted requirements, stable IDs and historical evidence must not be discarded to simplify a task.

IndexedDB is used for browser-local workspace-handle registry and temporary unsaved-draft recovery; it is not the canonical document store. Do not assume Wave has a server API, account system, cloud database or collaboration backend.

## 3. How an agent must start

Before changing anything:

1. Read this file and identify the requested outcome, constraints and target branch.
2. Inspect Git state and repository HEAD. Do not assume the branch, clean working tree, file layout, issue status or documentation snapshot is current.
3. Read the relevant GitHub issue/PR and acceptance criteria. Search existing issues before creating duplicates.
4. Inspect current source, tests, package scripts and CI workflow related to the task. Documentation and old agent summaries are not proof of implementation.
5. Find the authoritative trackers and documentation for the affected area. Preserve their IDs and history.
6. Identify risks, dependencies, affected ownership teams and test strategy.
7. If the task is ambiguous in a way that could change product scope, data handling, security, destructive behavior or acceptance criteria, ask one focused clarification before proceeding. Otherwise make a reasonable, reversible implementation decision and record it.

Useful initial commands:

```bash
git status --short --branch
git branch --show-current
git remote -v
git fetch origin --prune
git log -5 --oneline --decorate
```

Never discard another contributor's work. Never reset, force-push, rebase a shared branch or change the target branch without authorization.

## 4. How Wave is structured

The current documented architecture (verify files before relying on it):

- `src/App.tsx` — React workspace UI, application state and user interactions.
- `src/storage.ts` — filesystem/workspace operations, validation, collision handling, backups, Trash and concurrency.
- `src/workspaceRegistry.ts` — browser-local recent workspace handle registry.
- `src/draftJournal.ts` — browser-local temporary unsaved-draft recovery.
- `src/safety.ts` — shared safety, queue, revision and concurrency primitives.
- `src/markdown.tsx` — Markdown preprocessing and safe rendering extensions.
- `src/templates.ts` — built-in templates.
- `src/styles.css` — application styling and responsive behavior.
- `tests/storage.test.js` — storage and safety tests.
- `tests/e2e/workspace.spec.ts` — Playwright browser journeys.
- `.github/workflows/ci.yml` — CI workflow.
- `config/` and `docker/` — build/test/deployment configuration.

Runtime and implementation details may change. Inspect the current source and `package.json` before editing or quoting this map. Read `docs/ARCHITECTURE.md` and `docs/MARKDOWN_SUPPORT.md` when relevant.

### Organizational model

Wave uses seven functional teams. This is a responsibility model; it does not mean all teams are staffed or that GitHub permissions have been configured:

1. **Core Platform & Architecture** — storage, workspace format, migrations, data integrity, recovery, concurrency and technical architecture.
2. **Product Experience & UI** — editor, navigation, design system, interaction patterns, responsive UI and accessibility.
3. **Feature Engineering** — user-facing capabilities and their ongoing maintenance.
4. **Quality Engineering & Reliability** — independent testing, regression, bug evidence, security/accessibility/performance verification and release recommendation.
5. **DevOps & Infrastructure** — CI/CD, build, dependencies, Docker, packaging and release automation.
6. **Integrations & Ecosystem** — import/export, APIs, plugins and opt-in integrations.
7. **Product Strategy & Documentation** — discovery, requirements, acceptance criteria, prioritization, research and documentation.

Every task has one directly responsible owner, even when multiple teams contribute. The feature-owning team remains responsible after release.

## 5. How work is delivered

Use this lifecycle for features, fixes, refactors and maintenance:

1. **Understand:** confirm issue, user problem, scope, non-goals and acceptance criteria.
2. **Design:** identify affected modules, data flows, migrations, security/privacy implications, accessibility, dependencies and rollback/recovery needs.
3. **Assign:** name one directly responsible owner and supporting reviewers/teams.
4. **Plan:** split large work into focused, reviewable steps. Preserve existing functionality and avoid unrelated refactors.
5. **Implement:** change the real underlying behavior, not only a mockup, placeholder or disabled control. Add regression tests with the change.
6. **Verify:** run relevant tests and checks; inspect the actual diff and resulting behavior.
7. **Review:** open a focused PR with issue link, acceptance mapping, design/data impact, exact verification evidence and limitations. Obtain required ownership and QA reviews.
8. **Document:** update authoritative Markdown records and user/developer docs affected by the change.
9. **Handoff:** record exact commit, changed files, decisions, verification, known limitations and next steps.

Follow [howto/howtodev.md](./howto/howtodev.md) for the detailed developer/PR process and [howto/howtoqa.md](./howto/howtoqa.md) for the detailed QA process. These are supporting procedures; this file remains the first-read entry point.

### Branch and PR discipline

- Default integration target is `main`, unless the user explicitly specifies another branch.
- Use issue-linked branches, e.g. `WAVE-0042` for issue 42, unless the repository's current policy or task specifies otherwise.
- Do not push feature work directly to the integration branch unless explicitly authorized.
- Do not self-approve or bypass required reviews, branch protection or failing checks.
- Never claim GitHub Teams, CODEOWNERS, branch protections, permissions or approvals exist until verified in GitHub settings.

## 6. How to test and report honestly

Check the current `package.json` and CI workflow for authoritative commands. The usual baseline is:

```bash
npm ci
npm test
npm run typecheck
npm run build
```

For browser-visible changes, use the CI-matched Playwright setup and run:

```bash
npm run test:e2e
```

Also test the relevant failure paths: empty/invalid input, cancellation, permission denial, failed writes, stale async work, concurrency, external edits, recovery and migration where applicable. Use disposable workspaces for destructive tests.

Every report must distinguish:
- Source inspection.
- Test definitions present.
- Tests actually executed locally.
- Fresh CI results for the exact commit.
- Manual browser/OS verification.
- Not run, skipped, blocked or unverified checks.

A test file existing is not evidence of a pass. A historical green CI run does not verify a newer commit. Never invent results, screenshots, review approvals or commit IDs.

## 7. How to maintain documentation and project memory

Documentation is part of every task. After each implementation, bug fix, refactor, QA audit, dependency/configuration change or user-visible behavior change:

- Update the relevant feature catalogue/status map and feature specification.
- Update `bugs.md` for current open findings and `fixed-bugs.md` only when a fix and regression evidence are established.
- Keep `trash/dev-fixed.md` for fix history and `trash/dev-build.md` for feature/build/CI implementation history, following the current repository's conventions.
- Update `QA_CONTEXT.md` after QA work and `DEV_CONTEXT.md` for implementation handoff changes.
- Update roadmap/priority records only when their facts or status change. Never prune the full feature scope to make progress look better.
- Update relevant user docs, architecture docs and `howto/` procedures.
- Check links, paths, case, duplicate sources of truth and stale statements.
- Preserve stable issue IDs, prior decisions and meaningful history. Append or reconcile; do not erase evidence.

**Update `DEV_CONTEXT.md` as the final documentation action of an implementation batch.** For QA-only work, update `QA_CONTEXT.md` with the exact commit and evidence; do not fabricate implementation changes.

## 8. Definition of done

A task is done only when:
- The requested outcome and acceptance criteria are met.
- Existing agreed functionality and scope are preserved.
- Relevant tests are added/updated and run, or unrun checks are explicitly disclosed.
- Security, privacy, data integrity, accessibility and recovery impacts are addressed.
- Required reviews and CI checks are satisfied before merge.
- Relevant documentation, trackers and handoff records are current.
- The final report lists files changed, commit/PR links, exact verification and remaining limitations.

Do not report 100% completion while acceptance criteria, required checks, documentation or required reviews remain outstanding.

## 9. Where to find deeper information

This is the only file an agent should need as its initial instruction. Read supporting sources only as the task requires:

- [README.md](./README.md) — product overview and setup.
- [WIKI.md](./WIKI.md) — full project history, detailed agent context and repository map.
- [DEV_CONTEXT.md](./DEV_CONTEXT.md) — current developer handoff.
- [QA_CONTEXT.md](./QA_CONTEXT.md) — QA disposition, test inventory and known limitations.
- [howto/README.md](./howto/README.md) — contributor and organizational handbook index.
- [howto/organization.md](./howto/organization.md), [teams.md](./howto/teams.md), [ownership.md](./howto/ownership.md), [workflow.md](./howto/workflow.md), [engineering-rules.md](./howto/engineering-rules.md) — team governance and engineering rules.
- [upcoming-features.md](./trash/upcoming-features.md) and [priority-features.md](./trash/priority-features.md) — full scope and delivery priority.
- [bugs.md](./trash/bugs.md), [fixed-bugs.md](./trash/fixed-bugs.md), and relevant UI/Markdown gap trackers — current defects and coverage gaps.
- [GitHub Issues](https://github.com/iamjpsonkar/Wave/issues), PRs and current Actions runs — live work and verification evidence.

If a supporting document conflicts with current source or a newer explicit user decision, investigate and reconcile it; do not silently guess. Security and data-protection constraints remain mandatory.

---

## 10. Agent task handoff template

When reporting back, use this structure:

```text
Task:
Issue / PR:
Target branch and commit:
Summary:
Files changed:
Design and data-safety decisions:
Tests run (exact commands and results):
CI evidence (exact commit/run):
Documentation updated:
Known limitations / unverified areas:
Follow-up work:
```

**Operating principle:** Understand what Wave is, why the requested change matters, and how it must be delivered safely. Then inspect, implement, test, document and report with evidence.


---

## 11. Execution protocols by task type

Choose the smallest protocol that fully satisfies the request; do not apply a feature-build workflow to a documentation-only or research-only task.

### Feature or enhancement
- Trace the requirement to the complete feature catalogue and priority plan.
- Define user journey, acceptance criteria, empty/error/cancel states and non-goals.
- Review architecture/data contracts and cross-team dependencies.
- Implement real behavior, tests, docs and release notes.
- Verify backward compatibility and preserve existing capabilities.

### Bug fix
- Reproduce or establish source-supported evidence before changing code.
- Identify root cause and affected paths; search for related regressions and stable IDs.
- Add a regression test that fails before the fix.
- Fix the root cause, not just the symptom.
- Update the open/fixed registers only when status and evidence justify it.

### Refactor or maintenance
- State the intended invariant and why the refactor is needed.
- Preserve externally observable behavior unless explicitly changing it.
- Use tests and diff review to demonstrate equivalence.
- Avoid bundling feature scope or unrelated formatting.

### QA or audit
- Capture branch, commit, environment and exact scope.
- Separate observed facts, reproduction, source inference and historical claims.
- Do not modify application behavior unless the user also requested a fix.
- Update QA records with evidence and residual risk.

### Documentation or governance
- Identify the canonical owner of each fact before editing.
- Preserve meaningful requirements, stable IDs, decisions and history.
- Resolve duplicate or conflicting guidance rather than adding another competing source.
- Check every relative link and filename against the target branch.
- Do not claim GitHub settings, team membership or CI enforcement based on a Markdown proposal.

### Research or planning
- Label external facts, repository facts, assumptions and recommendations separately.
- Link sources and record the date for volatile information.
- Do not convert a proposal into a shipped capability or an approved commitment.

## 12. Authority, conflicts and safe autonomy

Apply this precedence:
1. Applicable law, platform safety requirements and explicit security/privacy constraints.
2. The user's latest explicit instruction for this task, within those constraints.
3. Current source code, tests, package scripts, GitHub configuration and verified runtime behavior for implementation facts.
4. Current canonical product decisions and scope catalogue.
5. This guide and supporting how-to procedures.
6. Historical logs, old issue comments, prior agent summaries and inferred assumptions.

A lower-ranked source cannot silently override a higher-ranked one. If two current authoritative sources conflict, stop before an irreversible or scope-changing action, surface the conflict and ask for a decision. For a reversible documentation inconsistency, preserve both facts with clear status and reconcile the canonical owner.

Agents may autonomously inspect, plan, edit scoped files, add tests and run safe local checks. Obtain explicit authorization before destructive data operations, production releases, permission/secret changes, branch-protection changes, force pushes, history rewrites, external data transfer or changes that materially alter the privacy/product contract.

## 13. Repository documentation map and link discipline

Use [howto/README.md](./howto/README.md) as the index for the operational handbook. Use [WIKI.md](./WIKI.md) for broad project orientation, [DEV_CONTEXT.md](./DEV_CONTEXT.md) for the latest development handoff and [QA_CONTEXT.md](./QA_CONTEXT.md) for QA disposition. Trackers and detailed product specifications remain separate because they have distinct purposes.

Repository paths and filenames have changed over time. Before linking to or editing a tracker, verify its exact current path and case on the target branch. A link mentioned in an old document is not proof the destination still exists. Never create a replacement tracker just because an expected path returns 404; search the current repository and migrate meaningful history deliberately.

## 14. Final response contract

End every task with a concise, evidence-based report:
- Outcome and scope completed.
- Target branch and exact commit/PR.
- Files changed and why.
- Tests/checks actually run, with results.
- Checks not run and why.
- Known risks, limitations and follow-up.
- Documentation/tracker updates.

Use precise language: “implemented”, “source-reviewed”, “test-defined”, “locally passed”, “CI passed on SHA …”, and “not verified” mean different things. Never use “fully tested”, “production-ready” or “100% complete” without evidence for the relevant acceptance criteria.