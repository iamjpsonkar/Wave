# Wave — QA Context

> Repository: https://github.com/iamjpsonkar/Wave  
> Branch: `main`  
> Last QA recheck: 2026-11-14  
> Scope: source review of current default-branch files, open bug register, and fixed-bug regression baseline.

## Current disposition

- **WAVE-031 — OPEN / PARTIAL (P1):** native user-picked-folder permission prompt and OS permission revocation are not exercised. External filesystem edits during active read/save/backup/restore, comprehensive keyboard/screen-reader accessibility, and actual browser-process termination are also not covered.
- **WAVE-039 — OPEN / PARTIAL (P1):** IndexedDB journal writes request strict durability and are attempted on `pagehide` / hidden visibility, but the transaction is asynchronous. A process kill before commit can still lose the latest keystroke.
- **WAVE-042 — FIXED in source:** per-tab draft records and current-tab-only clearing are implemented; the cross-tab E2E scenario verifies both edits remain represented and that recovery provenance is shown.
- No newly confirmed regression was found in the source paths reviewed. Do not close WAVE-031 or WAVE-039 based on source inspection.

## Current test inventory (source, not execution)

- `tests/storage.test.js`: **30** Node test definitions.
- `tests/e2e/workspace.spec.ts`: **13** Playwright Chromium test definitions.
- E2E fixture: Origin Private File System (OPFS) directory handles; `showDirectoryPicker` is replaced with a fixture and permission query/request behavior is simulated.
- Current E2E coverage includes workspace creation/autosave, reload recovery, Trash round trip, root/nested attachments, mobile navigation, backup/restore, strict IndexedDB durability request, simulated permission denial, same-workspace two-tab edits, cross-tab recovery provenance, Markdown sanitization/GFM, command palette keyboard execution, and wiki links/backlinks.
- Historical CI evidence in `dev-build.md` reports 30 Node tests and 10 E2E scenarios passing for commit `09021ed224f739fd66325bb8f6cc8f1bcca5b142`. That run does **not** establish that the current 13-scenario E2E suite passed.

## Files reviewed

- `bugs.md` and `fixed-bugs.md` (including historical regression scenarios)
- `src/App.tsx`, `src/draftJournal.ts`, `src/storage.ts`, `src/safety.ts`
- `tests/storage.test.js`, `tests/e2e/workspace.spec.ts`, `.github/workflows/ci.yml`, `playwright.config.ts`
- `package.json`, `DEV_CONTEXT.md`, `dev-build.md`, `dev-fixed.md`

## QA limitations and next verification

This was a **source-only recheck**. No repository checkout, local test execution, browser run, native picker interaction, accessibility audit, or fresh GitHub Actions result was available in this pass. Do not report tests as newly passed.

Next:
1. Run `npm ci`, `npm test`, `npm run typecheck`, `npm run build`.
2. Install the CI-matched Playwright version and Chromium, then run `npm run test:e2e`.
3. Add supported native picker/revocation integration tests, external filesystem race/fault injection, keyboard/accessibility checks, and controlled process-termination tests.
4. Recheck every `fixed-bugs.md` scenario when its related code changes; reopen the original WAVE ID on any regression.
5. Keep `bugs.md` limited to currently reproducible/source-supported findings. Do not move WAVE-031 or WAVE-039 to fixed until the remaining failure windows/coverage criteria are addressed and verified.
