# Wave Code Ownership & Decision Boundaries

## 1. Purpose

Ownership identifies the first responsible team for maintenance and review. It does not prevent other teams from contributing. Verify the current repository tree before applying path rules; paths below reflect the documented architecture and must be updated when files move.

## 2. Ownership map

| Area / paths | Primary owner | Required consultation |
|---|---|---|
| `src/storage.ts`, workspace format, migrations | Core Platform | QA, Product |
| `src/safety.ts`, `src/draftJournal.ts`, `src/workspaceRegistry.ts` | Core Platform | QA |
| `src/App.tsx`, `src/styles.css`, shared UI | Product Experience | Feature, QA |
| `src/markdown.tsx` | Product Experience | Core Platform, QA |
| `src/templates.ts` | Feature Engineering | Product Experience, QA |
| `tests/**` | Quality Engineering | Owning implementation team |
| `.github/workflows/**`, `config/**`, `docker/**` | DevOps | Engineering Director, QA |
| `docs/**`, root product docs, `howto/**` | Product & Documentation | Relevant technical owner |

This is a proposed logical ownership map, not a claim that GitHub CODEOWNERS or GitHub Teams have already been configured.

## 3. Review expectations

- Every PR must have an author and a responsible issue/feature owner.
- Changes to a team's owned area require review from that team or an explicitly delegated maintainer.
- Cross-boundary changes require review from each materially affected owner.
- Data format, storage, recovery, security or privacy changes require Core Platform review and QA involvement.
- CI/deployment changes require DevOps review.
- User-facing interaction changes require Product Experience review.
- Documentation-only changes still require technical fact-checking by the relevant owner.
- Required repository branch protection and CODEOWNERS rules must be configured separately in GitHub.

## 4. Maintainer authority

Repository maintainers administer repository-level settings, protect branches, manage releases and resolve escalations. Team ownership does not automatically grant GitHub write/admin permissions.

Use least privilege:
- Read access by default where appropriate.
- Write access only for contributors who need to push branches or maintain code.
- Maintain/admin permissions restricted to trusted maintainers.
- Secrets and deployment credentials restricted to the smallest necessary group.
- Review and release authority documented separately from code authorship.

## 5. Ownership changes

When a file or capability moves:
1. Identify current and future owners.
2. Update this map and any actual CODEOWNERS file.
3. Update relevant docs and links.
4. Ensure tests and operational knowledge transfer with the code.
5. Record the decision and effective commit.

Do not claim GitHub teams, CODEOWNERS, branch protection or permissions are active until they have actually been configured and verified.
