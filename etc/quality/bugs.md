# Wave — Current Open Bugs

> Repository: https://github.com/iamjpsonkar/Wave  
> Branch: `main`  
> Source review baseline: `268de12338bce554f18e5feef27acbb5e9ea45fe`  
> Review date: 2026-11-14  
> Scope: only current reproducible/source-supported defects and material reliability/QA gaps.

## Rules

- This file contains only findings that remain open in the current implementation.
- Resolved findings and their regression scenarios belong in [fixed-bugs.md](./fixed-bugs.md).
- Preserve original WAVE IDs if a finding regresses; never create a duplicate for the same root cause.
- Do not record planned features, preferences, or speculative risks as confirmed bugs.
- Distinguish source review, test definitions, CI execution, and manual/native-environment verification.
- Recheck [fixed-bugs.md](./fixed-bugs.md) during every QA pass.

## Current summary

- **2 open findings:** WAVE-031 and WAVE-039.
- **30 Node test definitions** and **28 Playwright Chromium scenarios** are present in the current test sources.
- The OPFS E2E fixture simulates the File System Access permission contract; it does not exercise the native OS folder picker or OS-level permission revocation.
- Baseline CI run [43618454015](https://github.com/iamjpsonkar/Wave/actions/runs/43618454015) passed Node tests, typecheck, production build and all 28 Playwright scenarios before the later diagram-accessibility patch.
- Diagram-accessibility patch CI exposed a failing accessible-name assertion. Commit `268de12338bce554f18e5feef27acbb5e9ea45fe` corrects the sequence diagram to use its Mermaid title as its SVG accessible name. Verification of that correction is pending; do not count it as passed until a new workflow completes.

---

## WAVE-031 — Native picker, external filesystem and lifecycle QA coverage remains incomplete

- Priority: **P1** | Confidence: **Confirmed coverage gap**
- Affected areas: File System Access integration, workspace operations, browser lifecycle and accessibility.
- Relevant files: `src/App.tsx`, `src/storage.ts`, `tests/e2e/workspace.spec.ts`, `playwright.config.ts`.

### Current behavior and gap

The checked-in suite covers workspace creation/autosave, recovery-draft reload, Trash and backup restore, root/nested attachments, mobile navigation, simulated permission denial, same-workspace two-tab editing, and targeted Markdown accessibility behavior.

The browser fixture uses OPFS directory handles and stubs the folder-picker gesture. It does not exercise the real native folder picker, native permission prompts or OS-level permission revocation. External filesystem edits racing active reads/writes/backups/restores and full browser-process termination are also not covered. Current accessibility checks are focused smoke tests, not a complete keyboard, screen-reader or WCAG audit.

### Impact

The existing tests do not establish safe behavior for all native permission transitions, external-writer races, abrupt process termination or comprehensive accessibility paths. These are release-confidence gaps; they are not evidence that every uncovered path currently fails.

### Recheck scenarios

1. Where supported by the browser runner, exercise the real user-picked-folder prompt, permission revocation and reauthorization.
2. Modify Markdown/assets externally while Wave reads, saves, backs up or restores; verify no silent overwrite or inconsistent snapshot.
3. Exercise keyboard-only navigation, focus order/restoration, accessible names and representative screen-reader semantics across the workspace and Markdown preview.
4. Terminate the browser process during an IndexedDB journal transaction and verify the documented recovery behavior.
5. Retain the current 28 Chromium journeys, 30 Node tests, simulated permission denial and two-tab regression scenarios.

### Expected behavior and fix direction

Keep deterministic OPFS/Node coverage, then add browser-supported native permission integration, external-edit fault injection, focused accessibility automation/manual review and lifecycle fault injection. Document unsupported platform cases rather than silently treating simulated permission tests as native coverage.

### Verification boundary

This is an open QA coverage gap. The 28-scenario baseline CI passed in run [43618454015](https://github.com/iamjpsonkar/Wave/actions/runs/43618454015), but the diagram-accessibility follow-up requires its own successful CI run. Native picker/revocation, external filesystem race and actual process-kill cases remain unverified.

---

## WAVE-039 — Abrupt termination can occur before the recovery-draft transaction commits

- Priority: **P1** | Confidence: **High; browser lifecycle dependent**
- Files: `src/App.tsx` — draft autosave and lifecycle handling; `src/draftJournal.ts`.

### Current behavior and gap

Wave starts the IndexedDB journal write in the editor input handler, requests strict transaction durability where supported (with a compatibility fallback), retries best-effort writes on `visibilitychange` and `pagehide`, and distinguishes pending from committed recovery status.

IndexedDB is asynchronous. If the browser process is terminated after input but before the transaction commits, the newest edit can still be lost. Lifecycle events are best-effort and cannot guarantee a final write. Existing Playwright coverage verifies recovery after a completed journal commit and checks the strict durability option; it does not simulate an OS-level process kill before commit.

### Recheck scenarios

1. Type a unique marker and terminate/reload immediately, at controlled intervals, and while the journal transaction is pending.
2. Reopen the workspace and verify the marker is either in the Markdown file or available as a recovery draft.
3. Repeat with rapid edits and delayed/out-of-order transaction completion.
4. Retain the committed-draft reload and strict-durability regression scenarios.

### Expected behavior and fix direction

Never report a recovery draft as committed until its IndexedDB transaction completes. Keep the input-path write, strict durability where supported and explicit pending/committed UI state. Add controllable transaction-delay and lifecycle fault injection where the browser runner permits it. Do not claim crash-proof durability: no asynchronous browser storage transaction can protect data if the process dies before commit.

### Verification boundary

The residual pre-commit loss window is an inherent asynchronous durability limitation and remains open. Existing tests cover post-commit recovery and strict durability configuration, not actual process termination before commit.
