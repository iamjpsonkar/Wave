# Contributing to Wave

Thank you for helping improve Wave. The project is local-first, user-owned and reliability-sensitive; contributions should preserve those contracts.

## Before changing code

1. Read [DEV_CONTEXT.md](DEV_CONTEXT.md) for the current source map, invariants and handoff.
2. Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and the relevant feature, roadmap or Markdown compatibility documentation.
3. Inspect the current implementation and tests on the target branch. Do not rely on old commit notes as proof that current code behaves the same way.
4. Keep changes focused and preserve existing product scope and engineering history.

## Development setup

- Node.js 22.6+ and npm.
- Chromium or Edge for the intended browser filesystem workflow.
- Docker Engine and Compose v2 only when working on the container deployment.

```bash
npm ci
npm run dev
```

## Required checks

Run the checks relevant to your change:

```bash
npm test
npm run typecheck
npm run build
```

For browser-facing changes, also run the Playwright suite:

```bash
npm install --no-save --package-lock=false @playwright/test@1.55.0
npx playwright install chromium
npm run test:e2e
```

For container changes:

```bash
docker build -t wave:local .
docker compose config
docker compose up --build -d
docker compose ps
docker compose down
```

Do not claim a check passed unless it was actually executed. Report any unrun checks and environment limitations.

## Non-negotiable engineering invariants

- Saved documents and assets remain in the user's selected workspace; do not introduce uploads or remote processing without an explicit product decision.
- Keep filesystem/storage operations in the storage adapter, not React components.
- Never silently overwrite user data. Preserve collision checks, external-edit detection, verified backups, recoverable Trash and restore safety.
- Treat workspace paths and Markdown as untrusted input. Keep preview sanitization and external-link protections.
- IndexedDB is for browser-local handles and temporary recovery drafts, not the canonical document store.
- Keep migrations explicit, repeat-safe and verified. Do not remove source Markdown before a migration is verified.
- Preserve keyboard access, responsive layouts, focus behavior and accessible labels.
- Add regression tests for changed behavior and failure paths.

## Documentation and scope registers

Keep each document's purpose intact:

- `upcoming-features.md` is the complete product blueprint; do not prune agreed scope.
- `priority-features.md` controls delivery order, not feature retention.
- `FEATURES.md` contains the shipped-feature overview and detailed feature map.
- `docs/ROADMAP.md` tracks delivery phases.
- `dev-fixed.md` and `dev-build.md` record implementation and verification history.
- `DEV_CONTEXT.md` is the canonical developer handoff and must be updated at the end of each implementation batch.
- Existing UI gap IDs and engineering history are append-only unless the product owner explicitly requests otherwise.

See [the documentation index](docs/README.md) for the full map.

## License and contributions

Wave is distributed under the [MIT License](../../LICENSE) (SPDX identifier: `MIT`). The license permits use, modification and redistribution, including commercial use, subject to retaining the copyright and license notices. The complete terms are in the repository-root [LICENSE](../../LICENSE) file.

By submitting a contribution for inclusion in Wave, you agree that the contribution is made available under the project's MIT License. You retain copyright in your contribution; this statement does not assign copyright to the project owner. No Contributor License Agreement (CLA) or Developer Certificate of Origin (DCO) is currently required. Do not add either requirement without an explicit project-owner decision.

## Third-party dependency and asset changes

Any dependency, font, icon, image, logo, copied snippet, documentation excerpt, sample, or media asset added or updated in Wave must have a traceable source and license. Before submitting the change:

1. Update `package-lock.json` through npm and run `npm run license:audit`.
2. Inspect the exact upstream LICENSE and applicable NOTICE/attribution records for changed packages; package metadata alone is not proof of compliance.
3. Record new/changed packages and assets, exact versions or source revisions, license identifiers, source links, attribution and redistribution requirements in [THIRD_PARTY_NOTICES.md](../../THIRD_PARTY_NOTICES.md).
4. Preserve upstream notices and escalate missing, custom, conflicting or unclear terms to the project owner. Do not silently relicense, remove, or substitute third-party material.
5. Include the audit result and any remaining legal/attribution questions in the PR.

CI runs the metadata audit for every pull request. A passing check is not a legal compatibility opinion and does not replace manual review.

For dependency changes, update the committed machine-readable inventory at `etc/legal/dependency-license-inventory.json` with `npm run license:audit:update` only after reviewing the new/changed packages' exact upstream terms. Review the complete JSON diff and commit it together with the lockfile and any required attribution changes. CI rejects an out-of-date inventory.

## Commit scope and documentation

Keep each task's implementation and its documentation together. The default is one cohesive commit containing related source changes, tests, configuration and the relevant Markdown updates (including the appropriate development history and handoff when applicable). Do not create a separate documentation-only commit for docs that explain the same implementation. Minimize commits without combining unrelated work; split only genuinely independent reviewable phases. Review the complete diff before pushing, and verify CI against the exact pushed commit. Amend unshared commits when needed; never rewrite shared main history. See [AGENTS.md](../../AGENTS.md) for the full agent commit policy.

