# Wave — QA Context

> Purpose: persistent handoff for future Wave QA tasks. Read this file before starting a QA task, then refresh it after every task.
> Repository: https://github.com/iamjpsonkar/Wave
> Default branch: `main`
> Last context refresh: 2026-11-14
> Last application/source baseline inspected: `e53de9e554d4e5ccee32cfbaa72378dc0c6f9f44`
> Context-file commit: `ccc59b0ef9a55b41b6ca3a7b35ccf6ca61d065d0`

## Mandatory workflow for every future task

1. Fetch the latest `main` HEAD. Never assume the revision recorded here is still current.
2. Read `QA-CONTEXT.md`, `bugs.md`, and `fixed-bugs.md` from that same current branch before changing code or auditing.
3. Read the relevant current source, tests, and CI workflow. Do not rely on prior assistant summaries when repository files are available.
4. Re-run relevant open-bug reproductions and the regression scenarios in `fixed-bugs.md`. Preserve original WAVE IDs when a fixed issue regresses.
5. Distinguish clearly between source review, Node tests, browser E2E, cross-tab tests, native picker/permission tests, fault injection, and real browser-process termination. Do not claim a scenario passed unless it was actually run.
6. Add only reproducible or code-supported defects to `bugs.md`. A failing test is a QA blocker; it is not automatically a product defect until the cause is understood.
7. Move an item from `bugs.md` to `fixed-bugs.md` only after the fix is supported by relevant evidence. Preserve the original ID and regression scenario.
8. **After every Wave task**, update this `QA-CONTEXT.md` with the resulting HEAD, task summary, files changed, verification evidence, current CI state, and unresolved work. Commit the update to `main` when the task is performed directly against the repository.
9. Never silently drop features, bug IDs, regression scenarios, or historical evidence. Keep this file concise enough to be a practical handoff, and point to the canonical registers for detailed history.

## Project purpose and architecture

Wave is a local-first Markdown workspace inspired by Notion/Quip. The user selects a local folder; Wave stores workspace data in its `.wave/` directory. Documents are Markdown files, assets are ordinary files, and the MVP has no application backend or account requirement.

Workspace layout:
```text
<chosen-folder>/
└── .wave/
    ├── manifest.json
    ├── settings.json
    ├── documents/   # Markdown pages and nested folders
    ├── assets/      # Uploaded images and files
    ├── backups/     # Verified local snapshots
    └── trash/       # Recoverable deleted pages
```

Important implementation boundaries:
- React + TypeScript + Vite frontend.
- `src/storage.ts`: filesystem operations, workspace setup, document/folder/asset operations, settings, Trash, backup/restore, locking and conflict checks.
- `src/draftJournal.ts`: browser IndexedDB recovery drafts, Web Locks/local serialization, per-tab ownership and strict-durability request.
- `src/safety.ts`: pure helpers for revision/generation checks, queues, conflict paths, relative asset paths and newest-draft selection.
- `src/App.tsx`: UI and editor lifecycle, autosave, recovery prompts, command palette, wiki links/backlinks and navigation.
- `src/markdown.tsx`: Markdown/wiki-link transformation and related rendering behavior.
- `tests/storage.test.js`: Node storage and concurrency tests using in-memory filesystem handles.
- `tests/e2e/workspace.spec.ts`: Playwright Chromium browser journeys using OPFS-backed directory handles as a deterministic fixture.
- `.github/workflows/ci.yml`: CI pipeline.

## Current product/test surface observed at last refresh

The current repository includes local Markdown editing/autosave, nested folders, search, templates, favorites, duplicate pages, attachments, sanitized GFM Markdown preview, local backups/restore, Trash/recovery, workspace-handle persistence, draft recovery, external-edit conflict handling, mobile navigation, command palette, wiki links and backlinks.

Commands from `package.json`:
- `npm test` — Node test suite using Node's experimental type stripping.
- `npm run typecheck` — TypeScript project check.
- `npm run build` — typecheck plus Vite production build.
- `npm run test:e2e` — Playwright suite.
- CI uses Node 22, installs Chromium, and runs Node tests, typecheck, build, and browser E2E.

At HEAD `e53de9e554d4e5ccee32cfbaa72378dc0c6f9f44`, `tests/e2e/workspace.spec.ts` contains **13 Playwright tests**:
1. Workspace creation and Markdown autosave.
2. IndexedDB draft recovery after reload.
3. Trash move and restore.
4. Root/nested attachment paths.
5. Mobile navigation drawer.
6. Backup and restore to a separate workspace.
7. Strict IndexedDB draft durability request.
8. Simulated recent-workspace permission denial.
9. Two tabs editing one workspace without silently overwriting each other.
10. Cross-tab recovery prompt provenance and preserving another tab's draft when declined.
11. GFM tables, task lists, footnotes, safe alert callouts and sanitized HTML.
12. Command palette filtering and keyboard execution.
13. Wiki-link navigation and backlinks.

The OPFS fixture is not equivalent to a real user-picked folder. Permission denial is simulated by overriding the permission contract. Do not describe this as native picker prompt/revocation coverage.

## Active bug register and fixed-bug baseline

Canonical registers:
- Open findings: [bugs.md](./bugs.md)
- Fixed findings and mandatory regression scenarios: [fixed-bugs.md](./fixed-bugs.md)

At the last inspection:
- `bugs.md` listed **WAVE-031** and **WAVE-039** as open.
- `fixed-bugs.md` retained **49 source-verified findings**, WAVE-001 through WAVE-051 excluding the two open IDs.
- Preserve all IDs. Check the current files afresh because the register counts and historical notes can be edited independently of this context.

### WAVE-031 — Remaining browser QA coverage gap

The current E2E suite covers simulated permission denial, two-tab editing, and cross-tab recovery-draft provenance. Remaining unverified areas recorded in `bugs.md` include:
- Native user-picked-folder permission prompt and OS/browser permission revocation.
- External filesystem edits during active read/save/backup/restore operations.
- Comprehensive keyboard-only navigation, focus order/restoration, accessible names and screen-reader semantics.
- Abrupt browser-process termination during a pending IndexedDB transaction.

Keep this classified as a QA coverage gap unless a concrete user-facing failure is reproduced.

### WAVE-039 — IndexedDB draft commit crash window

Draft writes start from the editor input path, request `durability: 'strict'` with a compatibility fallback, and best-effort retry on `visibilitychange`/ `pagehide`. The recovery UI reports the committed draft state. IndexedDB is still asynchronous: process termination before transaction commit can lose the latest keystroke. A reload after confirmed commit is not equivalent to a process kill before commit. Do not claim crash-proof durability.

## Latest verification evidence and immediate blocker

Latest inspected HEAD: `e53de9e554d4e5ccee32cfbaa72378dc0c6f9f44`.

Latest CI run for that HEAD:
- [GitHub Actions run 43607252390](https://github.com/iamjpsonkar/Wave/actions/runs/43607252390)
- Conclusion: **failure**.
- `npm test`, `npm run typecheck`, and `npm run build` succeeded.
- Playwright: **12 passed, 1 failed** (13 tests total).
- Failing test: `wiki links navigate to pages and backlinks are derived from Markdown files`, at `tests/e2e/workspace.spec.ts:288`.
- Failure assertion at line 310: expected sidebar text to contain `Linked Page`; actual sidebar text was `All pages / Untitled / Source Page`.
- The test retried once and failed again. This is a real CI blocker. Investigate whether this is an application refresh/title/path behavior regression or an incorrect test assumption before changing `bugs.md`.
- Job log: https://github.com/iamjpsonkar/Wave/actions/runs/43607252390/job/132484451222

Important documentation drift observed at the same HEAD:
- `bugs.md` still refers to an earlier source revision `b11b46eebc1558de9910d8523cdaa027817b087d`, reports ten browser journeys in one place, but cites a CI run with nine E2E tests.
- `fixed-bugs.md` also has an older reviewed source revision and old CI evidence; its historical notes should be retained, but its current verification addendum should be refreshed after the next successful run.
- Do not present the older successful CI run 43603278555 or 43603436474 as verification of HEAD `e53de9e...`.

## Last task recorded

**Task:** Create a persistent QA handoff file so future Wave tasks do not require the user to repeat project and QA context.

**Changes:** Added this `QA-CONTEXT.md` in commit `ccc59b0ef9a55b41b6ca3a7b35ccf6ca61d065d0`. No application source code, open bug classification, or fixed-bug classification was changed as part of this task.

**Verification:** Repository tree was inspected; current source/test/CI files, bug registers, current workflow run and failing job log were fetched. The source/test baseline is `e53de9e...`; the context-only commit is `ccc59b0...`. No local test suite was run during this documentation-only task. CI for the context-only commit was queued at the time of this update.

**Next action:** Triage and resolve the failing wiki-link/backlink E2E scenario, run the full CI suite, then refresh `bugs.md`, `fixed-bugs.md`, and this context file with the resulting revision and evidence.


## Feature coverage audit — 2026-11-14

**Audit baseline:** current `main` HEAD `82388f392a3089266f883c548f2246748937255c` (latest branch ref checked during this audit).

**Files reviewed:** `upcoming-features.md`, `priority-features.md`, `features.md`, `docs/FEATURES.md`, `features-gap.md`, `README.md`, `src/App.tsx`, `src/storage.ts`, `src/markdown.tsx`, `src/draftJournal.ts`, `src/templates.ts`, Node tests, Playwright E2E tests and CI workflow.

**Feature coverage conclusions:**
- Current working MVP includes local Markdown pages/editing/autosave, browser-local recovery drafts, nested folders/navigation, title/content search, favorites, duplicate pages, Trash/recovery, local attachments, verified local backups/restore, external-edit conflict detection, mobile navigation, command palette, wiki links/backlinks and a substantial Markdown preview subset.
- Markdown is not full showcase parity. Current code and E2E definitions include unique heading IDs, safe inline syntax, emoji shortcodes, DETAILS disclosures, limited MathML, local code token coloring, and Mermaid flowchart/sequence/pie output. Full TeX, broad Mermaid grammar/families, Graphviz/PlantUML/Vega/D2/AsciiDoc, unrestricted HTML (deliberately disabled), arbitrary media embeds, and broad conformance/accessibility coverage remain incomplete or intentionally excluded.
- `features-gap.md` is stale relative to the current renderer: it still lists duplicate heading suffixes, emoji shortcodes, DETAILS blocks, sequence diagrams and pie charts as missing even though current source and E2E tests implement those subsets. Its audit should be refreshed before treating it as authoritative.
- Feature tracking is inconsistent: `docs/FEATURES.md` has 19 checked, 47 unchecked and 1 partial item; `priority-features.md` has 104 unchecked items; `upcoming-features.md` has 973 checklist entries, only one checked (the status-convention definition) and 972 unchecked. The latter two are not meaningful implementation status trackers and should not be read as evidence that nothing has shipped. `features.md` is the current shipped-feature showcase.
- Some docs conflict: `features.md` says command palette is implemented, while `docs/FEATURES.md` still marks it planned. Reconcile the feature map with code/tests.

**Current verification at this audit:**
- Current E2E source defines 18 Playwright scenarios; Node test source defines 30 tests.
- Latest CI run for current HEAD: [43614487327](https://github.com/iamjpsonkar/Wave/actions/runs/43614487327) — Node tests, typecheck and production build passed; Playwright failed **1 of 18**. The failing wiki-link/backlinks scenario at `tests/e2e/workspace.spec.ts:288` expects preview content for the newly edited Source Page, but actual preview HTML was only `<h1 id="untitled">Untitled</h1>`. It failed on both attempts. This is an unresolved browser/functional blocker; investigate why the editor content remains Untitled after the test's page-creation flow before claiming the wiki-link feature fully verified.
- No local tests were run as part of this feature audit; evidence above is from source inspection and the linked CI run.

**Next feature-audit actions:**
1. Resolve the current wiki-link E2E failure and obtain a full green CI run on the resulting HEAD.
2. Refresh `features-gap.md` to distinguish newly implemented Markdown subsets from remaining gaps and retain all unsupported syntax/security decisions.
3. Reconcile `docs/FEATURES.md` against current source and tests; use `features.md` for the shipped showcase and keep the full `upcoming-features.md` catalogue intact.
4. Build a feature-by-feature evidence matrix for the full blueprint: implemented + tested, implemented but under-tested, partial, planned, intentionally excluded. Do not delete or drop any planned capability.
5. Keep WAVE-031 and WAVE-039 open until their stated verification gaps are genuinely closed.


## Markdown feature-gap recheck — 2026-11-14 (latest)

**Audit source baseline:** application source at commit a9dc70170bcbac21bdb7634edbcf63567d34342a; documentation updates are on current main after that source baseline. Current branch HEAD before this context update: 29b6d6b45a6315115f946168101cdf8bd806f537.

**Files rechecked:** features-gap.md, docs/MARKDOWN_SUPPORT.md, src/markdown.tsx, src/App.tsx, src/styles.css, src/templates.ts, tests/e2e/workspace.spec.ts, package.json, bugs.md, fixed-bugs.md and CI workflow.

**Current Markdown feature status:**
- Implemented and covered by browser scenarios: CommonMark/GFM baseline, hard breaks, reference links, safe URL sanitization, escaped table pipes, nested lists, duplicate heading IDs, safe inline mark/underline/sup/sub/kbd, emoji shortcode subset, fenced code copy, line-based diff coloring, NOTE/TIP/IMPORTANT/WARNING/CAUTION alerts, DETAILS disclosure, local MathML examples (quadratic formula/matrices/cases/sums/integrals/limits), constrained Mermaid family renderers, constrained DOT/Graphviz/PlantUML/Vega/D2/AsciiDoc renderers, and local-only audio/video.
- Partial, not full specification parity: heuristic syntax highlighting, line-prefix diff parsing, custom TeX parser, hand-built Mermaid renderers, hand-built other diagram renderers, limited emoji map, and showcase template completeness.
- Deliberately excluded: unrestricted raw HTML, arbitrary iframe/media and remote media/image fetch. GitHub mentions and issue/PR references remain inert plain text.
- Remaining QA gaps: broad conformance fixtures, malformed/oversized-input/resource limits, full accessibility/screen-reader verification, cross-browser coverage, visual regression and preview/source round-trip tests.
- Technical learning-notes template is present but broken: src/templates.ts joins its content with a JavaScript string literal containing two backslash characters followed by n, rather than a real newline separator. No E2E test selects this template. Recorded as **WAVE-052** in bugs.md; do not mark template done until fixed and covered.
- The original checklist in features-gap.md has stale statuses; the new “Current verified status override” supersedes those status statements while preserving the original requirements.

**Current automated verification:**
- Node tests: 30 definitions.
- Playwright Chromium: 23 scenario definitions.
- CI run [43616302974](https://github.com/iamjpsonkar/Wave/actions/runs/43616302974) for source HEAD a9dc70170bcbac21bdb7634edbcf63567d34342a: Node tests, typecheck and production build passed; Playwright **20 passed / 3 failed**.
- The three E2E failures are assertion/selector mismatches that remain CI blockers: wiki-link test expects a wave.invalid href although the preview intentionally renders a button.wiki-link; code-highlighting test's .syntax-keyword locator matches four elements under strict mode; Mermaid test expects polygon/ellipse elements that the renderer does not emit. Update assertions to actual user-visible behavior and rerun all scenarios. Do not infer renderer defects or full correctness solely from these mismatches.
- No local test execution was performed during this audit.

**Repository changes made during this audit:**
- features-gap.md: added a current verified status override; documented partial/not-implemented/intentional boundaries, the 23-scenario suite and CI failures.
- bugs.md: added WAVE-052 for the technical-notes template separator defect; updated current test counts. Existing WAVE-031 and WAVE-039 remain open.
- fixed-bugs.md: read as the regression baseline; no historical findings were removed or changed.
- No application source code was changed and no feature was removed.

**Next actions:** fix WAVE-052 with a template-selection/preview E2E test; correct the three CI assertion mismatches; rerun full CI; then continue Markdown accessibility, cross-browser, malformed-input and source-preservation verification. Preserve all original Markdown showcase requirements.


### Documentation follow-up after the Markdown audit

- Refreshed WAVE-031's current suite references from 13 to 23 scenarios; its historical 13-scenario remediation note remains historical.
- Corrected WAVE-052 wording to reflect the source's two-backslash-plus-n separator and the required actual-newline separator.
- Final audit documentation HEAD before this context update: faf991645e639ed55406d810b9a89426b154c354.
- Current source verification remains tied to CI run 43616302974: 30 Node tests, typecheck and build passed; 20/23 Playwright scenarios passed, with three stale/strict assertions failing. New documentation commits have their own CI runs and are not a new application-source verification.

---

## Full repository review — 2026-11-14

**Review baseline:** main at `9facb8bf1b71b4470ea661cb4b30a76660217f18` before this handoff update.

**Scope reviewed:** `src/App.tsx`, `src/storage.ts`, `src/draftJournal.ts`, `src/safety.ts`, `src/markdown.tsx`, `src/templates.ts`, Node storage tests, Playwright E2E tests, CI workflow, `bugs.md`, `fixed-bugs.md`, `features-gap.md`, `features.md`, `docs/FEATURES.md`, `docs/MARKDOWN_SUPPORT.md`, `docs/ROADMAP.md`, `priority-features.md`, `upcoming-features.md`, `DEV_CONTEXT.md`, `dev-fixed.md` and `dev-build.md`.

### Current implementation and verification

- The current browser suite defines **28 Playwright Chromium scenarios**; the Node suite defines **30 tests**.
- CI run [43618423075](https://github.com/iamjpsonkar/Wave/actions/runs/43618423075) completed successfully for the corrected template/selector baseline: Node tests, TypeScript typecheck, production build and all 28 Playwright scenarios passed.
- The later diagram-accessibility change (commit `052840f834f879e54ac32567aecc3e4c7a0cad13`, test extension `ed34c50b6f21c134d762786f869801785b2452d3`) is present in current main. It moves image semantics to SVG elements so the source disclosure remains outside the image role. Its own CI result was not available during this review; do not infer that the patch is verified from the earlier green run.
- No local test execution, native OS folder picker/revocation test, real browser-process termination test, screen-reader certification or cross-browser run was performed during this review.

### Bug register reconciliation

- **WAVE-052 is fixed and moved to `fixed-bugs.md`**. Current `src/templates.ts` uses a real newline separator; the dedicated template-selection/preview E2E scenario exists; run 43618423075 passed all 28 scenarios. Preserve the regression scenario.
- **WAVE-031 remains open**: native picker/permission lifecycle, external filesystem mutation during operations, comprehensive accessibility and process-termination coverage remain incomplete. The newer diagram accessibility smoke test narrows one gap but is not a full accessibility audit.
- **WAVE-039 remains open/partially mitigated**: strict IndexedDB durability and lifecycle retries cannot guarantee an edit survives process termination before transaction commit.
- The active bug register now has two open findings (WAVE-031 and WAVE-039); the fixed register retains 50 findings including WAVE-052.

### Feature and documentation findings

- The implementation includes a substantial CommonMark/GFM subset, wiki links/backlinks, safe URL handling, local-only media, limited MathML, constrained Mermaid families and lightweight DOT/PlantUML/Vega/D2/AsciiDoc renderers. These are not full language implementations.
- `features-gap.md` still contains stale earlier checklist/status statements: it says the technical-notes template is broken, reports 23 E2E scenarios, and lists several implemented Markdown extensions/diagram families as missing. Its appended remediation notes also predate the latest successful CI. Treat source + current tests + `docs/MARKDOWN_SUPPORT.md` as the current technical evidence until the gap checklist is reconciled.
- `docs/FEATURES.md` and `docs/ROADMAP.md` still understate some shipped behavior (notably wiki-link/backlink workflows and recent Markdown renderer work) while `features.md` and `docs/MARKDOWN_SUPPORT.md` describe more of the current implementation. Reconcile the status map without deleting any planned capability.
- `priority-features.md` has 104 unchecked planning items and `upcoming-features.md` has 972 unchecked catalogue entries. These are planning documents, not evidence that the capabilities are absent from the current app; preserve the full catalogue and distinguish planned scope from shipped status.
- README and feature showcase should continue to state the real browser boundary (File System Access API / Chromium family), local-first storage and deliberate remote HTML/media exclusions.

### Source review notes

- Core architecture remains local-first: File System Access API workspace files, IndexedDB recovery journal, per-workspace serialization/locks, revision-guarded saves, external-edit conflict checks, Trash operation recovery, and integrity-checked backup creation.
- Current automated coverage is strongest for storage allocation/collision/concurrency, backup snapshots, Trash recovery, Markdown rendering examples and the core browser journeys.
- Remaining material verification gaps include large workspace/document performance budgets, Unicode and platform filename behavior, malformed/oversized parser inputs, full preview/source round-trip coverage across every extension, comprehensive keyboard/focus/contrast/screen-reader audit, cross-browser behavior, native picker/revocation, external-edit fault injection, and actual process termination during IndexedDB writes.
- No additional confirmed source-level product defect was established in this review beyond the stale WAVE-052 register entry, which has now been reconciled. Treat the remaining items above as coverage/roadmap gaps, not confirmed bugs.

### Repository changes for this review

- `bugs.md`: removed WAVE-052 from the open register, corrected open count and current test/CI references.
- `fixed-bugs.md`: added WAVE-052 with source/test evidence and a retained regression scenario; fixed register now contains 50 findings.
- No application source or test source changed. Feature and roadmap documentation wording/status was reconciled; no planned capability was removed or cancelled.
- Documentation commits: `bbc7e1df6db98d87a08b8a8d0d2aca96bbb19700`, `9facb8bf1b71b4470ea661cb4b30a76660217f18`, `dd9c4954b1426a96c32614eb8a50c87ef1762670`, `75bb1ca7777aa87072c74d0ef9964a0ab2bc3a01`, `ecfc6488918869d426b40ec20e91391e70961f63`, `fd8a6ac3d4462c53405c535f5db17d2367830d27`, `311878abeb5b0f303b2befe52c83ea6a5242b9d4` and `4fd135fadce0ab45488581d7b785c9a44ab84548`.

### Recommended next actions

1. Obtain and inspect a fresh CI run for the diagram-accessibility patch on current main; repair any failures without weakening behavior assertions.
2. Reconcile `features-gap.md`, `docs/FEATURES.md`, `docs/ROADMAP.md` and the current feature showcase against source/tests; preserve every original planned feature.
3. Expand WAVE-031 verification with native picker/permission revocation where supported, external filesystem mutation tests, accessibility tooling and process-lifecycle fault injection.
4. Continue WAVE-039 durability investigation with controlled IndexedDB transaction delay and real browser-process termination tests; do not promise zero crash window.
5. Add large-workspace performance budgets, Unicode/platform path fixtures, malformed/oversized parser limits and broader preview/source round-trip tests.


### Documentation reconciliation follow-up — 2026-11-14

- Updated `bugs.md` to two open findings and 50 retained fixed findings; WAVE-052 is no longer open.
- Updated the current verification addendum in `fixed-bugs.md` to distinguish the green 28-scenario CI baseline from the later unverified diagram-accessibility patch.
- Appended a current status override to `features-gap.md`, preserving its original requirements while superseding stale implementation claims.
- Updated `docs/FEATURES.md` and `docs/ROADMAP.md` to distinguish implemented wiki links/backlinks from still-planned mentions and rich link previews.
- Updated `features.md` to describe the current constrained local diagram-renderer families and technical learning-notes template.
- These are documentation-only changes; no source or test files changed. The CI run for the source/test baseline remains 43618423075. The newest documentation commits have not been independently checked in CI.
- Main HEAD immediately before this QA-context update: `4fd135fadce0ab45488581d7b785c9a44ab84548`.

---

## UI screenshot review — 2026-11-14

- Reviewed user-provided desktop screenshot (2048 × 1330) against current `src/App.tsx`, `src/styles.css` and `docs/FEATURES.md`.
- Created `ui-gaps.md` with 15 stable UI gap IDs (UI-001 through UI-015), priorities, evidence classification, user impact, target behavior, acceptance criteria and a suggested implementation order.
- Main confirmed gaps: Settings is visibly and source-confirmedly unavailable; editing is a plain textarea plus separate Markdown preview rather than a rich block editor; the wide writing surface has no visible reading-width constraint; toolbar actions are icon-heavy; typography/metadata are small; document outline and settings preferences remain planned.
- Other items (undo/redo, find/replace, responsive behavior, template discovery, backup/recovery explanation) are explicitly marked for interaction review where a static screenshot cannot establish the complete behavior.
- No application source or tests changed. Only `ui-gaps.md` was created.
- Commit: `118be4b91fc05500af5425ce820a5eab3bed66b0`.
- Evidence limitation: one desktop edit-state screenshot only; no preview, modal, mobile, tablet, keyboard or screen-reader states were provided.

## Dark-theme UI follow-up — 2026-11-14

- Reviewed the newly supplied dark-theme Edit and Preview screenshots (2048 × 1330) against current `src/App.tsx` and `src/styles.css`.
- Updated `ui-gaps.md` additively with UI-016 through UI-020: dark code-block contrast, Markdown heading/body contrast, mixed theme surfaces, wordmark/navigation contrast, and missing theme × mode visual regression coverage.
- Reconciled prior gaps with current source: UI-001 Settings now exists as a keyboard-accessible dialog; UI-012 appearance/typography preferences exist in source but need full visual/accessibility verification; UI-003 configurable content width is implemented (680/860/1100/full) and visually demonstrated as a centered writing column.
- UI-005 remains open: muted small metadata/helper text remains visible in the dark screenshots.
- Strongest new issues are the near-white code block with pale text and the very low-contrast rendered heading in dark Preview. These are screenshot observations; exact CSS cause and WCAG ratios still require browser inspection.
- No application source or test code changed. Only `ui-gaps.md` changed in this review.
- Commit: `8f8afb6388c879fce522302a46679e63a814bda3`.
- Evidence limitations: desktop Edit/Preview only; no mobile, settings dialog, keyboard/focus, accessibility tree, or contrast measurement evidence.
