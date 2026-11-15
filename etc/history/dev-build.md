# Wave — Developer Context

> Canonical handoff document for AI-assisted development. Read this file before making changes, then inspect the referenced source/docs relevant to the task.
> Repository: https://github.com/iamjpsonkar/Wave
> Default branch: `main`
> Last reviewed: 2026-11-15
> Latest reviewed branch baseline: `561fef34390d6805b30956a1723bbcb0a0edcdad` on `WAVE-0001` (refresh `main` and branch HEAD before every task)

## Current documentation audit — 2026-11-15

- Audited all 33 Markdown files on `manager`; final relative-link scan found zero missing case-sensitive repository paths.
- Repaired migrated links and path references across product, engineering, quality, history and contributor documentation without removing planned scope or historical evidence.
- Enforced the project-owner QA rule in the operating guide and how-to procedures: QA is read-only; findings go to GitHub issues and PR review comments; developers own fixes.
- Current test-source inventory on this branch: 30 Node test definitions and 48 Playwright Chromium test definitions. These are source counts, not test execution or CI pass claims.
- Documentation-only verification used GitHub tree/content inspection. No local tests, typecheck, build, browser run or CI result is claimed.
- Audit history: `etc/history/dev-build.md`. The documentation audit was based on manager commit `81ce45825044fc7c6dea63e6186280ef28abb13f`; this handoff update is the final documentation action.

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

Primary local commands:
```bash
./run.sh       # start Vite; bootstraps npm dependencies if missing
./test.sh      # Node tests + typecheck + build + Playwright Chromium E2E
./test.sh --no-e2e
npm run test:local
```
`test.sh` installs the CI-pinned Playwright runner and Chromium when needed. Pre-provisioned/CI usage: `./test.sh --skip-install --skip-playwright-install --skip-browser-install`. Node.js 22.6+ is required. See the scripts' `--help` output and README for environment variables/options.

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
- `config/vite.config.ts`: Vite configuration.
- `config/playwright.config.ts`: Playwright configuration and Vite test server.
- `config/tsconfig.app.json`: application TypeScript project configuration; root `tsconfig.json` references it.
- `run.sh`: local Vite development-server launcher.
- `test.sh`: fail-fast local Node/typecheck/build/Playwright quality gate shared with CI.
- `.github/workflows/ci.yml`: CI gate using the same test script.

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

## 6. Project documents and their responsibilities

- `etc/product/upcoming-features.md`: complete product blueprint/catalogue. Source of truth for preserving full scope. Never delete or compress requirements without explicit owner approval.
- `etc/product/priority-features.md`: prioritized implementation plan and dependencies. Does not supersede the full catalogue.
- `etc/product/FEATURES.md`: combined shipped-feature overview and detailed shipped/planned feature map.
- `etc/product/ROADMAP.md`: release sequencing.
- `etc/engineering/ARCHITECTURE.md`: architecture and reliability/security rationale.
- `etc/quality/bugs.md`: only current reproducible/source-supported bugs and material QA gaps.
- `etc/quality/fixed-bugs.md`: resolved bug history and regression baseline; recheck on every QA task.
- `etc/history/dev-fixed.md`: implementation/fix log (problem, code changes, tests, commit, limitations).
- `etc/history/dev-build.md`: build/test/CI and feature implementation history (exact commit, workflow run, per-suite outcome).
- `etc/product/UI_BACKLOG.md`: consolidated UIB/UI/UIF export bugs, UI gaps and UI feature proposals.
- `QA_CONTEXT.md`: current QA disposition, test inventory, limitations and historical QA audit evidence.
- `DEV_CONTEXT.md` (this file): concise AI handoff; update last after every task. See `WIKI.md` for the mandatory per-task Markdown documentation policy.

Don't conflate these trackers. Don't move an issue to fixed until implemented and appropriate regression verification passes. Planned features are not bugs.

## 7. Open bug snapshot — refreshed 2026-11-14

The reviewed `etc/quality/bugs.md` reported two partial findings:
- **WAVE-031 (P1):** remains open/partial. Branch `WAVE-0001` adds deterministic E2E coverage for prompt-state permission reauthorization and external-edit conflict preservation. Native picker/OS revocation, external-process races during read/save/backup/restore, comprehensive keyboard/screen-reader accessibility and abrupt process termination remain unverified. See `QA_CONTEXT.md` manual plan and `etc/quality/bugs.md`.
- **WAVE-039 (P1):** remains partial. IndexedDB strict durability and `pagehide`/`visibilitychange` best-effort writes reduce but cannot eliminate the asynchronous pre-commit crash window.

WAVE-042 remains fixed in source and has a cross-tab regression scenario. Latest QA recheck: see `QA_CONTEXT.md`; current bug register is `etc/quality/bugs.md`.

## 8. Verification snapshot and current QA inventory

The checked-in `dev-build.md` reports workflow run [43604242348](https://github.com/iamjpsonkar/Wave/actions/runs/43604242348), for commit `09021ed224f739fd66325bb8f6cc8f1bcca5b142`, successful:
- 30 Node tests passed.
- 10 Playwright Chromium scenarios passed.
- TypeScript typecheck passed.
- Production build passed.

This remains historical CI evidence and does not verify later commits. The current checked-in test sources on `WAVE-0001` define 30 Node tests and 48 Playwright Chromium scenarios; the documented successful CI run covers an earlier 10-scenario browser suite. The 2026-11-14 QA recheck was source-only: no local build/tests or new CI run were performed. WAVE-0001 adds two browser test definitions; PR CI is pending and must be checked before reporting any pass. Refresh the default-branch HEAD and CI before relying on test status.

## 9. Required workflow for every future task

### Before changes
1. Read `DEV_CONTEXT.md` first.
2. Check current branch, HEAD commit, working tree and relevant source files; don't assume this snapshot is current.
3. Read relevant feature/priority/roadmap docs and tests.
4. For QA/bug tasks, inspect `etc/quality/bugs.md` and matching scenarios in `etc/quality/fixed-bugs.md`; QA remains read-only.
5. Resolve acceptance criteria using existing product decisions; preserve all previously agreed features and constraints.

### During changes
1. Make the smallest cohesive change; preserve existing behavior unless task explicitly changes it.
2. Respect the storage adapter boundary; keep UI concerns out of `src/storage.ts`.
3. Add/update regression tests for fixes/features; cover failure paths, concurrency, reload/restore and accessibility where relevant.
4. Never delete existing features or requirements to simplify implementation.
5. Avoid unrelated refactors and unrelated file churn.
6. Keep README/docs/catalogues consistent with actual behavior.

### At the end of every task
- Feature work: update `etc/product/FEATURES.md`, `etc/product/priority-features.md`, and/or `etc/product/ROADMAP.md` as appropriate. Preserve the full `etc/product/upcoming-features.md` catalogue.
- Bug work: developers update `etc/quality/bugs.md` and `etc/quality/fixed-bugs.md` when implementation and regression evidence justify a status change. QA does not edit these files; it reports findings through GitHub.
- Code fixes: append problem, changes, files, tests, commit/CI and limitations to `etc/history/dev-fixed.md`.
- Build/test/CI: append exact commit and suite-level outcome to `etc/history/dev-build.md`; distinguish not run, queued, failed and passed.
- **Always update this `DEV_CONTEXT.md` after every task**, as the final documentation step: date/HEAD, current architecture or contracts affected, changed files, current open bugs, key decisions and latest verified test/CI evidence. Keep concise and link detailed logs instead of copying them.
- Never claim a test passed unless it actually ran and passed. Never claim a GitHub write/commit succeeded unless the tool confirms it.

## 10. Completion checklist

- [ ] Requested behavior implemented without removing previously agreed features.
- [ ] Regression tests added/updated.
- [ ] `npm test` run where relevant.
- [ ] `npm run typecheck` run.
- [ ] `npm run build` run.
- [ ] `npm run test:e2e` run when browser behavior is affected.
- [ ] Existing GitHub issues and regression scenarios reviewed; QA reports findings without repository edits.
- [ ] Product docs and separate development logs updated.
- [ ] `DEV_CONTEXT.md` updated as the final documentation step.
- [ ] Exact commit/CI evidence and remaining limitations recorded.


## 11. Latest QA handoff — 2026-11-14

- Source-only QA recheck recorded in [QA_CONTEXT.md](./QA_CONTEXT.md).
- Open findings remain WAVE-031 and WAVE-039; WAVE-042 remains fixed in source.
- Current test source defines 30 Node tests and 13 Chromium E2E scenarios. The successful CI result currently documented in `dev-build.md` covers an earlier 10-scenario suite; no fresh execution was performed in this QA task.
- QA documentation commits: `bugs.md` `453f44268b694ded80109f785054d4e80b0ca5bb` (superseded by inventory correction in this task); `fixed-bugs.md` `c0b7503991190d6a84d3f381136bdd75fe98078a`; `QA_CONTEXT.md` `4f52cbfd016a7419848cf4b2d100266c260cc290`. See current GitHub history for the final corrected `bugs.md` commit.


## 12. Markdown compatibility implementation — 2026-11-14

- Read the user-provided Markdown Feature Showcase and implemented the practical supported subset in the existing renderer without adding remote services or new npm dependencies.
- `src/markdown.tsx`: wiki/alert preprocessing remains; added math delimiter preprocessing, MathML subset (basic tokens, Greek commands, simple fractions/roots and one superscript/subscript), simple Mermaid flowchart SVG rendering with readable source fallback for other Mermaid forms, and heading slug IDs.
- `src/App.tsx`: maps Markdown heading levels to anchor IDs and routes code nodes through the custom renderer.
- `src/styles.css`: preview styling for math, diagrams and heading levels.
- `src/templates.ts`: adds the Markdown feature showcase template.
- `docs/MARKDOWN_SUPPORT.md`: canonical syntax compatibility/security matrix. Raw HTML remains disabled; full LaTeX, advanced Mermaid, PlantUML, Graphviz, Vega, D2, AsciiDoc, syntax highlighting and media embeds are not claimed as supported.
- E2E test source now contains 14 scenarios, including the new math/flowchart/heading scenario. Run 43612461372 passed `npm ci` and 30 Node tests but failed typecheck because `MarkdownElementProps` lacked `className`; fixed in `035e442a90d7e8cb48b88e4e9df93971a1bcaa24`. Follow-up run 43612488927 passed install, 30 Node tests, typecheck and production build; Playwright install/E2E remained in progress at last check. Latest run 43612554015 on `983055ca882936345a37abbf8de5b9a90a0ea9fc` had passed install, Node tests and typecheck, with build/E2E still in progress. Check `dev-build.md` before claiming a full pass.
- Always read `docs/MARKDOWN_SUPPORT.md` before extending Markdown support; preserve local-only rendering and sanitization boundaries.


## 13. Markdown showcase gap audit — 2026-11-14

- Audited the complete user-provided 20-section Markdown Feature Showcase against the current renderer, App preview wiring, styles, templates, `docs/MARKDOWN_SUPPORT.md`, `FEATURES.md`, `FEATURES.md` and E2E test source.
- Conclusion: Markdown is **not feature-complete** against that showcase. Existing support includes common Markdown/GFM, alert callouts, wiki links/backlinks, local images, heading anchors, a small MathML subset and simple Mermaid flowcharts.
- Created [markdown-coverage.md](./etc/product/markdown-coverage.md) as the canonical itemized gap/acceptance checklist. Major gaps: full LaTeX/math grammar, advanced Mermaid diagram families and syntax, syntax highlighting/diff coloring, safe HTML-like inline formatting and collapsible sections, emoji shortcodes, GitHub mention/issue references, Graphviz/PlantUML/Vega/D2/AsciiDoc renderers, media embeds, duplicate-heading slugs, and broader accessibility/conformance coverage.
- Raw HTML and arbitrary media remain deliberately disabled for safety; any future support must use explicit safe components/allowlists rather than enabling unrestricted HTML.
- Updated `dev-build.md` with the audit record. This was a source/documentation audit only; no application code changed and no tests were run for this audit. Existing CI evidence is historical and must not be described as full Markdown showcase verification.
- Latest documentation commits: `features-gap.md` `0b85dd6`; `dev-build.md` `69f749a`. This handoff update is the final documentation step for the task.


## 14. Markdown implementation follow-up — 2026-11-14

- Audited `features-gap.md` and implemented an additional source-supported subset without modifying that file, `bugs.md`, or `fixed-bugs.md`.
- `src/markdown.tsx`: safe inline formatting shorthands (`==mark==`, `++underline++`, `^sup^`, `~sub~`, `[[kbd:...]]`), common emoji shortcodes, lightweight token coloring for common code languages, recursive MathML groups/fractions/roots/scripts and common commands, local Mermaid sequence and pie renderers, safe DETAILS disclosure blocks, and a rehype heading-ID plugin that runs after sanitization.
- `src/App.tsx`: the heading-ID plugin is ordered after `rehypeSanitize`; local image fallback retains alt/title and links retain title metadata.
- `src/styles.css`: styles for syntax tokens, diagrams, inline styles and disclosure.
- `src/templates.ts`: expanded Markdown showcase examples, including math, sequence/pie charts, inline syntax and details.
- Added E2E scenarios for extended rendering and CommonMark conformance. Current browser suite source: **17 scenarios**; Node suite source: **30 tests**.
- Updated `FEATURES.md`, `FEATURES.md`, `docs/MARKDOWN_SUPPORT.md`, `README.md`, `dev-fixed.md` and `dev-build.md`.
- Verification: workflow [43614071812](https://github.com/iamjpsonkar/Wave/actions/runs/43614071812), code commit `1df330599916a9d657e83838b03231bd39296ae5`: `npm ci`, 30 Node tests, typecheck and production build passed; Playwright E2E was still in progress at last check. Earlier E2E run [43613680208](https://github.com/iamjpsonkar/Wave/actions/runs/43613680208) failed four preview journeys; the heading/disclosure/sidebar timing corrections were added afterwards and need the new E2E result before verification is complete.
- Still not full parity: complete TeX/LaTeX environments, all Mermaid diagram families and advanced syntax, full grammar-based syntax/diff highlighting, GitHub mention/issue semantics, PlantUML/Graphviz/Vega/D2/AsciiDoc renderers, arbitrary media embeds, cross-browser/visual/accessibility audits and a full conformance fixture suite. Raw HTML remains disabled intentionally.
- Explicitly untouched in this task: `bugs.md`, `fixed-bugs.md`, and `features-gap.md`.
- Final documentation handoff commit follows this update; check the current Actions run before relying on browser-test status.


## 15. Markdown E2E follow-up — 2026-11-14

- Latest E2E feedback from [43614071812](https://github.com/iamjpsonkar/Wave/actions/runs/43614071812): 14/17 browser scenarios passed. Remaining test failures identified DETAILS summary extraction and two test assertions (stable path targeting for wiki-link navigation and duplicate reference-link matches).
- Corrected DETAILS to split summary/body on the first line in `9648f202c23d5771799dd3f59e30800ce20df6c0`; updated wiki-link and reference-link E2E assertions in `d3c4da59c8796a42e7e3acc378a5bdac53e99c8b`.
- The latest code/test workflow [43614377295](https://github.com/iamjpsonkar/Wave/actions/runs/43614377295), commit `d3c4da59c8796a42e7e3acc378a5bdac53e99c8b`, passed npm ci, 30 Node tests, typecheck and production build; Playwright dependency install was in progress at last inspection, so browser verification remains pending.
- Development log updates are in `dev-build.md` and `dev-fixed.md`. `DEV_CONTEXT.md` is the final handoff update for this task.

## 16. Markdown gap recheck — 2026-11-14 (latest handoff)

- Rechecked current Markdown source at code revision 186e7ec3dd817a42a610e51c6a3c4a3d8b3d8f19; docs and gap tracker were then refreshed in commits 8b9753b, a3d0612, 920a1c2, 47eaf57 and 19046fa. This section supersedes earlier Markdown capability and CI snapshots above where counts/status differ.
- Source now includes safe inline formatting/emoji/disclosure extensions, duplicate heading IDs, lightweight token and diff coloring, a constrained recursive MathML parser, many constrained Mermaid family renderers, local DOT/PlantUML/Vega-Lite/D2/AsciiDoc subsets, local-only controlled audio/video, and a technical learning-notes template.
- These are partial local implementations, not full language engines. Full TeX grammar, full Mermaid compatibility/layout/accessibility, grammar-grade syntax highlighting, complete DOT/PlantUML/Vega/D2/AsciiDoc compatibility, broad accessibility/cross-browser/visual/round-trip coverage remain open. Raw HTML and remote media remain deliberately disabled; GitHub @mentions and issue references remain inert plain text.
- Current test source: **30 Node tests** and **23 unique Playwright scenarios**.
- Latest workflow [43616005399](https://github.com/iamjpsonkar/Wave/actions/runs/43616005399), code commit 186e7ec3dd817a42a610e51c6a3c4a3d8b3d8f19: install, 30 Node tests, typecheck and production build passed; E2E **failed 20/23**. Three failures remain: wiki-link E2E asserts internal URL instead of rendered button; syntax-keyword assertion is strict against multiple matching spans; Mermaid flowchart E2E expects SVG primitives not emitted by the current renderer. The other new math, other-diagram, local-media and additional Mermaid fixture scenarios passed in that run.
- features-gap.md now contains the recheck matrix and pending acceptance sequence. docs/MARKDOWN_SUPPORT.md now describes the current constrained renderer subsets and security boundaries. Detailed CI result is in dev-build.md.
- No app source was changed in this recheck; the three E2E assertions remain unfixed. Open Wave bugs remain WAVE-031 and WAVE-039 partial; WAVE-042 remains fixed.
- Next task should fix the three browser assertions/behaviors, rerun the full 23-scenario suite, then continue the unverified accessibility, conformance, round-trip and compatibility work. Do not mark Markdown feature-complete yet.

## 17. Markdown gap remediation checkpoint — 2026-11-14

- Initial remediation pass committed to `main`: fixed the technical learning-notes template's literal backslash-n separator in `src/templates.ts`; added a Playwright template-selection/editor-newline/preview-structure scenario; corrected three stale/overly strict E2E assertions for wiki links, syntax-token selection and Mermaid flowchart output.
- Code/test commits: `b8e936b707d9f8c2d78a88991943b7a57c705689`, `65f62060152596d160f66effebcf17a274edc80b`, `f633ccc75c9afb9d3ab7529b489e557d7ae9f8c8`, `5d6b16d18e552c79f11dd6471c47aeab54662f47`.
- Updated `dev-fixed.md`, `dev-build.md` and `features-gap.md` with the remediation and explicit verification boundary. This context update is the final documentation step; its parent documentation checkpoint is `88899a31f721a6dadcd5f2174b73e569562ee0a5`.
- Browser test source now defines 24 scenarios; Node test source remains 30 tests. **No local tests were run and no CI run for these new commits has been verified.** The last inspected CI evidence remains the earlier 20/23 Playwright result; do not claim the corrected suite passes.
- Keep WAVE-052 in `bugs.md` and do not move it to `fixed-bugs.md` until the new template regression passes in CI. WAVE-031 and WAVE-039 remain partial.
- Remaining Markdown acceptance scope is still open: complete TeX/LaTeX, Mermaid and external renderer compatibility; grammar-based highlighting and unified diff parsing; broader accessibility, cross-browser and visual checks; malformed/oversized input limits; full preview/source round-trip fixtures; exhaustive showcase coverage. Preserve raw-HTML/remote-media security boundaries and inert GitHub references unless product semantics are explicitly changed.
- For the next pass, inspect the latest Actions run for the current `main` head, fix any actual failures, then proceed through the remaining `features-gap.md` acceptance groups. Never mark the Markdown feature set complete based on source presence alone.


## 18. Markdown security regression expansion — 2026-11-14

- Picked the next item from the core compatibility/security coverage group in `features-gap.md`: a URL-scheme and local-media path security regression matrix.
- Added a Playwright scenario in `tests/e2e/workspace.spec.ts` that verifies HTTPS/mailto links remain available while `javascript:`, `data:`, `vbscript:`, `file:` and mixed-case JavaScript URLs do not become anchors.
- The same test creates a sentinel `secret.mp3` in the local assets directory and checks that parent traversal, percent-encoded traversal, absolute paths, Windows-style paths and remote media references do not produce playable audio/video elements.
- Updated `docs/MARKDOWN_SUPPORT.md` with the intended sanitized URL and local single-filename media resolution contract. Updated `features-gap.md`, `dev-fixed.md` and `dev-build.md` with scope and verification status.
- Test source now defines **25 Playwright scenarios** and **30 Node tests**. No local test execution or CI run for this scenario has been verified; do not report it as passing. This step adds regression coverage and documentation only; it is not a source-code security fix and closes no bug.
- Next: inspect CI for current `main`; fix any real failures exposed by the new security scenario. Then continue with another core conformance item (preview/source round-trip invariance or accessibility coverage) before moving into the larger renderer-compatibility projects.


## 19. Markdown preview/source round-trip regression — 2026-11-14

- Picked the next core conformance item from `features-gap.md`: verify preview transformations never rewrite the original Markdown source.
- Added a Playwright E2E scenario in `tests/e2e/workspace.spec.ts` with hard breaks, ordinary/wiki links, inline and fenced code, escaped table pipes, fenced math, callouts and raw-HTML text.
- The scenario checks byte-for-byte equality after Preview → Edit, reads the saved Markdown file and compares exact contents, then reloads/reopens the workspace and checks the editor value again.
- Updated `docs/MARKDOWN_SUPPORT.md`, `features-gap.md`, `dev-fixed.md` and `dev-build.md`. No runtime application code changed.
- Browser test source now defines **26 Playwright scenarios**; Node test source remains **30 tests**. No local test execution or CI result for this scenario has been verified. Treat it as regression coverage defined, not passed.
- Latest code/test commit for this item: `cf824115ba035c41ecaf1e8c5923310e69599986`; documentation commits follow in `006ec92`, `9d15249`, `dd3a84d` and this handoff update.
- Next: inspect current CI for the latest `main` head and repair any actual test failures. Then continue with accessibility checks (including keyboard focus, headings, images, tables, task lists, callouts, math and diagram fallbacks). Keep full language compatibility and malformed/oversized-input testing open.

- Follow-up test-fixture correction: the round-trip test's array join now uses an actual newline separator (not a literal backslash-n). Corrected in `031a0e2427a6669312d643e14275a3ebd1ce04db`; fetched source was rechecked to confirm `.join('\n')`.


## 20. Multiline code blocks and Markdown accessibility smoke coverage — 2026-11-14

- Next picked item: accessibility checks for semantic Markdown output, plus the user's explicit request for multiline code support.
- Implemented a new editor toolbar action in `src/App.tsx`: **Code block** wraps selected content in triple-backtick fences and selects it; when selection is empty, inserts a selected `Write code here` placeholder.
- Added two Playwright scenarios:
  - Multiline code insertion, fenced preview rendering and exact clipboard-copy fidelity.
  - Accessibility smoke checks for heading levels, accessible link name, table and column headers, task-list checkbox roles, NOTE callout role/name, DETAILS disclosure and keyboard focus/activation.
- Updated `docs/MARKDOWN_SUPPORT.md`, `features-gap.md`, `dev-fixed.md` and `dev-build.md`.
- Current test source counts: **28 Playwright scenarios**, **30 Node tests**. No local tests or CI run for these commits have been executed/inspected. Do not claim passing. Accessibility coverage is a focused semantic/keyboard smoke test, not a full WCAG audit or screen-reader certification.
- Main implementation commit: `2553d24d95ed322a21588a1b02a6cb14107b45ec`; E2E coverage commits: `55e51e1f7d8d8b45a38843248456bf14493c2f98`, `d4f3a375888c033645ab1af07463a011b082926d`.
- Next: inspect CI on current main and repair any actual failures; then expand accessibility coverage (images/alt text, focus visibility, color contrast, diagram source/fallback semantics) and malformed/oversized input tests. Preserve all outstanding feature scope.


## 21. CI pipeline failure triage — 2026-11-14

- Inspected failed workflow `43617787871` for commit `91e9ffb8a5a7b73ba6532a0f2e9c54230f280e54`.
- Node suite, TypeScript typecheck and production build passed. E2E Playwright failed due to strict-mode test locators and a newline fixture mismatch:
  - keyword selector matched four spans, not just `def`;
  - template button matched two instances, now scoped to `.sidebar-templates`;
  - template test expected literal `\\n`, corrected to real newline characters;
  - ER diagram test matched two CUSTOMER labels, now exact-match;
  - table header assertion uses `thead th` DOM elements instead of role lookup.
- Applied corrections in `tests/e2e/workspace.spec.ts`; commit `44d78ebc1ba6734caa75cb52d20bbb1ee1a5e6d8`.
- Follow-up CI run `43618259567` was queued at handoff: https://github.com/iamjpsonkar/Wave/actions/runs/43618259567. Do not claim pipeline green until that run completes.


- Additional CI follow-up: run `43618259567` for commit `44d78ebc` reached **27/28 Playwright scenarios**; Node, typecheck and build passed. The sole remaining failure was a strict-mode H2 locator in the Technical Learning Notes test. Corrected by targeting level-2 headings by accessible name in commit `026b0bdee17d05278dbf616afd4b4a323df264cd`. New Actions run `43618423075` is queued: https://github.com/iamjpsonkar/Wave/actions/runs/43618423075. Pipeline green status remains pending.


## 22. Markdown diagram accessibility and multiline code — 2026-11-14

- Picked the next accessibility item from the Markdown gap work: diagram source disclosures must remain independently available to keyboard and assistive-technology users.
- `src/markdown.tsx`: moved accessible image roles/names from the 15 diagram wrapper containers onto their SVG elements. Wrappers now remain normal document containers so the nested **View diagram source** disclosure is not flattened by an image role.
- `tests/e2e/workspace.spec.ts`: extended the accessibility smoke scenario to assert a named sequence-diagram image, keyboard focus/Enter activation of its source disclosure, and readable diagram source.
- Updated `docs/MARKDOWN_SUPPORT.md`, `features-gap.md`, `dev-fixed.md` and `dev-build.md`.
- Multiline code support remains implemented: the Code block toolbar wraps selected multiline text in a fenced block, retains the selection, supports an empty-selection placeholder, and has a preview/copy fidelity E2E scenario.
- Baseline CI run [43618454015](https://github.com/iamjpsonkar/Wave/actions/runs/43618454015) passed Node tests, typecheck, build and all Playwright scenarios before this patch. The accessibility patch itself is **pending CI**; do not claim it passed until a workflow for the updated source completes.
- Implementation commit: `052840f834f879e54ac32567aecc3e4c7a0cad13`; regression test commit: `ed34c50b6f21c134d762786f869801785b2452d3`. Latest main before this handoff update: `c2c470d1d2ebc04283eea4646704e20292fea155`.
- Open reliability findings remain WAVE-031 and WAVE-039 partial; WAVE-042 remains fixed. No bug trackers were changed.


## 23. QA tracker reconciliation — 2026-11-14

- Refreshed repository source baseline to `268de12338bce554f18e5feef27acbb5e9ea45fe`.
- `bugs.md` now contains only the two current open findings: WAVE-031 (native picker/external filesystem/lifecycle and comprehensive accessibility QA coverage) and WAVE-039 (residual IndexedDB pre-commit crash window). WAVE-042 and WAVE-052 remain in the fixed-history register.
- `fixed-bugs.md` retains all **50** historical finding IDs and their regression scenarios. Its latest addendum distinguishes the successful 30-Node/28-Playwright baseline from the later diagram-accessibility patch.
- `features-gap.md` has been consolidated into one current 16-section Markdown acceptance checklist. The original requirement families remain preserved; repeated contradictory status snapshots were removed, not scope.
- At this historical checkpoint, source defined **30 Node tests** and **28 Playwright Chromium scenarios**; the reconciled current inventory is **30 Node tests and 48 Playwright Chromium scenarios**.
- Baseline workflow [43618454015](https://github.com/iamjpsonkar/Wave/actions/runs/43618454015) passed Node tests, typecheck, production build and all 28 Playwright scenarios.
- The diagram accessibility follow-up initially failed because the sequence SVG used a generic accessible name. Fixed in `268de12338bce554f18e5feef27acbb5e9ea45fe`; workflow [43619577306](https://github.com/iamjpsonkar/Wave/actions/runs/43619577306) was still running at this handoff. Verify latest-main CI before claiming the accessibility correction fully passed.
- Detailed current state: [bugs.md](./etc/quality/bugs.md), [fixed-bugs.md](./etc/quality/fixed-bugs.md), [markdown-coverage.md](./etc/product/markdown-coverage.md), [dev-build.md](./etc/history/dev-build.md) and [dev-fixed.md](./etc/history/dev-fixed.md).


## 24. Markdown image accessibility and fallback behavior — 2026-11-14

- Picked the next core compatibility/accessibility item from `features-gap.md`: image alt semantics, decorative empty-alt handling, broken-image fallback, and reference-style linked images.
- `src/App.tsx` / `LocalMarkdownImage`: loaded images preserve explicit Markdown alt text and title; when alt is omitted, the title (or a neutral unavailable label) supplies a fallback name. Missing informative images render a visible `role="img"` fallback with an accessible name. Explicit empty-alt images remain decorative, including when the asset is missing (`role="presentation"`, `aria-hidden="true"`).
- `tests/e2e/workspace.spec.ts`: added a browser scenario for a local image, decorative image, missing informative/decorative assets, reference-style linked image metadata, and keyboard focus on the wrapping link. Corrected the previous accessibility smoke test's broad DETAILS-summary selector, which CI showed also matched the Mermaid source disclosure.
- Updated `docs/MARKDOWN_SUPPORT.md`, `FEATURES.md`, `features-gap.md`, `dev-fixed.md` and `dev-build.md`. Full WCAG/screen-reader certification remains open.
- Current source inventory: 30 Node tests and 29 Playwright E2E scenarios. CI run [43619707243](https://github.com/iamjpsonkar/Wave/actions/runs/43619707243) passed install, Node tests, typecheck and build but failed one existing Playwright selector assertion (27/28 passed). That selector and the new image scenario are in commits `211a19dfca41096cc9617c1124cf439a1313a5cc` and `f5dc998b77176af54d46db22e28034f137328470`; CI is pending for the updated source. Do not report the new scenario as passed until the workflow finishes.
- Open reliability findings remain WAVE-031 and WAVE-039. No bug trackers were changed.


## 25. Math parser malformed-input and complexity limits — 2026-11-14

- Picked the next open math item in `features-gap.md`: malformed grouping, oversized expressions and parser resource bounds.
- `src/markdown.tsx`: added preflight brace-balance validation and explicit bounds of 8192 source characters, 48 recursive nesting levels and 2048 parser steps. Invalid/over-limit expressions return a readable `.markdown-math-fallback` note with a bounded source preview; no TeX execution or remote renderer is introduced.
- `src/styles.css`: added a readable fallback style for rejected expressions.
- `tests/e2e/workspace.spec.ts`: added a scenario for an unbalanced fraction, 60 nested groups and an 8200-character expression. Current E2E source count: 30; Node test source count: 30.
- Updated `features-gap.md` and `docs/MARKDOWN_SUPPORT.md`. General parser fuzzing, delimiter conflicts and full TeX grammar remain open.
- The previous image-accessibility CI exposed a second broad DETAILS-summary selector and a linked-image fallback assertion mismatch; both assertions were narrowed to Wave's disclosure/fallback elements in the current commit. The previous CI also showed the new image scenario itself passing on one run. Current combined source CI is [43620567676](https://github.com/iamjpsonkar/Wave/actions/runs/43620567676); at handoff it is running. Do not claim all 30 E2E scenarios pass until CI completes.
- Implementation commit: `c8ad5066f24333e7777e910378c49b206e65d71a`. The latest source follow-up corrects the budget label to parser steps for accuracy.
- Open reliability findings remain WAVE-031 and WAVE-039. No bug trackers were changed.


## 26. Workspace Settings UI implementation — 2026-11-14

- Picked the first UI gap priority group: UI-001 (Settings unavailable) and UI-012 (appearance/typography controls).
- `src/App.tsx`: added an accessible Settings dialog, validated preference defaults, workspace-specific preference loading, serialized writes through the existing settings queue, and preference reset that leaves documents/recovery untouched. Dialog explains local storage/recovery and shows current save status plus page/folder counts.
- `src/styles.css`: added dialog layout, responsive writing measure and typography variables, core dark/system-dark workspace styling, and reduced-motion behavior.
- `tests/e2e/workspace.spec.ts`: added persistence/application/reopen regression; browser suite source is now 31 scenarios, Node suite remains 30 tests.
- `UI_BACKLOG.md` now records UI-001/UI-012 as **Implemented — CI pending**; all other IDs and acceptance scope remain open. `FEATURES.md` reflects the partial settings capability.
- No test pass is claimed until the new main-branch workflow completes. Full contrast/accessibility review and broader diagnostics remain open.

- Follow-up: dialog focus is contained (Shift+Tab/Tab wrap) and Escape dismisses it; preference writes expose saving/saved/failure status. UI-003 is now **Partially implemented — CI pending** due to the centered 860px default and width choices; responsive/wide-code/table verification remains open.

- Final UI-gap wording was reconciled so implemented settings are not still described as wholly unavailable; UI-003 remains partial and all other IDs remain open. E2E now checks Escape dismissal as well as focus wrapping.


## 27. UI toolbar icon distinction and dark-theme parity — 2026-11-14

- Re-read `DEV_CONTEXT.md`, `UI_BACKLOG.md`, current `src/App.tsx`, `src/styles.css`, `tests/e2e/workspace.spec.ts`, package dependencies and the latest source history before implementation.
- `src/App.tsx`: replaced duplicate code action icons. Inline code remains `Code2` and is named `Inline code`; fenced code now uses Lucide `FileCode2` and is named `Code block`.
- `src/styles.css`: added explicit dark and system-dark styles for Markdown heading/body, fenced/inline code, links, blockquotes, tables, dividers, toolbar, Edit/Preview segmented control, Backup and sidebar wordmark.
- `tests/e2e/workspace.spec.ts`: added 2 Playwright scenarios for unique toolbar icon/label/insertion behavior and system-dark Preview colors. E2E source count 33; Node source count 30.
- `UI_BACKLOG.md`: reconciled source evidence to current HEAD `4713725f0e09efae0d0b8e6c9da880f5513e18ca`; UI-004 is partially implemented pending regression, UI-016/017 source mitigations await visual regression, UI-018/019 partial, UI-020 partial. UI-001/012 source implementation awaits QA; UI-003 responsive QA remains open. All 20 IDs preserved.
- No tests or build are claimed to pass until the latest main workflow reports success.

- Test review follow-up: toolbar insertion regression now selects actual text before wrapping it in inline/fenced code, matching the current selection-based implementation. UI gap headings/order were rewritten to reflect implemented source behavior and the remaining verification work without dropping IDs.


## 28. UI feature backlog from spreadsheet-toolbar reference — 2026-11-14

- Created `UI_BACKLOG.md` as an additive UI proposal backlog based on the supplied spreadsheet-toolbar screenshot and inspection of current Wave editor source.
- Captures Markdown-editor improvements (undo/redo verification, document-local find, responsive toolbar grouping/overflow, heading styles, shortcut hints, safe insertion/table/link workflows, document statistics, zoom/focus mode and contextual formatting state).
- Separates spreadsheet-only controls (number formats, cell formatting, grid controls, formulas/sort/filter/charts) into a future dedicated sheet UI, aligned with `priority-features.md` P2.3; these are not proposed for the Markdown editor toolbar.
- Includes stable UIF-001–UIF-021 IDs, priorities, current-state notes, acceptance criteria, dependencies, delivery order and relationships to existing planning documents. All are proposals, not shipped features.
- No application code, existing gap tracker, product catalogue or tests were changed. No test/build/CI result is claimed for this documentation-only task.
- Backlog commit: `d9211992d04fd3510f93cc546b814c5a067798d5`.

## 29. UI-020 theme and responsive regression foundation — 2026-11-14

- Re-read this handoff, `UI_BACKLOG.md`, `dev-fixed.md`, `dev-build.md`, current source, Markdown renderer and Playwright suite before implementation.
- Latest main documentation HEAD before this handoff update: `6084b20582eab22b4a2ecc5dea27d14b0dfefa73`. UI styles commit: `cfb73c72ae17671e893e564688a2324180cbbb6e`; E2E matrix commit: `b729eea18aa7f9297bd977110837c58c6a6ef03f`.
- `src/styles.css`: added explicit dark/system-dark surfaces and text colors for Markdown alerts, DETAILS disclosures, math and fallback panels, Mermaid diagrams, syntax/diff tokens, missing-image fallbacks, copy controls and Settings dialog controls. Explicit Light mode remains independent of OS dark preference.
- `tests/e2e/workspace.spec.ts`: added UI-020 matrix for Light/Dark/System × Edit/Preview × desktop/mobile (12 states), covering headings, links, inline/fenced code, tables, alerts, disclosures, math, Mermaid and missing-image fallback. Checks computed styles and horizontal overflow at 1440px and 390px.
- E2E source inventory is now **34 scenarios**; Node source remains **30 tests**. No local runner is available through the repository connector; no tests, typecheck or production build are claimed to have passed. Check Actions for the latest code commit before asserting verification.
- `UI_BACKLOG.md`, `dev-fixed.md` and `dev-build.md` record the implementation and pending status. UI-020 remains open pending CI and visual review; UI-005 contrast/WCAG audit, UI-014 broader breakpoints, UI-018/UI-019 full dialogs/popovers/navigation audit and screenshot-diff baselines remain open. All existing UI IDs and the complete product catalogue are preserved.
- Open reliability findings remain WAVE-031 and WAVE-039; WAVE-042 remains fixed. No bug trackers were changed.
- UI-020 test-source follow-up: simplified the horizontal-overflow assertion in commit `5b110945a45596de28c13f34435816a87907089f`; `dev-build.md` records this follow-up. The repository connector did not expose a push-triggered workflow run or combined status for this commit, so CI remains unverified.
- Latest developer handoff update follows the UI-020 implementation: styles `cfb73c72ae17671e893e564688a2324180cbbb6e`, initial matrix `b729eea18aa7f9297bd977110837c58c6a6ef03f`, assertion follow-up `5b110945a45596de28c13f34435816a87907089f`. UI-020 remains open pending actual CI and visual review.
 
## 30. Remaining UI implementation batch — 2026-11-14

- Re-read the current `DEV_CONTEXT.md`, `UI_BACKLOG.md`, `dev-fixed.md`, `dev-build.md`, `FEATURES.md`, current App/styles/Markdown source and the E2E suite before continuing. Existing IDs, feature inventory and reliability findings were preserved.
- Latest documentation HEAD after this batch: `f16e7120f63a55b2d18cd6ef875270595e8fe176`. UI register commit: `82117c34564e1c40365ba6fffb9947f4b3dfef37`; dev fix log: `6eef51e741a24ee8ec972696effb604411b66e9b`; build log: `3fd818f18d277cdd56aacf5949d6e21998d1965e`.
- `src/EditorEnhancements.tsx` adds bounded in-memory per-page undo/redo, editor-local find/case-sensitive navigation/replace/replace-all, heading outline with Edit/Preview jump, and live word/character/reading-time statistics. History and literal replacement follow-ups: `eec6dda2a2684734b59b34b26073f20bcfffdd78`, `91f52d341feec3274551fba0ab122affcf4e70c1`.
- `src/App.tsx` integrates the tools through `handleEditorChange` so existing recovery/autosave behavior is retained; adds clickable folder breadcrumbs, polite live save status, searchable/preview-first template gallery, Escape dismissal and accessible names for all primary formatting toolbar actions. Key commits: `0e4bc6b89344f1a09c880322797eff8d9ff60f28`, `2913af688afc024af3739b3980284e5476547273`, `cb278bce391d0c3a116724496bde88f385ef3a0c`, `ee9ba2c16d0c65e136b2e081c5545c75a0424d21`, `e753495c0d44f35c1a8bdbef5d19b5be59694454`, `4ec982c5e64bb93e224017ab2d6036a4a8169629`.
- `src/styles.css` improves functional text sizing/focus rings, narrow responsive layout, template preview, editor tools, dark secondary surfaces and System-light color handling. Relevant latest CSS commits: `48a1ec34f15598295936e0b01abe535224645fbd`, `13b43c119c9bf20a15dddbe9a097c8178759050b`, `6dab14ef3cc0014d0eb08389c88b14738d19e6b3`, `f9cc770fb54e7165e1f37103bfee9148bb26b3d5`, `bda620165c5264fab0ccda1999aa568690963b87`.
- `tests/e2e/workspace.spec.ts` adds editor productivity, searchable template preview and nested breadcrumb scenarios. UI-020 now has 3 appearance modes × 2 editor modes × 5 viewport widths (320, 390, 768, 1024, 1440) = **30 states**, computed body/heading contrast assertions at 4.5:1, and page-overflow checks. E2E inventory is **37 scenarios**; Node suite source remains **30 tests**. Regression commits include `632cb75a5693e851937a59ad5958e9c9117f88b5`, `c26e88ec26dfb0e24f84b0c90e4eb525f7cc62b8`, `a1ca18cbb2e987e2725de241e4807a7e01627bf8`, `63de70f23a9379018e22a3107a25db38fce1fff8`.
- `UI_BACKLOG.md` now includes an authoritative 20-ID implementation status table; `dev-fixed.md`, `dev-build.md` and `FEATURES.md` were updated. UI-002 remains open because a genuine optional rich block editor and lossless Markdown round-trip are not delivered. UI-005, UI-018/UI-019 and other named QA items remain partial pending CI/manual review.
- The repository connection did not expose a current push-triggered Actions run or combined status, and no local dependency install/test runner is available in this GitHub-only path. **Do not claim tests, typecheck, production build, screenshot review or CI passed.** All new source and tests are committed; verification is pending.
- Open reliability findings remain WAVE-031 and WAVE-039; WAVE-042 remains fixed. No bug trackers were changed.

 
## 31. UI-002 optional source-preserving block mode — 2026-11-14

- Continued the remaining UI backlog after re-reading this context and the authoritative UI register. Added a separate optional Blocks mode without replacing the Markdown source editor or Preview.
- `src/MarkdownBlockEditor.tsx`: classifies headings, paragraphs, lists, quotes, callouts, fenced code, tables, dividers, image lines and attachment links. Each block textarea edits only its original source range; unedited Markdown and blank-line separators remain intact.
- `src/EditorEnhancements.tsx`: added a distinct Blocks icon/control and extended undo/redo shortcuts to block textareas. `src/App.tsx` integrates the mode through the existing recovery-aware handler. `src/styles.css` adds responsive and theme-aware block surfaces, including System-light legibility.
- E2E regression edits a paragraph block then verifies exact source preservation for the rest of the document, including heading, list, callout and fenced code. E2E source inventory is now **38 scenarios**; Node suite source remains **30 tests**.
- Implementation/test commits: component `78e2887d069b6471610b23f341d5178a02c3e12b`; App integration `15928f7956e2fae4934e730a4c99e0eee3cf97ea`; CSS `5ff104ba9f1315b13cc5b40f4dad59f47ea4fcbe`; E2E `2c95631c21f27faad50f4f49bb038a4c7bdb1b1d`; source/test follow-ups `cc6809086922947ae4f32e4eaf47257f93c66073`, `e0d901711430355b06f7c870453484d88099a886`, `760ec73b51361826be00ee653c441d72bca65e28`, `6c9cb3f7b0862fd20253da75a10c263fe215add3`, `41c8adefd98ef00d5ba38867a0e828cd626554a8`.
- UI-002 is now partially implemented, not complete: block reordering/drag-drop, handles, slash menu, bookmarks/embeds and rich inline formatting remain. UI register and development logs record this honestly.
- `UI_BACKLOG.md`, `dev-fixed.md`, `dev-build.md` and `FEATURES.md` are updated. Latest dev logs: `54e81395ec9fd0f67e1907254c73e58420a5bc6f` and `8ae1d16d15034fd495b110cdf8449ef5fc74554a`.
- No current GitHub Actions result or combined status was exposed. No test/typecheck/production build/visual audit pass is claimed; CI and manual QA remain pending.

 
- Block-mode follow-up: `src/EditorEnhancements.tsx` now jumps from the outline into the corresponding block textarea and uses a distinct Blocks icon; `src/MarkdownBlockEditor.tsx` keeps list and quote/callout grouping separate; `src/styles.css` corrects System-light block labels. Undo/Redo keyboard shortcuts work while a block textarea is focused.
- The block-mode Playwright scenario now verifies Undo and Redo before exact-source round-trip. E2E source remains **38 scenarios**; Node source remains **30 tests**. Follow-up commits: `03c572edd64fb6924d0bbda706dbf840f44bef26`, `30be50f3afae887386eba1f86faf2d855207c925`, `6c9cb3f7b0862fd20253da75a10c263fe215add3`, `41c8adefd98ef00d5ba38867a0e828cd626554a8`.
- Development logs updated again: `dev-fixed.md` commit `e8a262b50b92c6399e8a7e0f765ce2bfc4a1c3d6`; `dev-build.md` commit `9ec508729ee56d23b63c9a3e7ecbad731b9aea8b`. No current CI result is exposed; all verification remains pending.

 
- UI-020 test-helper correction: fixed the CSS RGB numeric-channel matcher used by the computed contrast ratio assertions. This ensures the helper can parse RGB channel values; it does not establish that any contrast assertion or browser test passed. Test commit: `ffc3be4ae9026ce76148ce3fbcaa86b4be0e0f73`. E2E source inventory remains 38.
- Logs updated: `dev-fixed.md` `bf33131eec965ce0373c5dfd2967b5f6b88420e6`; `dev-build.md` `8871fb213f823b65685688ad1a65521e95424a27`. CI remains unavailable/unverified.


## 32. UI continuation — block controls and dialog focus — 2026-11-14

- Continued the UI-002/UI-018 work after re-reading this handoff and the UI register. Existing Markdown remains the portable source of truth; the original source editor and Preview are retained.
- src/MarkdownBlockEditor.tsx: optional block mode now supports keyboard up/down reorder, draggable block handles, delete, and common-block insertion (paragraph, heading, list, quote, callout, fenced code, divider). Reordering moves source blocks while retaining whitespace separators.
- src/App.tsx: template preview and command palette now trap Tab/Shift+Tab focus; template preview focuses its close control on open.
- src/styles.css: theme-aware block control, drag and focus-visible styling.
- tests/e2e/workspace.spec.ts: added block keyboard reorder, drag/drop, insertion and exact-source assertion; template preview focus-wrap assertions. E2E source inventory: **39 scenarios**; Node test source: **30 tests**.
- FEATURES.md records block mode as partial. UI_BACKLOG.md updates UI-002 and UI-018 while retaining every original ID and remaining acceptance criterion. dev-fixed.md and dev-build.md contain implementation and verification notes.
- Source commits: block insertion/reorder 9e4f29390447dcdbd43f80098da522385a270448; drag handle 7057ce25861bffce43ee05ce5f8afb305ae1d0e8; dialog focus 290f926c92caffe64d2ac34f1eea483df015f464; tests 8bb74c69ec4c9adad7d59c0e34e869224742fa42, f292e32e853fce640d44f05f554ee4bce1cbba72, b90369be8ef6ba66ab95f84f5e609b406afd87f7; styles 6bbd015307f55a0e385b6f041d383bdb07e6e87c, 93bdd45f2fe17bda2375cb0a41c8f2f7f9e6ca62.
- Documentation commits: UI register af7db39acbc456fd3d929dc092f2eabdb2aa9320; dev fix log 6adb102cc0e1d6066e2ad222fcd7c823010d43a5; build log 3f71424b8169aa510a406302a912d9003e5defaf; feature map 9cc459e91e5b1588526c1371084501dea12d3db0.
- Remaining UI-002 scope: slash-triggered block menu, bookmarks/embeds and rich inline editing. UI-018 still needs focus restoration and complete dialog/popover/disabled/error visual and accessibility review. UI-005/UI-014/UI-020 still need actual browser visual/accessibility verification; no existing UI ID or catalogue requirement was removed.
- Verification: no local tests, typecheck, production build or screenshot review was run. Combined status and associated workflow-run lookups for latest code commit 93bdd45f2fe17bda2375cb0a41c8f2f7f9e6ca62 returned empty arrays. **No pass is claimed.** Latest test evidence remains the historical CI recorded in dev-build.md; refresh Actions before release decisions.
- This handoff update is the final documentation step for this task.

- Documentation-reference correction after the UI log update: dev-fixed.md `34a1d666fd1ca924943ea8bffd332ed3ceee873c`; dev-build.md `f052a4a9bb3b4e113b700bb20d9cc809387b4c18`. This context entry is the final documentation update.

- Feature inventory reconciliation: FEATURES.md now consistently records keyboard/drag reorder, handles, deletion and common-block insertion as implemented, with slash menu, bookmarks/embeds and rich inline editing still partial. Commit `0cfb8174e688e31f866ae4d44e2c98cf8cf21393`. This is the final documentation step.

## 33. Inline foreground/background color formatting — 2026-11-15

- Re-read this handoff, current toolbar/Markdown renderer/styles, the E2E suite, UI register and feature backlog before implementing the next editor formatting feature. Existing functionality and UI-001–UI-020 IDs were retained.
- `src/App.tsx`: added native **Text color** and **Text background color** controls to the Markdown toolbar. When a source selection exists, the picker wraps it in `[[color:#RRGGBB|text]]` or `[[bg:#RRGGBB|text]]`. Pickers are disabled in Preview and optional Blocks mode, where there is no single source selection.
- `src/markdown.tsx`: added local inline conversion and rendering for the two directives. Only six-digit hexadecimal tokens are accepted; color spans are generated as React elements with a validated color value. Inline-code content is not transformed; malformed color tokens remain literal. Raw HTML and arbitrary style strings remain disabled.
- `src/styles.css`: added theme-aware color picker controls and a System-light correction.
- `tests/e2e/workspace.spec.ts`: added one regression for foreground and background application, preview styles, inline-code preservation, invalid-token fallback and returning to Edit. Browser source inventory: **40 scenarios**; Node test source remains **30 tests**. These are definitions, not run results.
- Updated `docs/MARKDOWN_SUPPORT.md`, `FEATURES.md`, `features-gap.md`, `UI_BACKLOG.md`, `UI_BACKLOG.md`, `dev-fixed.md` and `dev-build.md`. New UI-021 records the inline color controls as implemented in source with CI/visual verification pending. Existing UI IDs and the broader product catalogue remain intact.
- Source commits: App `4df616fee1cbdcd80e878e422bc0ecc264c2c02e`; renderer `4f68b91243e17a2a2642961ec45c01550893aaa4`; styles `3464fd936b96bd280db1794f230a378041945a07` and System-light follow-up `53779f8f9705c1b78195761c794935e7aa1c6230`; E2E `323f49e33ab59f38cb2790628d83630f934d6282`, `48af3998748b51779a0abe75ca5853dd80fa03b1`, `80f7534927fa505f7e7ed00caceb6f0e47066517`, `2d054accda98ec95d32f3ef69decead9d39d789b`, `1da64359dfe02a51e96679fa282b011550f9a4b6`, `81f819653e5f766670e51b783edacb1fa39c41b5`.
- Documentation commits: Markdown support `bf5d455c2012fa9750f585eb104a03ecf0b6b9ec`; feature gap `99007028e8f9c98de8baa5d32d55ce97d346d183`; UI feature backlog `bd27ca629c7556b3f2fbeac75e3b600b976365b9`; UI gap register `a0974f7144ec7e0c9fb68a641e4493aadf11c825`; dev-fixed `2b85f26668d6d4f22fe62dcf7ea1f3646444d920`; dev-build `e42d1beff37a08cb5ec4c57cbe97ed9401ad4891`.
- Remaining color scope: curated preset swatches, remove/reset formatting, nested color spans, block-level fills, selection in Blocks mode, non-Wave fallback/rendering and visual/contrast verification.
- Verification: no local tests, typecheck, production build or screenshot review was run. GitHub Actions run `43627300560` was observed in progress for commit `b435eb383d83f092526fa36fc8fc72064c87998d`; it is not a completed verification result. Recheck the latest main-branch Actions run before claiming success.
- This handoff update is the final documentation step for this task.

## 34. Color formatting expansion — 2026-11-15

- Continued the color feature from section 33 without removing prior controls or Markdown syntax.
- `src/App.tsx`: added six quick foreground swatches, a remove-color-formatting action for selected inline source, and a block background picker. Block fills wrap the selected source lines in a Markdown blockquote beginning `> [!COLOR=#RRGGBB]`; the blockquote lines remain ordinary Markdown.
- `src/markdown.tsx`: `MarkdownBlockquote` recognizes only the `[!COLOR=#RRGGBB]` marker with a six-digit hex token, strips the marker from rendered content and creates a blockquote with the validated background color. Existing NOTE/TIP/WARNING/DETAILS blockquotes are unchanged.
- `src/styles.css`: added swatch, clear action and block-fill styling with focus-visible states and theme-aware block borders.
- `tests/e2e/workspace.spec.ts`: added one regression covering quick swatch insertion, selection-based removal, block-fill source syntax and preview rendering. E2E source inventory is now **41 scenarios**; Node test source remains **30 tests**. These are source counts, not test execution.
- Updated `docs/MARKDOWN_SUPPORT.md`, `FEATURES.md`, `UI_BACKLOG.md`, `UI_BACKLOG.md`, `features-gap.md`, `dev-fixed.md` and `dev-build.md`. UI-021 remains partial/CI pending; nested inline color ranges, Blocks-mode selection, non-Wave reader fallback and contrast/accessibility review remain open.
- Source commits: App `25fa032884d8cf6f1356f20ebe0e9ffc0bd5e381`; renderer `08cf36f8b9b29295c52b883b56a0559f85592e4a`; styles `7020028201eeee4be404a003b4e2c2abc7925c9a`; E2E `76a55e006b00513e21a1a5ef406645a55339a762`.
- Documentation commits: Markdown support `e71535c61698145ae199a898c9ac6cdf2b910089`; feature inventory `de91a21626ca4fc6bcea07c2e37ee5b8f347e6d2`; UI gap register `8ec018ce51b592282c4e1a0ee91ebe33345b41e8`; UI feature backlog `ece36cd16ecf68c3fd292231bc48034dee6e760a`; renderer feature gap `61213bd311329d75fa2814145847c0f47da6b0a7`; dev-fixed `7a752555c70bb96a17d0ac1bbd7e6187599be7e7`; dev-build `a0aae6b812ecf0a931b77dff41f518b5cad5da89`.
- Latest observed GitHub Actions run for the documentation commit `a0aae6b812ecf0a931b77dff41f518b5cad5da89` is `43627623167`, queued at the time of inspection. Earlier documentation runs were in progress. No local tests, typecheck, production build or screenshot review were performed; do not claim a pass.
- Remaining next work: implement safe nested inline color spans (or explicitly disallow overlapping ranges in the editor), enable block fill from the optional Blocks editor where selection semantics are defined, add contrast guidance for arbitrary colors and confirm all Actions results.
- This handoff update is the final documentation step for this batch.



## Implementation update — Blocks-mode block background colors — 2026-11-15

- Extended the optional Markdown Blocks editor with an accessible per-block native background color picker. Applying a color wraps the original block source in the safe `> [!COLOR=#RRGGBB]` quote directive; changing a previously colored block updates the marker in place rather than nesting another color wrapper.
- Updated block classification so Wave color blocks are recognized as callout blocks. Added light/dark theme styling and an E2E source scenario covering first application, changing the color, switching to Preview and checking the rendered block.
- Fixed a TypeScript error in the existing source-toolbar block-color cursor calculation. CI for the preceding color batch exposed that a concatenated marker expression produced a string cursor argument; the code now computes a single marker string and uses its numeric length.
- Updated compatibility and feature records: `docs/MARKDOWN_SUPPORT.md`, `FEATURES.md`, `UI_BACKLOG.md`, `UI_BACKLOG.md`, `features-gap.md`, `dev-fixed.md` and `dev-build.md`. UI-001–UI-020 and all previous feature proposals remain preserved; UI-021 is expanded, not replaced.
- Source commits: Blocks editor `b191a2759ff917c0ab1ed0ebb333b828b035a9b3`; styles `93bf0eb5dc809e373292570d900066161f6e7be3`; E2E `0cf474ff0d0765f882916c04efbb69e49c95cb85`; toolbar TypeScript fix `efd19504e8d44ab16869f6b82482b00da816d162`.
- Documentation commits: Markdown support `4e895839c50e6f42d5b1e3830de86d0e1a921066`; feature inventory `6fe3fff45580b238d433ed353f5588ecbc9e80ed`; UI gaps `ea0d90b7e96d6d060bab06a5319297f0bc52e208`; UI feature backlog `a07722b61658e6df1008373323da757f18fc1dd3`; renderer feature gaps `f68a9ac601b7b3aeffdeb6b153c5c29a0446bf19`; dev-fixed `9f85560bfcf7cc921fa46084e8b06d9549c2abc7`; dev-build `dce84d4c2f7dd4d236f8f8676f8676c692bcf730`.
- Regression source inventory: **42 Playwright E2E scenarios** and **30 Node test definitions**. These are source counts only. The CI run for the preceding docs commit failed at TypeScript because of the cursor expression; Node tests passed 30/30, while build and E2E steps were skipped. The fix is committed; CI run `43627887363` for `efd19504e8d44ab16869f6b82482b00da816d162` was **in progress** at handoff. No pass is claimed yet.
- Remaining color scope: nested inline color ranges, portable non-Wave fallback rendering, custom-color contrast guidance and theme/visual review. The color controls remain Wave-specific Markdown and do not enable arbitrary HTML or CSS.
- This handoff update is the final documentation action for this batch.


## Implementation update — Wave Complete Feature Test template — 2026-11-15

- Added a new **Wave Complete Feature Test** entry to the existing searchable template gallery in `src/templates.ts`. It is separate from and does not replace the original Markdown feature showcase or any existing template. It includes heading/inline formatting examples, nested lists, GFM tables/tasks/footnotes, reference and wiki links, alert/disclosure blocks, foreground/inline/block colors, code and diff blocks, math, Mermaid and local diagram subsets, local image/file/audio/video references, emoji, search/navigation/backlink prompts, an editor/workspace QA checklist and safe-rendering checks.
- Existing template preview and create flow is reused; no new storage format, service, or data migration was introduced. Added a Playwright E2E scenario covering template discovery, preview/create, source sections, color and diagram preview, and Edit/Preview source round-trip.
- Updated `FEATURES.md`, `FEATURES.md` and `dev-build.md`. All previous templates, feature ideas and UI gap IDs remain preserved.
- Commits: template `f7a11993e821cf8cac77b34bc2f593217f8979b7`; template color-marker correction `b1c65d2f0d2893056ae7e75483023eae657bcf74`; E2E scenario `1e7558de59c360532101004695d12b12c1ea1155`; feature showcase `FEATURES.md` `759ee2165cb878949e77fecd9daa97527ae48217`; feature map `FEATURES.md` `fe7855acd31cfd20eb5526b02e0e107569764392`; build log `dev-build.md` `92ddcbdb179421d3ef761dde0fb64207c0489b8b`.
- Browser E2E source inventory is **43 scenarios** and Node test source remains **30 definitions**; these are source counts, not executed results. No local test, typecheck, production build or screenshot review was performed. GitHub Actions run [43628949071](https://github.com/iamjpsonkar/Wave/actions/runs/43628949071) for main commit `92ddcbdb179421d3ef761dde0fb64207c0489b8b` was **queued** at the time of this update. No pass is claimed.
- Known test limitation: image, file, audio and video examples are placeholders and require matching local files in the user's workspace before those individual asset examples can render. The renderer compatibility remains the documented local subset; this template does not claim full TeX/diagram specification support.
- This handoff update is the final documentation action for this batch.


## Implementation update — Export rendered Preview as PDF — 2026-11-15

- Added a Preview-only **Export PDF** action in `src/App.tsx`. It temporarily sets the active document title as the suggested print/PDF filename, invokes `window.print()`, and restores the original tab title on `afterprint`.
- Added `@media print` and `@page` rules in `src/styles.css` so only `.markdown-preview` is visible in print output. Wave navigation, workspace chrome, editor toolbar, metadata, backlinks and status controls are hidden. Print rules preserve colors where supported, avoid splitting common content blocks, keep headings with following content and wrap long code lines. Audio/video controls are omitted.
- Added Playwright E2E regression coverage for print invocation, title restoration and print-media visibility. Browser E2E source inventory is now **44 scenarios**; Node test source remains **30 definitions**. These are source counts, not executed results.
- Updated `FEATURES.md`, `FEATURES.md`, `UI_BACKLOG.md` (new UI-022; UI-001–UI-021 retained) and `dev-build.md`.
- Commits: App `e6800b1725f1471fcd56a403e001ff7fa7302cbb`; print CSS `26dc983d85a531e4a1431624ec7558b5b5dcb2b2`; E2E `8608f04f7c4347d4f59dff4016d45b52db15219b`; feature showcase `0981adaac8c88ee92b7c5e6dc418734b577dfaab`; feature map `f1da436367824bd726b8e63e5fccfa7c73a82359`; UI gap record `623d7ccab194baa3096a07d18ce5b1eb9340b167`; build log `456f4ba2f61a2a4e6c5cf65bf2544e3fc0f07ad3`.
- Scope limitation: this uses the browser's print dialog and its **Save as PDF** destination; it does not yet generate/download a PDF file directly. Page size, pagination, headers/footers and background printing remain controlled by browser print settings.
- No local test, typecheck, production build or screenshot review has been performed. Verify the latest GitHub Actions run before claiming success. This developer-context update is the final documentation action for this batch.

## Implementation update — PDF export UI bug remediation — 2026-11-15

- Re-read the six findings in `UI_BACKLOG.md` and targeted the PDF print path rather than changing the general screen theme. `src/styles.css` now applies a deterministic white-page print palette with dark text across Markdown descendants, normalizes code/table/alert/quote/disclosure surfaces, preserves validated custom foreground colors through a dedicated CSS token, forces table cells visible, and exposes initially collapsed DETAILS bodies only for print.
- `src/markdown.tsx`: fixed the Wave inline-color serialization matcher so it captures the complete text payload after the six-digit HEX token. Rendered foreground/background spans now have dedicated classes; the print palette keeps custom foreground colors instead of overriding them with generic body text.
- `src/templates.ts`: corrected the Complete Feature Test summation from a single-dollar marker on separate lines to the documented `$$` display-math delimiters. The Markdown support contract already documents `$$` or fenced `math` for display expressions.
- `tests/e2e/workspace.spec.ts`: expanded the existing PDF export scenario to check print invocation and title restoration, hidden Wave chrome, white page/dark heading, retained blue custom text, first table-row Priority `1`, rendered MathML and visibility of collapsed DETAILS content. Source inventory remains **44 Playwright scenarios** and **30 Node test definitions**; these counts do not indicate execution.
- Updated `UI_BACKLOG.md` without removing any UIB-001–UIB-006 finding, `dev-fixed.md` and `dev-build.md`. All six findings now describe their source remediation and pending verification honestly. UIB-005 remains subject to visual confirmation because the supplied PDF's missing first-row value has not yet been reproduced in a fresh PDF.
- Source commits: Markdown renderer `05275f7c18594918a64e19ab5166300c5cab6424`, follow-up `b68d2a0a43e918fa52f9ebeeb87ef1d3e8676f5b`; print CSS `27678927380002a17400697bb6a6f890032063be`, follow-up `33bbcfdcf00f5200c2f1bd125573d0596d94b188`; showcase fixture `d4049b2e5228b77b8befd7e989252d8b81eed201`, delimiter correction `6f594bab5e4e6e503a77023ca7cac2089e678349`; E2E `2c34b20ad21b930be260f84bcf463075dff4f6d8`, delimiter correction `45c9cd0e2e43a57252f734bb4cfa40a4f085c823`; `UI_BACKLOG.md` `2942b71734064433f9816caca86ab2ba452e749e`; `dev-fixed.md` `fc63a024e74be7ccd39f30d1f89de47595c1e59c`; `dev-build.md` `30061332e4b0aa82d3aacf4830c57cb197599df4`.
- GitHub Actions run `43630578833` for the defect-register commit was in progress at inspection; later commits triggered additional workflows. No local tests, typecheck, production build or screenshot review were performed. Do not mark any finding fully verified until CI and a fresh light/dark browser-generated PDF are reviewed.
- This developer-context update is the final documentation action for this batch.
- PDF export regression follow-up: expanded the existing Playwright fixture to cover all three showcased foreground colors (blue, green, red), the inline yellow background and the normalized print table-header surface. E2E commit `dabe21bcf587f84835b3b5b2a5c90295686ebcf1`; follow-up log commits: `dev-fixed.md` `57a4f23f6f38c939c51115620ad6e60627d35ce3`, `dev-build.md` `58740f0dc87c3f4a055bc7d61c16a50b5b1bcf4b`. Scenario inventory remains 44; execution is still unverified.
- This handoff update is the final documentation action for the PDF export UI bug remediation batch.
- CI exposed a pre-existing syntax error in the UI-020 Playwright fixture: the closing code-fence array entry lacked a comma. Fixed the separator only; fixture behavior/content is unchanged. Commit `56e9eb2d638cbe9a8883c3c5cbc16cc3fc40e94e`. The earlier run `43630578833` had passed `npm test`, TypeScript typecheck and production build, then failed at Playwright parse time; the new fix commit requires a fresh CI run. Log commits: `dev-fixed.md` `49cae04bd8cd1f40e25ff88c307e67e296dbbd81`, `dev-build.md` `edb3ffc0269738a4449f95a3c093367f96b47aae`.
- This is the final handoff update for the PDF export bug remediation and CI syntax correction.

## Implementation update — Contextual Markdown sample library and list Enter behavior — 2026-11-15

- Added `src/SnippetLibrary.tsx`, a right-side, searchable Markdown sample library with category filters for Text, Blocks, Lists, Data, Code, Advanced and Media. The 21 examples include headings, emphasis, links, quotes, callouts, DETAILS, dividers, unordered/ordered/nested/task lists, tables, code/diff, math, Mermaid, Wave color directives, wiki links and local media/asset references. Selecting an example shows a rendered preview and its exact Markdown source.
- Integrated the sample panel into the active editor work area in `src/App.tsx`, with responsive/light/dark styles in `src/styles.css`. The **Insert into document** action inserts Markdown source at the current textarea selection (replacing selected text) and restores the caret after insertion. If Preview or Blocks mode has no source textarea mounted, it appends the sample to the current document so the current view updates through the normal state/autosave path.
- Added `handleEditorKeyDown` for Enter in the source textarea. Ordered and unordered list markers continue; ordered numbers increment; nested indentation is retained; task-list markers continue as unchecked `[ ]`; and Enter on an empty list item exits the list. Fenced code is deliberately excluded so Enter retains normal code editing behavior.
- Added Playwright scenarios for sample selection/preview and selection replacement with inserted Markdown, plus ordered/bullet/task list continuation, empty-item exit, nested indentation and fenced-code Enter behavior.
- Updated `UI_BACKLOG.md` with additive UI-023 (sample discoverability) and UI-024 (list Enter continuation), preserving all existing IDs. Updated `UI_BACKLOG.md`, `FEATURES.md`, `FEATURES.md`, `dev-fixed.md` and `dev-build.md`.
- Source commits: sample component `65fb14ba86541accb9a36617588dbd80b9c65b99`; App integration `148fc99d14bfbc792e4be0a830938cbf001a791e`, newline/regex correction `40ca59461ae6cab5c2b772f4e11b32d07d55e26f`, event typing `e55a34748dcf02c1ec6ae2c87aa27afadb7aa664`; styles `6ffe152c88fec619cca223871d51086894ebe408`, nav alignment `c1f7265ed48cafe50dc9fab2fb8975c59aa0700b`; E2E `4c616bba1d7c3e37408834b8fdba117918f4e321`, stray suite-closure correction `81261223084692acf14486db9d937cd77238e055`, nested/fenced-code follow-up `757d8edba0925432bf8c5027924074ee8331a1eb`.
- Documentation commits: UI gaps `4e0fbdfb5b2db775bab0e13e771246909e797cc6`; UI backlog `9ee90e20791c53ca78ca075a36fc87430943279b`; feature showcase `225a700a24ddfef166681c74b2528819465dcbdf`; detailed feature map `d8d4ca732010eb56b1ce54a4d2468ab46922e354`; dev-fixed `950162622719c2117337f5163fd48dcaf1119f5f`, follow-up `cd199d846d5c8069952b40fb657f765c53da5268`; dev-build `10cb85ef32f92c7924c23ebe1b62e2e6ed5a9dfe`, follow-up `746ccb7b1ae7245278c201792087a5ba0d70acc1`.
- CI run `43633086687` for the suite-closure correction passed `npm test`, TypeScript typecheck and production build; Playwright was still executing at last inspection. The expanded nested/fenced-code test commit `757d8edba0925432bf8c5027924074ee8331a1eb` has run `43633137209`, whose Node tests, typecheck and production build passed and whose E2E step was still in progress at last inspection. No E2E pass or screenshot/manual visual review is claimed. No local test/build was run.
- This is the final developer-context update for the sample-library and list-continuation batch.
## Implementation update — Repository navigation and Docker static hosting — 2026-11-15

- Repository documentation is now navigable from docs/README.md. Root-level feature blueprints and engineering registers remain in place and retain their distinct roles; do not move, merge, truncate or replace them just to create a cleaner directory tree.
- README.md now explains the current app, shipped capabilities, local development, production build, Docker deployment, workspace layout, privacy/browser constraints and repository map. CONTRIBUTING.md documents setup, checks, storage/security invariants and documentation ownership.
- Docker files: Dockerfile (Node 22 multi-stage build and unprivileged Nginx runtime), .dockerignore, compose.yaml, .env.example, docker/nginx.conf. Nginx listens on 8080, supports Vite SPA fallback, uses immutable caching for hashed assets and no-cache for the app shell, denies dotfiles and emits browser security headers. Compose enables read-only root, bounded /tmp, drops all capabilities and sets no-new-privileges.
- Commands: docker compose up --build -d, docker compose down; optional port via WAVE_PORT. Npm shortcuts: npm run docker:build, npm run docker:up, npm run docker:down. Full operational notes are in docs/DOCKER.md.
- Critical deployment boundary: this is static web hosting only. It does not add backend APIs, accounts, server-side workspace persistence, shared folders, collaboration, database or synchronization. Browser File System Access API continues to operate on a directory selected on each browser user's own device; remote access requires HTTPS and browser support.
- Updated docs/ARCHITECTURE.md, docs/ROADMAP.md, FEATURES.md, FEATURES.md, contributor/docs navigation and the build log. Corrected stale feature wording about wiki links/backlinks. No prior product scope, UI gap IDs, feature ideas or historical engineering records were removed.
- CI adds a dedicated container job that validates Compose configuration and builds the production image. Run 43634056269 successfully built the container and passed Node tests, TypeScript and Vite build, while Playwright installation remained in progress at inspection. Runs 43634100390 and the latest Compose-validation workflow are pending final verification; check them before claiming complete CI.
- Important implementation commits are catalogued in dev-build.md. No local Docker/Compose run, browser E2E completion or manual visual review was performed in this environment.
- This is the final developer-context update for the repository restructuring and Docker delivery batch.


- CI workflow correction after review: the first attempted Compose-check insertion did not match the workflow text. The final workflow now explicitly runs `docker compose config -q` before `docker build --pull -t wave:ci .`; commit b41adbeb2ea68fd1632975ca1275c01f6e9b87dd. Earlier image-build jobs passed; wait for the run triggered by this final workflow change to verify Compose validation and the final container build. The build log records the correction.
- This is the final developer-context update after the CI workflow correction.


## 2026-11-15 — Comprehensive project wiki and AI-agent onboarding

- Added [wiki.md](./WIKI.md) as the comprehensive product, repository and AI-agent orientation guide. It consolidates durable instructions from the available Wave project conversation context, product constitution, current architecture/source map, storage boundaries, engineering invariants, UI/Markdown decisions, QA limitations, roadmap coverage, documentation ownership, Docker boundaries and recommended improvements.
- Linked the wiki from [README.md](./README.md) and [docs/README.md](./docs/README.md).
- Detailed implementation and verification note: [dev-build.md](./etc/history/dev-build.md).
- This is a documentation-only change. Repository files were inspected through GitHub; no local tests/build or new CI run was performed.
- Current baseline before this handoff update: wiki commit `8f1ebafc01c44d36230dd45d9030f16236642105`; README commit `1eaa559f158c46afa1beddbaca797ace9de7ce7c`; docs index commit `5a5bc4dabb1a353c61bfba0658eaf42e6119706c`; build log commit `888d54fac0c980a81332286993794a907758f991`. Refresh the repository HEAD before the next task.


### Wiki instruction formatting correction

- Corrected a malformed inline-code delimiter in the new wiki's instruction for updating `DEV_CONTEXT.md` last. No product/source behavior changed.
- Wiki correction commit: `aa2de3ad50df17172065717765c0ca50126d479d`. Refresh HEAD before the next task.


## 2026-11-15 — Markdown documentation consolidation and enforcement policy

- Consolidated overlapping documentation into [FEATURES.md](./FEATURES.md), [UI_BACKLOG.md](./UI_BACKLOG.md) and [QA_CONTEXT.md](./QA_CONTEXT.md). The former seven duplicate source files were removed only after verifying their meaningful content and stable IDs were present in the destinations.
- Updated [README.md](./README.md), [CONTRIBUTING.md](./CONTRIBUTING.md), [docs/README.md](./docs/README.md), the product/priority/issue references, and the [Wave Wiki](./WIKI.md).
- The wiki now contains a mandatory **Documentation enforcement after every task** section. Every implementation, fix, refactor, QA or configuration task must review Markdown impact, update the authoritative records that changed, validate links and IDs, avoid unnecessary duplicate files, and update this handoff last.
- The full product blueprint, priority plan, development logs, open/fixed bug registers, Markdown compatibility checklist and diagram research remain separate.
- Detailed migration record: [dev-build.md](./etc/history/dev-build.md), entry dated 2026-11-15.
- Verification: source/destination content comparison and tracker-ID checks completed before source deletion. No application code changed; no local tests/build or CI run was performed. Refresh `main` and CI before the next implementation task.


## 9. Latest repository-wide audit — 2026-11-15

- Audited current main baseline `d831bf04ac458a888206de4d492830f55958b022`.
- New findings are tracked in [#99 — Markdown navigation links](https://github.com/iamjpsonkar/Wave/issues/99) and [#100 — duplicate storage regression tests](https://github.com/iamjpsonkar/Wave/issues/100).
- Existing open defect, UI, Markdown, export and roadmap tickets were checked before creation; do not open duplicates for the same scope.
- Full evidence and limitations: [QA_CONTEXT.md](./QA_CONTEXT.md). Issue index: [etc/quality/github-issues.md](./etc/quality/github-issues.md).
- No source code changed and no tests/build/CI execution is claimed for this audit.


## 36. WAVE-0001 — native filesystem and permission QA follow-up — 2026-11-15

- Issue: [#1 — Complete native filesystem, permission and lifecycle verification](https://github.com/iamjpsonkar/Wave/issues/1), internal defect ID WAVE-031.
- Branch: `WAVE-0001`, created from the refreshed `main` branch.
- `tests/e2e/workspace.spec.ts`: expanded the OPFS permission fixture to count permission requests; added prompt-state reauthorization and external-file-edit conflict preservation scenarios. Browser test source count is now 48; Node source count remains 30.
- `etc/quality/bugs.md`: updated WAVE-031 test inventory and recorded branch follow-up. The issue remains open.
- `QA_CONTEXT.md`: added real-browser native picker/permission, external filesystem, keyboard/focus/screen-reader, and process-termination manual checklists.
- `etc/history/dev-fixed.md` and `etc/history/dev-build.md`: recorded implementation scope and CI-pending status.
- `WIKI.md`: documented the product-owner-approved issue branch → commit/push → PR → issue-comment workflow. Do not merge PRs or close issues; product owner reviews them.
- Verification: source and test definitions inspected; no local test/typecheck/build or native/manual browser verification was performed. PR CI is pending. The OPFS tests simulate permission behavior and are not evidence of native OS picker/revocation behavior.
- Remaining acceptance criteria: real native picker and permission revocation/reauthorization results; external writer races across read/save/backup/restore; comprehensive keyboard/focus/screen-reader/contrast review; actual process-termination fault test. Keep #1 open until these criteria are evidenced.


## 37. WAVE-0001 — CI failure remediation — 2026-11-15

- PR: [#101](https://github.com/iamjpsonkar/Wave/pull/101), issue [#1](https://github.com/iamjpsonkar/Wave/issues/1), branch `WAVE-0001`.
- Initial workflow `43682365587` passed Node tests, typecheck, production build and container build but failed Playwright (33 passed, 15 failed).
- Remediated invalid newline fixtures, current error class and ambiguous/stale selectors; corrected template preview flow, image/diagram/PDF assertions; fixed empty task-list Enter handling and block-color newline parsing/serialization; preserved selection during color toolbar mouse-down.
- QA/WIKI/archive logs record exact scope and limitations. Latest CI at initial remediation check: [run 43683698072](https://github.com/iamjpsonkar/Wave/actions/runs/43683698072), still in progress at time of writing. Verify the final run for the latest PR head before claiming success.
- No local tests/typecheck/build were run. Native OS picker/revocation, real external-process races, full accessibility audit and process-termination checks remain unverified. Issue #1 remains open; PR must not be merged by the agent.


## 38. WAVE-0001 — second CI triage pass — 2026-11-15

- Rechecked PR #101, current head at the time of this pass `98f3a77e90ed1819811998d1519d010516c1203d`; latest completed run `43683760674` failed Playwright with 39 passed / 9 failed. Node tests, typecheck, production build and container job passed.
- Failure categories: settings Escape/focus trap, Lucide icon class expectation, strict selectors for preview code/template/diagrams/PDF color spans, color toolbar not applying background/clear due to selection/state handling, and generated block-color callout classification.
- Follow-up commits: scoped Playwright selectors and icon expectation; settings Escape support; toolbar color edits now use the controlled editor change path and clear wrapper-aware selection; block color classifier corrected. Updated QA/WIKI/development archive notes.
- A newer workflow triggered by later commits must be checked against the latest PR head SHA. This remains unverified; no local tests were run. Do not merge. Issue #1 still has open native picker/OS permission, external-process race, accessibility and termination acceptance criteria.


## 39. WAVE-0001 — consolidated CI remediation pass — 2026-11-15

- Rechecked PR [#101](https://github.com/iamjpsonkar/Wave/pull/101), issue [#1](https://github.com/iamjpsonkar/Wave/issues/1), branch `WAVE-0001`.
- Latest inspected run [43684569184](https://github.com/iamjpsonkar/Wave/actions/runs/43684569184), head `8ff23d414ecf2dc7421fbb7188cf7b56145af419`: failed with 42 Playwright passes / 6 failures. Container passed; Node tests, TypeScript and production build passed.
- Root causes fixed in source: toolbar color formatting could use a stale `content` closure after editor selection/event timing; block-color actions bypassed the shared recovery-draft handler; block editor color callbacks could preserve stale block offsets after re-render. Updated all mutations to read current content and persist through the controlled change handler; block color updates replace the full current source range.
- Fixed two verification issues: Settings E2E attempted to interact with Preview behind an open modal; Lucide FileCode2 SVG renders class `lucide-file-code2`, not `lucide-file-code-2`.
- Changed files: `src/App.tsx`, `src/MarkdownBlockEditor.tsx`, `tests/e2e/workspace.spec.ts`; QA and archive notes updated. Fresh workflow must be checked against the resulting latest head.
- No local commands or test runs were available through this GitHub-only task. Do not claim the fixes pass until CI completes. Native picker/OS permission changes, external-process read/save/backup/restore races, complete accessibility review and controlled process-termination testing remain open; do not merge PR #101 or close issue #1.

## 40. WAVE-0001 verification handoff — latest code commit and pending CI

- Remediation source commits: `763008201aa6f8112345f6343bb480fbfbd85372`, `43830417f3be88556a4db952789416cc46211916`, `9c1e653e38e3478e7eb9a1e1f0249775f044d768`.
- Documentation commits followed source changes: QA `487c834d65e0dd1cdb1b187bb6db5a4a2bc37679`, WIKI `19f6ccb0ee492fe3b57ff505cc6e03e996dc5b70`, dev build `75b12146d47c10070c828b6f26afc710ea21b5e4`, dev fixed `af89ee50c770571a258f524e05ade5531545d969`, bug register updated separately.
- This section is written last as the developer handoff. Check GitHub Actions for the newest commit on `WAVE-0001`; earlier run 43684569184 predates the latest corrections and remains a 42-pass / 6-fail failure, not a pass.
- The PR is intentionally unmerged; issue #1 remains open. No local test, typecheck or build was executed in this session.


## 41. Local developer feedback loop — 2026-11-15

- `./run.sh` now only bootstraps dependencies when needed and starts the Vite server; removed unreachable typecheck/build commands that followed a long-running server process. Supports `--install`, `WAVE_HOST`, and `WAVE_PORT`.
- Added executable `./test.sh` as the local quality gate: Node tests, TypeScript typecheck, production build and Playwright Chromium E2E. It installs missing dependencies and the pinned Playwright/browser prerequisites; `--no-e2e` provides a fast non-browser pass. CI invokes this same script after provisioning browser system dependencies.
- Added `npm run test:local` alias. README, QA context, WIKI and development log updated. This task used GitHub repository editing only; no local test execution is claimed. Check the workflow on this final commit for script syntax and behavior.


## Workspace UI regression follow-up

- Color picker inputs use a neutral initial selection so choosing the standard highlight or block-background colors fires the change handler and inserts the expected Markdown formatting.
- Mobile Settings is available from the top bar even when the sidebar is collapsed.
- Content width preferences are maximum widths bounded by the available editor grid column; tests should assert the configured cap and the rendered width constraint, not force horizontal overflow.
- See QA_CONTEXT.md and WIKI.md for the regression details. CI verification for the latest commit is authoritative.


## Latest CI triage — 2026-11-15

- Workflow `43687589347` on source head `50eebbd975d0a1dfa47e54d23b51a85e62828703` completed with failure: Node tests, typecheck, Vite build and container image passed; Playwright reported 44 passes, two repeatable failures and two flaky tests.
- The repeatable issues were invalid color directive text being transformed as a wiki link and an E2E style assertion comparing CSS hex text against Chromium's normalized RGB output. Flaky cases involved a frozen second-tab clock during cross-tab recovery and typing before list-editor caret restoration.
- Follow-up patch: preserve malformed `color:`/`bg:` directives literally; assert computed RGB background color; remove the unnecessary second-tab fake clock and explicitly verify the recovery prompt; wait for list editor focus/caret restoration before subsequent typing.
- Fresh CI is required. No local tests were run. This handoff is the final documentation action for this remediation pass.


## Latest cross-tab recovery test correction — 2026-11-15

- CI `43688050754`: 47/48 E2E passed; 30 Node tests, typecheck, production build and container build passed. The only failure was the recovery prompt assertion: the source tab autosaved its content after 600ms, before the second tab attempted recovery.
- Updated the E2E setup to freeze only the source page's clock after workspace setup and before editing. The immediate IndexedDB recovery journal write can complete while the delayed Markdown autosave stays pending. The second page is intentionally left on real time.
- Fresh CI is required. No local browser test is claimed. This is the final documentation update for this pass.


## Latest CI handoff — cross-tab recovery fixture correction (2026-11-15)

- Latest inspected run `43688362527` failed at 47/48 Playwright tests; container, 30 Node tests, TypeScript typecheck and production build passed.
- Corrected `tests/e2e/workspace.spec.ts`: the source page's clock is no longer installed before workspace setup. It is frozen once after the baseline page has been created/saved and before the unsaved cross-tab draft is entered; the second tab remains on real time.
- Test commit: `a983dc3199264348331a9e172217d6e70ec4d099`. QA evidence and development history are appended in `QA_CONTEXT.md`, `WIKI.md`, `etc/history/dev-fixed.md` and `etc/history/dev-build.md`.
- Fresh CI is required; no local tests were executed. PR #101 remains open/unmerged and issue #1 remains open pending manual native picker/permission, external-process race, accessibility and process-termination acceptance checks.


### Current CI investigation — cross-tab recovery
The repeated recovery-dialog failure is being isolated with direct browser-side IndexedDB checks. The E2E test now verifies the source tab's saved draft text/session/workspace handle and confirms the second tab sees the same record with a different session ID before invoking `open()`. Existing dialog-source and declined-record-retention assertions are preserved. Treat this as diagnostic hardening, not a confirmed production fix, until CI proves the complete flow passes.


### Cross-tab recovery — plan and current evidence
CI run `43689421532` (#918) showed that the source tab's IndexedDB draft was correctly persisted: exact content, source session ID, and workspace-handle identity all matched. The new diagnostic test itself failed because its expected Markdown newline escapes were double-escaped. Corrected those expectations in commit `418e1e5`. Next CI must verify second-tab visibility and the recovery prompt/decline flow. If it fails, inspect the first failing boundary (IndexedDB visibility, handle identity, newest-draft selection, or `open()` decision) and fix that boundary without weakening assertions. Require the full `test.sh` CI gate and container job to pass before declaring completion.

## WAVE-031 verification issue split — 2026-11-15

- Parent reliability issue [#1](https://github.com/iamjpsonkar/Wave/issues/1) remains open pending native/manual acceptance evidence.
- New child workstreams: [#104 WAVE-031A — native picker and real permission lifecycle](https://github.com/iamjpsonkar/Wave/issues/104); [#105 WAVE-031B — external filesystem races and backup/restore fault handling](https://github.com/iamjpsonkar/Wave/issues/105); [#106 WAVE-031C — abrupt browser termination and recovery drafts](https://github.com/iamjpsonkar/Wave/issues/106).
- Accessibility remains tracked in existing [#3](https://github.com/iamjpsonkar/Wave/issues/3); do not create a duplicate accessibility ticket.
- Latest verified PR #101 CI recorded on main: [run 43690301741](https://github.com/iamjpsonkar/Wave/actions/runs/43690301741), including 48/48 Playwright tests, Node tests, typecheck, production build and container job. This does not replace native/manual checks.
- Reconciliation preserves the PR branch's implementation history and the base branch's issue split. This GitHub-only operation does not run tests or a build.

## Main sync verification and operating procedure — 2026-11-15

- Product owner manually merged the latest `main` into `manager` and force-pushed the branch. Main sync PR [#107](https://github.com/iamjpsonkar/Wave/pull/107) is closed unmerged and must remain abandoned for this purpose.
- Verified refs at the start of this documentation pass: `main` `c421f7bcf40ec430eda90fe0a57e98464762e68f`; `manager` `6747efdf0204c1cded75fd03475a75d0cbdef60b`. Manager's tip is a merge commit whose second parent is the exact current main SHA. Compare reports manager ahead 2 / behind 0, confirming main is fully contained in manager.
- The compare endpoint reports only two manager-only additions relative to main: `etc/howtodev.md` and `etc/howtoqa.md`. No source/test file differences were reported by that comparison.
- Future synchronization and conflict resolution are now documented in [etc/howtodev.md](./etc/howtodev.md#main-to-feature-branch-synchronization-required-workflow), linked from [WIKI.md](./WIKI.md#main-to-feature-synchronization-and-conflict-resolution-policy), and recorded in [etc/history/dev-build.md](./etc/history/dev-build.md).
- Verification limits: GitHub refs, commit parents, tree and compare metadata were inspected. No local checkout/status, tests, typecheck, build or CI run was executed in this environment. Check CI for the latest manager commit before claiming runtime validation.
- This is the final developer-context update for the main-sync documentation batch.

## Documentation reorganization — 2026-11-15

The project documentation library is organized under `etc/product/`, `etc/engineering/`, `etc/quality/` and `etc/history/`; see [etc/README.md](./etc/README.md). Contributor procedures and team governance are under `howto/`. The former `trash/` directory is removed. This reorganization preserves the feature catalogue, tracker IDs and history; it does not change application behavior or imply fresh test/CI verification.

## 2026-11-15 — Manager-to-main documentation integrity reconciliation

- Reconciled the reorganized canonical registers against the latest main-branch documentation before integrating PR #110.
- Restored the four WAVE-0001 fix-history sections that were present in main's former `trash/dev-fixed.md` but absent from the reorganized manager copy; retained the 30 Node / 48 Playwright source inventory and permission/external-edit evidence in `etc/quality/bugs.md`.
- Repaired issue archive references to the reorganized `etc/product/`, `etc/quality/` and `etc/history/` locations and restored missing issue traceability for #104–#106 and the existing accessibility issue #3.
- Preserved the two distinct Markdown feature-gap audit notes in the development history, with links corrected to the reorganized canonical files.
- PR [#110](https://github.com/iamjpsonkar/Wave/pull/110) head `f1d49c174279158f1a20a8fc9efb675ab0708b66` passed CI workflow [43693734660](https://github.com/iamjpsonkar/Wave/actions/runs/43693734660). This is GitHub CI evidence for that exact pre-reconciliation head; the documentation commits created by this reconciliation require a fresh workflow before merge.
- No application source or test code changed. No local tests, typecheck or production build were run. PR #110 remains open and unmerged.

## Automated test organization tracking — 2026-11-15

- New issue [#111 — restructure automated tests into feature-based suites and scenarios](https://github.com/iamjpsonkar/Wave/issues/111) tracks an inventory-first test-layout refactor. Current baseline: Node test script uses flat `tests/*.test.js` discovery; Playwright journeys are concentrated in `tests/e2e/workspace.spec.ts`.
- Scope includes meaningful unit/integration/E2E directories, feature-oriented files/scenarios, shared fixtures/helpers where justified, recursive/explicit discovery, focused commands, and synchronized `test.sh`/CI execution.
- Preserve all unique assertions and guarantees. Coordinate with [#100](https://github.com/iamjpsonkar/Wave/issues/100), whose narrower duplicate-test cleanup must not remove unique coverage.
- Issue index: [github-issues.md](./etc/quality/github-issues.md). Detailed task-creation history: [dev-build.md](./etc/history/dev-build.md).
- This was issue creation/documentation only; no source/test files changed and no tests/build were run.


## #111 diagnostic logging scope update — 2026-11-15

- [#111](https://github.com/iamjpsonkar/Wave/issues/111) now includes required test-run diagnostics and production failure observability in addition to test-suite restructuring.
- Implementation must provide structured/log-level-controlled diagnostics, test failure context and CI artifacts, operation/correlation IDs, and error capture across critical workspace/storage/recovery flows.
- Preserve Wave's local-first privacy model: redact sensitive data, never log document contents/secrets/raw paths by default, no remote telemetry without separate explicit opt-in, and keep diagnostic sinks bounded and non-blocking.
- Detailed requirements and checklist live in the GitHub issue; task history is in [trash/dev-build.md](./trash/dev-build.md).
- No code/test changes or verification were performed for this scope update.


## Cross-tab recovery decline preservation — 2026-11-15

- PR #110 CI run [43695466439](https://github.com/iamjpsonkar/Wave/actions/runs/43695466439) had one remaining Playwright failure: after declining another tab's recovery prompt, the original source-tab journal record was not present in the final IndexedDB snapshot. Unit tests, typecheck, production build and container build passed in that run.
- Updated the recovery decline branch to preserve the other tab's journal record without invoking draft cleanup; added content-free ownership diagnostics. Same-tab cleanup and normal autosave remain unchanged.
- Updated the E2E check to poll for the original record by exact content and source tab ID, avoiding a single-snapshot race while retaining a strict preservation assertion.
- Commit and fresh CI verification are pending. Do not claim the regression fixed until the full workflow passes on the resulting head SHA.


## WAVE-0111 — test extraction repair handoff — 2026-11-15

- PR [#115](https://github.com/iamjpsonkar/Wave/pull/115), issue [#111](https://github.com/iamjpsonkar/Wave/issues/111), branch `WAVE-0111`.
- Repaired the broken test extraction by restoring `tests/storage.test.js` from `main` and deleting the malformed duplicate storage and safety split files. The original regression scenarios remain in the canonical storage suite; do not claim the feature-based split is complete.
- Corrected `tests/unit/diagnostics/diagnostics.test.js` to valid JavaScript, fixed the test scripts to reference only extant test paths, and updated `tests/unit/README.md` to document the actual transitional layout.
- Updated `etc/history/dev-build.md` with the corrective work and verification caveats.
- GitHub Actions runs on intermediate SHAs were queued/in progress; they do not verify this final documentation commit. No local tests, typecheck, build or Playwright run were executed in this GitHub-only session. Verify the latest CI workflow for the exact PR head before claiming success or making the PR ready.
- Remaining #111 scope: inventory-backed feature/layer split without lost assertions, robust Playwright failure artifacts, app diagnostics integration at critical failure boundaries, focused debug controls, and full local/CI verification. PR #115 remains draft.


## WAVE-0111 — completed test architecture and diagnostics handoff — 2026-11-15

- PR [#115](https://github.com/iamjpsonkar/Wave/pull/115), issue [#111](https://github.com/iamjpsonkar/Wave/issues/111), branch `WAVE-0111` (base `main`).
- Node suite: all 30 original storage/safety scenarios moved intact into `tests/unit/storage/` and `tests/unit/safety/`; shared in-memory filesystem fixtures are in `tests/helpers/storage-fixtures.js`. Five diagnostics contract tests bring the current Node total to 35.
- Browser suite: all 48 original Playwright journeys moved intact into `tests/e2e/workspace/`, `tests/e2e/markdown/` and `tests/e2e/editor/`; shared browser workspace setup is in `tests/e2e/fixtures/workspace.ts`.
- Source inventory reconciliation against the branch base found no missing, extra or duplicate scenario names: 30/30 Node and 48/48 E2E.
- `npm test` uses Node's built-in recursive discovery. Focused commands are `npm run test:unit:storage`, `npm run test:unit:safety`, and `npm run test:unit:diagnostics`. `./test.sh` remains the canonical full gate used by CI.
- Playwright retains HTML reports, traces, screenshots and video on failure. CI uploads diagnostic artifacts with 14-day retention. Runtime diagnostics are structured, level-controlled, redacted and bounded to 200 in-memory events; the user can preview/copy/clear a sanitized report in Settings. `?waveDebug=1` opts into debug output. No remote telemetry or persistent diagnostic storage.
- Full CI run [43700194483](https://github.com/iamjpsonkar/Wave/actions/runs/43700194483) passed on source head `ada90b58b05247358604a644a3e6902edcbed80f`: 35 Node tests, typecheck, production build, 48 Playwright tests and container job all passed. Artifact `wave-playwright-diagnostics` was uploaded (1.5 MB, 14-day retention).
- This task used GitHub repository operations only; no local checkout or local test execution is claimed. The final docs commit and workflow artifact-path extension also trigger a fresh CI run; verify the latest PR workflow against the final head before merging.
- PR #115 is open and should be reviewed/merged by the repository owner; do not merge or close issue #111 automatically.


## PR #115 review follow-up — diagnostic privacy and isolation (2026-11-15)

- Review 5910111707 identified missing failure-boundary events, missing operation correlation, permissive string fields, absent sanitized causes, test-layer rationale, shared fixed OPFS name and missing E2E failure-injection coverage.
- Follow-up updates strict diagnostic vocabularies and sanitizes error names/messages and bounded cause chains. Raw stacks remain excluded because browser frames may disclose workspace paths or user-derived values.
- Autosave failure reports once at central `persistDocument` using the save timer's operation ID; timer catch remains for UI state only.
- Playwright now creates unique OPFS directories per browser context. Multi-tab scenarios reopen the user-selected workspace through the remembered handle.
- Test-layer rationale: storage contract cases share one in-memory filesystem adapter; concurrency/recovery primitives are isolated in safety; true UI integration is exercised through Playwright. A separate Node integration layer awaits a genuinely distinct injectable app/storage boundary.
- GitHub-only edits; local tests/typecheck/build were not run. Verify full CI on the exact resulting SHA.


## WAVE-0111 second review follow-up (2026-11-15)

- Second review [5910232936](https://github.com/iamjpsonkar/Wave/pull/115#pullrequestreview-5910111707) identified recovery trace gating, incomplete operation correlation and unsafe free-form exception text.
- Removed direct `console.info('[Wave recovery]')` tracing. Recovery stages now use structured `debug` events and share the same operation ID as document-open failure reporting. Default verbosity suppresses those events; `?waveDebug=1` enables them.
- Diagnostic errors retain the standard error class and a bounded cause chain, but free-form exception messages are replaced with the fixed string `Details omitted for privacy.` This intentionally avoids heuristic text redaction that could miss document-derived prose. Raw stack traces are not stored.
- Stable operation IDs now span workspace open/reopen and activation, document open, autosave persistence, Trash restore/delete, and backup create/restore. Existing diagnostics use strict string vocabularies and duplicate propagation is suppressed.
- Unit coverage now checks ordinary unprefixed private prose is omitted. Playwright coverage checks no recovery trace noise by default, debug visibility when enabled, and autosave error privacy/correlation.
- Full canonical CI must run against the exact latest head after these changes; no local execution is claimed.


## WAVE-0111 pipeline follow-up (2026-11-15)

- Investigated exact-head CI run [43704440873](https://github.com/iamjpsonkar/Wave/actions/runs/43704440873). Node suite passed (36 tests); container job passed; Playwright had 49 passing tests and one failure.
- The only remaining failure was the cross-tab recovery E2E assertion. Runtime evidence showed the source tab's recovery journal record correctly remains after the second tab declines recovery. The test had been changed to expect deletion; restored the correct preservation assertion and made it poll for the durable source-tab record.
- The debug-gating E2E test passed in this run, as did all other Playwright cases.
- A fresh full CI run is required for the updated test commit before considering the PR ready to merge.


## WAVE-0111 recovery pipeline diagnostics (2026-11-15)

- Investigated recurring cross-tab recovery failure from runs 43704827319 and 43705311985. The test had treated `page.clock.install()` as a frozen clock, but Playwright continues advancing timers unless explicitly paused. The source document's 600 ms autosave could therefore commit and clear its own journal before the second tab inspected it.
- Regression test now explicitly pauses the source tab clock with `page.clock.pauseAt(new Date())` after installation and before typing the unsaved source draft.
- Added privacy-safe structured debug diagnostics to `draftJournal.ts`: lock wait/acquire/release, save plan, read result, clear plan and clear completion. Events include operation/stage and bounded counts only; no document content, path or tab ID. Removed direct recovery `console.info` output.
- Threaded operation IDs through document-open journal reads/clears and persistence journal cleanup. The cross-tab E2E test enables `?waveDebug=1` in both tabs, captures both tabs' logs, and fixes the undefined failure-handler variable.
- Node tests passed in the prior run; full E2E verification must pass on the final exact PR head before merge. The nested-breadcrumb timeout was separately observed as flaky and must be monitored in the next full run.

## PR #115 final diagnostics review follow-up — 2026-11-15

- Branch: `WAVE-0111`; PR: [#115](https://github.com/iamjpsonkar/Wave/pull/115).
- Completed the outstanding operation-correlation work from review [5910312606](https://github.com/iamjpsonkar/Wave/pull/115#pullrequestreview-5910312606). `flush(operationId)` now forwards its ID to `persistDocument`; parent IDs are threaded through create/template, duplicate, Trash move and refresh, backup create, workspace activation, document open and reload, including nested copy synchronization.
- Replaced the prior weak debug-gating E2E check with assertions that default-mode opens emit no recovery debug trace, `?waveDebug=1` emits structured debug events, and all events from one open share a single operation ID.
- Updated `tests/unit/README.md` and `etc/history/dev-build.md` with the implementation and pending verification status.
- Latest implementation commit before this handoff update: see branch `WAVE-0111` HEAD. The exact-head CI for this follow-up is not yet verified. Do not merge until it passes and review is satisfied.


## PR #115 review 5910351108 follow-up

- Fixed operation-ID loss in attachment(): both pre- and post-asset flush calls now receive the ID created at the attachment action boundary.
- Fixed page-exit draft correlation: savePendingDraft() passes its operation ID into saveDraft() and the failure event.
- Strengthened E2E coverage to assert that ordinary app bootstrap/open generates no [Wave] console diagnostics, while the same document-open flow with ?waveDebug=1 emits structured recovery debug events sharing one operation ID.
- refresh() intentionally represents an independent listing/settings-prune operation and creates its own ID; it can run outside any parent action and does not share a persistence transaction.
- CI verification on the resulting exact SHA is pending; earlier green CI does not verify these changes.

## Issue #117 — explicit MIT licensing published on WAVE-0117 (2026-11-15)

- Owner explicitly selected the MIT License; the follow-up "go ahead" approved the proposed notice `Copyright (c) 2026 Jay Prakash Sonkar`.
- Added root `LICENSE` using the canonical ChooseALicense MIT text, with only the year and copyright-holder placeholders replaced by the approved values.
- Added README license summary and rationale; declared SPDX identifier `MIT` in root `package.json` and the root package entry of `package-lock.json`.
- Added contributor licensing expectations to `etc/engineering/CONTRIBUTING.md`: contributions submitted for inclusion are offered under MIT, contributors retain their copyright, and no CLA/DCO requirement is introduced.
- Updated `WIKI.md` to use the actual canonical contributor-guide path and to index the license; kept its documentation map table contiguous. Updated `etc/README.md` and README contributor links.
- Branch: `WAVE-0117`. This is a GitHub API-only documentation/metadata change; no local tests, typecheck or build were run. Exact-head GitHub Actions verification is pending. GitHub's detected-license metadata is tied to the default branch and cannot be considered complete until this PR is merged.

## Issue #118 — third-party license audit and maintenance controls (2026-11-15)

- Default-branch lockfile audit: npm lockfileVersion 3, 221 package entries, all declared license metadata (MIT 210, ISC 7, Apache-2.0 2, BSD-3-Clause 1, CC-BY-4.0 1). The non-MIT data-license item is `caniuse-lite@1.0.30001826` (CC-BY-4.0); exact release attribution remains a manual release-review requirement.
- Asset/source inventory: runtime Google Fonts DM Sans, DM Mono and Playfair Display (SIL OFL 1.1; font binaries not committed/pinned); Lucide React icons (`lucide-react@0.468.0`, ISC); Mermaid/Graphviz SVGs and Markdown templates are authored by Wave; end-user workspace images/media are user-provided and local. No tracked standalone image/font assets were identified in the repository tree audit.
- Added `THIRD_PARTY_NOTICES.md` for third-party license/attribution inventory and `scripts/check-dependency-licenses.mjs` for exact lockfile metadata screening. Added npm scripts `license:audit`, `license:audit:json`, and `test:license`; CI now executes the audit after `npm ci`.
- Ongoing maintenance rules added to `AGENTS.md`, `WIKI.md`, and `etc/engineering/CONTRIBUTING.md`; README and `etc/README.md` link to notices. Recheck exact upstream LICENSE/NOTICE files for modified/added packages; document all external assets, preserve attribution and escalate uncertain/possibly incompatible terms.
- Limitations: metadata scan is not legal compatibility review and does not prove notice contents were preserved. Each package's exact tarball license/NOTICE has not yet been individually checked. caniuse-lite attribution and package-specific Apache NOTICE requirements need release artifact verification. Google Fonts exact font bytes are not pinned. No material was relicensed or substituted.
- Branch `WAVE-0118`. GitHub API-only edits; local checker execution and exact-head CI are pending. Update this handoff last after any further documentation corrections.


## Issue #118 — exact dependency inventory and ongoing maintenance (2026-11-15)

- Added committed snapshot `etc/legal/dependency-license-inventory.json` with all 221 exact package entries from the lockfile: install path, package name/version, declared license, resolved npm tarball, integrity digest and dev-only marker. Counts: MIT 210, ISC 7, Apache-2.0 2, BSD-3-Clause 1, CC-BY-4.0 1. Snapshot data reconciled against the current branch lockfile; all records matched.
- Audit metadata identifies Apache-2.0 packages `baseline-browser-mapping@2.11.37` and dev-only `typescript@5.7.3`; `caniuse-lite@1.0.30001826` is CC-BY-4.0. The notices file records Lucide React ISC and runtime Google Fonts DM Sans, DM Mono and Playfair Display under OFL-1.1; fonts are runtime-loaded and unpinned.
- `scripts/check-dependency-licenses.mjs` now compares the committed exact inventory against `package-lock.json`; it fails on stale inventory, missing license declarations or unrecognized identifiers. Npm commands: `license:audit`, `license:audit:json`, `license:audit:update`, and `test:license`. CI invokes the audit after `npm ci`.
- `THIRD_PARTY_NOTICES.md`, README, `etc/README.md`, `AGENTS.md`, `WIKI.md`, and `etc/engineering/CONTRIBUTING.md` now prescribe how to record and review future dependency and external-asset updates. Refresh the JSON only after reviewing upstream terms; inspect the full generated diff; preserve NOTICE/attribution material; escalate ambiguous terms.
- Legal/verification limitations remain explicit: the 221 package tarballs' LICENSE/NOTICE files were not individually compared; Apache package-specific NOTICE presence and CC-BY attribution wording need release-artifact verification; Google Fonts CSS responses and exact font binaries are not pinned. The audit checker is not a legal compatibility opinion. No materials were changed or relicensed.
- Branch: `WAVE-0118`. GitHub API-only changes; no local script execution or CI result claimed. Exact-head CI pending.


### Issue #118 exact-head CI follow-up — 2026-11-15

- The first PR #121 workflow [43711176098](https://github.com/iamjpsonkar/Wave/actions/runs/43711176098) ran `npm ci` successfully and then failed at `npm run license:audit`; the container job passed, while remaining build/browser steps were skipped. Log showed all 221 package counts as expected but the snapshot comparator considered inventory stale.
- Independently compared all 221 snapshot package records with package-lock entries; exact names, versions, license IDs, registry sources, integrity digests and dev-only flags matched. Root cause was JSON serialization/property ordering and optional-field comparison.
- Checker now compares normalized semantic fields and stable sorting. This correction is committed on `WAVE-0118`; the new exact-head workflow result is still required. Do not report CI green until it finishes.


### Issue #118 exact-head CI final result — 2026-11-15

- PR [#121](https://github.com/iamjpsonkar/Wave/pull/121) exact-head workflow [43711329699](https://github.com/iamjpsonkar/Wave/actions/runs/43711329699) completed successfully on source head `d6a1f49feddfec6bcee930807d779e2390e1c977`.
- Passed jobs: build and container. The build job passed `npm ci`, the dependency-license inventory audit, Playwright runner setup, Chromium install, and the full `./test.sh --skip-install --skip-playwright-install --skip-browser-install` gate (Node tests, typecheck, production build, E2E); the container job passed Compose config validation and image build.
- The first workflow [43711176098](https://github.com/iamjpsonkar/Wave/actions/runs/43711176098) failed only at inventory freshness comparison. The checker now normalizes record fields and sorts packages before comparison; the corrected exact-head CI passed.
- PR description was updated with the exact-head green run. PR #121 remains open and mergeable pending owner review. Issue #118 was reopened because it had been auto/consolidation-closed as duplicate of #120 while this delivery remains under review; a status comment records the reason.
- Remaining legal source-review gaps: package tarball LICENSE/NOTICE files were not individually compared, Apache NOTICE requirements and caniuse-lite attribution need release-artifact inspection, and the unpinned runtime Google Fonts files require capture/notice work only if the project chooses to self-host or bundle them. Do not imply these legal checks are complete from green CI.


## 14. Third-party license audit follow-up — 2026-11-15

- Work is in [PR #121](https://github.com/iamjpsonkar/Wave/pull/121), branch `WAVE-0118`, target `main`; broader consolidated tracking remains in [#120](https://github.com/iamjpsonkar/Wave/issues/120).
- Follow-up notice correction: commit `61f7425c44e182780c5d6d97c30b03d41024a8d6` documents caniuse.com's CC-BY-4.0 attribution instruction, versioned source references for Apache-2.0 dependencies, Feather-derived Lucide attribution caveat and remaining package artifact review boundaries.
- Documentation history was appended in `etc/history/dev-build.md` (commit `d76a97d7e8fe3f676561e247807de6bb69b50501`) and `WIKI.md` (commit `9a3c81b6feb58492b94a39cd8d4311459311e099`).
- CI run [43712184333](https://github.com/iamjpsonkar/Wave/actions/runs/43712184333) was in progress at the last inspection. Its npm ci and metadata license audit steps passed; remaining Playwright/build/container stages had not yet finished. Recheck before reporting.
- Important limitation: exact LICENSE/NOTICE content across all 221 locked npm tarballs and final distribution artifact inclusion has not been verified. The GitHub-only tool session cannot run local npm or unpack the tarballs. This issue is not legally certified complete; keep #118 and PR #121 open until exact artifact review is completed or explicitly dispositioned by the owner/legal reviewer.


## 2026-11-15 — Keep npm lockfile tracked

- Removed `package-lock.json` from `.gitignore` in commit `fa9de6a18305704d7f560086490255238d116726` on `WAVE-0118`.
- Verified `package-lock.json` remains present and tracked on both `main` and `WAVE-0118` (same blob SHA `0b67bf1a95283010f1aaeb7983f622e7248bebf1`).
- This is required for reproducible `npm ci` installs and the committed dependency license inventory check.

## 2026-11-15 — Commit discipline for future tasks

- Owner direction: minimize commit count and keep documentation updates with the implementation they describe.
- Default to one cohesive commit per task containing related code, tests, configuration and relevant Markdown documentation/history. Do not create separate documentation-only commits for the same task.
- Split commits only for genuinely independent, reviewable phases or technical necessity; do not combine unrelated work just to reduce count.
- Review the complete diff before pushing, then verify CI against the exact pushed SHA. Amend unshared commits where appropriate; never rewrite shared main history.
- The authoritative detailed policy is in AGENTS.md; contributor and agent guidance also appears in etc/engineering/CONTRIBUTING.md and WIKI.md.



## 2026-11-15 — PR #121 review remediation

- Addressed review [5910646985](https://github.com/iamjpsonkar/Wave/pull/121#pullrequestreview-5910646985): dependency inventory names now derive from the final `node_modules/` path segment, including complete scoped names; regression coverage includes nested unscoped, nested scoped and root scoped packages.
- Regenerated `etc/legal/dependency-license-inventory.json` with corrected package names and aligned the audit baseline in `THIRD_PARTY_NOTICES.md` to PR base SHA `7e895f26b05288dc8edfebcf03e14efe954950f5`.
- Full exact-head CI is required before treating the code findings as verified. Previously documented package tarball/LICENSE/NOTICE and final distribution attribution checks remain open and must not be represented as legally complete.


## 2026-11-15 — PR #121 CI test import fix

- Run [43713413195](https://github.com/iamjpsonkar/Wave/actions/runs/43713413195) exposed an incorrect relative import in the new license inventory regression test. The npm audit and container build had passed; the full Node unit gate failed before executing that test.
- Extracted inventory normalization into side-effect-free `scripts/dependency-license-inventory.mjs`; CLI checker imports it, tests import the helper directly, and the relative path is corrected. Exact-head CI is required after this fix.

## Issue #120 — security program kickoff (2026-11-15)

- Active tracker: [#120](https://github.com/iamjpsonkar/Wave/issues/120). Consolidated scope from #44, #89 and #118 remains preserved; no inherited checklist scope is considered complete from consolidation alone.
- PR [#121](https://github.com/iamjpsonkar/Wave/pull/121) merged to `main` at `04afcf448e0d45b743fd8324071b1339301904e2`. Exact-head CI [43713585404](https://github.com/iamjpsonkar/Wave/actions/runs/43713585404) passed both jobs: npm ci, license audit, Playwright setup, `./test.sh` and container Compose/image build.
- First implementation branch: `WAVE-0120`, based on the merged main commit. Scope is CI workflow hardening: read-only token permissions, immutable action SHA pins, explicit job timeouts and concurrency cancellation. Functional and container gates are retained.
- Next scanner slices remain open: Dependabot and dependency advisory/CVE coverage (npm audit plus OSV), secret scanning, CodeQL/SARIF, filesystem/container scanning, Sonar configuration/explicit skip behavior, then application threat model and privacy/content/file/permission controls.
- Legal limitations from #118 remain: individual exact-version npm tarball LICENSE/NOTICE files and final release-artifact attribution have not been exhaustively checked. The automated audit is not legal sign-off.
- Source was inspected through GitHub. No local test or YAML/Docker validation is claimed; await exact-head CI for this branch.

## Mobile navigation drawer close contract

When the mobile drawer is open, render an explicit close button in a higher stacking layer than the sidebar. The backdrop is behind the sidebar and can be occluded by it; Playwright center-clicks are therefore not a reliable way to activate the backdrop. Keep the close button keyboard accessible and explicitly test it.

## Security automation and application security handoff — 2026-11-15

Current security tranche adds .github/dependabot.yml and dedicated workflows for npm audit, OSV-Scanner, Gitleaks, CodeQL, Trivy and Sonar. CI parses every workflow YAML file and checks for top-level permissions, concurrency, explicit timeouts, no pull_request_target, and full-SHA action/reusable-workflow pins. See docs/SECURITY_OPERATIONS.md for triggers, thresholds, owner configuration and triage; see docs/SECURITY_THREAT_MODEL.md for source-backed controls and limitations.

Application-side changes in this tranche: production Nginx CSP and cross-origin/security headers; removed remote Google Fonts requests; external Markdown links use noopener noreferrer; SVG Markdown image previews are disabled; attachments are limited to 25 MiB and known active/executable extensions/MIME types are rejected before storage. Existing rehype-sanitize and path validation remain in place. New storage tests cover blocked SVG and oversized files.

Important limitations: Wave still stores Markdown/assets as ordinary plaintext; no vault encryption/key recovery, E2E sync, teams/permissions, plugin execution/sandbox, integration secret store, remote sharing, access audit log, archive extraction or malware scanning of user workspace files exists. Sonar is intentionally skipped with a visible awaiting-configuration state until owner variables/secrets are added. Dependabot security alerts/updates and GitHub secret scanning/push protection also need owner-side settings. Automated license scans do not settle exact tarball NOTICE/legal obligations. Keep #120 open.


## 2026-11-15 — Replace Sonar with free, credential-free static analysis

- Removed the Sonar workflow because the hosted service required owner credentials and a paid plan was not justified for this project.
- Added OpenGrep 2.0.0 SAST workflow using the immutable Linux x86 release binary and a pinned SHA-256 digest; local Wave-specific rules are in `.github/opengrep-rules.yml`. Findings and parser/config errors fail the scan; SARIF is retained as a short-lived artifact.
- Added ESLint 10.15.0, @eslint/js 10.0.1, typescript-eslint 8.72.2 and globals 17.14.0 in a separate CI workflow. Tooling is installed transiently with exact versions after npm ci so Wave's application lockfile/runtime dependencies remain unchanged. JavaScript recommended rules block; TypeScript recommended rules are warnings during initial baseline.
- Added `eslint.config.mjs`; updated README, WIKI, security operations, documentation index, AGENTS and CONTRIBUTING. Corrected the README's stale Google Fonts statement to match the existing system-font implementation.
- Exact-head GitHub Actions validation is pending for this branch update. Do not claim OpenGrep or ESLint clean until their new workflows complete successfully; review and disposition TypeScript lint warnings before ratcheting them to blocking.


### ESLint first-run remediation — 2026-11-15

- First run identified one blocking `preserve-caught-error` finding in `scripts/check-dependency-licenses.mjs`; the caught file-read error is now attached as `cause` rather than flattened into the message.
- Initial warning baseline includes unused imports/variables in the legacy tests and app. These remain warnings and are not silently suppressed; review them separately before changing the warning policy.


### Gitleaks false-positive triage — 2026-11-15

- Gitleaks reported a historical commit SHA in etc/history/dev-build.md as generic-api-key. Confirmed the value shape and context are Git commit identifiers, not credentials. Added a path- and line-pattern-scoped allowlist in .gitleaks.toml; no broad rule suppression was introduced. Re-run Gitleaks on the exact resulting commit.


## 2026-11-15 — Static-analysis verification

- OpenGrep 2.0.0 validation and blocking scan passed after the rules YAML/CLI syntax corrections; release binary checksum verification passed.
- Gitleaks passed with the narrow historical commit-ID allowlist in .gitleaks.toml.
- ESLint passed with 0 errors and 161 warning-level unused-variable/import findings. These remain a visible cleanup baseline, not a claim of warning-free lint.
- All eight workflows passed on pre-consolidation head f645cfacf539645aff6d3b5bc0bbf86b5478ef31, including 50 Playwright tests. A one-commit consolidation follows; rerun all workflows on the final squashed commit.


## 2026-11-15 — PR #122 QA comment 6895740917 remediation

- Investigated exact Main CI run [43722300849](https://github.com/iamjpsonkar/Wave/actions/runs/43722300849), job [132836778794](https://github.com/iamjpsonkar/Wave/actions/runs/43722300849/job/132836778794). The first Playwright attempt timed out in `attachments are saved locally with correct root and nested Markdown paths` while filling the nested page editor immediately after folder navigation. The same test passed on Playwright retry in 3.2 seconds. This was a flake, not an intentional timeout. Updated the scenario to wait for the editor to be enabled and show the expected page content before editing, and gave the fill a bounded diagnostic timeout.
- Updated CI's checkout/setup-node/upload-artifact actions to verified full SHAs for Node-24-compatible v7.0.1/v7.1.0/v7.0.2 releases. Other workflows already use v6/v7 action families and did not emit the warning.
- Replaced deprecated OSV `--output=` CLI arguments with `--output-file=`.
- Added attachment metadata extension/MIME mismatch rejection and byte-signature verification for supported image/document/archive formats before saving. Added regressions for mismatched metadata, spoofed PNG/PDF declarations, active SVG bytes under a benign extension, and valid PNG/text files. This is format integrity defense-in-depth, not malware scanning; generic/unknown formats remain subject to extension/MIME deny-list screening.
- Owner-side Dependabot alerts/security updates, secret scanning/push protection, private vulnerability reporting, and exact package tarball LICENSE/NOTICE/legal review remain manual repository-owner/release tasks; workflows cannot enable them.
- All changes above are source updates only at this point. Run local `./test.sh`, YAML/policy validation, and verify all workflow results on the new exact PR head before claiming completion.


### OSV reporter CLI correction — 2026-11-15

- The first follow-up after switching the scanner command to `--output-file` exposed that reporter CLI v2.7.1 uses `--output-files=sarif:<path>` (plural), not `--output-file`. The reporter's `--gh-annotations` flag is also deprecated; annotations now use `--output-files=gh-annotations:#stderr` for PR comparison. Corrected from the exact workflow log for run [43723343889](https://github.com/iamjpsonkar/Wave/actions/runs/43723343889). New exact-head CI remains required.


## 2026-11-15 — Main CI unit-test failures from run 43723476897

- Inspected job [132840278700](https://github.com/iamjpsonkar/Wave/actions/runs/43723476897/job/132840278700). Install, license audit, Chromium setup, workflow YAML/policy checks passed; `./test.sh` failed before Playwright at Node unit tests (36 passed, 3 failed).
- Root cause: the initial content-signature gate required all claimed PNG/PDF/image data to match exact signatures, breaking existing opaque-image fixture behavior and intercepting the permission lookup test before its intended storage permission failure. Refined the gate to reject active SVG/HTML payloads masquerading as other types and known archive/container signatures inconsistent with the declared MIME, while retaining the supported-extension/MIME mismatch checks. Updated fixtures to use a valid PNG signature where the test specifically exercises the subsequent storage permission failure; spoof tests now assert against concrete detected SVG/HTML and ZIP signatures.
- These are source corrections only so far. Require a fresh exact-head CI run; no local test execution is claimed.


### Attachment-signature test correction — 2026-11-15

- Exact Main CI run [43723789551](https://github.com/iamjpsonkar/Wave/actions/runs/43723789551), job [132841222439](https://github.com/iamjpsonkar/Wave/actions/runs/43723789551/job/132841222439) failed only in attachment validation unit test (38/39 passed). The failing assertion supplied ZIP magic bytes with `text/plain` and expected a signature mismatch rejection.
- The signature detector already recognizes ZIP, but the validator intentionally treated unknown/container formats as non-blocking. Since ZIP is a container and no archive extraction is supported, rejecting a recognized ZIP signature when it is not declared as `application/zip` is appropriate; accepting it under `text/plain` is a metadata spoof.
- Updated the validator to classify ZIP and gzip signatures as container formats requiring a matching declared MIME, preserving unknown/unrecognized payload compatibility. Updated the regression test to expect ZIP under `text/plain` to reject; added positive coverage for a correctly declared ZIP only if that policy remains supported.
- Exact-head CI is required; no local execution is claimed.


### Repeat attachment-signature CI failure — root cause correction — 2026-11-15

- Run [43724070652](https://github.com/iamjpsonkar/Wave/actions/runs/43724070652), job [132842068875](https://github.com/iamjpsonkar/Wave/actions/runs/43724070652/job/132842068875) executed the exact head `d4fd5b1d258c44e4a946daeb50343532cc2594bf`; 38/39 unit tests passed and the attachment validation test failed at the assertion expecting active SVG content disguised as PNG to reject.
- The previous fix only classified ZIP/gzip signatures as required MIME matches. The active SVG/HTML signatures were filtered out of the signature list, so the content-specific test was exercising a second inconsistent branch. The generic text-prefix check is not an adequate single source of truth for these recognized signatures.
- Removed that filtering and explicitly treat detected SVG, HTML, ZIP, gzip and WASM signatures as active/container signatures requiring the matching declared MIME. Kept supported benign image/document signature matching and unknown-format compatibility. Updated the test to directly exercise `validateAttachmentContent` for the renamed PNG content case, so the failing layer is tested without relying on `addAsset`'s earlier checks.
- New exact-head CI is required; no local execution is claimed.


### 2026-11-15 — Attachment unit-test debug instrumentation

- Exact run [43724391529](https://github.com/iamjpsonkar/Wave/actions/runs/43724391529), job [132843050515](https://github.com/iamjpsonkar/Wave/actions/runs/43724391529/job/132843050515) failed at attachment test line 68 (38/39 passed). The active SVG payload renamed as PNG is correctly rejected by the validator as active SVG/HTML, but the previous assertion expected the generic content mismatch error. Updated expected error and added labelled case-by-case debug output. Validator diagnostics log metadata and the first 16 bytes as hex only, never file contents.
- A local checkout attempt and `./test.sh` were blocked by unavailable DNS access to github.com; local test status is NOT RUN. Exact-head CI is required before claiming success.


### 2026-11-15 — Fix attachment signature regex escaping

- CI run `43724833607` failed in `tests/unit/storage/workspace.test.js`: the disguised SVG payload was rejected, but the test received the generic signature-mismatch error instead of the active-SVG error.
- Root cause: regex literals in `ACTIVE_ATTACHMENT_SIGNATURES` and `validateAttachmentContent` were double-escaped. SVG/HTML detectors therefore matched literal backslashes rather than XML declarations, tag boundaries, or whitespace.
- Corrected the regex literals for SVG/XML, HTML, and BOM detection. The existing test expectations remain strict; no assertion was weakened.
- Debug logs from the failed run confirmed the 29-byte `<svg...` prefix and exposed the failed detection path. Logs report only filename, MIME, size, and hex prefix—not file contents.
- Validation status: awaiting CI for commit `9c25904e2e8609de1720db7a5fbc417033fb60fb`. Local `./test.sh` has not been run in this environment because repository checkout access is unavailable; do not treat CI as locally executed.


## 2026-11-15 — CI functional-first orchestration

- Reworked .github/workflows/ci.yml into the single PR/main-push orchestrator. The Functional build and browser tests job is the mandatory first gate.
- The production container build and reusable workflows for ESLint, CodeQL, Trivy, npm audit, OSV-Scanner, OpenGrep and Gitleaks all declare needs: build. GitHub skips these downstream jobs when the functional gate fails and starts them after it succeeds.
- Converted the seven scanner/quality workflow files to reusable workflow_call workflows while preserving their weekly schedules and manual workflow_dispatch triggers. Scheduled and manually dispatched scans therefore remain independently runnable.
- Kept least-privilege job permissions, full-SHA action pins, existing scanner policies, artifacts, timeouts and per-workflow concurrency. Caller permissions are limited to the union required by the invoked workflows; each job grants only its own required scopes.
- Updated docs/SECURITY_OPERATIONS.md to document the execution order and skip behavior.
- Verification: source/configuration review only. Local ./test.sh, YAML parsing, workflow-security script and Docker validation were not run in this environment. The CI functional gate itself validates workflow YAML and the repository security policy; exact-head Actions results are required before calling this change verified.

### 2026-11-15 — Reject malformed supported-format attachment signatures

- Exact CI run [43725766392](https://github.com/iamjpsonkar/Wave/actions/runs/43725766392), job [132847238237](https://github.com/iamjpsonkar/Wave/actions/runs/43725766392/job/132847238237) failed at the attachment validation unit test (38/39 passed). A `.pdf` declared as `application/pdf` but containing plain text was accepted.
- Root cause: the validator rejected recognized signatures with a mismatched MIME, but did not require a signature when the declared MIME itself represented a supported signature-bearing format.
- Added the reciprocal check for every supported signature-bearing MIME type. Unknown formats remain compatible, and a valid PDF signature has positive regression coverage.
- Local `./test.sh` remains unrun because repository checkout access is unavailable here. Exact-head CI must verify the change; no pass is claimed before that run completes.

### 2026-11-15 — Narrow signature-required policy after regression run

- Follow-up run [43726027375](https://github.com/iamjpsonkar/Wave/actions/runs/43726027375), job [132848030853](https://github.com/iamjpsonkar/Wave/actions/runs/43726027375/job/132848030853) confirmed malformed PDF rejection, but exposed two unintended regressions: existing generic PNG upload fixtures use arbitrary small payloads, and the minimal PNG fixture is not a valid size-preserving storage fixture.
- Narrowed mandatory signature presence to the supported document/container formats explicitly covered by this check (PDF, ZIP, gzip and WASM). Image signature mismatch detection remains active when a known signature is present, but metadata-only legacy image fixtures remain compatible.
- Changed the PNG regression to directly verify signature recognition in `validateAttachmentContent`, keeping it independent from the fake storage writer's size-verification contract.
- New exact-head CI is pending; no success is claimed yet.


### 2026-11-15 — QA re-review findings: OSV ref correctness and padded active content

- Addressed QA comment [6896404719](https://github.com/iamjpsonkar/Wave/pull/122#issuecomment-6896404719).
- OSV pull-request baseline now checks out `github.event.pull_request.base.sha`, verifies `git rev-parse HEAD`, and scans that exact commit. The proposed scan separately checks out and verifies `github.event.pull_request.head.sha`. Both expected and actual SHAs are logged; scheduled/default-branch scans retain a separate checkout path.
- Attachment SVG/HTML marker checks now inspect the complete bounded file payload rather than the first 512 bytes. Added padded SVG and HTML regression cases with markup beyond the old prefix boundary.
- Security operations documentation explicitly scopes the guarantee: signature/pattern defense-in-depth, not complete parsing, malware scanning, or polyglot detection.
- Exact-head CI and scan-result verification are pending. No CI success is claimed until the new head finishes.


### 2026-11-15 — OSV report persistence failure correction

- Run [43726878501](https://github.com/iamjpsonkar/Wave/actions/runs/43726878501), OSV job [132851185917](https://github.com/iamjpsonkar/Wave/actions/runs/43726878501/job/132851185917): explicit baseline and proposed SHAs both verified successfully and both scanner containers returned exit code 0, but their `--output-file` reports were not persisted to the host workspace. The subsequent required-report check correctly failed closed.
- Replaced the non-persisting Docker action invocation with the pinned OSV-Scanner CLI installed on the runner, so JSON reports are created in the checked-out workspace and can be consumed by the reporter step. Retained explicit base/head checkout and SHA verification; updated reporter arguments to the upstream documented flags.
- Exact-head CI is pending. No scan result or CI pass is claimed yet.


### 2026-11-15 — Verify official OSV binary digest

- Replaced the invalid guessed install-script URL with the official OSV-Scanner v2.2.1 Linux amd64 release binary.
- Embedded and verify the SHA-256 digest published in GitHub release metadata (`59e3bbd49f964265efc495b7ff896bff3c725b14c9fcce2e82088e053af98e7b`) before execution. Scanner JSON output is written directly to the runner workspace; base/head SHA checks and fail-closed report checks remain enforced.
- Exact-head CI pending.


### 2026-11-15 — Correct OSV CLI output flag

- Run [43727455161](https://github.com/iamjpsonkar/Wave/actions/runs/43727455161), OSV job [132853138100](https://github.com/iamjpsonkar/Wave/actions/runs/43727455161/job/132853138100) showed OSV-Scanner v2.2.1 rejected `--output-file` (`flag provided but not defined`). The upstream v2.2.1 CLI uses `--output`.
- Updated baseline, proposed-source and scheduled scan invocations to use `--output=<report>`. Binary version and SHA-256 verification, explicit base/head SHA checks, report-existence validation and comparison gate remain intact.
- Exact-head CI pending.


### 2026-11-15 — Preserve OSV baseline report across checkout cleanup

- Run [43727921465](https://github.com/iamjpsonkar/Wave/actions/runs/43727921465), job [132854393678](https://github.com/iamjpsonkar/Wave/actions/runs/43727921465/job/132854393678): baseline and proposed OSV scans both completed successfully, but the baseline JSON disappeared before report verification.
- Root cause: the next `actions/checkout` of the proposed head cleans untracked files in the workspace, deleting `old-results.json` generated by the baseline scan. The final report check correctly failed closed.
- Moved OSV JSON outputs to `$RUNNER_TEMP/osv-reports`, outside the checkout working tree and therefore persistent when switching from base SHA to head SHA. Updated scan output paths, per-scan report checks, final verification, reporter input paths, and artifact paths consistently. Scan ordering and explicit base/head SHA verification remain unchanged.
- Verification in this environment: source-level path consistency checks only. Local `./test.sh`, YAML parsing, live OSV scans and reporter execution were not run because repository cloning is blocked by DNS resolution for github.com. Require exact-head CI for end-to-end verification.


## 2026-11-15 — GitHub Pages deployment from main

- Added a GitHub Pages deployment job to `.github/workflows/ci.yml`. It runs only on pushes to `main` and depends on the functional build/browser-test job, so pull requests and failed functional checks cannot publish the site.
- Added a Pages-specific Vite build using `GITHUB_PAGES=true`, which sets `/Wave/` as the asset base for the project site while preserving `/` for local development and Docker. CI checks generated script and stylesheet paths before uploading `dist/` with the pinned Pages artifact action.
- Added a dedicated deploy job with only `pages: write` and `id-token: write`, targeting the `github-pages` environment. GitHub Pages must be set to **Settings → Pages → Build and deployment → Source → GitHub Actions** once by a repository administrator.
- Added `docs/GITHUB_PAGES.md` and updated README/documentation indexes and the Docker guide. Hosting remains static and does not upload user documents or introduce a backend.
- Verification: source-level workflow and path review only. Local `./test.sh` and Vite builds were not run in this environment; exact-main CI and a browser smoke test against the published URL remain required.

## 2026-11-15 — Align reusable GitHub Actions workflows with verified v7 pins

- Audited all eight workflows against the current main branch. The primary CI already used immutable SHAs for checkout v7.0.1, setup-node v7.1.0 and upload-artifact v7.0.2; reusable workflows still contained older v6/v4 references, and the container job still used checkout v4.
- Updated the remaining checkout references to `3d3c42e5aac5ba805825da76410c181273ba90b1` (v7.0.1), setup-node references to `949feb2413d6458794dcd2491c4babbbce0c15c1` (v7.1.0), and upload-artifact to `cf430e030ddbb5b0abf93d22962f4752f3646cd9` (v7.0.2). All references remain immutable full-SHA pins.
- No application dependencies or lockfiles changed. Source/configuration review only; exact-head CI is required for verification. Local test/build execution is unavailable in this environment because DNS resolution for github.com fails.

## 2026-11-15 — Coordinated npm dependency upgrade candidate (issue #137)

- Prepared a single compatible version set from the seven closed Dependabot update branches: Vite 8.3.8 + `@vitejs/plugin-react` 6.3.0; React/React DOM 19.3.1 + both React type packages 19.3.0; TypeScript 7.0.2; react-markdown 10.1.0; lucide-react 1.72.0.
- Vite 8 requires Node 20.19+ or 22.12+; CI uses Node 22. The current Vite config calls `react()` without the Babel options removed in plugin-react 6, so no config migration was required by source inspection.
- Combined the package metadata from the separate npm-generated Dependabot lockfile updates, preserving independent dependency entries and applying the coordinated root dependency map. This is a candidate lockfile merge, not a local npm regeneration; fresh `npm ci` on the PR is the acceptance gate.
- Candidate lock inventory: 181 packages; MIT 142, Apache-2.0 22, ISC 3, MPL-2.0 12, BSD-3-Clause 1, 0BSD 1; no missing license declarations. Added MPL-2.0 to the checker allowlist after reviewing Mozilla's official license and Lightning CSS 1.33.0 package metadata. Updated third-party notices to record source-availability and notice obligations; no legal certification is claimed.
- Local checkout/npm execution is blocked by DNS resolution for github.com. No local tests or build are claimed. Exact-head CI must validate lock consistency, React 19/TypeScript 7/Vite 8 compatibility, unit tests, E2E and all security workflows.

### React 19 / TypeScript 7 first CI correction — 2026-11-15

- Exact PR #139 run [43733896044](https://github.com/iamjpsonkar/Wave/actions/runs/43733896044): `npm ci`, dependency license audit and all 39 Node unit tests passed. Typecheck then failed on two migration issues: React 19's textarea ref is `RefObject<HTMLTextAreaElement | null>`, while EditorEnhancements required the narrower type; TypeScript 7 also requires an explicit declaration for the CSS side-effect import.
- Updated the component prop to accept the nullable ref and added Vite's official `vite/client` type reference in `src/vite-env.d.ts` (which supplies the CSS module shim). No compiler strictness was disabled and no test assertions were changed.
- Exact-head CI must rerun typecheck, production build, Playwright and the full security/container matrix. No pass is claimed for this correction yet.

### Lucide 1.x icon class compatibility — 2026-11-15

- Exact PR #139 run [43734105883](https://github.com/iamjpsonkar/Wave/actions/runs/43734105883): `npm ci`, license audit, all 39 Node tests, TypeScript 7 typecheck and production build passed. Playwright passed 49 of 50 scenarios.
- The only failure was the toolbar icon assertion expecting the old `lucide-file-code2` class. Lucide 1.72 maps the existing `FileCode2` export to an SVG with `lucide-file-code-corner lucide-file-code-2`; the UI label and behavior remained correct.
- Updated the regression assertion to accept the new icon class while still checking that the code-block icon is distinct from the inline-code icon. Fresh exact-head E2E and downstream CI are required.

### TypeScript 7 toolchain compatibility decision — 2026-11-15

- The full PR #139 workflow reached the code-quality job after the functional suite passed. ESLint tooling installation failed because pinned stable `typescript-eslint@8.72.2` declares peer `typescript >=4.8.4 <6.1.0` and rejects TypeScript 7.0.2.
- Did not bypass peer validation or install a canary. Changed the candidate compiler to stable TypeScript 6.0.3, which is inside the supported peer range and is the TypeScript transition release before the native TypeScript 7 compiler. Updated the lock entry using the exact package metadata and integrity from npm-generated TypeScript 6.0.3 lockfiles; removed the TypeScript 7 platform packages.
- TypeScript 7 is deferred until the stable typescript-eslint toolchain explicitly supports it. The current PR must re-run npm ci, license audit, typecheck, build, all 50 E2E tests and the full CI matrix on the new head.

### Coordinated dependency upgrade — full CI success — 2026-11-15

- Final candidate commit: `61831fa21435cb718e2c2d4a7858f7e6ec89f6cf` on `WAVE-0137-npm-upgrades`.
- Workflow [43734814515](https://github.com/iamjpsonkar/Wave/actions/runs/43734814515) completed successfully.
- Functional build: `npm ci`, license audit, 39 Node tests, TypeScript 6.0.3 typecheck, production build and **50/50 Playwright Chromium scenarios** passed.
- Downstream jobs: container configuration/image build, npm audit, Code Quality/ESLint, CodeQL, OSV-Scanner, OpenGrep, Gitleaks and Trivy filesystem/image scans all passed. GitHub Pages deploy was correctly skipped for the PR event.
- Candidate set: Vite 8.3.8 + plugin-react 6.3.0; React/React DOM 19.3.1 + matching type packages 19.3.0; TypeScript 6.0.3; react-markdown 10.1.0; lucide-react 1.72.0. TypeScript 7 is deferred in issue #140 until stable typescript-eslint supports it.
- Candidate license inventory: 161 entries (MIT 142, Apache-2.0 2, ISC 3, MPL-2.0 12, BSD-3-Clause 1, 0BSD 1). MPL-2.0 Lightning CSS notices and source-availability obligations are documented in `THIRD_PARTY_NOTICES.md`; no legal certification is claimed.
- No local build/test was run; all reported verification is from the exact-head GitHub Actions workflow above.

## 2026-11-15 — Current-layout backup regression audit and deduplication (#137 / #103)

- Audited the current `main` test layout rather than porting the obsolete `tests/storage.test.js` branch directly.
- Found two duplicate backup lock-interleaving scenarios and two duplicate copied-snapshot mismatch scenarios in `tests/unit/safety/concurrency.test.js`. Retained one canonical test for each guarantee.
- Added distinct external-source-mutation-during-copy coverage. The fixture mutates the source after the copy read; the test verifies the external edit remains intact, backup creation rejects, and the failed snapshot is absent from `listBackups`.
- Strengthened the successful backup completion test in `tests/unit/storage/trash-backup.test.js` to read the saved snapshot document and compare its exact contents.
- No production storage code changed. The existing implementation already compares before/after source trees and copied snapshot trees and marks failed backups as non-restorable.
- Source review confirms the focused regression cases are present. Tests, typecheck, build and browser suite have **not** been run in this GitHub-only edit; exact-head CI is required. Do not claim execution success until CI completes.

### PR #141 exact-head CI verification — 2026-11-15

- Exact source head `c1e6eeff71bb57d03d294e343aae0c85a0c35e41`; workflow [43737101051](https://github.com/iamjpsonkar/Wave/actions/runs/43737101051) completed successfully.
- Functional gate: `npm ci`, license metadata audit, **38/38 Node tests**, TypeScript typecheck, production build and **50/50 Playwright Chromium scenarios** passed. The new source-mutation-during-copy regression passed as Node subtest 17.
- Container configuration/image build, ESLint, npm audit, OSV, CodeQL, OpenGrep, Gitleaks and Trivy filesystem/image scan all passed. GitHub Pages deployment was skipped as expected for a pull request.
- This verifies exact head `c1e6eeff...`; any subsequent source commit requires a fresh exact-head CI run. No local test/build execution is claimed.

## 2026-11-15 — Markdown navigation and exact-case link audit (#102 / #137)

- Re-audited the closed #102 proposal against current `main`; the old branch was not reused because it targeted a superseded repository layout.
- Corrected stale links in README, Wiki, developer handoff, developer procedure and contributor guide to match the current `etc/`, `docs/` and `howto/` ownership paths.
- Added a dependency-free checker for inline local Markdown links. It checks exact path casing, percent-encoded paths, relative and repository-root paths, and missing targets; external URLs, anchor-only links, code examples and reference-style definitions remain outside its stated scope.
- Added focused parser/path tests and an integration test over maintained repository Markdown. Exposed `npm run test:links`; the existing `npm test` discovery command also includes the integration test.
- CI is required to reveal any remaining broken links outside the initial manual audit. Reference-style navigation and heading-anchor correctness still need manual review.
- No application runtime behavior changed.

### Markdown link checker CI refinement — 2026-11-15

- First exact-head CI run `43738234294` executed the checker and reported stale links in active Wiki, project indexes, feature/priority/product docs, QA bug register and QA how-to. Those current navigation references were repaired against the actual tree.
- The initial scan also found historical path references embedded in dated `etc/history/` development snapshots. These are preserved records of repository state at the time and are now excluded from automated link enforcement; current maintained navigation and tracker documents remain checked.
- The first run's unit suite reached 41 passes and one expected integration failure due to the findings above. A fresh exact-head run is required after the corrections.
- README now documents `npm run test:links`.

### Markdown link checker lint follow-up — 2026-11-15

- Exact-head run `43738426652` passed the functional gate: **42 Node tests**, typecheck, production build and **50/50 Playwright scenarios**; container, npm audit, OSV, CodeQL, OpenGrep, Gitleaks and Trivy passed.
- ESLint found one error in the new checker (a redundant initial assignment) and an unused import. Both were removed. The run therefore remains failed overall until fresh exact-head CI confirms lint and the full matrix.

### Exact-head verification — 2026-11-15

- Source commit `c136c19924593601420478eb55fc00c5d59bd3ec`; GitHub Actions [run 43738815009](https://github.com/iamjpsonkar/Wave/actions/runs/43738815009) completed successfully.
- Functional gate: **42/42 Node tests** (including the three Markdown-link tests), TypeScript typecheck, production build and **50/50 Playwright Chromium scenarios** passed.
- Container/Compose validation and image build, ESLint, npm audit, OSV, CodeQL, OpenGrep, Gitleaks and Trivy filesystem/image scans passed.
- GitHub Pages deployment was skipped as expected for a pull request.
- Local tests/build were not run; this evidence is from GitHub Actions. The subsequent handoff-only documentation commit requires its own exact-head CI before merge.

### Current-main port verification correction — 2026-11-15

- After PR #141 merged, the Markdown audit was recreated on fresh main. The first exact-head run `43739976737` correctly caught six stale Markdown-support/coverage links retained in the merged developer handoff.
- Corrected those references in `DEV_CONTEXT.md` while preserving the PR #141 handoff and history. Fresh exact-head CI is required before merge.



## 2026-11-15 — Security tracker documentation accuracy follow-up

- Reviewed the remaining scope in [issue #120](https://github.com/iamjpsonkar/Wave/issues/120) against current source and security documentation after PR #122.
- Found stale third-party notice statements: the notices described Google Fonts as runtime imports even though the current stylesheet uses a system font stack, and a package-tarball audit limitation still referred to 181 packages instead of the current 161-entry inventory.
- Corrected the notices to label the former Google Fonts families as historical attribution records, state that no Google Fonts CSS/font request is currently made, and align the package-tarball review count with the current inventory.
- This is a documentation accuracy correction only. It does not complete the manual package-tarball/NOTICE legal review, owner-side GitHub security settings, or any future product-security capabilities in #120.
- Source inspection only; no local tests or CI run are claimed. The PR must pass exact-head CI before merge.

## 2026-11-15 — Detect backup mutation during restore (#105)

- Issue: [#105 — external filesystem races and backup/restore fault handling](https://github.com/iamjpsonkar/Wave/issues/105).
- Restore previously checked the copied file count against the backup completion marker, but a same-count source mutation during copying could produce a mixed or stale restored workspace without detection.
- Added SHA-256 tree snapshots around document and asset copying. Restore compares the backup source before/after the operation and verifies the destination tree matches the pre-copy source snapshot.
- Added equivalent consistency checks for `manifest.json` and `settings.json`, including detection of files appearing, disappearing or changing during copy.
- Added a regression that mutates a source backup document after its copy read. The restore must reject, persist a failed marker, and remain blocked by `openWorkspace`.
- Verification is pending exact-head GitHub Actions. No local test/build execution is claimed.
