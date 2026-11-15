# Test architecture

Node tests are organized by layer and behavior. Keep scenario names outcome-oriented and preserve every independent assertion when moving tests.

```text
tests/
  helpers/
    storage-fixtures.js
  unit/
    diagnostics/
      diagnostics.test.js
    safety/
      concurrency.test.js
    storage/
      workspace.test.js
      trash-backup.test.js
  e2e/
    fixtures/
      workspace.ts
    workspace/
      workspace.spec.ts
    markdown/
      markdown.spec.ts
    editor/
      editor.spec.ts
```

- `unit/storage`: workspace/document operations, Trash, backup and recovery behavior.
- `unit/safety`: concurrency, locking, revision flushes, path safety and stale-workspace guards.
- `unit/diagnostics`: structured event shape, redaction, levels and sink isolation.
- `helpers`: shared in-memory File System Access API fixtures. Fixtures are stateless per test; call `fixture()` for a fresh workspace.
- `e2e`: Playwright user journeys in the Chromium browser. Keep browser-only behavior out of Node unit tests.

Commands:
- `npm test` / `npm run test:unit` — recursively discover all Node unit tests.
- `npm run test:unit:storage` — storage and recovery suites.
- `npm run test:unit:safety` — safety/concurrency suite.
- `npm run test:unit:diagnostics` — diagnostics contract suite.
- `npm run test:e2e` — Playwright browser journeys.
- `./test.sh` — canonical full local gate: Node tests, typecheck, production build and E2E.

To debug one scenario, pass Node's `--test-name-pattern` option through `node --test`; use Playwright's `--grep` option for a browser scenario. Do not weaken assertions to make a flaky test pass; add deterministic fixture control and record operation identifiers instead.


## Diagnostics and failure artifacts

- Production diagnostics default to warning/error output and keep a bounded 200-event in-memory history on the device. Sensitive field names (including document/content, paths, asset names, credentials and user identifiers) are redacted before a record is stored or sent to a sink.
- Root React render failures, uncaught browser errors/rejections and critical workspace operations (open/reopen, document open/save/reload, Trash, backup/restore and asset add) emit structured events with operation IDs and error class only; raw error messages and workspace paths are not copied into diagnostic fields.
- Add `?waveDebug=1` to the app URL to enable info/debug console output. In Settings → Diagnostics, inspect the sanitized report preview, copy it explicitly, or clear the in-memory history. No remote telemetry or persistent diagnostic storage is used.
- Playwright retains traces, screenshots and video on failure, plus an HTML report. CI uploads `test-results/` and `playwright-report/` as `wave-playwright-diagnostics` for 14 days. The trace includes browser console and network activity; inspect it alongside the failing file/scenario name.


## Layering rationale and review follow-up

- The Node tests are storage contract tests: workspace/document/assets, Trash/backup/restore, plus concurrency/recovery primitives. They share the in-memory File System Access adapter, so a distinct Node integration layer would currently duplicate setup without representing an independent runtime boundary. Browser-visible cross-module journeys remain in Playwright E2E.
- Storage files split by behavior: workspace/document/assets versus Trash/backup/restore. Further splits should follow a cohesive scenario inventory, not file length alone.
- Each browser context receives a unique OPFS directory. Separate tests/retries cannot encounter stale files; multi-tab scenarios reopen the same workspace through the app's remembered folder handle.
- Diagnostic metadata has strict key-specific value vocabularies. Unknown strings redact regardless of field name. Error messages and bounded causes are sanitized; raw stack frames are intentionally omitted to avoid leaking filesystem paths, URLs or user content.


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
