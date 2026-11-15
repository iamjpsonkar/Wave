# Wave Cross-Team Delivery Workflow

## 1. Work intake

All planned engineering work starts with a GitHub issue or an explicitly approved task record.

The issue must identify:
- User problem and intended outcome.
- Scope and non-goals.
- Acceptance criteria and edge cases.
- Relevant feature/bug/UI/roadmap IDs.
- Dependencies and affected teams.
- Data, privacy, accessibility and migration implications.

Search existing issues before creating a duplicate. Assign one directly responsible owner and identify supporting teams.

## 2. Discovery and design

1. Product clarifies the problem and priority.
2. Feature owner drafts the proposed behavior and acceptance criteria.
3. Core Platform reviews architecture, data model, storage, migration and security implications when relevant.
4. Product Experience reviews interaction and accessibility implications.
5. QA identifies test strategy, regression scope and release risks.
6. DevOps identifies CI, packaging or deployment impact.
7. Record material decisions before implementation.

Large changes should be split into reviewable milestones with explicit dependencies.

## 3. Implementation

- Follow [howtodev.md](./howtodev.md).
- Use issue-linked branches and focused commits.
- Keep PRs small enough to review.
- Add tests alongside code.
- Avoid unrelated refactors and undocumented scope changes.
- Update relevant feature and technical docs as behavior changes.

## 4. Pull request review

A PR description must include summary, linked issue, acceptance criteria, design/data impact, tests run, CI evidence and limitations.

Required review depends on affected areas:
- Owning team review.
- Cross-team review for material boundary changes.
- QA review for acceptance and regression evidence.
- Security/platform review for sensitive data, permissions, network or persistence changes.

Reviewers must provide actionable comments. Authors must address comments or explain a documented alternative. No self-approval or bypass of required protection.

## 5. Verification and release

Before release:
- Required CI jobs pass for the exact PR head SHA.
- Acceptance criteria are verified.
- Critical/high-risk bugs are resolved or explicitly accepted by authorized product/engineering leadership with a documented mitigation.
- Data migration, backup, restore and rollback plans are checked where relevant.
- Release notes and user documentation are updated.
- QA records what was and was not tested.

QA provides an independent recommendation; the authorized release owner makes the final release decision under repository policy.

## 6. Post-release ownership

The feature-owning team remains responsible for:
- Defect triage and regression fixes.
- Compatibility and dependency maintenance.
- User feedback and usability improvements.
- Performance and reliability monitoring where applicable.
- Keeping feature docs and tests current.
- Deprecation or migration planning if the feature changes.

A feature is not orphaned after its original author moves to another task.

## 7. Team coordination

Suggested lightweight cadence, to be adapted to team size:
- Weekly product/engineering priority and dependency review.
- Short team planning and progress check-ins.
- PR review continuously, not batched until release day.
- Release readiness review for each meaningful release.
- Periodic architecture and technical-debt review.
- Retrospective after significant delivery or incident.

Avoid meetings without a decision, owner or useful outcome. Track decisions and actions in repository issues/docs.

## 8. Escalation

Escalate immediately when a change risks data loss, privacy breach, security exposure, unrecoverable migration, release-blocking regression or violation of product principles. Pause affected rollout until an authorized decision and mitigation are recorded.


## 9. Required work-item and PR fields

A work item should state the problem, user impact, scope, non-goals, acceptance criteria, dependencies, affected data, risks and owner. For a defect, include deterministic reproduction steps and observed versus expected behavior.

A pull request should include:
- Linked issue and target base branch.
- Summary and rationale.
- Acceptance-criteria checklist.
- Files/modules and cross-team impact.
- Data migration, privacy, security and accessibility implications.
- Exact commands run and outcomes.
- CI run/commit link where available.
- Manual checks, limitations and follow-up items.

## 10. Change sizing and dependency management

Prefer vertical slices that deliver a complete, testable user outcome. Keep refactors separate from behavior changes where practical. If a change requires a migration or staged rollout, make the dependency explicit and do not merge a consumer before its prerequisite contract is available.

When blocked, record the blocker, owner, decision needed and next review point in the issue. Do not silently change acceptance criteria to fit the implementation.