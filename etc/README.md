# Wave Project Documentation

This directory contains the maintained product specifications, engineering references, quality registers and implementation history. It replaces the former `trash/` directory; none of that directory's meaningful records were discarded.

## Documentation rules

- Current source, tests and fresh CI are authoritative for shipped behavior.
- Feature catalogues and roadmaps represent planned scope unless an item has explicit implementation and verification evidence.
- Preserve stable IDs, acceptance criteria, issue links and historical evidence.
- Update the owning document after every implementation or QA task; follow [AGENTS.md](../AGENTS.md).
- Never mark a feature shipped or a bug fixed from documentation edits alone.
- Use explicit statuses: **Shipped & verified**, **Implemented; verification pending**, **In progress**, **Planned**, **Proposed**, **Blocked**, **Deprecated**.
- Append dated evidence; do not overwrite historical audit snapshots.

## Product and roadmap
- [Feature overview](./product/FEATURES.md)
- [Complete feature blueprint](./product/upcoming-features.md)
- [Priority features](./product/priority-features.md)
- [Release roadmap](./product/ROADMAP.md)
- [UI backlog](./product/UI_BACKLOG.md)
- [Markdown compatibility matrix](./product/markdown-coverage.md)
- [Diagram editor blueprint](./product/diagram-features.md)

## Engineering and operations
- [Architecture](./engineering/ARCHITECTURE.md)
- [Markdown support](./engineering/MARKDOWN_SUPPORT.md)
- [Docker deployment](./engineering/DOCKER.md)
- [Contributing](./engineering/CONTRIBUTING.md)

## Quality and issue tracking
- [Open bugs](./quality/bugs.md)
- [Fixed bugs](./quality/fixed-bugs.md)
- [GitHub issue index](./quality/github-issues.md)

## Engineering history
- [Development/build log](./history/dev-build.md)
- [Development fix log](./history/dev-fixed.md)

## Root context and contributor handbook
- [Agent operating contract](../AGENTS.md)
- [Developer handoff](../DEV_CONTEXT.md)
- [QA handoff](../QA_CONTEXT.md)
- [Project wiki](../WIKI.md)
- [Contributor handbook](../howto/README.md)
- [User-facing overview](../README.md)
- [Project license](../LICENSE) — canonical MIT License text

## Production documentation standard

A production-facing claim must identify the behavior, supported environment, storage/privacy implications, failure behavior and verification evidence. A production build or Docker deployment describes packaging/hosting capability; it does not by itself establish operational readiness, security certification, backups, monitoring, uptime, cross-browser support or a production release.
