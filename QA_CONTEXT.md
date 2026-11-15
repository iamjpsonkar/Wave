# Wave — Consolidated QA Context

> Consolidated from `qa-context.md` (current QA disposition and test inventory) and `QA-CONTEXT.md` (detailed audit history). The original files are retired after migration; meaningful current and historical findings are retained below. Always refresh current source/CI evidence before relying on dated snapshots.

## Current QA disposition

# Wave — QA Context

> Repository: https://github.com/iamjpsonkar/Wave  
> Branch: `main`  
> Last QA recheck: 2026-11-15 (WAVE-0001 branch; source/test update pending CI)  
> Scope: source review of current default-branch files, open bug register, and fixed-bug regression baseline.

## Current disposition

- **WAVE-031 — OPEN / PARTIAL (P1):** branch `WAVE-0001` adds deterministic tests for permission reauthorization from the prompt state and editor conflict handling after an external file edit. The OPFS permission contract remains simulated; native picker/OS revocation, external-process scheduling races during read/save/backup/restore, comprehensive keyboard/screen-reader accessibility, and actual browser-process termination remain unverified.
- **WAVE-039 — OPEN / PARTIAL (P1):** IndexedDB journal writes request strict durability and are attempted on `pagehide` / hidden visibility, but the transaction is asynchronous. A process kill before commit can still lose the latest keystroke.
- **WAVE-042 — FIXED in source:** per-tab draft records and current-tab-only clearing are implemented; the cross-tab E2E scenario verifies both edits remain represented and that recovery provenance is shown.
- No newly confirmed regression was found in the source paths reviewed. Do not close WAVE-031 or WAVE-039 based on source inspection.

## Current test inventory (source, not execution)

- `tests/storage.test.js`: **30** Node test definitions.
- `tests/e2e/workspace.spec.ts`: **48** Playwright Chromium test definitions on branch `WAVE-0001` (46 before this issue's two added scenarios).
- E2E fixture: Origin Private File System (OPFS) directory handles; `showDirectoryPicker` is replaced with a fixture and permission query/request behavior is simulated.
- Current E2E coverage includes workspace creation/autosave, reload recovery, Trash round trip, root/nested attachments, mobile navigation, backup/restore, strict IndexedDB durability request, simulated permission denial and reauthorization, external-edit conflict preservation, same-workspace two-tab edits, cross-tab recovery provenance, Markdown sanitization/GFM, command palette keyboard execution, wiki links/backlinks, and the broader Markdown/UI regression suite.
- Historical CI evidence in `dev-build.md` reports 30 Node tests and 10 E2E scenarios passing for commit `09021ed224f739fd66325bb8f6cc8f1bcca5b142`. That run does **not** establish that the current 13-scenario E2E suite passed.

## Files reviewed

- `bugs.md` and `fixed-bugs.md` (including historical regression scenarios)
- `src/App.tsx`, `src/draftJournal.ts`, `src/storage.ts`, `src/safety.ts`
- `tests/storage.test.js`, `tests/e2e/workspace.spec.ts`, `.github/workflows/ci.yml`, `config/playwright.config.ts`
- `package.json`, `DEV_CONTEXT.md`, `dev-build.md`, `dev-fixed.md`

## WAVE-031 manual verification plan

The following checks must be performed in a real supported browser and recorded with browser version, OS version, date, outcome and any reproducible evidence. OPFS/Playwright stubs are not substitutes.

### Native folder picker and permission lifecycle
1. Use a current supported Chromium browser (Chrome or Edge) on a secure origin (HTTPS or localhost).
2. In a fresh browser profile, choose a real user folder using the native picker; confirm Wave creates/opens only its `.wave/` subdirectory and that canceling the picker leaves the welcome screen usable.
3. Reload and use **Reopen recent workspace**. Record whether the browser retains the read/write grant or presents a native permission prompt.
4. Revoke the site's file-system permission using browser site settings (and OS-level folder access controls where the platform exposes them); reload and attempt reopen.
5. Confirm Wave does not load/edit the workspace while permission is denied, provides a clear recovery message, and can reopen after the user reauthorizes from the explicit Reopen gesture.
6. Repeat after browser restart and after changing the folder's OS access rights. Record platform-specific differences; do not infer behavior from the OPFS fixture.

### External filesystem and backup/restore
1. Open a Markdown page in Wave, then modify the same file from an external editor before Wave autosaves. Confirm Wave reports a conflict and does not overwrite the external content.
2. Repeat with an external rename/delete and record safe error/recovery behavior.
3. Modify a document or asset while backup is in progress using a controlled external writer. Verify the backup is rejected or clearly marked incomplete; no partial snapshot may be offered as valid.
4. Inject a restore copy failure and verify the destination is marked incomplete and cannot be opened as a workspace.
5. Record the exact operation timing and source/backup hashes where available. Current Node tests cover simulated snapshot mutation and restore failure, not arbitrary OS process scheduling.

### Keyboard, focus and assistive technology
1. Complete the core workspace journey using only the keyboard: open/reopen, navigate page list, create/open/edit, switch Edit/Preview, use command palette, open/close settings/dialogs, and navigate Trash/backups.
2. Verify visible focus at every step, logical tab order, Escape behavior, focus containment where appropriate, and focus restoration to the invoking control after dialogs close.
3. Inspect accessible names/roles for icon-only controls, dialogs, editor, navigation, Markdown headings/links/tables/task lists/callouts/disclosures.
4. Perform a screen-reader pass with at least one platform-supported screen reader (for example NVDA on Windows or VoiceOver on macOS). Record browser/screen-reader versions and any findings.
5. Run contrast checks for light/dark themes and keyboard focus indicators. Automated smoke assertions do not constitute a WCAG conformance audit.

### Browser lifecycle
1. Use a controlled test profile to terminate the browser process while a recovery-draft transaction is pending and at several intervals after input.
2. Reopen and verify whether the edit exists in the Markdown file or as a committed recovery draft. Document the unavoidable pre-commit loss window separately; do not promise crash-proof IndexedDB durability.

## QA limitations and next verification

This branch update is a **source/test-definition change pending CI**. No local test execution, browser run, native picker interaction, or accessibility audit has been performed for WAVE-0001 yet. Do not report tests as newly passed.

Next:
1. Run `npm ci`, `npm test`, `npm run typecheck`, `npm run build`.
2. Install the CI-matched Playwright version and Chromium, then run `npm run test:e2e`.
3. Add supported native picker/revocation integration tests, external filesystem race/fault injection, keyboard/accessibility checks, and controlled process-termination tests.
4. Recheck every `fixed-bugs.md` scenario when its related code changes; reopen the original WAVE ID on any regression.
5. Keep `bugs.md` limited to currently reproducible/source-supported findings. Do not move WAVE-031 or WAVE-039 to fixed until the remaining failure windows/coverage criteria are addressed and verified.


---

## Historical QA audits and evidence trail

> The following sections preserve the substantive audit history from the former `QA-CONTEXT.md`. Dates and counts are historical snapshots, not assertions about the current branch.

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

---

## diagrams.net research and diagram roadmap — 2026-11-14

- Researched the official app.diagrams.net site and official draw.io feature/editor/manual/layers/integration documentation.
- Reviewed current Wave `src/markdown.tsx`, `docs/MARKDOWN_SUPPORT.md`, `features-gap.md`, `src/App.tsx` and `src/styles.css`.
- Created `diagram-features.md` with reference capability analysis, Wave's current renderer baseline, explicit visual-editor gaps, local-first design principles, proposed native graph architecture, a comprehensive feature catalogue, five implementation phases, acceptance criteria and test strategy.
- Current Wave Markdown renderer baseline includes constrained Mermaid flowchart/sequence/pie/class/ER/state/Gantt/git graph/mindmap/timeline/quadrant/requirement/architecture-beta subsets and constrained DOT/Graphviz, PlantUML, Vega/Vega-Lite, D2 and AsciiDoc renderers. These are source-based preview renderers, not an editable canvas diagram application.
- Roadmap preserves these existing renderers and proposes a structured native diagram document model with canvas, shapes, connectors, styles, undo/redo, pages/layers, layouts, import/export, domain libraries and optional later collaboration.
- Official research sources are linked inside `diagram-features.md`.
- No application source or tests changed. Only `diagram-features.md` was created.
- Commit: `918015553e2d1b1e2d77ccedd7214bd17b5bb9cc`.

---

## Exported preview UI bug register — 2026-11-15

- Reviewed both user-supplied 10-page PDFs: `Wave Complete Feature Test.pdf` (light export) and `Wave Complete Feature Test 1.pdf` (dark export).
- Created `ui-bug.md` as a separate export/UI defect register; it does not replace `ui-gaps.md`, `bugs.md` or `fixed-bugs.md`.
- Recorded UIB-001–UIB-006 with severity, observed evidence, reproduction steps, expected behavior and acceptance criteria.
- Highest priority: dark export uses pale foreground text on a white PDF page and mixes dark component surfaces with the white page (UIB-001/002).
- Other observed issues: Wave inline color extensions appear as literal code-like text (UIB-003); standalone summation math remains raw TeX in the PDF (UIB-004); first table row's Priority value 1 is missing (UIB-005).
- UIB-006 records the collapsed DETAILS content omitted from static PDF as a behavior requiring an explicit export policy, rather than assuming current behavior is definitively wrong.
- Deliberately did not log the combined alert appearance as a confirmed defect: the source fixture places multiple alert markers inside one contiguous blockquote, which may explain the combined result.
- Findings are PDF observations; no live-browser reproduction, CSS diagnosis, source fix or test execution was performed.
- No application source or test files changed. Only `ui-bug.md` and this context handoff changed.
- Register commit: `89729ac2d7b7a7d9d78879929e1ff0e5a508aa47`.

---

## GitHub issue triage — 2026-11-15

- Reviewed current `bugs.md`, `fixed-bugs.md`, `features-gap.md`, `ui-gaps.md`, `ui-bug.md`, `diagram-features.md`, `docs/FEATURES.md`, `docs/ROADMAP.md`, `priority-features.md` and `upcoming-features.md`.
- Checked the repository's open issue search before creating issues; no existing open issues were returned, so the identified work did not duplicate an existing open issue.
- Created 10 GitHub issues, grouped by implementation and verification work:
  - #1 WAVE-031 native filesystem/permission/lifecycle verification.
  - #2 WAVE-039 IndexedDB recovery-draft pre-commit window.
  - #3 UI theme, contrast and accessibility verification (UI-001, UI-005, UI-012, UI-016–UI-020).
  - #4 source-preserving block editor completion (UI-002).
  - #5 editor navigation/productivity regression coverage (UI-003, UI-006–UI-011, UI-013, UI-015).
  - #6 Markdown compatibility, security, round-trip, accessibility and performance test suite.
  - #7 theme-aware PDF/print export verification (UI-022, UIB-001/002).
  - #8 PDF regression verification for color, math, tables and DETAILS (UIB-003–006).
  - #9 Wave color-extension portability/accessibility (UI-021).
  - #10 native local-first visual diagram editor epic (`diagram-features.md`).
- Created `github-issues.md` as the stable cross-reference between the registers and issue URLs.
- Grouped related UI IDs to avoid excessive duplicate tickets; original IDs and acceptance criteria remain in their source registers.
- Historical fixed findings, including WAVE-052, were not reopened. Long-range roadmap catalogue entries were not misclassified as bugs or individually ticketed.
- No application source or tests changed. Issues are open and unassigned; no implementation or CI pass is implied by issue creation.
- Issue index commit: `f2b408aa6b05a4721bc1bb8fc3821da9799f0855`.

---

## Full roadmap issue creation — 2026-11-15

- Parsed the current `upcoming-features.md` directly (1,983 lines). It contains 974 checkbox entries; one is already marked shipped, and two remaining entries are status-legend definitions rather than product features.
- Created 80 roadmap tracking issues covering **971 unchecked/in-progress checklist entries**. Each issue is grouped by an existing blueprint subsection and contains the source wording, source line references, checkboxes and a definition-of-done checklist.
- Coverage includes A–P, release 0.3 through Later, Q–AA, product coverage, specialist capability areas 14.1–14.10, cross-cutting areas 15.1–15.6 and competitor coverage.
- Release roll-up and competitor/product coverage checklists were retained as traceability issues instead of being silently dropped. Where requirements overlap existing bug/gap tickets, canonical issue links are included where applicable.
- An accidental duplicate A1 issue #90 was immediately closed as duplicate of canonical issue #11.
- Created #91 for the additional competitor coverage checklist.
- Verified GitHub search returned 90 open issues: #1–#89 and #91. The issue index `github-issues.md` now lists all 90 active issues.
- No application source code was changed. No feature is claimed implemented by issue creation. Issues are tracking artifacts; completion still requires implementation, tests and documentation.
- Issue index update commit: `4aa17e29acdd08eaeb3cdaa4ebf477e03857bb60`.


---

## Repository-wide issue audit — 2026-11-15

- Audited current `main` at commit `d831bf04ac458a888206de4d492830f55958b022`, including repository orientation/developer handoff, QA and bug registers, issue index, package scripts, CI workflow, configuration relocation, storage tests and Playwright E2E test source.
- Reconciled against all **98 existing GitHub issues** (92 open, 6 closed) before creating new tickets. Existing WAVE-031/WAVE-039, UI/Markdown/export issues and roadmap/coverage epics were treated as canonical; no duplicate issue was opened for their scope.
- Created [#99 — repair case-sensitive and stale Markdown navigation links](https://github.com/iamjpsonkar/Wave/issues/99). Confirmed examples include README's `./WIKI.md` versus maintained `WIKI.md`, missing `docs/README.md`, and root-level tracker links where the maintained files live under `trash/`.
- Created [#100 — remove duplicate storage regression scenarios](https://github.com/iamjpsonkar/Wave/issues/100). `tests/storage.test.js` repeats the backup-lock interleaving scenario at lines 300–321 and 334–355, and repeats the copied-file mutation scenario at lines 322–333 and 356 onward. The issue requires preserving distinct locking and integrity guarantees while removing redundant tests.
- Updated `etc/quality/github-issues.md` to include both issues and the verified open-issue count.
- This was a repository/source and tracker audit only. No application source was changed; no tests, typecheck, build, browser run, Docker build or current CI workflow result was executed/verified in this task. Do not interpret source inventory as a passing test run.


## WAVE-0001 CI failure remediation — 2026-11-15

- Initial PR run `43682365587` passed `npm test`, typecheck, production build and container build, but Playwright failed 15 scenarios (33 passed). The failure was not a single product regression: several tests used stale/ambiguous accessible-name selectors or expected an obsolete error class; multiple fixtures encoded literal `\\n` instead of real line breaks.
- Corrected the external-edit fixture to write actual Markdown newlines and assert the current `.app-error` surface. Tightened ambiguous Edit/Preview/Settings/code-action selectors, fixed template-preview flow/scoping, corrected image/diagram expectations, and repaired PDF fixture newlines.
- Fixed task-list Enter handling so a blank `- [ ] ` item is recognized as empty and exits the list.
- Fixed block-color parsing/serialization to split/join real newlines and match callout syntax correctly. Preserved editor selection while clicking color preset/clear actions.
- Re-run workflow for commit `639be32a7060c6d0b4454a611c944eb909c9b353`: [CI run 43683698072](https://github.com/iamjpsonkar/Wave/actions/runs/43683698072). Status was in progress at documentation time; do not record as passing until final job conclusions are checked.
- No local test/typecheck/build run was performed. The E2E run remains the acceptance gate; inspect any remaining failures rather than loosening assertions.


## WAVE-0001 latest CI recheck — 2026-11-15

- Latest completed run checked: [43683760674](https://github.com/iamjpsonkar/Wave/actions/runs/43683760674), head `98f3a77e90ed1819811998d1519d010516c1203d` — **failed**. Container job passed; Node tests, typecheck and production build passed; Playwright reported 39 passed / 9 failed.
- Remaining failures from that run: settings Escape dismissal/focus trap, Lucide icon class expectation, duplicate `pre`/template/diagram/color-span selectors, color-toolbar operations not applying background/clear due to stale selection/state, and block callout classification.
- Follow-up pushed after this run: settings dialog Escape handling, scoped/exact locator updates, color-edit operations now flow through the controlled change handler, and block-color callout classification fix. A newer workflow must be checked for the latest head before recording any pass.
- Do not treat the previous 39/9 result as current CI; inspect latest PR SHA and run.


## WAVE-0001 consolidated CI recheck — 2026-11-15

- Latest checked PR-head workflow: [43684569184](https://github.com/iamjpsonkar/Wave/actions/runs/43684569184), head `8ff23d414ecf2dc7421fbb7188cf7b56145af419` — **failed**. Container job passed; build job Playwright reported **42 passed / 6 failed**. Node tests, typecheck and production build completed successfully in this run.
- Remaining failures: Settings test attempted to click Preview while its modal overlay was still open; code-block icon assertion expected `lucide-file-code-2` while the rendered SVG class is `lucide-file-code2`; inline/block color changes still did not reliably consume the current controlled source; block-mode color update did not refresh the block source range.
- Remediation pushed to `WAVE-0001`: color actions now read `contentRef.current` and pass changes through `handleEditorChange`; block-mode color replacement writes the complete current source range; Settings test closes its modal before switching Preview; icon expectation matches actual Lucide class.
- Fresh CI is required for these commits. No local test, typecheck, build, native picker, or accessibility pass is claimed. Keep PR #101 and issue #1 open until latest CI and WAVE-031 manual acceptance criteria are met.

## Local test runner and CI parity — 2026-11-15

- Added root `test.sh` as the canonical local verification entry point. By default it runs Node tests, TypeScript typecheck, production build and Playwright Chromium E2E; it installs missing npm dependencies, the pinned Playwright runner and Chromium when needed.
- `./test.sh --no-e2e` runs the fast non-browser checks. `--skip-install`, `--skip-playwright-install` and `--skip-browser-install` support pre-provisioned/CI environments and fail clearly if a required tool is missing.
- CI now provisions its Linux browser dependencies and invokes the same script with install steps skipped, reducing local/CI command drift.
- No local execution is claimed for this repository-edit task; run `./test.sh` from a checkout to verify locally. Chromium system libraries may need OS-specific installation on Linux.


## CI follow-up — workspace theme and color-formatting regressions

- Fixed the three color-formatting E2E regressions by making the color inputs start from a neutral `#ffffff` value. This allows selecting the documented warm highlight (`#fff0a8`) and green block background (`#eaf2e8`) to produce a real input change event, instead of asking the browser to re-select the already-selected color.
- Added a compact mobile Settings action in the top bar so appearance preferences remain reachable when the sidebar is collapsed into its navigation drawer.
- Corrected the narrow-content-width assertion: 680px is the configured maximum, while the editor's grid column can be narrower when the contextual sample library is visible. The test now verifies the configured cap and that the rendered preview respects it.
- Verification is pending the PR workflow for the follow-up commit; no local execution is claimed.


## 2026-11-15 — CI follow-up: Markdown directives and E2E stability

- Run `43687589347` failed only in Playwright; Node tests, typecheck, production build and container build passed. The suite reported 44 passes, two deterministic failures and two flaky scenarios (cross-tab recovery and list typing).
- Fixed malformed `[[color:red|...]]`-style directives being mistaken for unresolved wiki links: invalid `color:`/`bg:` directives now remain literal text, while valid six-digit hex directives retain their existing rendering path.
- Corrected the block-background E2E assertion to compare the browser-computed RGB CSS value rather than expecting the source hex serialization. Removed an unnecessary frozen clock from the second cross-tab page, asserted the dialog source before checking the declined-recovery result, and made list continuation tests wait for focus/caret restoration before typing the next item.
- Verification is pending on the new commit. No local browser run is claimed. Native OS picker/permission, external-process race, accessibility and process-termination checks remain outstanding; issue #1 stays open and PR #101 stays unmerged.


## 2026-11-15 — Cross-tab recovery CI follow-up

- Workflow `43688050754` passed 47 of 48 Playwright tests; Node tests (30), typecheck, production build and container image passed. The remaining failure was the cross-tab recovery test: after removing the fake clock from both pages, the source tab's 600ms autosave committed the changed Markdown before the second tab opened it, so no recovery dialog was expected and the prompt assertion received an empty string.
- Corrected the test to freeze only the source tab's clock after workspace/page setup and before editing. Draft-journal writes remain immediate; only the delayed Markdown autosave is held. The second tab remains on real time so navigation and recovery interaction are not blocked.
- Fresh CI is pending. No local browser execution is claimed. Outstanding manual OS picker/permission, external-process race, accessibility, and process-termination criteria remain tracked; issue #1 and PR #101 remain open.


## 2026-11-15 — Cross-tab recovery test clock isolation correction

- Run `43688362527` failed with 47/48 Playwright tests passing; Node tests (30), TypeScript typecheck, production build and container image passed. The cross-tab recovery test received no prompt message.
- Inspection found the source page's clock was installed twice: once before workspace/page setup and again after the baseline page had been created. The early installation could freeze the baseline page's own save lifecycle, invalidating the intended setup. Removed the premature installation; the source clock is now frozen exactly once, after the baseline page is saved and immediately before the unsaved edit. The second tab remains on real time.
- This is a test-fixture correction, not a production recovery implementation change. Fresh CI is required; no local test execution is claimed. Native picker/OS permission, external-process race, accessibility and process-termination criteria remain outstanding; issue #1 and PR #101 remain open.


### Cross-tab recovery: diagnostic coverage
- The cross-tab recovery E2E now inspects the IndexedDB journal in both tabs before attempting recovery.
- It verifies the source record's content, owning session ID, and `FileSystemDirectoryHandle.isSameEntry()` relationship; the second tab must observe that same record while having a distinct session ID.
- These assertions distinguish a failed journal write, workspace-handle mismatch, cross-tab visibility problem, and recovery-dialog logic failure. The recovery prompt and decline-preserves-record assertions remain intact.


### Cross-tab recovery — latest CI diagnosis and plan
- CI run `43689421532` (#918) reached 48 Playwright scenarios; the only persistent failure was in the new diagnostic assertion before the second tab attempted recovery. The source journal contained the exact draft, correct source `tabId`, and `sameWorkspace: true`.
- Root cause of this run's failure: the test expectation encoded newline escapes twice, so it compared literal `\\n` sequences with actual Markdown line breaks. This was a test assertion defect, not evidence of a failed IndexedDB write or workspace-handle mismatch.
- Corrected the expected strings to use actual newline escapes. Next verification must proceed through second-tab visibility, distinct session identity, recovery prompt source, and declined-draft retention.
- Plan: (1) prove the second tab sees the source record; (2) if not, isolate IndexedDB origin/context and workspace-handle identity; (3) if visible, instrument `getDraft()` selection and `open()` decision; (4) fix only the failing production boundary; (5) rerun the complete `test.sh` CI gate and require all Node, typecheck, build, E2E, and container jobs to pass. Do not mask the test with sleeps, retries, or weakened assertions.

## WAVE-031 verification workstream split — 2026-11-15

The remaining acceptance work from parent issue [#1](https://github.com/iamjpsonkar/Wave/issues/1) is split into focused GitHub issues:

- [#104 — WAVE-031A: native folder picker and real filesystem permission lifecycle](https://github.com/iamjpsonkar/Wave/issues/104). OPFS/Playwright permission behavior is simulated; native picker, cancellation, browser/OS revocation and real reauthorization remain to be verified.
- [#105 — WAVE-031B: external filesystem races and backup/restore fault handling](https://github.com/iamjpsonkar/Wave/issues/105). Existing E2E coverage verifies one editor-save external-edit conflict; broader read/save/backup/restore race boundaries and fault injection remain.
- [#106 — WAVE-031C: recovery drafts under abrupt browser process termination](https://github.com/iamjpsonkar/Wave/issues/106). Normal journal and cross-tab recovery tests do not establish behavior under actual process termination; measure the commit boundary and document the pre-commit loss window.
- Accessibility remains in existing [#3 — theme, contrast and accessibility verification](https://github.com/iamjpsonkar/Wave/issues/3), avoiding a duplicate issue. Parent #1 remains open until all workstreams have evidence.
- Main recorded PR #101 CI run [43690301741](https://github.com/iamjpsonkar/Wave/actions/runs/43690301741) passed (48/48 Playwright, Node tests, typecheck, build and container). This automated result does not satisfy native/manual acceptance criteria.


## Documentation reorganization — 2026-11-15

QA registers and issue traceability now live under `etc/quality/`; product/UI and Markdown coverage records live under `etc/product/`. See [etc/README.md](./etc/README.md). The move is documentation-only and does not alter QA evidence or test execution status.

## Documentation reconciliation and current manager CI — 2026-11-15

- Reconciled the reorganized QA register with the latest main-branch evidence: current source inventory is **30 Node test definitions and 48 Playwright Chromium scenarios**. Historical run counts above remain historical and must not be read as the current suite size.
- PR [#110](https://github.com/iamjpsonkar/Wave/pull/110) targets `main`, head `f1d49c174279158f1a20a8fc9efb675ab0708b66`. Its CI workflow [43693734660](https://github.com/iamjpsonkar/Wave/actions/runs/43693734660) completed successfully on that exact head.
- This workflow result verifies the configured CI jobs for the manager head; it does not satisfy native picker/OS permission, external-process race, abrupt process-termination or full accessibility acceptance work tracked under issues #3 and #104–#106.
- No application source or test code was changed in this documentation reconciliation. No local tests, typecheck or build were run.
