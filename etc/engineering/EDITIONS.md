# Wave editions — Personal and Full

> **Status:** Approved architecture; implementation not started (2026-11-15).  
> **Tracking:** [Issue #135](https://github.com/iamjpsonkar/Wave/issues/135).  
> **Authority:** Elaborates, and does not replace, the [product constitution](../product/upcoming-features.md#20-wave-product-constitution--decisions-based-on-the-product-owners-answers).

## 1. Decision

Wave will ship two editions from one shared codebase:

- **Wave Personal:** local-only, no backend dependency, no user-document uploads, no server database, no accounts, no remote sync or collaboration service.
- **Wave Full:** all Personal local/offline capabilities plus optional identity, encrypted multi-device synchronization, collaboration and connected integrations.

Full supports disconnected/hybrid use and cloud-connected use. “Cloud-connected” is preferred to “cloud-first”: local workspaces remain usable offline and local storage remains the durable source on each device. Hosted services coordinate access and transport encrypted data; they do not become a mandatory central store of readable documents.

This preserves product constitution sections 20.2–20.5. The planned canonical workspace is a versioned local SQLite database with ordinary asset files. The current Markdown-based MVP remains readable and must be migrated safely. SQLite, identity, sync and collaboration are not implemented today.

## 2. Capability matrix

| Capability | Personal | Full |
|---|---|---|
| Local workspace and assets | Yes | Yes |
| Offline create/edit/search | Yes | Yes |
| Local backup, restore, import/export | Yes | Yes |
| Local SQLite workspace (planned engine) | Yes, when implemented | Yes, when implemented |
| Account / identity | No | Optional |
| Device enrollment | No | Optional |
| Remote discovery / signaling | No | Optional |
| Encrypted synchronization | No | Optional per workspace |
| Collaboration, presence, comments | No | Optional |
| Integrations / hosted notifications | No | Optional, permission-scoped |
| Upload readable documents to Wave server | Never | Never by default; not part of this architecture |
| Store/relay encrypted payloads | No | Optional, separately disclosed and consented |
| Telemetry / analytics | No | Off by default; separate product approval and consent required |

This is a target capability contract, not a shipped-feature list. Each capability remains planned until implemented and verified.

## 3. Data ownership and trust boundaries

### Personal data flow

1. Static hosting delivers application assets only.
2. The user explicitly chooses a local workspace.
3. The application reads and writes workspace data locally.
4. Browser-local state is limited to documented transient recovery/handle data.
5. No Wave application service receives document text, assets, metadata, drafts or keys.

Personal must be usable after initial application delivery with network access disabled. Do not include Full service clients, credentials, sync queues, background workers or account UX in the Personal bundle.

### Full data flow

1. The local workspace remains the durable, offline-readable copy on each device.
2. Identity/control-plane services may manage account identity, device public keys, workspace membership metadata, authorization, discovery, signaling, presence and notification routing.
3. Before sync data leaves a device, the client encrypts it end-to-end. Services must not receive plaintext workspace keys or readable document payloads.
4. Direct peer transport is preferred where practical. A relay may forward ciphertext. Optional relay/object storage may retain ciphertext only when explicitly enabled and disclosed.
5. A service outage must not prevent local reading, editing or saving. Pending operations remain in a bounded local queue until safe retry or user-visible conflict handling.
6. TLS protects transport; it is not a substitute for end-to-end encryption.

Do not describe the system as zero-knowledge until the protocol, metadata exposure, key lifecycle, implementation and independent review justify that claim.

## 4. Shared-codebase and build isolation

- Share domain types, editor UI, local storage abstractions, validators and serialization where safe.
- Keep edition-specific capabilities behind explicit interfaces and separate entry points/build targets.
- Personal's dependency/import graph must exclude Full API/auth/sync/telemetry modules. Hiding controls with a runtime flag is insufficient.
- Build-time edition selection must fail closed on unknown or missing configuration.
- The Full server must authorize every request independently; UI visibility and client-side checks are not security controls.
- Never place server secrets or privileged service credentials in either browser bundle.
- Do not make Personal depend on Full endpoints for startup, licensing checks, updates, error reporting or feature discovery.
- Generate a machine-inspectable bundle/dependency report for both targets.

Suggested future targets are `build:personal` and `build:full`. The existing `npm run build` must retain a documented deterministic default and must not silently change edition.

## 5. Required interfaces

Extract interfaces before adding online services:

- `WorkspaceStorage`: open/create, read/write, move, trash/restore, list/search, backup/restore, import/export and integrity diagnostics.
- `IdentityProvider`: sign-in/out, session refresh, device enrollment/revocation and account deletion.
- `SyncTransport`: encrypted envelope send/receive, retry, ordering, acknowledgement and bounded offline queue.
- `WorkspaceCrypto`: key creation/wrapping, authenticated encryption, key rotation and recovery flows.
- `CollaborationProvider`: presence, cursors, comments and revision-aware collaborative operations.
- `IntegrationHost`: scoped grants, explicit consent, revocation and audit visibility.

The editor must not import a concrete network client. Personal supplies only local implementations or absence for optional services; Full supplies explicitly configured adapters.

## 6. Security, privacy and reliability requirements

Before Full sync is enabled, specify and test:

- Cryptographic protocol, algorithms, nonce rules, authenticated metadata, versioning, replay protection and forward compatibility.
- Key derivation/storage, recovery, loss, rotation, device enrollment and revocation.
- Authorization, invitation expiry, membership changes, least privilege and server-side enforcement.
- Conflict semantics, deterministic ordering, idempotency, tombstones, deletion propagation and offline queue limits.
- Metadata visible to identity, signaling, relay, notification and storage providers.
- Optional ciphertext retention, backup, deletion guarantees, region/provider, export and account/workspace offboarding.
- Incident response, abuse controls, rate limits, operational logging and privacy-safe diagnostics.

E2E encryption does not protect a compromised or unlocked endpoint. Disclose endpoint, metadata and recovery limitations accurately.

## 7. Migration from current MVP

1. Preserve the existing `.wave/` Markdown workspace and current Personal workflow.
2. Define the versioned domain model and SQLite schema; keep Markdown import/export.
3. Implement a repeat-safe migration on a copied workspace with a verified pre-migration snapshot, report, rollback and source preservation.
4. Verify pages, folder paths, settings, favorites, Trash and assets; report skipped/unsupported content.
5. Add integrity diagnostics, backup/restore and portable export before switching the canonical writer.
6. Only after local SQLite reliability is proven, add identity, device keys and encrypted synchronization.

Never run an automatic destructive migration or maintain two independently editable canonical copies.

## 8. Staged delivery plan

| Stage | Deliverable | Exit gate |
|---|---|---|
| 0. Architecture | Edition matrix, threat model, interfaces, data flow and migration plan | Product/security decisions documented |
| 1. Storage boundary | UI decoupled from concrete filesystem adapter | Existing workflows pass through adapter contract |
| 2. Local data engine | Versioned SQLite local store, assets, migration and rollback | Integrity, backup/restore, import/export and migration tests pass |
| 3. Crypto/device foundation | Key lifecycle, enrollment, revocation and recovery | Independent cryptographic/security review and failure-path tests |
| 4. Coordination service | Identity, authorization, discovery and signaling | Server-side authz tests; no plaintext content/key exposure |
| 5. Encrypted sync | Offline queue, encrypted events/snapshots, conflicts and optional ciphertext relay | Multi-device partition/reconnect/replay/revocation tests pass |
| 6. Collaboration | Presence, comments and concurrent editing | Conflict and access-control review; reliable offline fallback |
| 7. Edition releases | Separate Personal and Full builds, docs and distribution | Personal bundle/network isolation verified; Full disclosure and ops gates passed |

Stages may be split into smaller issue-linked changes. No stage implies later stages are shipped.

## 9. Mandatory tests

**Personal**
- Run without network after initial static asset delivery.
- Fail tests on unexpected application API, auth, sync, upload, telemetry, WebSocket, beacon or remote-media requests.
- Inspect generated bundle/import graph for Full-only clients, credentials and service URLs.
- Verify local workflows, backups, restore and export continue to work.

**Full**
- Test no plaintext document/key exposure in network captures, relay payloads, server logs and diagnostics.
- Test server authorization against forged workspace/device IDs and revoked memberships.
- Test offline edits, concurrent writes, reconnect, duplicate/reordered/replayed events, partial failures and bounded queues.
- Test device loss/revocation, key rotation/recovery, account deletion and workspace export/deletion.
- Test local editing remains available during auth, network, coordination and relay outages.

## 10. Explicit non-goals and prohibited shortcuts

- No mandatory Wave-hosted readable document database.
- No plaintext document upload as a sync shortcut.
- No server-side canonical source of truth that silently supersedes local workspaces.
- No telemetry, remote AI processing, malware scanning or external integration without separate approval, disclosure and consent.
- No claim that Personal/Full builds, SQLite, encryption, sync or collaboration are implemented until exact code and tests prove it.
- No runtime-only feature flag as the sole isolation/security control.
