# Wave security and privacy threat model

> Status: initial source-backed threat model, 2026-11-15. This is an engineering baseline, not a security certification or completed review.

## Product and trust boundaries

Wave is a browser-based, local-first workspace. A user explicitly selects a directory through the browser File System Access API. Wave stores Markdown documents and ordinary attachment files beneath that directory in .wave/. The browser-local IndexedDB registry stores a workspace handle; the draft journal stores temporary unsaved recovery content. There is no Wave application backend, account service, team server, cloud sync service or server-side sharing service in the current product.

Primary trust boundaries:
1. User-selected filesystem: workspace files are user-controlled and may be malicious, malformed, stale, oversized or externally modified.
2. Browser origin/runtime: Wave code executes in the browser with filesystem access only after the user grants/retains permission. Browser vulnerabilities and compromised dependencies remain in scope.
3. Markdown and attachment rendering: document content, links, image/media references, code blocks and filenames are untrusted input.
4. Build and release supply chain: npm packages, GitHub Actions, scanner images, Docker base images and generated artifacts can be compromised or vulnerable.
5. External navigation: users may choose to follow external links. Wave must not fetch remote document content or silently upload workspace content.
6. Reserved `https://wave.invalid/` preview routes are application-internal only; malformed percent-encoded page/media targets must render as inert unresolved content rather than throw during React rendering.

## Assets and security objectives

| Asset | Objective |
|---|---|
| Markdown documents and attachments | Confidentiality, integrity, availability, portability |
| Workspace manifest, settings, backups and Trash | Integrity and recoverability |
| Temporary browser recovery drafts and workspace handles | Local confidentiality and safe lifecycle |
| Browser filesystem permission | Least privilege; user-initiated selection and revocation |
| Dependency, action and container build chain | Integrity, vulnerability visibility, reproducibility |
| Diagnostics and CI reports | No workspace content, credential or matched-secret disclosure |

## Threat actors and abuse cases

- A malicious document or attachment attempts script execution, unsafe navigation, remote resource loading, path traversal or resource exhaustion.
- A malicious or compromised dependency/action attempts to exfiltrate source, secrets or workspace data during CI/build.
- A malicious PR attempts to access repository secrets or write to the default branch/security settings.
- A local process modifies a document between read and save, or injects malformed metadata/path names.
- A compromised container/base image introduces vulnerable OS packages or unexpected runtime behavior.
- A user unintentionally attaches an executable or active-content document.

## Current controls verified in source

- Markdown preview uses react-markdown, remark-gfm and rehype-sanitize; raw HTML is not enabled with rehype-raw.
- External links open in a separate browsing context with noopener noreferrer; local media/assets resolve only from the workspace asset directory.
- Workspace paths reject absolute paths, empty segments, dot segments, backslashes, colons and NULs before filesystem traversal.
- Attachment names are normalized and collision-safe. This tranche adds a 25 MiB limit and rejects known executable/active-content extensions and MIME types.
- Existing storage code verifies saved attachment size and uses collision checks; backups are verified before listing/restoring.
- Production Nginx receives a restrictive Content Security Policy and standard security headers. Remote Google Fonts loading is removed to avoid unsolicited third-party font requests.
- GitHub workflows use read-only defaults, pinned actions, explicit timeouts/concurrency and no secrets for fork PR scanners. Sonar is gated on owner-provided configuration.
- npm, OSV, Gitleaks, CodeQL and Trivy are configured as independent automated checks.

- Attachment validation does not write user-provided filenames, declared MIME types, file sizes or content prefixes to the browser console; regression coverage guards against reintroducing these logs.

## Known limitations and unimplemented product capabilities

These are intentionally not represented as shipped:
- No encryption-at-rest vault or password/key recovery; workspace Markdown and assets are ordinary plaintext files.
- No end-to-end sync, key rotation or device revocation; there is no sync service.
- No team/document permission model, plugin runtime/capability sandbox, integration credential store or automation execution environment.
- No server-backed sharing links, expiry/revocation, public publishing service or access/admin audit log.
- No archive extraction/import flow exists; do not add one without archive traversal, symlink, size/entry-count and bomb-resistance design.
- No built-in malware scanner is installed. CI scanners analyze repository/dependencies/container, not a user's private workspace attachments. Do not upload user files to a remote scanning service without explicit product approval and consent.
- Native browser permission revocation, OS-level malware defense, compromised browser extensions and physical-device compromise remain outside Wave's current guarantees.

## Required follow-up review

1. Review the file size/type policy against supported attachment use cases and add additional safe formats only with tests.
2. Perform a focused manual review of every renderer/custom Markdown component and every filesystem entry point.
3. Decide whether an optional local encryption vault is a product priority; specify threat model, recovery, key derivation, migration, backup and key-loss semantics before implementation.
4. Keep sync, teams, plugins, sharing and malware scanning blocked behind explicit product decisions and privacy review.
5. Revisit this document when data flow, permissions, dependencies, renderer or deployment architecture changes.


## Additional trust boundaries for two editions

The two-edition plan adds a strict separation requirement. These are design requirements, not controls already shipped.

### Wave Personal

- No account/authentication client, application API client, sync worker, remote document store, analytics or telemetry is permitted in the Personal runtime bundle.
- No workspace document, attachment, metadata, draft or encryption key may be sent to a Wave-operated service.
- Network tests must fail on unexpected fetch/XHR/WebSocket/EventSource/beacon requests to application service origins. Static app assets and explicit user-initiated external navigation are separate and must be allow-listed narrowly.
- Personal must continue opening, editing, saving, exporting and restoring local workspaces with network access disabled after the application is loaded.

### Wave Full

- Local workspace storage remains authoritative on each enrolled device. The planned canonical local store is SQLite with ordinary asset files; this is future work, not current behavior.
- Identity/control-plane services may process account identifiers, device public keys, workspace membership metadata, authorization decisions, signaling, presence and notification metadata. Minimize and document each field and its retention.
- Sync payloads and optional relay/backup objects must be end-to-end encrypted before leaving the client. Services must not receive plaintext workspace keys or readable document payloads.
- Distinguish transport encryption (TLS) from end-to-end encryption. TLS alone does not prevent the service operator from reading stored or relayed plaintext.
- Device enrollment, revocation, key rotation, recovery, lost-device handling, account deletion, workspace removal, export and ciphertext-retention behavior must be designed and tested before release.
- A compromised authorized endpoint can read content while unlocked; E2E encryption does not protect against malware, browser extensions, screenshots or an already compromised device.
- Conflict resolution, replay protection, event ordering, tombstones, offline queue limits and recovery from partial sync must be specified before multi-device write access.
- Optional ciphertext relay/storage is a distinct, explicit capability. Document provider/operator, region, retention, deletion guarantees, metadata exposure, backup policy and user consent. Never market it as zero-knowledge without independent design review and evidence.

### Release gates

1. Separate Personal/Full build dependency graphs and inspect generated bundles.
2. Automated Personal network-egress tests covering auth, API, sync, telemetry, uploads and external media.
3. Threat model and security review for cryptographic protocol, identity, device lifecycle and server authorization.
4. Multi-device offline/online, concurrent edit, conflict, replay, revocation, key-loss and restore tests.
5. User-facing disclosure and consent for every remote data flow, including metadata and ciphertext storage.
6. Export, deletion, retention and account/workspace offboarding verified end to end.
