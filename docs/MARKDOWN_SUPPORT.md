# Markdown support in Wave

This page is the compatibility contract for Wave's local Markdown preview. The editor stores the original Markdown text; preview transformations do not rewrite the user's source file. The E2E round-trip scenario checks exact source equality after preview/edit toggling, a completed save, and workspace reload, including syntax that is transformed only for rendering.

## Supported writing syntax

- CommonMark-style paragraphs, hard line breaks, headings (levels 1–6), Setext headings, emphasis, inline code, fenced and indented code, blockquotes, nested blockquotes, ordered/unordered/nested/mixed lists, links, images, thematic breaks, escaping, and reference-style links/images.
- GFM through `remark-gfm`: tables and column alignment, strikethrough, task lists, autolinks, and footnotes.
- Wave extensions: internal wiki links and backlinks, GitHub-style NOTE/TIP/IMPORTANT/WARNING/CAUTION callouts, safe DETAILS disclosure blocks, copyable code, lightweight token/diff highlighting, unique heading IDs, inline/display MathML for a constrained TeX subset, safe inline formatting shorthands, a small emoji shortcode map, and local diagram renderers described below. In the editor toolbar, **Code block** wraps the current selection in a fenced block; with no selection it inserts a focused placeholder. Multiline content and language-tagged fences can also be written directly.
- Local image attachments resolve from the workspace assets directory; Markdown image alt text and titles are retained. External images are not fetched by the preview and display a readable missing-asset fallback.
- Controlled audio/video embeds can reference supported local workspace assets with `[[audio:path/to/file.mp3]]` or `[[video:path/to/file.mp4]]`. The resolver accepts only a single filename inside the workspace `assets` directory, checks the media extension and MIME type, and creates a revocable object URL; remote media, absolute paths, traversal paths and arbitrary HTML media are not loaded.
- Direct Unicode emoji and symbols work as ordinary text.

## Math

Inline expressions use dollar delimiters, for example `$E = mc^2$`. Display expressions can use a line containing two dollar signs before and after the expression, or a fenced `math` block.

The built-in MathML parser supports nested groups, recursive fractions and square roots, indexed roots, grouped superscript/subscript expressions, selected Greek letters/operators/functions, text groups, accents, spacing, binomial notation, and constrained matrix/cases environments. It can render common showcase expressions involving sums, integrals and limits. It remains a deliberately limited TeX subset: arbitrary macros, custom commands, full aligned environments, extensible delimiters, broad symbol packages and the complete TeX grammar are not supported. Unknown commands remain visible as text; TeX is never executed.

## Mermaid

Fenced Mermaid definitions render locally for constrained subsets of flowchart, sequence, pie, class, ER, state, Gantt, git graph, mindmap, timeline, quadrant, requirement and architecture-beta diagrams. These are purpose-built lightweight parsers/layouts, not the complete Mermaid grammar or layout engine. Complex syntax, unsupported directives and malformed input use a readable source fallback. Wave does not load a remote Mermaid service.

## HTML and security

Raw HTML is not enabled in the Markdown parser. Link URLs are sanitized by the Markdown pipeline; active schemes such as `javascript:`, `data:`, `vbscript:` and `file:` must not become clickable anchors. Ordinary HTTPS and mailto links remain available. This is deliberate: Wave uses a sanitized preview and does not execute scripts, event handlers, embedded frames, remote media, or arbitrary HTML. HTML examples in Markdown documents remain source text or are sanitized by the parser. Equivalent safe inline shorthands are available without enabling raw HTML: `==highlight==`, `++underline++`, `^superscript^`, `~subscript~`, and `[[kbd:Ctrl+K]]`. Use `> [!DETAILS] Summary` followed by quoted body lines for a keyboard-operable disclosure block.



### Image accessibility and missing assets

Informative images retain their Markdown alt text as their accessible name. If an informative local image cannot be resolved, Wave renders a visible fallback with image semantics and the same accessible name instead of leaving a broken image. An explicitly empty alt string remains decorative: both loaded and missing decorative images are hidden from assistive technology and do not receive a fabricated fallback label. Reference-style images and images wrapped in links retain their title/alt metadata; linked images remain keyboard-focusable through the surrounding link. Remote image fetching remains disabled.

## Diagram accessibility

Rendered diagrams expose their SVG as a named image, while the surrounding container remains a normal document region. The **View diagram source** disclosure stays outside the image semantics and can be reached and toggled with the keyboard, preserving a readable source alternative for assistive technology.

## Other diagram formats

Fenced DOT/Graphviz, PlantUML, Vega/Vega-Lite, D2 and AsciiDoc have lightweight local subset renderers. These are not full implementations of those specifications; unsupported or invalid constructs remain available through a readable source fallback. Vega data must be inline (remote data URLs are rejected). Wave will not send document contents to a third-party renderer.

## Compatibility matrix

| Feature group | Wave status |
|---|---|
| CommonMark writing syntax | Supported through the configured Markdown parser |
| GFM tables, tasks, strikethrough, autolinks, footnotes | Supported through remark-gfm |
| GitHub-style alert callouts | Supported |
| Local images and Markdown links | Supported with local-asset and URL safety rules; titles/alt text retained |
| Heading anchors | Supported with deterministic duplicate suffixes |
| MathML | Partial local TeX subset; not full LaTeX |
| Mermaid | Partial local renderers for the families listed above; not full Mermaid compatibility |
| DOT/Graphviz, PlantUML, Vega/Vega-Lite, D2, AsciiDoc | Partial local subset renderers |
| Raw HTML | Disabled for safety; safe Wave shorthands and DETAILS disclosure are supported |
| Syntax highlighting | Lightweight token coloring and line-based diff coloring; not grammar-based |
| Audio/video | Controlled local assets only; remote media and arbitrary HTML media are disabled |
| Emoji shortcodes | Small common shortcode set supported; unknown shortcodes remain unchanged |
| GitHub mentions and issue/PR references | Intentionally inert plain text; no GitHub notification behavior |

## Regression entry point

Choose **Markdown feature showcase** from Wave's page templates to try the supported syntax and preview extensions. The browser E2E suite includes a renderer-extension scenario. Run `npm run typecheck`, `npm run build`, and `npm run test:e2e` before treating a source change as verified.
