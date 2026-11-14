# Wave — GitHub issue index

> Created: 2026-11-15  
> Purpose: map the current bug, UI-gap, Markdown-gap and diagram roadmap registers to actionable GitHub issues. Related IDs are grouped by shared implementation/verification work to avoid duplicate issues.

## Created issues

| GitHub issue | Priority | Scope | Source register IDs |
|---|---|---|---|
| [#1 Native filesystem, permission and lifecycle verification](https://github.com/iamjpsonkar/Wave/issues/1) | P1 | Native picker, permission revocation, external filesystem races, backup fault injection and accessibility verification | WAVE-031; UI-005, UI-014, UI-018, UI-019, UI-020 |
| [#2 IndexedDB recovery-draft pre-commit window](https://github.com/iamjpsonkar/Wave/issues/2) | P1 | Controlled transaction delay, termination testing, pending/committed status and durability limits | WAVE-039 |
| [#3 Theme, contrast and accessibility verification](https://github.com/iamjpsonkar/Wave/issues/3) | P1 | Theme matrix, contrast, Settings/dialog focus, popovers and manual accessibility | UI-001, UI-005, UI-012, UI-016–UI-020 |
| [#4 Complete source-preserving block editor](https://github.com/iamjpsonkar/Wave/issues/4) | P1 | Slash commands, bookmark/embed blocks, richer inline formatting and round-trip coverage | UI-002; A1 block editor |
| [#5 Editor navigation and productivity regression coverage](https://github.com/iamjpsonkar/Wave/issues/5) | P2 | Width behavior, breadcrumbs, outline, backlinks, undo/redo, counts, templates, backup UX and version-history decision | UI-003, UI-006–UI-011, UI-013, UI-015 |
| [#6 Markdown renderer compatibility and round-trip suite](https://github.com/iamjpsonkar/Wave/issues/6) | P2 | Complete showcase fixtures, compatibility matrix, malformed input, accessibility, cross-browser and performance coverage | `features-gap.md` sections 1–16; UI-020 |
| [#7 Theme-aware PDF/print export](https://github.com/iamjpsonkar/Wave/issues/7) | P1 | Execute CI and visually verify Light/Dark/Print PDF output and coherent palettes | UI-022; UIB-001, UIB-002 |
| [#8 PDF rendering verification for color, math, tables and DETAILS](https://github.com/iamjpsonkar/Wave/issues/8) | P2 | Verify the source remediation in a real generated PDF; close findings only with evidence | UIB-003–UIB-006 |
| [#9 Wave color-extension portability and accessible contrast](https://github.com/iamjpsonkar/Wave/issues/9) | P2 | Non-Wave fallback, nested ranges, custom color contrast and source preservation | UI-021; `features-gap.md` color extension follow-up |
| [#10 Native local-first visual diagram editor](https://github.com/iamjpsonkar/Wave/issues/10) | P2 | Native graph model, canvas, shapes, connectors, styles, persistence, undo/redo and phased advanced capabilities | `diagram-features.md`; P2.5 whiteboards/canvas |

## Triage and scope rules

- These ten issues cover current actionable defects, verification gaps and substantial product work identified in the source registers.
- The two open reliability findings WAVE-031 and WAVE-039 are represented by dedicated issues #1 and #2.
- UI IDs are grouped where the same theme, dialog, editor or navigation work shares implementation and test infrastructure. Preserve each original UI ID when updating status.
- UIB-001–UIB-006 are PDF observations. Source/test remediation exists for UIB-003–UIB-006, but actual browser-generated PDF verification is still required.
- WAVE-052 and historical fixed findings are not reopened.
- The extensive unchecked catalogue in `upcoming-features.md` and `priority-features.md` is long-term product planning, not a list of confirmed bugs. It is not converted wholesale into GitHub issues. Create focused issues as those roadmap epics are prioritized.
- No issue is marked fixed or closed by this index. Implementation and CI evidence must be added before closure.
