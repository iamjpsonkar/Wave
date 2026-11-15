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
