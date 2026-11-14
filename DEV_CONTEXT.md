# Wave — Developer Context

> Canonical handoff document for AI-assisted development. Read this file before making changes, then inspect the referenced source/docs relevant to the task.
> Repository: https://github.com/iamjpsonkar/Wave
> Default branch: `main`
> Last reviewed: 2026-11-14
> Baseline commit/tree observed: `e53de9e554d4e5ccee32cfbaa72378dc0c6f9f44` (tree SHA at context review; refresh HEAD before every task)

## 1. Product contract

Wave is a local-first workspace for notes, documents, and ideas. The user chooses a directory; Wave manages a `.wave/` directory inside it. The MVP needs no account and has no application backend.

Non-negotiable principles:
- User-owned local content: saved documents and assets stay in the selected workspace directory.
- Portable content: Markdown documents and ordinary asset files remain inspectable outside Wave.
- Privacy by default: don't introduce uploads, analytics, remote processing, or third-party services without an explicit product decision and disclosure.
- Reliability before breadth: integrity, safe failure, recovery, backup/restore, migration, accessibility and export are release gates.
- Preserve scope: never silently prune agreed features. `upcoming-features.md` is the complete scope catalogue; `priority-features.md` assigns delivery order, not permission to drop requirements.

## 2. Stack and development commands

- React 18, TypeScript 5.7, Vite 6.
- Browser File System Access API for user-selected directories; secure context and supported Chromium browser are the intended MVP environment.
- IndexedDB for recent workspace handle and temporary unsaved recovery drafts only.
- Markdown: `react-markdown`, `remark-gfm`, `rehype-sanitize`.
- Icons: `lucide-react`.
- Node built-in test runner for storage/safety tests; Playwright Chromium for E2E.
- GitHub Actions CI runs on push/PR to `main`, using Node 22.

Scripts in `package.json`:
```bash
npm ci
npm test
npm run typecheck
npm run build
# E2E setup, matching CI:
npm install --no-save --package-lock=false @playwright/test@1.55.0
npx playwright install chromium
npm run test:e2e
```
Check package/CI files for exact current versions and commands before modifying dependencies.

## 3. Architecture and source map

Runtime: `index.html` → `src/main.tsx` → `src/App.tsx`.

- `src/App.tsx`: main React workspace UI/state, onboarding/reopen, navigation, editor/autosave, Markdown preview, local assets, search, favorites, templates, Trash, backups/restore, command palette/backlinks and recovery prompts.
- `src/storage.ts`: filesystem/storage adapter. Keep independent of React. Owns workspace initialization, document/folder/asset operations, settings, backups, Trash, integrity checks, path validation, collision handling, queues and locking.
- `src/workspaceRegistry.ts`: IndexedDB registry for recently used directory handle and permission-aware reopening. Stores a handle reference, not document content.
- `src/draftJournal.ts`: browser-local IndexedDB journal for temporary unsaved drafts, including per-tab identity and cross-tab-safe behavior.
- `src/safety.ts`: reliability primitives including task queues, workspace-generation checks, stable revision flush, relative asset paths and newest-draft selection.
- `src/markdown.tsx`: Markdown preprocessing, wiki-link extraction/resolution, alert blockquotes and code-block copy.
- `src/templates.ts`: built-in page templates.
- `src/styles.css`: application styling and responsive behavior.
- `tests/storage.test.js`: Node storage/concurrency/safety regression tests.
- `tests/e2e/workspace.spec.ts`: Playwright Chromium journeys.
- `playwright.config.ts`: Playwright configuration and Vite test server.
- `.github/workflows/ci.yml`: CI gate.

### Current on-disk workspace format

```text
<chosen-folder>/
└── .wave/
    ├── manifest.json
    ├── settings.json
    ├── documents/   # Markdown pages and nested folders
    ├── assets/      # ordinary uploaded files/images
    ├── backups/     # verified snapshots
    └── trash/       # recoverable deleted pages and operation metadata
```

Markdown under `.wave/documents/` is the current document source of truth. Assets are ordinary files under `.wave/assets/`; Markdown references them using relative paths based on document nesting. Manifest holds workspace identity/schema metadata; settings hold preferences such as favorites.

A versioned SQLite canonical store is a future architecture direction, not current implementation. Any migration must be explicit, repeat-safe, verified, and preserve original Markdown until successful verification.

IndexedDB boundaries:
- Recent folder registry: `wave-local` / `workspaces`.
- Temporary unsaved draft journal: separate browser-local records, isolated per tab/session.
- Do not describe IndexedDB as the canonical document store.
- Browser site-data clearing can remove recovery drafts and remembered handles. Keep independent backups.

## 4. Implemented capabilities at baseline

Verify current source and tests before asserting these remain unchanged:
- User-selected folder onboarding and `.wave/` initialization.
- Markdown page create/open/list/autosave, nested and empty folders.
- Formatting toolbar and sanitized Markdown preview; GFM via configured libraries.
- Local image/file attachments with collision-safe names and relative links.
- Search over page titles/content, snippets and keyboard result navigation.
- Recoverable Trash, restore without overwrite, permanent deletion and interrupted-operation journal/reconciliation.
- Local backup snapshots, integrity verification, backup browsing and restore to a separate workspace; incomplete snapshots/restores are marked and refused as valid.
- IndexedDB recovery drafts, per-tab isolation and cross-tab provenance in the recovery prompt.
- Revision-aware saves, flush-until-stable transitions, workspace-generation guards, serialized writes and Web Locks with in-process fallback.
- External-edit detection before overwrite, with reload or save-as-copy flow.
- Case-insensitive collision protection and serialized allocation.
- Recent workspace reopening with permission-aware reauthorization.
- Built-in templates: blank, meeting, project brief, task list, weekly plan, research notes, decision record.
- Favorites, duplicate page, responsive/mobile navigation, command palette and wiki-link/backlink behavior (verify exact current UI before changing).

Implementation does not equal full verification. Check evidence for each affected behavior.

## 5. Reliability, security and UX invariants

Preserve all of the following:
1. Never silently overwrite documents, assets, backups, or restore destinations.
2. Validate workspace-relative paths; reject absolute paths, traversal segments, invalid separators and unsafe names.
3. Close writable streams before reporting success; abort failed writes while preserving the original error.
4. Serialize operations that mutate the same workspace/resource; use Web Locks when available and safe in-process fallback.
5. Treat async UI completions as stale when workspace generation changes; never publish old-workspace results into the active workspace.
6. Editor transitions flush until the latest revision is persisted; never mark a newer revision saved based on an earlier write.
7. Detect external document changes before overwrite; offer reload or save-as-copy.
8. Trash: verify recoverable copy before deleting original; journal/reconcile interrupted operations; restore to a unique destination.
9. Backup: allocate unique destination; mark in-progress/complete/failed; snapshot and copied content hashes; verify before completion.
10. Restore to a unique separate workspace; refuse incomplete restore destinations.
11. Recovery status distinguishes pending from committed. IndexedDB is async; never claim crash-proof durability or protection before transaction commit.
12. Markdown preview stays sanitized; don't execute raw HTML/scripts or fetch remote image content as part of preview.
13. External links remain safe (for example, noreferrer); treat workspace paths and file names as untrusted input.
14. New data shapes require schema/version/migration and backup/export/recovery consideration.
15. Preserve keyboard access, focus behavior, semantic labels, contrast, responsive/mobile behavior and reduced-motion/accessibility.

## 6. Project documents and their separate responsibilities

- `upcoming-features.md`: complete product blueprint/catalogue. Source of truth for preserving full scope. Never delete or compress requirements without explicit owner approval.
- `priority-features.md`: prioritized implementation plan and dependencies. Does not supersede the full catalogue.
- `features.md`: concise shipped-feature showcase.
- `docs/FEATURES.md`: detailed shipped/planned feature map.
- `docs/ROADMAP.md`: release sequencing.
- `docs/ARCHITECTURE.md`: architecture and reliability/security rationale.
- `bugs.md`: only current reproducible/source-supported bugs and material QA gaps.
- `fixed-bugs.md`: resolved bug history and regression baseline; recheck on every QA task.
- `dev-fixed.md`: implementation/fix log (problem, code changes, tests, commit, limitations).
- `dev-build.md`: build/test/CI history (exact commit, workflow run, per-suite outcome).
- `DEV_CONTEXT.md` (this file): concise AI handoff; update after every task.

Don't conflate these trackers. Don't move an issue to fixed until implemented and appropriate regression verification passes. Planned features are not bugs.

## 7. Open bug snapshot — refreshed 2026-11-14

The reviewed `bugs.md` reported two partial findings:
- **WAVE-031 (P1):** remains partial. Current tests simulate permission denial and exercise two-tab editing, but native picker/revocation, external filesystem races during active operations, comprehensive accessibility, and abrupt process termination remain uncovered.
- **WAVE-039 (P1):** remains partial. IndexedDB strict durability and `pagehide`/`visibilitychange` best-effort writes reduce but cannot eliminate the asynchronous pre-commit crash window.

WAVE-042 remains fixed in source and has a cross-tab regression scenario. Latest QA recheck: see `qa-context.md`; current bug register is `bugs.md`.

## 8. Verification snapshot and current QA inventory

The checked-in `dev-build.md` reports workflow run [43604242348](https://github.com/iamjpsonkar/Wave/actions/runs/43604242348), for commit `09021ed224f739fd66325bb8f6cc8f1bcca5b142`, successful:
- 30 Node tests passed.
- 10 Playwright Chromium scenarios passed.
- TypeScript typecheck passed.
- Production build passed.

This remains historical CI evidence and does not verify later commits. The current checked-in test sources define 30 Node tests and 13 Playwright Chromium scenarios; the documented successful CI run covers an earlier 10-scenario browser suite. The 2026-11-14 QA recheck was source-only: no local build/tests or new CI run were performed. Refresh the default-branch HEAD and CI before relying on test status.

## 9. Required workflow for every future task

### Before changes
1. Read `DEV_CONTEXT.md` first.
2. Check current branch, HEAD commit, working tree and relevant source files; don't assume this snapshot is current.
3. Read relevant feature/priority/roadmap docs and tests.
4. For QA/bug tasks, read both `bugs.md` and matching scenarios in `fixed-bugs.md`.
5. Resolve acceptance criteria using existing product decisions; preserve all previously agreed features and constraints.

### During changes
1. Make the smallest cohesive change; preserve existing behavior unless task explicitly changes it.
2. Respect the storage adapter boundary; keep UI concerns out of `src/storage.ts`.
3. Add/update regression tests for fixes/features; cover failure paths, concurrency, reload/restore and accessibility where relevant.
4. Never delete existing features or requirements to simplify implementation.
5. Avoid unrelated refactors and unrelated file churn.
6. Keep README/docs/catalogues consistent with actual behavior.

### At the end of every task
- Feature work: update `features.md`, `docs/FEATURES.md`, `priority-features.md`, and/or `docs/ROADMAP.md` as appropriate. Preserve the full `upcoming-features.md` catalogue.
- Bug work: current findings only in `bugs.md`; move to `fixed-bugs.md` only after verification; retain IDs and regression scenarios.
- Code fixes: append problem, changes, files, tests, commit/CI and limitations to `dev-fixed.md`.
- Build/test/CI: append exact commit and suite-level outcome to `dev-build.md`; distinguish not run, queued, failed and passed.
- **Always update this `DEV_CONTEXT.md` after every task**, as the final documentation step: date/HEAD, current architecture or contracts affected, changed files, current open bugs, key decisions and latest verified test/CI evidence. Keep concise and link detailed logs instead of copying them.
- Never claim a test passed unless it actually ran and passed. Never claim a GitHub write/commit succeeded unless the tool confirms it.

## 10. Completion checklist

- [ ] Requested behavior implemented without removing previously agreed features.
- [ ] Regression tests added/updated.
- [ ] `npm test` run where relevant.
- [ ] `npm run typecheck` run.
- [ ] `npm run build` run.
- [ ] `npm run test:e2e` run when browser behavior is affected.
- [ ] Open bugs and fixed-bug scenarios rechecked for QA tasks.
- [ ] Product docs and separate development logs updated.
- [ ] `DEV_CONTEXT.md` updated as the final documentation step.
- [ ] Exact commit/CI evidence and remaining limitations recorded.


## 11. Latest QA handoff — 2026-11-14

- Source-only QA recheck recorded in [qa-context.md](./qa-context.md).
- Open findings remain WAVE-031 and WAVE-039; WAVE-042 remains fixed in source.
- Current test source defines 30 Node tests and 13 Chromium E2E scenarios. The successful CI result currently documented in `dev-build.md` covers an earlier 10-scenario suite; no fresh execution was performed in this QA task.
- QA documentation commits: `bugs.md` `453f44268b694ded80109f785054d4e80b0ca5bb` (superseded by inventory correction in this task); `fixed-bugs.md` `c0b7503991190d6a84d3f381136bdd75fe98078a`; `qa-context.md` `4f52cbfd016a7419848cf4b2d100266c260cc290`. See current GitHub history for the final corrected `bugs.md` commit.


## 12. Markdown compatibility implementation — 2026-11-14

- Read the user-provided Markdown Feature Showcase and implemented the practical supported subset in the existing renderer without adding remote services or new npm dependencies.
- `src/markdown.tsx`: wiki/alert preprocessing remains; added math delimiter preprocessing, MathML subset (basic tokens, Greek commands, simple fractions/roots and one superscript/subscript), simple Mermaid flowchart SVG rendering with readable source fallback for other Mermaid forms, and heading slug IDs.
- `src/App.tsx`: maps Markdown heading levels to anchor IDs and routes code nodes through the custom renderer.
- `src/styles.css`: preview styling for math, diagrams and heading levels.
- `src/templates.ts`: adds the Markdown feature showcase template.
- `docs/MARKDOWN_SUPPORT.md`: canonical syntax compatibility/security matrix. Raw HTML remains disabled; full LaTeX, advanced Mermaid, PlantUML, Graphviz, Vega, D2, AsciiDoc, syntax highlighting and media embeds are not claimed as supported.
- E2E test source now contains 14 scenarios, including the new math/flowchart/heading scenario. Run 43612461372 passed `npm ci` and 30 Node tests but failed typecheck because `MarkdownElementProps` lacked `className`; fixed in `035e442a90d7e8cb48b88e4e9df93971a1bcaa24`. Follow-up run 43612488927 passed install, 30 Node tests, typecheck and production build; Playwright install/E2E remained in progress at last check. Latest run 43612554015 on `983055ca882936345a37abbf8de5b9a90a0ea9fc` had passed install, Node tests and typecheck, with build/E2E still in progress. Check `dev-build.md` before claiming a full pass.
- Always read `docs/MARKDOWN_SUPPORT.md` before extending Markdown support; preserve local-only rendering and sanitization boundaries.
