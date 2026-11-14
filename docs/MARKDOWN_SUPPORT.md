# Markdown support in Wave

This page is the compatibility contract for Wave's local Markdown preview. The editor stores the original Markdown text; preview transformations do not rewrite the user's source file.

## Supported writing syntax

- CommonMark-style paragraphs, hard line breaks, headings (levels 1–6), Setext headings, emphasis, inline code, fenced and indented code, blockquotes, nested blockquotes, ordered/unordered/nested/mixed lists, links, images, thematic breaks, escaping, and reference-style links/images.
- GFM through `remark-gfm`: tables and column alignment, strikethrough, task lists, autolinks, and footnotes.
- Wave extensions: internal wiki links and backlinks, GitHub-style NOTE/TIP/IMPORTANT/WARNING/CAUTION callouts, safe DETAILS disclosure blocks, copyable and lightly syntax-highlighted fenced code, unique heading IDs, inline/display math with recursive groups/fractions/roots/scripts and common symbols, inline formatting shorthands, emoji shortcodes, and local Mermaid flowchart/sequence/pie previews.
- Local image attachments resolve from the workspace assets directory; Markdown image alt text and titles are retained. External images are not fetched by the preview and display a readable missing-asset fallback.
- Direct Unicode emoji and symbols work as ordinary text.

## Math

Inline expressions use dollar delimiters, for example `$E = mc^2$`. Display expressions can use a line containing two dollar signs before and after the expression, or a fenced `math` block.

The built-in MathML parser supports nested groups, recursive fractions and square roots, superscript/subscript groups, common Greek letters/operators, and `\\text`, `\\mathrm`, `\\mathbf` and `\\operatorname` text groups. It remains a deliberately limited TeX subset: matrices, aligned environments, cases, extensible delimiters, macros, custom commands and many advanced symbols are not supported. Unknown commands are displayed as text; TeX is never executed.

## Mermaid

Fenced Mermaid `flowchart` definitions with simple `-->` edges and square-bracket node labels, basic `sequenceDiagram` messages, and `pie` charts render as local SVG. Class, ER, state, Gantt, git graph, subgraphs, complex flowchart syntax, styling and other advanced constructs remain visible as source in a fallback panel. Wave does not load a remote Mermaid service.

## HTML and security

Raw HTML is not enabled in the Markdown parser. This is deliberate: Wave uses a sanitized preview and does not execute scripts, event handlers, embedded frames, remote media, or arbitrary HTML. HTML examples in Markdown documents remain source text or are sanitized by the parser. Equivalent safe inline shorthands are available without enabling raw HTML: `==highlight==`, `++underline++`, `^superscript^`, `~subscript~`, and `[[kbd:Ctrl+K]]`. Use `> [!DETAILS] Summary` followed by quoted body lines for a keyboard-operable disclosure block.

## Other diagram formats

PlantUML, Graphviz/DOT, Vega/Vega-Lite, D2, and AsciiDoc diagrams require dedicated parsers/renderers and are not currently rendered. Their source can still be kept in fenced code blocks. Wave will not send document contents to a third-party renderer.

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
