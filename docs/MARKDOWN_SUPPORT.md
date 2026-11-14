# Markdown support in Wave

This page is the compatibility contract for Wave's local Markdown preview. The editor stores the original Markdown text; preview transformations do not rewrite the user's source file.

## Supported writing syntax

- CommonMark-style paragraphs, hard line breaks, headings (levels 1–6), Setext headings, emphasis, inline code, fenced and indented code, blockquotes, nested blockquotes, ordered/unordered/nested/mixed lists, links, images, thematic breaks, escaping, and reference-style links/images.
- GFM through `remark-gfm`: tables and column alignment, strikethrough, task lists, autolinks, and footnotes.
- Wave extensions: internal wiki links and backlinks, GitHub-style NOTE/TIP/IMPORTANT/WARNING/CAUTION callouts, safe DETAILS disclosure blocks, copyable code, lightweight token/diff highlighting, unique heading IDs, inline/display MathML for a constrained TeX subset, safe inline formatting shorthands, a small emoji shortcode map, and local diagram renderers described below.
- Local image attachments resolve from the workspace assets directory; Markdown image alt text and titles are retained. External images are not fetched by the preview and display a readable missing-asset fallback.
- Controlled audio/video embeds can reference supported local workspace assets with `[[audio:path/to/file.mp3]]` or `[[video:path/to/file.mp4]]`. Remote media and arbitrary HTML media are not loaded.
- Direct Unicode emoji and symbols work as ordinary text.

## Math

Inline expressions use dollar delimiters, for example `$E = mc^2$`. Display expressions can use a line containing two dollar signs before and after the expression, or a fenced `math` block.

The built-in MathML parser supports nested groups, recursive fractions and square roots, indexed roots, grouped superscript/subscript expressions, selected Greek letters/operators/functions, text groups, accents, spacing, binomial notation, and constrained matrix/cases environments. It can render common showcase expressions involving sums, integrals and limits. It remains a deliberately limited TeX subset: arbitrary macros, custom commands, full aligned environments, extensible delimiters, broad symbol packages and the complete TeX grammar are not supported. Unknown commands remain visible as text; TeX is never executed.

## Mermaid

Fenced Mermaid definitions render locally for constrained subsets of flowchart, sequence, pie, class, ER, state, Gantt, git graph, mindmap, timeline, quadrant, requirement and architecture-beta diagrams. These are purpose-built lightweight parsers/layouts, not the complete Mermaid grammar or layout engine. Complex syntax, unsupported directives and malformed input use a readable source fallback. Wave does not load a remote Mermaid service.

## HTML and security

Raw HTML is not enabled in the Markdown parser. This is deliberate: Wave uses a sanitized preview and does not execute scripts, event handlers, embedded frames, remote media, or arbitrary HTML. HTML examples in Markdown documents remain source text or are sanitized by the parser. Equivalent safe inline shorthands are available without enabling raw HTML: `==highlight==`, `++underline++`, `^superscript^`, `~subscript~`, and `[[kbd:Ctrl+K]]`. Use `> [!DETAILS] Summary` followed by quoted body lines for a keyboard-operable disclosure block.

## Other diagram formats

Fenced DOT/Graphviz, PlantUML, Vega/Vega-Lite, D2 and AsciiDoc have lightweight local subset renderers. These are not full implementations of those specifications; unsupported or invalid constructs remain available through a readable source fallback. Vega data must be inline (remote data URLs are rejected). Wave will not send document contents to a third-party renderer.

## Compatibility matrix

| Feature group | Wave status |
|---|---|
| CommonMark writing syntax | Supported |
| GFM tables, tasks, strikethrough, autolinks, footnotes | Supported |
| GitHub-style alert callouts | Supported |
| Local images and Markdown links | Supported with local-asset and URL safety rules; titles/alt text retained |
| Heading anchors | Supported with deterministic duplicate suffixes |
| MathML | Partial: nested groups/fractions/roots/scripts and common commands; no matrices or aligned environments |
| Mermaid | Partial: simple flowcharts, basic sequence diagrams and pie charts |
| Raw HTML | Disabled for safety; safe inline shorthands and DETAILS disclosure are supported |
| Syntax highlighting | Lightweight local token coloring for common language families; not a full grammar/highlighter |
| Video/audio embeds and arbitrary HTML media | Not supported |\n| Emoji shortcodes | Common shortcode set supported; unknown shortcodes remain unchanged |
| PlantUML, Graphviz, Vega, D2, AsciiDoc | Not rendered; source is preserved |

## Regression entry point

Choose **Markdown feature showcase** from Wave's page templates to try the supported syntax and preview extensions. The browser E2E suite includes a renderer-extension scenario. Run `npm run typecheck`, `npm run build`, and `npm run test:e2e` before treating a source change as verified.
