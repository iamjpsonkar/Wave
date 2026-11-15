# Test suite layout

The storage regression suite remains in `tests/storage.test.js` until its scenarios can be split with a verified one-to-one inventory. It includes storage, recovery, backup integrity, permission simulation and concurrency guarantees; do not duplicate or remove scenarios during future extraction.

Typed diagnostic API tests live in `tests/unit/diagnostics/diagnostics.test.js`.

Commands:
- `npm test` — complete Node test suite (same command used by `./test.sh` and CI).
- `npm run test:unit:storage` — storage, recovery and safety regression suite.
- `npm run test:unit:diagnostics` — diagnostic API tests.

The browser E2E suite is under `tests/e2e/` and runs with `npm run test:e2e`.
