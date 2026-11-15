# Wave Hiring & Team Growth Roadmap

## 1. Purpose

This roadmap translates the seven-team operating model into staged staffing. It is a planning recommendation, not a claim about current employees, budget or approved vacancies.

## 2. Hiring principles

- Hire for the current bottleneck, not the largest possible org chart.
- Prefer strong generalists early, with clear specialist accountability.
- Keep QA independent from feature implementation decisions.
- Do not create a team lead role without a real team or sustained coordination need.
- Use contractors or specialist reviews for intermittent needs where appropriate.
- Reassess staffing after each stage using delivery, quality and maintenance load.

## 3. Stage 1 — Lean foundation (approximately 5–8 people)

Suggested coverage:
1. Founder / Product Owner.
2. Engineering Director / senior full-stack technical lead.
3. One additional platform/full-stack engineer.
4. One frontend/product engineer.
5. One QA engineer with automation skills.
6. Product/UX designer (may be part-time or shared).
7. Product Manager / technical writer responsibilities shared initially.
8. DevOps responsibilities shared by engineering until workload justifies a dedicated hire.

At this stage, all seven functions exist as responsibilities, but not as seven separate departments.

**Priority hires:** senior technical lead, platform/full-stack engineer, product/frontend engineer, QA automation engineer.

## 4. Stage 2 — Growing product team (approximately 10–15 people)

Add capacity where roadmap delivery and maintenance load justify it:
- Dedicated Core Platform engineers.
- Dedicated UI/UX and frontend capacity.
- Feature engineers grouped into stable workstreams.
- Second QA engineer for E2E, accessibility, exploratory and release testing.
- Dedicated DevOps/release engineer.
- Product Manager or analyst.
- Technical writer/documentation owner, potentially shared with product.

Split Feature Engineering into squads only when workstreams have sustained independent backlogs and technical ownership.

## 5. Stage 3 — Multi-squad organization (approximately 15–30 people)

Potential structure:
- Core Platform squad.
- Product Experience squad.
- Feature squads for Documents/Knowledge, Databases/Projects, and Visual/Automation capabilities.
- Quality Engineering function with automation and specialist testing.
- DevOps/Release function.
- Ecosystem/Integrations function.
- Product Management, Research and Documentation.

Add security, performance, accessibility or data architecture specialists when the risk and workload warrant dedicated roles.

## 6. Stage 4 — Larger organization (30–60+)

Introduce additional management layers only when span of control requires them:
- Engineering managers for multiple squads.
- Dedicated security and privacy engineering.
- Developer relations and ecosystem support.
- Release management and site reliability expertise if online services are introduced.
- Research, design systems and dedicated accessibility specialists.
- Customer support and technical support with escalation paths into engineering.

Do not assume Wave needs a large backend/SRE organization while it remains a local-first static application. Revisit staffing if the product architecture and service model materially change.

## 7. Role scorecards

### Engineering Director / Technical Lead
- Proven architecture and delivery leadership.
- Strong code review, mentoring and risk management.
- Understands storage, browser constraints and data integrity.
- Can balance roadmap speed with reliability.

### Core Platform Engineer
- TypeScript/browser APIs and filesystem/storage experience.
- Concurrency, migration, recovery and testing discipline.
- Security and data-integrity mindset.

### Product/Frontend Engineer
- React, TypeScript, accessible interaction design.
- Component architecture and responsive UX.
- Strong testing and maintainability practices.

### QA Engineer
- Test strategy, automation and exploratory testing.
- Playwright/browser debugging and CI literacy.
- Ability to produce deterministic reproducers and evidence.
- Independence and willingness to block unsafe releases.

### DevOps Engineer
- GitHub Actions, Docker, build/release automation.
- Supply-chain and secret-management fundamentals.
- Reproducible environments and incident response.

### Product Manager / Researcher
- User discovery, problem framing and prioritization.
- Clear specifications and measurable acceptance criteria.
- Ability to preserve long-term scope while sequencing delivery.

### Technical Writer
- Clear developer/user documentation.
- Information architecture, Markdown and link maintenance.
- Ability to verify statements against source and tests.

## 8. Hiring sequence

1. Identify the largest current constraint from delivery and defect data.
2. Write a role scorecard and 90-day outcomes.
3. Confirm budget, employment model and decision authority.
4. Evaluate practical work relevant to Wave; do not use unpaid production work.
5. Check collaboration, communication, security and data-handling judgment.
6. Onboard with [organization](./organization.md), [teams](./teams.md), [ownership](./ownership.md), [workflow](./workflow.md) and the developer/QA guides.
7. Review outcomes after 30/60/90 days and adjust scope or support.

## 9. Staffing measures

Use outcomes rather than raw activity:
- Lead time from accepted issue to verified release.
- Escaped defects and regression rate.
- Recovery/backup integrity and severity of data incidents.
- PR review turnaround and rework.
- CI reliability and release rollback rate.
- Feature adoption and user-reported usability.
- Documentation freshness and onboarding time.

Do not optimize for lines of code, number of commits, tickets closed or headcount alone.
