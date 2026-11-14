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
