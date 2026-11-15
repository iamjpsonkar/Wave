# Wave How-To & Operating Handbook

This directory contains the practical operating procedures and governance documents for people and AI agents working on Wave.

## Guides

- [Developer workflow](./howtodev.md) — issue-to-PR engineering process.
- [QA workflow](./howtoqa.md) — testing, review, bug reporting and release evidence.

## Organization and governance

- [Organization](./organization.md) — reporting structure, leadership and operating model.
- [Teams](./teams.md) — team missions, roles, responsibilities and interfaces.
- [Ownership](./ownership.md) — code ownership, review boundaries and decision rights.
- [Workflow](./workflow.md) — cross-team feature lifecycle and ceremonies.
- [Engineering rules](./engineering-rules.md) — mandatory technical, security, quality and documentation policies.
- [Hiring roadmap](./hiring-roadmap.md) — staged staffing plan and role priorities.

## Authority and conflict resolution

These documents describe how work is organized; they do not override product scope or technical facts. Follow the product principles and complete feature catalogue, inspect current source/tests for implementation truth, and use current CI evidence for verification. Read [DEV_CONTEXT.md](../DEV_CONTEXT.md), [QA_CONTEXT.md](../QA_CONTEXT.md), and [WIKI.md](../WIKI.md) for repository handoff and product context.

Keep this handbook aligned with actual repository structure. When a process or ownership boundary changes, update the relevant page and the handoff records required by the task. Do not create duplicate trackers for bugs, features, or implementation history.


## How to use this handbook

1. Start with the repository-root [AGENTS.md](../AGENTS.md); it is the single first-read contract for AI agents and contributors.
2. Use [howtodev.md](./howtodev.md) for implementation, branching, commits and pull requests.
3. Use [howtoqa.md](./howtoqa.md) for independent verification, bug triage and release evidence.
4. Use [organization.md](./organization.md), [teams.md](./teams.md) and [ownership.md](./ownership.md) to determine accountability and review boundaries.
5. Use [workflow.md](./workflow.md) for cross-team delivery and [engineering-rules.md](./engineering-rules.md) for mandatory engineering constraints.
6. Use [hiring-roadmap.md](./hiring-roadmap.md) only for staffing and growth planning.

## Document ownership

| Document | Owner | Update trigger |
|---|---|---|
| `howtodev.md` | Engineering leadership | Branch, PR, implementation or contributor process changes |
| `howtoqa.md` | QA leadership | Test strategy, bug lifecycle or release evidence process changes |
| `organization.md` | Product Owner | Reporting, decision rights or organizational model changes |
| `teams.md` | Engineering Director | Team mission, scope or interfaces change |
| `ownership.md` | Engineering Director / maintainers | Code paths, review rules or permissions change |
| `workflow.md` | Engineering + Product | Delivery lifecycle or release process changes |
| `engineering-rules.md` | Engineering Director | Product invariants or mandatory engineering policy changes |
| `hiring-roadmap.md` | Product Owner | Approved staffing strategy or team capacity assumptions change |

These are proposed document owners, not assertions that named employees or GitHub teams currently exist.

## Project reference library

See the canonical [etc documentation index](../etc/README.md) for product scope, engineering architecture, deployment, quality registers, issue traceability and development history. Keep this handbook focused on operating procedures and team governance.
