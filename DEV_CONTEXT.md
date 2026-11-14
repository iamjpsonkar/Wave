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


## 13. Markdown showcase gap audit — 2026-11-14

- Audited the complete user-provided 20-section Markdown Feature Showcase against the current renderer, App preview wiring, styles, templates, `docs/MARKDOWN_SUPPORT.md`, `features.md`, `docs/FEATURES.md` and E2E test source.
- Conclusion: Markdown is **not feature-complete** against that showcase. Existing support includes common Markdown/GFM, alert callouts, wiki links/backlinks, local images, heading anchors, a small MathML subset and simple Mermaid flowcharts.
- Created [features-gap.md](./features-gap.md) as the canonical itemized gap/acceptance checklist. Major gaps: full LaTeX/math grammar, advanced Mermaid diagram families and syntax, syntax highlighting/diff coloring, safe HTML-like inline formatting and collapsible sections, emoji shortcodes, GitHub mention/issue references, Graphviz/PlantUML/Vega/D2/AsciiDoc renderers, media embeds, duplicate-heading slugs, and broader accessibility/conformance coverage.
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
- Updated `features.md`, `docs/FEATURES.md`, `docs/MARKDOWN_SUPPORT.md`, `README.md`, `dev-fixed.md` and `dev-build.md`.
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
- Current source defines **30 Node tests** and **28 Playwright Chromium scenarios**.
- Baseline workflow [43618454015](https://github.com/iamjpsonkar/Wave/actions/runs/43618454015) passed Node tests, typecheck, production build and all 28 Playwright scenarios.
- The diagram accessibility follow-up initially failed because the sequence SVG used a generic accessible name. Fixed in `268de12338bce554f18e5feef27acbb5e9ea45fe`; workflow [43619577306](https://github.com/iamjpsonkar/Wave/actions/runs/43619577306) was still running at this handoff. Verify latest-main CI before claiming the accessibility correction fully passed.
- Detailed current state: [bugs.md](./bugs.md), [fixed-bugs.md](./fixed-bugs.md), [features-gap.md](./features-gap.md), [dev-build.md](./dev-build.md) and [dev-fixed.md](./dev-fixed.md).


## 24. Markdown image accessibility and fallback behavior — 2026-11-14

- Picked the next core compatibility/accessibility item from `features-gap.md`: image alt semantics, decorative empty-alt handling, broken-image fallback, and reference-style linked images.
- `src/App.tsx` / `LocalMarkdownImage`: loaded images preserve explicit Markdown alt text and title; when alt is omitted, the title (or a neutral unavailable label) supplies a fallback name. Missing informative images render a visible `role="img"` fallback with an accessible name. Explicit empty-alt images remain decorative, including when the asset is missing (`role="presentation"`, `aria-hidden="true"`).
- `tests/e2e/workspace.spec.ts`: added a browser scenario for a local image, decorative image, missing informative/decorative assets, reference-style linked image metadata, and keyboard focus on the wrapping link. Corrected the previous accessibility smoke test's broad DETAILS-summary selector, which CI showed also matched the Mermaid source disclosure.
- Updated `docs/MARKDOWN_SUPPORT.md`, `features.md`, `features-gap.md`, `dev-fixed.md` and `dev-build.md`. Full WCAG/screen-reader certification remains open.
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
- `ui-gaps.md` now records UI-001/UI-012 as **Implemented — CI pending**; all other IDs and acceptance scope remain open. `docs/FEATURES.md` reflects the partial settings capability.
- No test pass is claimed until the new main-branch workflow completes. Full contrast/accessibility review and broader diagnostics remain open.

- Follow-up: dialog focus is contained (Shift+Tab/Tab wrap) and Escape dismisses it; preference writes expose saving/saved/failure status. UI-003 is now **Partially implemented — CI pending** due to the centered 860px default and width choices; responsive/wide-code/table verification remains open.

- Final UI-gap wording was reconciled so implemented settings are not still described as wholly unavailable; UI-003 remains partial and all other IDs remain open. E2E now checks Escape dismissal as well as focus wrapping.


## 27. UI toolbar icon distinction and dark-theme parity — 2026-11-14

- Re-read `DEV_CONTEXT.md`, `ui-gaps.md`, current `src/App.tsx`, `src/styles.css`, `tests/e2e/workspace.spec.ts`, package dependencies and the latest source history before implementation.
- `src/App.tsx`: replaced duplicate code action icons. Inline code remains `Code2` and is named `Inline code`; fenced code now uses Lucide `FileCode2` and is named `Code block`.
- `src/styles.css`: added explicit dark and system-dark styles for Markdown heading/body, fenced/inline code, links, blockquotes, tables, dividers, toolbar, Edit/Preview segmented control, Backup and sidebar wordmark.
- `tests/e2e/workspace.spec.ts`: added 2 Playwright scenarios for unique toolbar icon/label/insertion behavior and system-dark Preview colors. E2E source count 33; Node source count 30.
- `ui-gaps.md`: reconciled source evidence to current HEAD `4713725f0e09efae0d0b8e6c9da880f5513e18ca`; UI-004 is partially implemented pending regression, UI-016/017 source mitigations await visual regression, UI-018/019 partial, UI-020 partial. UI-001/012 source implementation awaits QA; UI-003 responsive QA remains open. All 20 IDs preserved.
- No tests or build are claimed to pass until the latest main workflow reports success.

- Test review follow-up: toolbar insertion regression now selects actual text before wrapping it in inline/fenced code, matching the current selection-based implementation. UI gap headings/order were rewritten to reflect implemented source behavior and the remaining verification work without dropping IDs.


## 28. UI feature backlog from spreadsheet-toolbar reference — 2026-11-14

- Created `ui-features.md` as an additive UI proposal backlog based on the supplied spreadsheet-toolbar screenshot and inspection of current Wave editor source.
- Captures Markdown-editor improvements (undo/redo verification, document-local find, responsive toolbar grouping/overflow, heading styles, shortcut hints, safe insertion/table/link workflows, document statistics, zoom/focus mode and contextual formatting state).
- Separates spreadsheet-only controls (number formats, cell formatting, grid controls, formulas/sort/filter/charts) into a future dedicated sheet UI, aligned with `priority-features.md` P2.3; these are not proposed for the Markdown editor toolbar.
- Includes stable UIF-001–UIF-021 IDs, priorities, current-state notes, acceptance criteria, dependencies, delivery order and relationships to existing planning documents. All are proposals, not shipped features.
- No application code, existing gap tracker, product catalogue or tests were changed. No test/build/CI result is claimed for this documentation-only task.
- Backlog commit: `d9211992d04fd3510f93cc546b814c5a067798d5`.

## 29. UI-020 theme and responsive regression foundation — 2026-11-14

- Re-read this handoff, `ui-gaps.md`, `dev-fixed.md`, `dev-build.md`, current source, Markdown renderer and Playwright suite before implementation.
- Latest main documentation HEAD before this handoff update: `6084b20582eab22b4a2ecc5dea27d14b0dfefa73`. UI styles commit: `cfb73c72ae17671e893e564688a2324180cbbb6e`; E2E matrix commit: `b729eea18aa7f9297bd977110837c58c6a6ef03f`.
- `src/styles.css`: added explicit dark/system-dark surfaces and text colors for Markdown alerts, DETAILS disclosures, math and fallback panels, Mermaid diagrams, syntax/diff tokens, missing-image fallbacks, copy controls and Settings dialog controls. Explicit Light mode remains independent of OS dark preference.
- `tests/e2e/workspace.spec.ts`: added UI-020 matrix for Light/Dark/System × Edit/Preview × desktop/mobile (12 states), covering headings, links, inline/fenced code, tables, alerts, disclosures, math, Mermaid and missing-image fallback. Checks computed styles and horizontal overflow at 1440px and 390px.
- E2E source inventory is now **34 scenarios**; Node source remains **30 tests**. No local runner is available through the repository connector; no tests, typecheck or production build are claimed to have passed. Check Actions for the latest code commit before asserting verification.
- `ui-gaps.md`, `dev-fixed.md` and `dev-build.md` record the implementation and pending status. UI-020 remains open pending CI and visual review; UI-005 contrast/WCAG audit, UI-014 broader breakpoints, UI-018/UI-019 full dialogs/popovers/navigation audit and screenshot-diff baselines remain open. All existing UI IDs and the complete product catalogue are preserved.
- Open reliability findings remain WAVE-031 and WAVE-039; WAVE-042 remains fixed. No bug trackers were changed.
- UI-020 test-source follow-up: simplified the horizontal-overflow assertion in commit `5b110945a45596de28c13f34435816a87907089f`; `dev-build.md` records this follow-up. The repository connector did not expose a push-triggered workflow run or combined status for this commit, so CI remains unverified.
- Latest developer handoff update follows the UI-020 implementation: styles `cfb73c72ae17671e893e564688a2324180cbbb6e`, initial matrix `b729eea18aa7f9297bd977110837c58c6a6ef03f`, assertion follow-up `5b110945a45596de28c13f34435816a87907089f`. UI-020 remains open pending actual CI and visual review.
 
## 30. Remaining UI implementation batch — 2026-11-14

- Re-read the current `DEV_CONTEXT.md`, `ui-gaps.md`, `dev-fixed.md`, `dev-build.md`, `docs/FEATURES.md`, current App/styles/Markdown source and the E2E suite before continuing. Existing IDs, feature inventory and reliability findings were preserved.
- Latest documentation HEAD after this batch: `f16e7120f63a55b2d18cd6ef875270595e8fe176`. UI register commit: `82117c34564e1c40365ba6fffb9947f4b3dfef37`; dev fix log: `6eef51e741a24ee8ec972696effb604411b66e9b`; build log: `3fd818f18d277cdd56aacf5949d6e21998d1965e`.
- `src/EditorEnhancements.tsx` adds bounded in-memory per-page undo/redo, editor-local find/case-sensitive navigation/replace/replace-all, heading outline with Edit/Preview jump, and live word/character/reading-time statistics. History and literal replacement follow-ups: `eec6dda2a2684734b59b34b26073f20bcfffdd78`, `91f52d341feec3274551fba0ab122affcf4e70c1`.
- `src/App.tsx` integrates the tools through `handleEditorChange` so existing recovery/autosave behavior is retained; adds clickable folder breadcrumbs, polite live save status, searchable/preview-first template gallery, Escape dismissal and accessible names for all primary formatting toolbar actions. Key commits: `0e4bc6b89344f1a09c880322797eff8d9ff60f28`, `2913af688afc024af3739b3980284e5476547273`, `cb278bce391d0c3a116724496bde88f385ef3a0c`, `ee9ba2c16d0c65e136b2e081c5545c75a0424d21`, `e753495c0d44f35c1a8bdbef5d19b5be59694454`, `4ec982c5e64bb93e224017ab2d6036a4a8169629`.
- `src/styles.css` improves functional text sizing/focus rings, narrow responsive layout, template preview, editor tools, dark secondary surfaces and System-light color handling. Relevant latest CSS commits: `48a1ec34f15598295936e0b01abe535224645fbd`, `13b43c119c9bf20a15dddbe9a097c8178759050b`, `6dab14ef3cc0014d0eb08389c88b14738d19e6b3`, `f9cc770fb54e7165e1f37103bfee9148bb26b3d5`, `bda620165c5264fab0ccda1999aa568690963b87`.
- `tests/e2e/workspace.spec.ts` adds editor productivity, searchable template preview and nested breadcrumb scenarios. UI-020 now has 3 appearance modes × 2 editor modes × 5 viewport widths (320, 390, 768, 1024, 1440) = **30 states**, computed body/heading contrast assertions at 4.5:1, and page-overflow checks. E2E inventory is **37 scenarios**; Node suite source remains **30 tests**. Regression commits include `632cb75a5693e851937a59ad5958e9c9117f88b5`, `c26e88ec26dfb0e24f84b0c90e4eb525f7cc62b8`, `a1ca18cbb2e987e2725de241e4807a7e01627bf8`, `63de70f23a9379018e22a3107a25db38fce1fff8`.
- `ui-gaps.md` now includes an authoritative 20-ID implementation status table; `dev-fixed.md`, `dev-build.md` and `docs/FEATURES.md` were updated. UI-002 remains open because a genuine optional rich block editor and lossless Markdown round-trip are not delivered. UI-005, UI-018/UI-019 and other named QA items remain partial pending CI/manual review.
- The repository connection did not expose a current push-triggered Actions run or combined status, and no local dependency install/test runner is available in this GitHub-only path. **Do not claim tests, typecheck, production build, screenshot review or CI passed.** All new source and tests are committed; verification is pending.
- Open reliability findings remain WAVE-031 and WAVE-039; WAVE-042 remains fixed. No bug trackers were changed.

 
## 31. UI-002 optional source-preserving block mode — 2026-11-14

- Continued the remaining UI backlog after re-reading this context and the authoritative UI register. Added a separate optional Blocks mode without replacing the Markdown source editor or Preview.
- `src/MarkdownBlockEditor.tsx`: classifies headings, paragraphs, lists, quotes, callouts, fenced code, tables, dividers, image lines and attachment links. Each block textarea edits only its original source range; unedited Markdown and blank-line separators remain intact.
- `src/EditorEnhancements.tsx`: added a distinct Blocks icon/control and extended undo/redo shortcuts to block textareas. `src/App.tsx` integrates the mode through the existing recovery-aware handler. `src/styles.css` adds responsive and theme-aware block surfaces, including System-light legibility.
- E2E regression edits a paragraph block then verifies exact source preservation for the rest of the document, including heading, list, callout and fenced code. E2E source inventory is now **38 scenarios**; Node suite source remains **30 tests**.
- Implementation/test commits: component `78e2887d069b6471610b23f341d5178a02c3e12b`; App integration `15928f7956e2fae4934e730a4c99e0eee3cf97ea`; CSS `5ff104ba9f1315b13cc5b40f4dad59f47ea4fcbe`; E2E `2c95631c21f27faad50f4f49bb038a4c7bdb1b1d`; source/test follow-ups `cc6809086922947ae4f32e4eaf47257f93c66073`, `e0d901711430355b06f7c870453484d88099a886`, `760ec73b51361826be00ee653c441d72bca65e28`, `6c9cb3f7b0862fd20253da75a10c263fe215add3`, `41c8adefd98ef00d5ba38867a0e828cd626554a8`.
- UI-002 is now partially implemented, not complete: block reordering/drag-drop, handles, slash menu, bookmarks/embeds and rich inline formatting remain. UI register and development logs record this honestly.
- `ui-gaps.md`, `dev-fixed.md`, `dev-build.md` and `docs/FEATURES.md` are updated. Latest dev logs: `54e81395ec9fd0f67e1907254c73e58420a5bc6f` and `8ae1d16d15034fd495b110cdf8449ef5fc74554a`.
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
- docs/FEATURES.md records block mode as partial. ui-gaps.md updates UI-002 and UI-018 while retaining every original ID and remaining acceptance criterion. dev-fixed.md and dev-build.md contain implementation and verification notes.
- Source commits: block insertion/reorder 9e4f29390447dcdbd43f80098da522385a270448; drag handle 7057ce25861bffce43ee05ce5f8afb305ae1d0e8; dialog focus 290f926c92caffe64d2ac34f1eea483df015f464; tests 8bb74c69ec4c9adad7d59c0e34e869224742fa42, f292e32e853fce640d44f05f554ee4bce1cbba72, b90369be8ef6ba66ab95f84f5e609b406afd87f7; styles 6bbd015307f55a0e385b6f041d383bdb07e6e87c, 93bdd45f2fe17bda2375cb0a41c8f2f7f9e6ca62.
- Documentation commits: UI register af7db39acbc456fd3d929dc092f2eabdb2aa9320; dev fix log 6adb102cc0e1d6066e2ad222fcd7c823010d43a5; build log 3f71424b8169aa510a406302a912d9003e5defaf; feature map 9cc459e91e5b1588526c1371084501dea12d3db0.
- Remaining UI-002 scope: slash-triggered block menu, bookmarks/embeds and rich inline editing. UI-018 still needs focus restoration and complete dialog/popover/disabled/error visual and accessibility review. UI-005/UI-014/UI-020 still need actual browser visual/accessibility verification; no existing UI ID or catalogue requirement was removed.
- Verification: no local tests, typecheck, production build or screenshot review was run. Combined status and associated workflow-run lookups for latest code commit 93bdd45f2fe17bda2375cb0a41c8f2f7f9e6ca62 returned empty arrays. **No pass is claimed.** Latest test evidence remains the historical CI recorded in dev-build.md; refresh Actions before release decisions.
- This handoff update is the final documentation step for this task.

- Documentation-reference correction after the UI log update: dev-fixed.md `34a1d666fd1ca924943ea8bffd332ed3ceee873c`; dev-build.md `f052a4a9bb3b4e113b700bb20d9cc809387b4c18`. This context entry is the final documentation update.

- Feature inventory reconciliation: docs/FEATURES.md now consistently records keyboard/drag reorder, handles, deletion and common-block insertion as implemented, with slash menu, bookmarks/embeds and rich inline editing still partial. Commit `0cfb8174e688e31f866ae4d44e2c98cf8cf21393`. This is the final documentation step.
