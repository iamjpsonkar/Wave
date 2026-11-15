# Security automation and response operations

## Automated checks

| Workflow | Trigger | Blocking policy | Output |
|---|---|---|---|
| CI | PR and main push | Functional build/browser tests are the mandatory first gate; container build and all security/quality workflows start only after it succeeds | Playwright diagnostics |
| Dependency security | PR, main push, weekly, manual | npm audit HIGH/CRITICAL | Sanitized npm audit JSON artifact |
| OSV-Scanner | PR, main push, weekly, manual | New PR vulnerabilities and full-scan findings fail | SARIF/code scanning and short-retention reports |
| Secret scanning | PR, main push, weekly, manual | Gitleaks findings fail | Gitleaks summary; no matched-secret artifact/comments |
| CodeQL | PR, main push, weekly, manual | Query results published to code scanning | SARIF; fork PR SARIF artifact only |
| Trivy | PR, main push, weekly, manual | HIGH/CRITICAL filesystem/image findings fail | SARIF and 14-day artifact |
| OpenGrep | PR, main push, weekly, manual | Fails on findings from maintained Wave rules; strict parser/config errors also fail | SARIF artifact (14 days) |

All third-party actions and reusable workflows are pinned to verified full commit SHAs. For pull requests and main-branch pushes, CI / Functional build and browser tests runs first. Container build, ESLint, CodeQL, Trivy, npm audit, OSV-Scanner, OpenGrep and Gitleaks are reusable workflows/jobs gated by needs: build; they are skipped automatically when the functional gate fails. Each scanner retains its independent weekly schedule and manual workflow_dispatch entry point. Scanner workflows are additive; they do not replace ./test.sh, the production build or container validation.

## Owner-side GitHub settings (manual)

Workflows cannot enable repository/organization security features. A repository owner should review availability under Settings → Code security and analysis and enable, where supported by the account/repository plan:
- Dependabot alerts and Dependabot security updates.
- Secret scanning and push protection.
- GitHub code scanning/CodeQL default setup only if it does not duplicate or conflict with the checked-in CodeQL workflow.
- Private vulnerability reporting and security contact process.

Do not claim these settings are enabled until repository settings are inspected directly. Dependabot version-update PRs are configured in .github/dependabot.yml; security-alert PRs still depend on owner-side alert/security-update settings.

## Open-source static analysis and code quality

Wave uses OpenGrep 2.0.0 (LGPL-2.1) for repository-local security-pattern analysis and ESLint 10 with typescript-eslint for JavaScript/TypeScript code-quality feedback. Both run without hosted-service accounts, project keys or secrets. OpenGrep is downloaded from its immutable release and verified against the published SHA-256 digest before execution. Its maintained rules live in `.github/opengrep-rules.yml`; findings are blocking and SARIF is retained for 14 days. Expand the rules only with focused, reviewed patterns and regression fixtures; do not treat this starter ruleset as comprehensive taint analysis.

The ESLint workflow installs exact tool versions transiently after `npm ci`, without changing the application `package-lock.json` or adding lint tooling to Wave's runtime dependency graph. JavaScript recommended rules are blocking; TypeScript recommended rules are initially warnings while the existing codebase is baselined. The initial verified baseline completed with zero ESLint errors and 161 warning-level unused-import/unused-variable findings; keep these visible and reduce them in follow-up cleanup rather than suppressing them. Existing `npm run typecheck`, unit tests, Playwright and build checks remain authoritative and are not replaced by linting.

No Sonar/SonarCloud account, token, organization or paid service is required. Do not reintroduce credential-gated Sonar as a required workflow without an explicit owner decision.

## Triage and remediation

1. Record scanner, workflow run, commit SHA, package/component, installed version, dependency path, advisory/CVE/GHSA, severity, fixed version and evidence.
2. Confirm the finding against the advisory and exact lockfile/image. Deduplicate the same underlying CVE across npm, OSV and Trivy; preserve each scanner's evidence.
3. Prioritize exploitable critical/high findings. Remediate by a reviewed dependency update or base-image update; run npm ci, npm run license:audit, ./test.sh and container checks.
4. Do not automatically upgrade, suppress or relicense dependencies. Update package-lock.json through npm and review exact upstream license/NOTICE changes.
5. Re-run the affected scanner and the complete functional/container gate on the exact candidate commit.

## Exceptions and false positives

An exception is temporary risk acceptance, not a fix. It must be recorded in a GitHub issue with: finding identifier, affected package/path/image, owner, technical rationale, compensating control, approval, creation date, expiry/review date and removal condition. No indefinite suppressions. Expired exceptions are treated as active findings. Do not add a scanner allowlist entry without a linked approved exception and a narrow path/fingerprint scope.

Gitleaks findings must never be copied into logs, PR comments, issue bodies or artifacts. The only committed allowlist is .gitleaks.toml, which narrowly excludes Git commit IDs on Key commits: lines in etc/history/dev-build.md; do not broaden this exception to other files or generic high-entropy values. Rotate/revoke any exposed credential first, then remove it from current code/history using the repository incident process. Treat a false positive only after verifying that the value is not a live credential.

## Incident response

- Stop distribution of affected builds if a credible critical compromise or secret exposure is identified.
- Revoke/rotate exposed credentials and invalidate affected tokens first.
- Determine affected commits, packages, artifacts and release images.
- Preserve non-sensitive logs and scanner metadata; do not publish workspace content or secret values.
- Patch, test, scan and document the exact fixed commit.
- Review whether the threat model, workflow permissions, dependency inventory or owner-side settings need updating.

## License and legal review

Automated license inventory/audit is metadata triage, not a legal opinion. Exact package tarball LICENSE/NOTICE contents, source asset attributions, Apache NOTICE obligations and CC-BY attribution in final release artifacts remain subject to manual owner/legal review. Do not mark the legal portion of issue #120 complete from a green scanner.


## Attachment content validation boundary

Wave rejects blocked extensions/MIME types, enforces the attachment size limit, and performs bounded signature checks for selected known formats. Text-based SVG/HTML markers are checked across the complete attachment payload (up to the 25 MiB attachment limit), including padded content. This is not a full parser, malware scanner, polyglot detector or guarantee that every active format is recognized. Do not describe it as comprehensive active-content detection; continue to treat attachments as untrusted data and preserve the local-only storage boundary.


OSV PR scanning explicitly checks out and verifies the target commit and proposed head commit. Its OSV-Scanner CLI pinned to v2.2.1 and verified against the official release asset SHA-256 runs on the runner with JSON output files written to the workspace; the reporter compares old/new reports and fails on newly introduced vulnerabilities. A successful CLI exit or missing report is never treated as an empty/clean comparison.
