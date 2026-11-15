# Contributing to Wave

Thank you for helping improve Wave. The project is local-first, user-owned and reliability-sensitive; contributions should preserve those contracts.

## Before changing code

1. Read [DEV_CONTEXT.md](../../DEV_CONTEXT.md) for the current source map, invariants and handoff.
2. Read [architecture](./ARCHITECTURE.md) and the relevant feature, roadmap or Markdown compatibility documentation.
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

- `etc/product/upcoming-features.md` is the complete product blueprint; do not prune agreed scope.
- `etc/product/priority-features.md` controls delivery order, not feature retention.
- `etc/product/FEATURES.md` contains the shipped-feature overview and detailed feature map.
- `../product/ROADMAP.md` tracks delivery phases.
- `etc/history/dev-fixed.md` and `etc/history/dev-build.md` record implementation and verification history.
- `DEV_CONTEXT.md` is the canonical developer handoff and must be updated at the end of each implementation batch.
- Existing UI gap IDs and engineering history are append-only unless the product owner explicitly requests otherwise.

See [the documentation index](../README.md) for the full map.
