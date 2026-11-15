# Wave documentation

> For the complete product vision, repository architecture, owner instructions, development rules and AI-agent onboarding, start with the [Wave Wiki](../../WIKI.md).

## Understand and use Wave

- [Project overview and quick start](../../README.md)
- [Implemented feature overview and detailed feature map](../FEATURES.md)
- [Markdown syntax and compatibility](MARKDOWN_SUPPORT.md)
- [Docker deployment](DOCKER.md)

## Product and architecture

- [Architecture and reliability boundaries](ARCHITECTURE.md)
- [Complete product blueprint and feature catalogue](../upcoming-features.md)
- [Priority delivery plan](../priority-features.md)
- [Markdown compatibility gaps and acceptance checklist](../features-gap.md)
- [Diagram and visualization feature catalogue](../diagram-features.md)
- [Product release roadmap](ROADMAP.md)

## Development and quality

- [Contributor guide](../CONTRIBUTING.md)
- [Developer context / AI handoff](../../DEV_CONTEXT.md)
- [Consolidated QA context and audit history](../../QA_CONTEXT.md)
- [Consolidated UI bugs, gaps and feature backlog](../UI_BACKLOG.md)
- [Current open bugs](../bugs.md)
- [Fixed bugs and regression scenarios](../fixed-bugs.md)
- [Development build and CI history](../dev-build.md)
- [Implemented fixes history](../dev-fixed.md)
- [GitHub issue index](../github-issues.md)

## Repository conventions

- `src/` — application source and browser storage adapters.
- `tests/` — Node storage tests and Playwright browser journeys.
- `.github/workflows/` — CI automation.
- `docker/` — static web-server configuration for the container image.
- `docs/` — user-facing Markdown, architecture, roadmap and deployment documentation.
- Root Markdown files contain the product constitution, AI-agent wiki, full feature catalogue, priority plan and maintained engineering registers.

## Documentation maintenance

Every implementation/QA task must review and update the authoritative Markdown files that describe the changed behavior. See the [wiki's documentation enforcement policy](../../WIKI.md#documentation-enforcement-after-every-task). Avoid duplicate sources of truth; consolidate meaningful content before removing obsolete Markdown files.
