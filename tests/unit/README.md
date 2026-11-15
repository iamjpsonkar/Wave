# Unit test suites

- `storage/workspace.test.js`: filesystem workspace behavior, persistence, Trash, backups, restore and integrity cases.
- `safety/concurrency.test.js`: pure path, generation, revision, draft selection and per-workspace queue behavior.

Run all unit tests with `npm test`, or focus with `npm run test:unit -- tests/unit/safety`.
