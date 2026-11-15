# Wave Team Charters

This document defines the mission, responsibilities, expected outputs and collaboration boundaries for each functional team.

## Team 01 — Core Platform & Architecture

**Mission:** Protect Wave's architecture, local-first foundations and user data.

**Roles:** Platform Lead, frontend/platform engineers, storage engineer, reliability engineer; security expertise may initially be shared.

**Owns:**
- Workspace filesystem adapter, workspace format and schema evolution.
- Persistence, path validation, collision handling and concurrency.
- Draft recovery, backup, restore, Trash and integrity guarantees.
- Architecture decisions, technical standards and threat-model input.

**Key areas:** `src/storage.ts`, `src/safety.ts`, `src/draftJournal.ts`, `src/workspaceRegistry.ts`, architecture documentation.

**Outputs:** Architecture proposals, safe storage changes, migration plans, reliability tests and documented technical decisions.

**Must consult:** QA for failure/recovery tests; Product for user-visible data behavior; DevOps for runtime constraints.

## Team 02 — Product Experience & UI

**Mission:** Make Wave understandable, accessible, responsive and efficient.

**Roles:** UI Lead, frontend engineers, UX/UI designer, accessibility specialist (shared initially).

**Owns:**
- Navigation, editor experience, settings, dialogs and command surfaces.
- Design system, visual consistency, responsive behavior and interaction patterns.
- Accessibility semantics, keyboard and focus behavior.
- Frontend integration of platform and feature capabilities.

**Key areas:** `src/App.tsx`, `src/styles.css`, shared UI components and UX documentation.

**Outputs:** Interaction designs, accessible components, visual regression coverage and user-facing UI behavior.

**Must consult:** Core Platform when UI changes storage lifecycle or data semantics; QA for accessibility and regression coverage.

## Team 03 — Feature Engineering

**Mission:** Deliver user-facing product capabilities without destabilizing existing workflows.

**Roles:** Feature Engineering Lead and product engineers. Form temporary squads around coherent capabilities.

**Workstreams:**
- Documents and blocks.
- Knowledge management, search and navigation.
- Databases, properties, relations and formulas.
- Projects, tasks, boards and calendars.
- Visual workspace, diagrams and whiteboards.
- Forms, productivity and automation.
- Collaboration and sharing when the architecture is ready.

**Outputs:** Implemented features, tests, migration/export considerations, feature documentation and maintained ownership after release.

**Must consult:** Product for acceptance criteria; Core Platform for data models; UI for interaction consistency; QA for test plans.

## Team 04 — Quality Engineering & Reliability

**Mission:** Independently assess correctness, regressions, security, accessibility and release risk.

**Roles:** QA Lead, automation QA, manual/exploratory QA, performance/security testing expertise.

**Owns:**
- Test strategy, test inventory and regression suites.
- Independent PR verification and release recommendations.
- Reproducible bug reports and evidence quality.
- Cross-browser, accessibility, performance and failure-path testing.

**Key areas:** `tests/`, `bugs.md`, `fixed-bugs.md`, `QA_CONTEXT.md` (subject to current repository paths).

**Outputs:** Reproducers, automated coverage, QA reports, release risk assessments and verified defect records.

**Independence:** QA may block a release recommendation when critical acceptance criteria or required evidence are missing. Developers remain responsible for fixing defects.

## Team 05 — DevOps & Infrastructure

**Mission:** Make development, CI, packaging and deployment repeatable and observable.

**Roles:** DevOps Lead/Engineer; release engineering may be shared.

**Owns:**
- CI workflows, build pipelines and repository automation.
- Docker and static hosting/deployment configuration.
- Dependency and toolchain automation.
- Release packaging, versioning, rollback procedures and operational runbooks.

**Key areas:** `.github/workflows/`, `config/`, `docker/`, deployment documentation.

**Outputs:** Reproducible pipelines, build artifacts, deployment procedures and release evidence.

**Must consult:** Engineering Director for standards; QA for test gates; feature teams for build requirements.

## Team 06 — Integrations & Ecosystem

**Mission:** Extend Wave's interoperability and extensibility without compromising user control.

**Roles:** Ecosystem Lead, integration engineers, API/plugin engineer; security review shared with Core Platform.

**Owns:**
- Import/export interoperability and external integrations.
- Developer APIs, SDKs, extension points and plugin lifecycle.
- Capability permissions, sandboxing and revocation design.
- Optional AI/provider integrations and data-flow controls.

**Outputs:** Integration specifications, permission models, compatibility tests, developer documentation and opt-in user controls.

**Guardrail:** No silent uploads, telemetry, remote processing or third-party data access.

## Team 07 — Product Strategy & Documentation

**Mission:** Ensure Wave solves the right problems and its requirements and knowledge remain understandable.

**Roles:** Product Manager, product/business analyst, researcher, technical writer.

**Owns:**
- Product discovery, requirements and acceptance criteria.
- Roadmap and priority coordination.
- User and competitor research.
- Product, contributor and operator documentation.
- Feature traceability from proposal through release.

**Key documents:** `upcoming-features.md`, `priority-features.md`, `FEATURES.md`, `docs/ROADMAP.md`, `WIKI.md` (verify current paths before editing).

**Outputs:** Problem briefs, specifications, prioritization rationale, release notes and accurate documentation.

## Shared responsibilities

Every team must:
- Follow the local-first, privacy and data-integrity product contract.
- Add or update tests for changed behavior.
- Review security, accessibility, performance and recovery implications.
- Maintain relevant documentation and trackers.
- Record limitations honestly and support defects in areas they own.

## Team interfaces

| Work crosses | Required collaboration |
|---|---|
| UI ↔ Storage | UI defines user journey; Platform defines safe data contract |
| Feature ↔ Platform | Feature defines capability; Platform reviews schema, persistence and lifecycle |
| Feature ↔ QA | Acceptance criteria become reproducible tests |
| All teams ↔ DevOps | Pipeline and release requirements are agreed before merge |
| Ecosystem ↔ Security/Platform | Permission, network and data boundaries reviewed before implementation |
| Product ↔ Engineering | Scope, feasibility, dependencies and acceptance are agreed before build |
