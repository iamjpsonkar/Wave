# Markdown support in Wave

This page is the compatibility contract for Wave's local Markdown preview. The editor stores the original Markdown text; preview transformations do not rewrite the user's source file.

## Supported writing syntax

- CommonMark-style paragraphs, hard line breaks, headings (levels 1–6), Setext headings, emphasis, inline code, fenced and indented code, blockquotes, nested blockquotes, ordered/unordered/nested/mixed lists, links, images, thematic breaks, escaping, and reference-style links/images.
- GFM through `remark-gfm`: tables and column alignment, strikethrough, task lists, autolinks, and footnotes.
- Wave extensions: internal wiki links and backlinks, GitHub-style NOTE/TIP/IMPORTANT/WARNING/CAUTION callouts, copyable fenced code, heading IDs for in-page links, inline and display math, and simple Mermaid flowcharts.
- Local image attachments resolve from the workspace assets directory. External images are not fetched by the preview.
- Direct Unicode emoji and symbols work as ordinary text.

## Math

Inline expressions use dollar delimiters, for example `$E = mc^2$`. Display expressions can use a line containing two dollar signs before and after the expression, or a fenced `math` block.

The current built-in MathML renderer intentionally supports a small portable subset: basic identifiers/numbers/operators, common Greek commands, simple `\\frac{a}{b}`, `\\sqrt{x}`, and a single superscript or subscript. It is not a full TeX/LaTeX engine. Unsupported TeX commands are shown as their command names rather than executed.

## Mermaid

Fenced Mermaid `flowchart` definitions with simple `-->` edges and square-bracket node labels render as a local SVG. Other Mermaid diagram types (sequence, class, ER, state, Gantt, pie, git graph, and advanced flowchart syntax) remain visible as source in a fallback panel. Wave does not load a remote Mermaid service.

## HTML and security

Raw HTML is not enabled in the Markdown parser. This is deliberate: Wave uses a sanitized preview and does not execute scripts, event handlers, embedded frames, remote media, or arbitrary HTML. HTML examples in Markdown documents remain source text or are sanitized by the parser; HTML-only presentation features such as `<details>`, `<kbd>`, `<mark>`, `<sub>`, and `<sup>` are not guaranteed to render. Use Markdown equivalents where available.

## Other diagram formats

PlantUML, Graphviz/DOT, Vega/Vega-Lite, D2, and AsciiDoc diagrams require dedicated parsers/renderers and are not currently rendered. Their source can still be kept in fenced code blocks. Wave will not send document contents to a third-party renderer.

## Compatibility matrix

| Feature group | Wave status |
|---|---|
| CommonMark writing syntax | Supported |
| GFM tables, tasks, strikethrough, autolinks, footnotes | Supported |
| GitHub-style alert callouts | Supported |
| Local images and Markdown links | Supported with local-asset and URL safety rules |
| Heading anchors | Supported; duplicate-heading suffixes are not yet generated |
| MathML | Partial: documented subset only |
| Mermaid | Partial: simple flowcharts only |
| Raw HTML | Disabled for safety |
| Syntax highlighting | Not yet implemented; code remains readable and copyable |
| Video/audio embeds and arbitrary HTML media | Not supported |
| PlantUML, Graphviz, Vega, D2, AsciiDoc | Not rendered; source is preserved |

## Regression entry point

Choose **Markdown feature showcase** from Wave's page templates to try the supported syntax and preview extensions. The browser E2E suite includes a renderer-extension scenario. Run `npm run typecheck`, `npm run build`, and `npm run test:e2e` before treating a source change as verified.
