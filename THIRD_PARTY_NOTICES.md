# Third-party notices

This file records third-party software and other externally sourced material used by Wave. It is supplementary to the upstream license files and package records; it does not replace those terms or relicense any component. Wave's own source is licensed under the MIT License in [LICENSE](./LICENSE).

Audit baseline: 2026-11-15  
Repository commit at audit start: `7e895f26b05247358604a644a3e6902edcbed80f`  
Dependency source: npm `package-lock.json`, lockfileVersion 3, 221 resolved package entries.

## Dependency inventory

The committed exact-version inventory is [`etc/legal/dependency-license-inventory.json`](./etc/legal/dependency-license-inventory.json). It records all 221 package entries, their exact versions, declared licenses, resolved npm tarball URLs, integrity digests and npm's dev-only marker, alongside the root production/development dependency declarations. The root `package-lock.json` remains the canonical source of resolution data. The audit script `scripts/check-dependency-licenses.mjs` compares the committed inventory against the lockfile and detects missing license metadata, unrecognized SPDX identifiers, and stale inventory snapshots. Use `npm run license:audit:update` only after reviewing the dependency changes and upstream license/NOTICE obligations, then inspect and commit the generated JSON diff. The script is a metadata quality check only; it does not determine legal compatibility, validate package license-file contents, or replace human review.

| Declared license | Resolved packages | Treatment |
|---|---:|---|
| MIT | 210 | Permissive notice obligations remain with each upstream package; retain upstream package notices when redistributing their code |
| ISC | 7 | Permissive license; retain copyright and permission notice |
| Apache-2.0 | 2 | Retain license and applicable NOTICE/attribution material; review patent and modification conditions in the upstream package |
| BSD-3-Clause | 1 | Retain copyright, conditions and disclaimer; respect non-endorsement clause |
| CC-BY-4.0 | 1 | Attribution is required; preserve attribution and source/license references when redistributing the licensed database material |

### Packages needing specific notice handling

- `baseline-browser-mapping@2.11.37` — Apache-2.0. This is a production dependency entry in the current lock snapshot. Preserve the Apache-2.0 license text and any applicable upstream NOTICE file when redistributing. The actual package tarball NOTICE was not individually inspected during this API-only pass; verify it before release.
- `typescript@5.7.3` — Apache-2.0, development-only in the current lock snapshot. Preserve upstream license/NOTICE material if its code is ever included in distributed artifacts; the current app build uses it as a dev tool and doesn't ship the compiler as application code.
- `caniuse-lite@1.0.30001826` — `CC-BY-4.0`, from the `browserslist/caniuse-lite` project and npm registry package. This is the only dependency outside the MIT/ISC/Apache-2.0/BSD-3-Clause set in the audited lock snapshot. Attribution 4.0 requires appropriate credit, a license link and indication of changes where applicable. The package's upstream LICENSE file is the authoritative legal text. See [upstream repository](https://github.com/browserslist/caniuse-lite) and [upstream LICENSE](https://github.com/browserslist/caniuse-lite/blob/main/LICENSE).
- `lucide-react@0.468.0` — declared `ISC` in the lockfile. The Lucide project's React package documentation identifies the ISC license; the upstream project license file is authoritative. See [Lucide React](https://github.com/lucide-icons/lucide/tree/main/packages/lucide-react) and [Lucide license](https://github.com/lucide-icons/lucide/blob/main/LICENSE).
- Apache-2.0 entries in the lockfile must be distributed with required upstream license and NOTICE text, when applicable. Review the exact installed package files before creating a release artifact; the lockfile expression alone does not prove whether an upstream NOTICE file applies.

All 221 package entries in the audited lock snapshot have a non-empty license field. The seven ISC package entries are individually named and versioned in the committed JSON inventory. The audit should be rerun whenever the lockfile changes. Package count and license distribution are a dated snapshot, not a permanent assertion.

## Fonts and other non-package assets

### Google Fonts loaded at runtime

`src/styles.css` imports the following font families from the Google Fonts CSS API:

- DM Sans — SIL Open Font License 1.1 (OFL-1.1); upstream family source: [googlefonts/dm-fonts](https://github.com/googlefonts/dm-fonts).
- DM Mono — SIL Open Font License 1.1 (OFL-1.1); upstream family source: [googlefonts/dm-mono](https://github.com/googlefonts/dm-mono).
- Playfair Display — SIL Open Font License 1.1 (OFL-1.1); upstream family source: [googlefonts/Playfair-Display](https://github.com/clauseggers/Playfair-Display).

The fonts are requested from Google's hosted CSS endpoint at runtime; font binaries are not checked into this repository. The OFL permits embedding and redistribution subject to its conditions. If the project begins self-hosting or bundling font binaries, include the relevant upstream copyright notice and full OFL text with the font files, preserve any Reserved Font Names, and record the exact upstream revision/files used. The project currently has not pinned a font file version or CSS response; therefore this record documents the current runtime family request, not a byte-identical font asset receipt. Upstream Google Fonts guidance: [license-file requirements](https://googlefonts.github.io/gf-guide/license-file.html).

### Icons

Wave imports icons from `lucide-react`. The React package's declared lockfile license is ISC. Wave renders the package's icon components as SVG; no separately downloaded icon pack or brand-logo collection is checked into the repository. Keep the upstream package's license with redistributed application bundles and re-check the license when upgrading Lucide.

### Images, logos and other binary files

The repository inventory inspected for this audit did not identify any checked-in image, raster-logo, font binary, or standalone icon asset under the source/public tree. The UI logo mark and the Mermaid/Graphviz/diagram SVGs are authored inline in Wave source; they are project-authored code, not copied third-party artwork. Sample Markdown snippets and templates are project-authored examples, and use generic/example URLs or links to Wave's own repository. Workspace images, attachments, audio and video are user-provided local files; Wave does not ship them as project assets.

This is a source-tree inspection result, not a guarantee for future changes. Any added third-party image, logo, font, sound, video, documentation excerpt, sample, code snippet or other asset must be recorded here before it is committed.

## Notice and redistribution requirements

- Preserve each package's upstream license and copyright notices in source and production distributions as required by that license.
- Include applicable Apache-2.0 NOTICE files and other upstream attribution material. Do not assume npm lock metadata includes the notice contents.
- Include CC-BY-4.0 attribution for caniuse-lite when distributing the database or derivative material in a way covered by CC-BY-4.0. The exact required attribution should be copied from authoritative package/source attribution information, not invented.
- Do not copy third-party code, text, examples, graphics, fonts or brand assets without tracing their origin and license.
- Wave's MIT license applies to Wave-authored project code; it does not supersede third-party licenses or convert third-party assets to MIT.

## Known audit limitations and owner follow-up

- The dependency audit is based on package metadata from the checked-in lockfile. It has not independently opened and compared every one of the 221 package tarball LICENSE files.
- The single CC-BY-4.0 entry needs release-distribution attribution review, especially when preparing a binary/web distribution that includes Browserslist data. Do not state that this requirement is fully satisfied solely because the package license field was detected.
- Apache-2.0 packages require package-specific NOTICE inspection and correct reproduction where applicable.
- Google Fonts runtime family names are recorded, but exact font-file revisions are not pinned by the application. Consider pinning/self-hosting the exact files and bundling their OFL notices for deterministic/offline builds; this is a product decision and is not done by this audit.
- No custom license, missing license metadata or conflicting SPDX expression was found in the 221 lock entries in the baseline snapshot. Re-run the checker after every dependency update and investigate all new/unknown results.

## Maintenance procedure

For every dependency or asset change:

1. Update dependencies through npm and commit the changed `package-lock.json`; do not hand-edit resolved versions or integrity hashes.
2. Run `npm run license:audit`. CI compares `etc/legal/dependency-license-inventory.json` with the current lockfile; a mismatch must be reviewed, not bypassed.
3. After verifying upstream license and NOTICE terms, run `npm run license:audit:update`, inspect the entire generated JSON diff, and commit it with the dependency change.
4. For new or changed packages, inspect the exact resolved package's upstream LICENSE and NOTICE files, not only the SPDX field.
5. For added fonts/images/icons/snippets/media, record creator, source URL/repository, exact version or commit, license, required attribution/notices and modification status here.
6. Update [README](./README.md), package metadata only if the project's own license changes, and this notices file whenever distribution obligations change.
7. Re-run CI; retain the exact lockfile SHA and audit output in the PR/issue and history.
8. Escalate ambiguous, custom, missing or potentially incompatible terms to the project owner/legal reviewer; do not relabel or silently replace an asset.

The CI check is intentionally fail-closed for missing or unrecognized package license metadata. A green CI result establishes only that the lockfile contains recognized declarations, not that every license has been legally reviewed.
