# Wave Organization

## 1. Purpose

Wave uses a product-engineering organization designed to deliver new capabilities while protecting the reliability, privacy, portability and local-first nature of the product.

The organization is a functional model, not a requirement to hire every role immediately. In a small team, one person may hold multiple responsibilities, but review and approval duties should remain explicit.

## 2. Leadership structure

```text
Founder / Product Owner
├── Engineering Director / Technical Lead
│   ├── Core Platform & Architecture
│   ├── Product Experience & UI
│   ├── Feature Engineering
│   ├── Quality Engineering & Reliability
│   ├── DevOps & Infrastructure
│   └── Integrations & Ecosystem
└── Product Manager
    └── Product Strategy, Research & Documentation
```

### Founder / Product Owner
- Owns product vision, target users, business priorities and final scope decisions.
- Approves major changes to product principles, privacy model and roadmap commitments.
- Resolves priority conflicts and accepts material product trade-offs.

### Engineering Director / Technical Lead
- Owns engineering execution, architecture governance and technical quality.
- Coordinates engineering leads and cross-team dependencies.
- Ensures capacity, technical debt and operational risks are visible.
- Does not unilaterally redefine product scope or privacy commitments.

### Product Manager
- Converts product direction into problem statements, requirements and prioritized outcomes.
- Maintains roadmap traceability and acceptance criteria.
- Coordinates user research and product documentation.
- Works with engineering to keep scope feasible and measurable.

### Team leads
Each team lead maintains ownership boundaries, plans work, mentors contributors, reviews relevant changes and reports risks. A lead is accountable for quality, not a gate that prevents collaboration.

## 3. Seven functional teams

1. Core Platform & Architecture
2. Product Experience & UI
3. Feature Engineering
4. Quality Engineering & Reliability
5. DevOps & Infrastructure
6. Integrations & Ecosystem
7. Product Strategy & Documentation

Detailed charters and interfaces are defined in [teams.md](./teams.md).

## 4. Operating principles

- Product direction is owned by the Product Owner; engineering implementation choices are owned by engineering within approved constraints.
- Security, privacy and data integrity are shared responsibilities, with specialist ownership.
- QA has independent authority to report release blockers and recommend no-go.
- Teams collaborate through issues, documented interfaces, pull requests and review—not informal assumptions.
- Every work item has one directly responsible owner, even when several teams contribute.
- No role or team may silently remove previously agreed product scope.

## 5. Decision rights

| Decision | Accountable role | Required consultation |
|---|---|---|
| Product vision and major scope | Product Owner | Product Manager, Engineering Director |
| Feature priority and acceptance | Product Owner / Product Manager | Feature Lead, QA |
| Architecture and technical standards | Engineering Director | Core Platform and affected leads |
| Data format or migration | Engineering Director | Core Platform, QA, Product |
| Privacy or data-flow change | Product Owner | Engineering, Security, QA |
| Release go/no-go | Release owner / Engineering Director | QA Lead, DevOps, feature owners |
| Bug severity and technical triage | QA Lead with Engineering | Affected team |
| Documentation policy | Product Manager | Engineering and QA |

Escalate unresolved risks rather than proceeding on an undocumented assumption.

## 6. Scaling

Start with a lean cross-functional group and combine roles where necessary. Split teams or create feature squads only when workload, ownership conflicts or sustained delivery demand justify it. See [hiring-roadmap.md](./hiring-roadmap.md).
