# Third-party notices

This file records third-party software and other externally sourced material used by Wave. It is supplementary to the upstream license files and package records; it does not replace those terms or relicense any component. Wave's own source is licensed under the MIT License in [LICENSE](./LICENSE).

Historical pre-upgrade audit baseline: 2026-11-15 (commit `7e895f26b05288dc8edfebcf03e14efe954950f5`, 221 resolved package entries).  
Current proposed dependency snapshot: 2026-11-15, lockfileVersion 3, 161 resolved package entries. See the current upgrade audit section below.

## Dependency inventory

The committed exact-version inventory is [`etc/legal/dependency-license-inventory.json`](./etc/legal/dependency-license-inventory.json). It records all 161 package entries, their exact versions, declared licenses, resolved npm tarball URLs, integrity digests and npm's dev-only marker, alongside the root production/development dependency declarations. The root `package-lock.json` remains the canonical source of resolution data. The audit script `scripts/check-dependency-licenses.mjs` compares the committed inventory against the lockfile and detects missing license metadata, unrecognized SPDX identifiers, and stale inventory snapshots. Use `npm run license:audit:update` only after reviewing the dependency changes and upstream license/NOTICE obligations, then inspect and commit the generated JSON diff. The script is a metadata quality check only; it does not determine legal compatibility, validate package license-file contents, or replace human review.

| Declared license | Resolved packages | Treatment |
|---|---:|---|
| MIT | 142 | Permissive notice obligations remain with each upstream package; retain upstream package notices when redistributing their code |
| ISC | 3 | Permissive license; retain copyright and permission notice |
| Apache-2.0 | 2 | Retain license and applicable NOTICE/attribution material; review patent and modification conditions in the upstream package |
| BSD-3-Clause | 1 | Retain copyright, conditions and disclaimer; respect non-endorsement clause |
| MPL-2.0 | 12 | File-level copyleft; preserve notices and provide recipients reasonable access to corresponding source when distributing executable form |
| 0BSD | 1 | Permissive; retain any upstream notices supplied with the package |
| CC-BY-4.0 | 0 (not present) | Present in the historical baseline only; caniuse-lite is no longer in the proposed lockfile |

### Packages needing specific notice handling

- `baseline-browser-mapping@2.11.37` — Apache-2.0 in the historical 221-entry baseline; it is removed from the proposed lockfile after the React plugin toolchain change. Reassess if reintroduced.
- `typescript@6.0.3` — Apache-2.0 in the proposed lockfile. Preserve the upstream license and applicable NOTICE material if the compiler is redistributed; it is a development tool and is not part of the application runtime bundle.
- `caniuse-lite@1.0.30001826` — `CC-BY-4.0`, from the `browserslist/caniuse-lite` project and npm registry package. This was the only dependency outside the MIT/ISC/Apache-2.0/BSD-3-Clause set in the historical lock snapshot; it is absent from the proposed lockfile. Attribution 4.0 requires appropriate credit, a license link and indication of changes where applicable. The package's upstream LICENSE file is the authoritative legal text. This is a historical pre-upgrade entry and is not present in the proposed 181-package lockfile. See [upstream repository](https://github.com/browserslist/caniuse-lite) and [upstream LICENSE](https://github.com/browserslist/caniuse-lite/blob/main/LICENSE).
- `lucide-react@1.72.0` — declared `ISC` in the lockfile. The Lucide project's React package documentation identifies the ISC license; the upstream project license file is authoritative. See [Lucide React](https://github.com/lucide-icons/lucide/tree/main/packages/lucide-react) and [Lucide license](https://github.com/lucide-icons/lucide/blob/main/LICENSE).
- Apache-2.0 entries in the lockfile must be distributed with required upstream license and NOTICE text, when applicable. Review the exact installed package files before creating a release artifact; the lockfile expression alone does not prove whether an upstream NOTICE file applies.

All 161 package entries in the proposed lock snapshot have a non-empty license field. The three ISC package entries are individually named and versioned in the committed JSON inventory. The audit should be rerun whenever the lockfile changes. Package count and license distribution are a dated snapshot, not a permanent assertion.

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

## Historical baseline attribution findings verified 2026-11-15 (pre-upgrade)

The npm lockfile metadata check is passing, but it is not a substitute for inspecting package distribution contents. This historical note refers to the 221-entry pre-upgrade inventory; it does not assert that every package tarball has been unpacked and reviewed.

### Confirmed attribution detail

- `caniuse-lite@1.0.30001826` is distributed under CC-BY-4.0. The upstream caniuse project states that attribution can be satisfied by mentioning `caniuse.com`. When redistributing the licensed database material, credit **caniuse.com**, link the [CC-BY-4.0 license](https://creativecommons.org/licenses/by/4.0/), identify modifications where applicable, and retain any upstream-supplied creator/copyright/license/disclaimer information. See the [versioned npm package](https://www.npmjs.com/package/caniuse-lite/v/1.0.30001826) and [upstream license](https://github.com/browserslist/caniuse-lite/blob/main/LICENSE).
- `baseline-browser-mapping@2.11.37` declares Apache-2.0. The package version and declared license are corroborated by the [versioned npm package](https://www.npmjs.com/package/baseline-browser-mapping/v/2.11.37). This is historical; the package is absent from the proposed lockfile.
- `typescript@5.7.3` declared Apache-2.0 and was development-only in the historical pre-upgrade lockfile. Its upstream package manifest identifies distribution files including `LICENSE.txt` and `ThirdPartyNoticeText.txt`; see the [version-pinned package manifest](https://unpkg.com/typescript@5.7.3/package.json). Verify the exact installed tarball contents if TypeScript is ever included in a distributed artifact.
- `lucide-react@0.468.0` was declared ISC in the historical pre-upgrade lockfile; the proposed version is `lucide-react@1.72.0`. Lucide's icon collection includes Feather-derived icons that retain the applicable Feather MIT attribution; inspect the exact package's bundled LICENSE when preparing redistribution. See the [Lucide React package](https://github.com/lucide-icons/lucide/tree/main/packages/lucide-react) and [upstream license source](https://github.com/lucide-icons/lucide/blob/main/LICENSE).

### Audit disposition (do not overstate)

The repository/lockfile metadata inventory is complete for the proposed snapshot (181 entries); it is not a package-file-content audit. Public source records above corroborate license identifiers and the caniuse attribution instruction, but the exact npm tarballs were not unpacked in this review environment. In particular, exact package-level NOTICE inclusion for the Apache-2.0 dependencies and complete license-file inspection for all 161 packages in the proposed lockfile remain release-review work. Do not report this issue as legally certified or all acceptance items complete until the actual locked tarballs and any applicable distribution artifact are inspected and required notices are reproduced.

Runtime Google Fonts remain remotely requested and unpinned; no font binaries are checked in. Pinning or self-hosting them is a separate product/distribution decision, not silently performed by this audit.

## Notice and redistribution requirements

- Preserve each package's upstream license and copyright notices in source and production distributions as required by that license.
- Include applicable Apache-2.0 NOTICE files and other upstream attribution material. Do not assume npm lock metadata includes the notice contents.
- If caniuse-lite is reintroduced, include CC-BY-4.0 attribution for its database material. The historical upstream project permits attribution by mentioning **caniuse.com**; include the license link and required change indication where applicable.
- Do not copy third-party code, text, examples, graphics, fonts or brand assets without tracing their origin and license.
- Wave's MIT license applies to Wave-authored project code; it does not supersede third-party licenses or convert third-party assets to MIT.

## Known audit limitations and owner follow-up

- The dependency audit is based on package metadata from the checked-in lockfile. It has not independently opened and compared every one of the 181 package tarball LICENSE files.
- The historical CC-BY-4.0 entry is absent from the proposed lockfile. If caniuse-lite is reintroduced, restore its attribution and verify the actual contents included in the final distribution.
- Apache-2.0 packages require package-specific NOTICE inspection and correct reproduction where applicable.
- Google Fonts runtime family names are recorded, but exact font-file revisions are not pinned by the application. Consider pinning/self-hosting the exact files and bundling their OFL notices for deterministic/offline builds; this is a product decision and is not done by this audit.
- No custom license, missing license metadata or conflicting SPDX expression was found in the historical 221-entry baseline snapshot; the proposed 181-entry snapshot is summarized below. Re-run the checker after every dependency update and investigate all new/unknown results.

## Current dependency upgrade audit — 2026-11-15

The coordinated candidate dependency set updates React and React DOM together with both React type packages; Vite 8 with `@vitejs/plugin-react` 6; React Markdown, Lucide React and TypeScript. The generated candidate inventory contains **181 resolved package entries**:

| Declared license | Entries |
|---|---:|
| MIT | 142 |
| Apache-2.0 | 22 |
| ISC | 3 |
| MPL-2.0 | 12 |
| BSD-3-Clause | 1 |
| 0BSD | 1 |

All 161 entries have non-empty license metadata and the checker allowlist includes each observed SPDX identifier. This is a metadata review only; it does not constitute legal certification or package-tarball inspection.

- `lightningcss@1.33.0` and its 11 platform packages declare MPL-2.0 and enter through the Vite 8 toolchain. MPL-2.0 is a file-level copyleft license. Sections 3.1–3.4 address source-form distribution, executable-form source availability and preservation of notices. See the [versioned Lightning CSS package](https://www.npmjs.com/package/lightningcss/v/1.33.0), [upstream source](https://github.com/parcel-bundler/lightningcss/tree/v1.33.0) and [official MPL-2.0 text](https://www.mozilla.org/en-US/MPL/2.0/). Before shipping an artifact containing this code, verify whether/how the toolchain package is included and provide the corresponding source and license notices through a reasonable distribution mechanism.
- `typescript@7.0.2` and its 20 `@typescript/typescript-*` platform packages declare Apache-2.0. Preserve the upstream license and applicable NOTICE material if redistributed. See the [versioned TypeScript package](https://www.npmjs.com/package/typescript/v/7.0.2).
- `detect-libc@2.1.2` declares Apache-2.0; retain applicable upstream notices if redistributed.
- `lucide-react@1.72.0` declares ISC. Keep the current Lucide attribution and re-check the exact package notice before release.
- The historical `caniuse-lite@1.0.30001826` CC-BY-4.0 entry and `baseline-browser-mapping@2.11.37` entry are absent from the proposed lockfile; their historical audit records above are retained for traceability, not represented as current dependencies.

The candidate inventory was assembled from the exact npm-generated package metadata in the seven closed Dependabot PR lockfiles, each based on the same package-lock baseline. TypeScript was changed to stable 6.0.3 because the pinned stable typescript-eslint 8.72.2 toolchain declares a TypeScript peer range below 6.1 and rejects TypeScript 7. The TypeScript 7 upgrade is deferred until stable lint-tool support is published. The resulting combined lockfile must pass a fresh `npm ci`, typecheck, build, unit/E2E tests and security workflows on the PR head before acceptance. If npm rejects the combined lockfile, regenerate it with npm in a network-enabled environment; do not hand-edit resolved versions or integrity hashes.

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
