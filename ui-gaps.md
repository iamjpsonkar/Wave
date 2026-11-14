# Wave — UI gaps register

> Review date: 2026-11-14  
> Repository: https://github.com/iamjpsonkar/Wave  
> Evidence: user-provided 2048 × 1330 desktop screenshot, current `main` source at `af366a055f4f11e14743f0c6f3d70b491c0822e6`, `src/App.tsx`, `src/styles.css`, and `docs/FEATURES.md`.  
> Scope: UI/UX observations and product-facing interface gaps. This is not a claim that every gap is a confirmed functional bug.

## How to read this register

- **Observed** means directly visible in the supplied screenshot.
- **Source-confirmed** means the current UI source or feature map confirms the limitation.
- **Needs interaction review** means a static screenshot cannot establish whether the behavior is missing or merely not shown.
- Priorities: P0 = blocks safe/basic use; P1 = major usability/product gap; P2 = meaningful polish/productivity; P3 = refinement.
- Preserve every item and its ID when changing status. Do not mark a gap complete without implementation evidence and a regression check.

## Screenshot assessment

The desktop layout has a recognizable visual identity: persistent workspace sidebar, document toolbar, edit/preview switch, backlinks control, local-save indicator, backup action and a calm neutral palette. The local-first message is clear.

The screenshot is an editor state, not a full product walkthrough. It does not prove how preview, search, templates, Trash, backup restore, mobile navigation or dialogs behave. The following observations are limited to what is visible or confirmed in source.

## Priority gaps

### UI-001 — Settings is visibly unavailable

- Priority: **P1**
- Status: **Implemented — CI pending**
- Original evidence: the sidebar footer displayed “Settings” with “NOT AVAILABLE YET”; the inert placeholder is now an accessible, keyboard-operable Settings dialog with focus containment and Escape dismissal.
- Implemented scope: workspace-persisted theme, typography, content width and reduced-motion preferences; local storage/recovery explanation; save status and basic page/folder diagnostics. More advanced editor/privacy/diagnostic controls remain future scope.
- Regression coverage checks preference persistence in `.wave/settings.json`, application and reload/reopen behavior. Do not mark complete until CI passes.
- User impact: core appearance and typography preferences are now configurable; more advanced editor behavior, privacy controls and deeper diagnostics are not yet configurable.
- Target: extend the Settings destination only with controls that have real effects. Keep autosave/recovery and local-data explanations accurate, and add deeper diagnostics when supported by reliable workspace data.
- Acceptance: Settings opens by mouse and keyboard; focus remains within the dialog and Escape closes it; implemented preferences persist across reload/reopen; reset changes preferences only and preserves documents/recovery data.

### UI-002 — Editor is a plain-text surface rather than a rich writing experience

- Priority: **P1**
- Status: **Observed + source-confirmed**
- Evidence: screenshot shows raw Markdown source in a large textarea; source uses a textarea for edit mode and a separate rendered preview. The feature map lists a rich block editor and block interactions as planned.
- User impact: users must know Markdown syntax and mentally translate source into rendered output. The toolbar helps, but editing remains source-centric.
- Target: keep Markdown as the portable source of truth while progressively adding an optional block-oriented editing layer: paragraph, headings, lists, quote, divider, callout, code, image/file and table blocks. Avoid silently changing or corrupting source.
- Acceptance: existing Markdown opens without loss; editing and switching modes preserves source; unsupported blocks remain readable; keyboard navigation and undo behavior are defined.

### UI-003 — Writing canvas uses the available width without a readable content measure

- Priority: **P1**
- Status: **Partially implemented — CI pending**
- Original evidence: the screenshot showed content starting near the left edge of a very wide pane without a centered measure or width control. The editor and preview now share a centered 860px default measure with narrow, wide and full-width preferences. Responsive review and specialized wide-content behavior remain open.
- User impact: long lines become difficult to scan and the document feels visually sparse on large displays.
- Target: introduce a comfortable default writing measure (for example, a centered 720–900px content column) with optional wider/full-width modes for tables, code and diagrams.
- Acceptance: normal text has a readable maximum line length on wide screens; wide content can intentionally expand; small screens retain usable horizontal padding; preview and edit modes share consistent alignment. Initial centered measure and width choices are implemented; responsive and wide-code/table behavior remain to verify.

### UI-004 — Toolbar actions are icon-heavy and some actions look indistinguishable

- Priority: **P2**
- Status: **Observed**
- Evidence: screenshot shows a compact row of icons with no visible text labels. Two adjacent code-shaped controls appear similar; the screenshot does not show their tooltip behavior.
- User impact: new users may not know which action inserts inline code versus a fenced code block, or what less common formatting controls do.
- Target: add accessible names and tooltips for every icon action; group related actions; distinguish inline code from code-block insertion with clear icons/labels; consider a responsive “More formatting” menu.
- Acceptance: every action has a unique accessible name, visible tooltip on hover/focus, and a keyboard-operable trigger; the two code actions are visually distinguishable.

### UI-005 — Small and low-emphasis interface text

- Priority: **P2**
- Status: **Observed**
- Evidence: screenshot uses very small muted text for document metadata, save status, sidebar helper labels and footer information.
- User impact: secondary information is hard to read, especially at normal laptop viewing distance and for users with low vision.
- Target: define a consistent type scale and minimum sizes for functional metadata; increase contrast for muted labels while retaining the quiet visual style.
- Acceptance: text and controls meet WCAG contrast requirements; essential status and navigation text remains legible at 100% zoom; browser zoom to 200% does not clip core controls.

### UI-006 — Document context and navigation hierarchy are weak

- Priority: **P2**
- Status: **Observed**
- Evidence: top breadcrumb displays workspace and current page, but the document metadata says only “Saved in .wave / documents”; folder context is not prominent in the document header. Sidebar shows a short page list and folder controls.
- User impact: in nested workspaces users may lose context about where a page lives, and it is harder to move or organize pages from the editing context.
- Target: strengthen breadcrumbs with clickable folder segments; provide clear move/organize actions; show parent folder context without duplicating noisy metadata.
- Acceptance: current path is understandable for root and nested documents; breadcrumb segments navigate to their folder; moving a page preserves links and does not overwrite existing files.

### UI-007 — No visible document outline or in-page navigation

- Priority: **P2**
- Status: **Needs interaction review**
- Evidence: no outline/table-of-contents panel is visible in the screenshot; the feature map lists page outline and table of contents as planned.
- User impact: long notes, specifications and technical documents become harder to navigate.
- Target: generate an outline from rendered headings, with collapsible panel and jump-to-heading behavior.
- Acceptance: heading levels are represented correctly; duplicate heading IDs remain stable; outline updates after edits; panel is keyboard accessible and does not steal editor focus.

### UI-008 — Backlinks are hidden behind a collapsed control

- Priority: **P2**
- Status: **Observed**
- Evidence: screenshot shows a “Backlinks 0” disclosure control; no backlinks are visible until expanded.
- User impact: graph/navigation context is not discoverable, especially for users unfamiliar with the feature.
- Target: retain the compact disclosure but provide clearer empty state, useful count and discoverability; consider a page relationship panel combining backlinks and outgoing links.
- Acceptance: disclosure state is keyboard accessible; empty and populated states are clear; selecting a linked page preserves a sensible return path.

### UI-009 — No visible undo/redo, find/replace or document-level productivity controls

- Priority: **P2**
- Status: **Needs interaction review**
- Evidence: the visible toolbar does not show undo/redo or find/replace. Source confirms command palette and page search shortcuts, but that is not equivalent to in-document find/replace.
- User impact: common editing workflows may require browser-native or manual workarounds.
- Target: provide editor undo/redo, find/replace within the current document, and clear shortcut discoverability. Avoid claiming these are absent until their keyboard behavior has been checked.
- Acceptance: edits can be undone/redone predictably across toolbar operations; find/replace supports next/previous and replace-all with selection-safe behavior.

### UI-010 — No visible word count, reading time or document statistics

- Priority: **P3**
- Status: **Observed**
- Evidence: screenshot footer shows Markdown and save shortcut but no document statistics.
- User impact: users writing reports, articles and notes cannot quickly assess document length.
- Target: optional unobtrusive word/character count and reading-time estimate, with a preference to hide it.
- Acceptance: counts update after edits, handle Unicode reasonably, and do not cause layout shifts.

### UI-011 — No clear page creation/empty-state onboarding once workspace is populated

- Priority: **P2**
- Status: **Needs interaction review**
- Evidence: screenshot shows existing pages and a “New from template” navigation action, but no visible contextual help, quick-start guidance or template preview.
- User impact: users may not understand which template to choose or how to structure a new page.
- Target: searchable template gallery with descriptions, preview, categories and a blank-page option; add concise first-use guidance without persistent clutter.
- Acceptance: template gallery can be searched and navigated by keyboard; preview does not create a page; selecting a template creates an editable copy and preserves its Markdown structure.

### UI-012 — Settings, appearance and typography controls are not exposed

- Priority: **P1**
- Status: **Implemented — CI pending**
- Original evidence: appearance and typography controls were planned and Settings was unavailable. A workspace Settings dialog now exposes working theme, font family/size, line spacing, content width and reduced-motion preferences. Privacy/local-storage and recovery explanations are informational rather than fictitious toggles.
- Preferences use the existing `.wave/settings.json` store and apply to editor/preview. Contrast and full component coverage still require accessibility review.
- User impact: users can now adapt theme and writing typography; complete visual consistency and contrast still need review.
- Target: maintain the implemented theme, font family/size, line height, content width and reduced-motion controls; expand only where a setting has a real, testable effect.
- Acceptance: preferences persist per workspace; theme and typography changes apply to editor and preview; contrast review across every component remains open.

### UI-013 — Backup action lacks visible context about backup history and safety

- Priority: **P2**
- Status: **Needs interaction review**
- Evidence: screenshot shows a top-level “Backup” button; source includes backup listing and restore-to-new-folder flows, but the screenshot does not show those states.
- User impact: users may not know when the last backup was created, what it includes or how restore behaves.
- Target: show last successful backup time and verified document/asset counts; make backup history and restore destination clear.
- Acceptance: incomplete backups are never shown as restorable; restore always explains that it creates a separate folder; no existing workspace is overwritten.

### UI-014 — Responsive behavior and mobile editor ergonomics need visual verification

- Priority: **P2**
- Status: **Needs interaction review**
- Evidence: source includes a mobile navigation drawer and CSS, but only a 2048px desktop screenshot was supplied.
- User impact: the screenshot cannot establish whether toolbar, sidebar, editor, dialogs and preview remain usable on phones/tablets.
- Target: capture and review 1440px, 1024px, 768px, 390px and 320px layouts; make toolbar overflow intentional and preserve access to primary actions.
- Acceptance: no unintended horizontal page overflow; editor remains usable; dialogs fit viewport; navigation can open/close with keyboard and touch; focus returns to the triggering control.

### UI-015 — No visible save history or recovery explanation

- Priority: **P2**
- Status: **Observed**
- Evidence: screenshot shows “Saved locally” and “Markdown · ⌘S to save”, but no last-saved time, recovery state explanation or document history. Source contains recovery drafts, but no user-facing version-history UI is shown.
- User impact: users may not understand what “Saved locally” guarantees or how to recover earlier versions.
- Target: explain local save and recovery draft states; show a timestamp or meaningful save state; consider page history/restore points as a separate planned capability.
- Acceptance: status distinguishes saving, saved, recovery-draft-only, conflict and error states; copy does not promise durability beyond what the storage implementation guarantees.

## Additional design-system work

1. Establish design tokens for spacing, typography, color, border, radius, focus ring and elevation.
2. Define consistent hover, focus-visible, active, disabled, loading, error and success states for every control.
3. Standardize icon sizes and button heights; avoid relying on color alone for selected/current states.
4. Ensure destructive actions (Trash, permanent deletion, reset) are visually distinct and have clear confirmation.
5. Keep the quiet, local-first visual identity; improve hierarchy and readability rather than adding decoration.

## Suggested implementation order

| Order | IDs | Work |
|---|---|---|
| 1 | UI-001, UI-012 | Make Settings real; theme and typography foundations |
| 2 | UI-003, UI-005, UI-004 | Readable canvas, type/contrast scale, toolbar clarity |
| 3 | UI-007, UI-008, UI-006 | Document outline, page relationships, navigation context |
| 4 | UI-009, UI-015, UI-013 | Editing productivity, save/recovery clarity, backup UX |
| 5 | UI-002, UI-011 | Block editing direction and template discovery |
| 6 | UI-014, UI-010 | Responsive visual QA and optional document statistics |

## Verification checklist

- [ ] Capture baseline screenshots at desktop, tablet and mobile breakpoints.
- [ ] Test keyboard-only navigation and visible focus for all controls.
- [ ] Run automated accessibility checks and manually inspect contrast and screen-reader output.
- [ ] Verify editor/preview alignment and long-line behavior with large Markdown documents.
- [ ] Verify nested-folder breadcrumbs and page move flows.
- [ ] Verify theme/typography persistence after reload and workspace switch.
- [ ] Verify undo/redo and find/replace do not interfere with autosave/recovery.
- [ ] Verify backup history and restore messaging with complete and incomplete snapshots.
- [ ] Add Playwright visual/interaction regressions for each completed UI gap.
- [ ] Update this register with implementation commit, test evidence and completion date; retain all IDs and history.

## Evidence limitations

- Only one desktop screenshot was provided. It shows one populated-workspace edit state.
- It does not show preview mode, open backlinks, search results, template gallery, backup history, Trash, dialogs, mobile/tablet breakpoints or keyboard/focus states.
- Do not infer that a feature is broken merely because its control is not visible in this screenshot.
- This review created a UI gap register only; no application UI code was changed.


## Implementation update — 2026-11-14

- UI-001 and UI-012: replaced the unavailable Settings footer placeholder with a keyboard-accessible dialog. Added workspace-scoped theme, font family, text size, line spacing, content width and reduced-motion preferences, persisted through the existing settings file. Added explicit local-storage, autosave/recovery and workspace-count information; no cloud or unsupported controls were introduced.
- Added a Playwright regression for preference persistence, application and workspace reopen. Status remains **Implemented — CI pending** until the full browser suite passes.
- All other UI gap IDs and acceptance criteria remain unchanged and open. This is the first implementation slice, not completion of the entire UI gap register.
