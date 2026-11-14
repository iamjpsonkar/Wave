export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  content: string;
}

export const pageTemplates: PageTemplate[] = [
  { id: 'blank', name: 'Blank page', description: 'Start with an empty page', icon: '＋', content: '# Untitled\n\n' },
  { id: 'meeting', name: 'Meeting notes', description: 'Agenda, notes and action items', icon: '◷', content: '# Meeting notes\n\n**Date:** \n**Attendees:** \n**Meeting:** \n\n## Agenda\n- \n\n## Notes\n\n\n## Decisions\n- \n\n## Action items\n- [ ] Task — Owner — Due date\n' },
  { id: 'project', name: 'Project brief', description: 'Goals, scope and milestones', icon: '◇', content: '# Project brief\n\n## Overview\n\n## Problem\n\n## Goals and success metrics\n- \n\n## Scope\n### In scope\n- \n### Out of scope\n- \n\n## Milestones\n- [ ] Discovery\n- [ ] Implementation\n- [ ] Review\n- [ ] Launch\n\n## Risks and dependencies\n\n## Open questions\n' },
  { id: 'tasks', name: 'Task list', description: 'A simple actionable checklist', icon: '☑', content: '# Task list\n\n## Next actions\n- [ ] \n- [ ] \n- [ ] \n\n## In progress\n- [ ] \n\n## Done\n- [x] \n' },
  { id: 'weekly', name: 'Weekly plan', description: 'Plan priorities and reflect', icon: '▦', content: '# Weekly plan\n\n**Week of:** \n\n## Top priorities\n1. \n2. \n3. \n\n## Schedule\n### Monday\n- \n### Tuesday\n- \n### Wednesday\n- \n### Thursday\n- \n### Friday\n- \n\n## Notes\n\n## Weekly review\n- Wins:\n- Challenges:\n- Next week:\n' },
  { id: 'research', name: 'Research notes', description: 'Capture sources and findings', icon: '⌕', content: '# Research notes\n\n## Research question\n\n## Summary\n\n## Key findings\n- \n\n## Sources\n- \n\n## Insights and implications\n\n## Follow-up questions\n- \n' },
  { id: 'decision', name: 'Decision record', description: 'Document context and rationale', icon: '◎', content: '# Decision record\n\n**Status:** Proposed\n**Date:** \n**Owner:** \n\n## Context\n\n## Decision drivers\n- \n\n## Options considered\n1. \n2. \n\n## Decision\n\n## Consequences\n### Positive\n- \n### Trade-offs\n- \n\n## Follow-up actions\n- [ ] \n' }
];
