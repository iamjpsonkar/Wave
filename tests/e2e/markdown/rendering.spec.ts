import { test, expect, openWorkspace, createPage } from '../fixtures/workspace';

test('workspace creation and autosave write Markdown into the selected local folder', async ({ page }) => {
  await openWorkspace(page);
  await createPage(page, 'Browser Autosave');
  const saved = await page.evaluate(async () => {
    const root = (window as any).__waveTestRoot;
    const wave = await root.getDirectoryHandle('.wave');
    const docs = await wave.getDirectoryHandle('documents');
    const file = await docs.getFileHandle('untitled.md');
    return await (await file.getFile()).text();
  });
  expect(saved).toContain('# Browser Autosave');
  expect(saved).toContain('Browser regression content');
});

test('an IndexedDB recovery draft survives a page reload before Markdown autosave', async ({ page }) => {
  await openWorkspace(page);
  const editor = await createPage(page, 'Recovery Base');
  await editor.fill('# Recovery Base\n\nDraft marker that is not yet in the Markdown file');
  await expect(page.locator('.topright small')).toContainText('Recovery draft saved', { timeout: 5000 });
  await page.reload();
  await page.getByRole('button', { name: /Reopen recent workspace/ }).click();
  await expect(page.getByRole('button', { name: /Recovery Base/ })).toBeVisible();
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: /Recovery Base/ }).click();
  await expect(page.locator('textarea')).toHaveValue(/Draft marker that is not yet in the Markdown file/);
});

test('Trash move and restore preserve the Markdown page', async ({ page }) => {
  await openWorkspace(page);
  await createPage(page, 'Trash Round Trip');
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: /Move to Trash/ }).click();
  await expect(page.locator('.trash-view')).toBeVisible();
  await expect(page.locator('.trash-item')).toContainText('Trash Round Trip');
  await page.getByRole('button', { name: /Restore/ }).click();
  await expect(page.locator('.trash-empty')).toContainText('Trash is empty');
  await page.getByRole('button', { name: /All pages/ }).click();
  await expect(page.getByRole('button', { name: /Trash Round Trip/ })).toBeVisible();
});

test('attachments are saved locally with correct root and nested Markdown paths', async ({ page }) => {
  await openWorkspace(page);
  await createPage(page, 'Root Attachment');
  await page.locator('input[type="file"]').setInputFiles({ name: 'root.txt', mimeType: 'text/plain', buffer: Buffer.from('root attachment bytes') });
  await expect(page.locator('textarea')).toHaveValue(/\.\.\/assets\/root\.txt/);
  await page.once('dialog', dialog => dialog.accept('Projects'));
  await page.locator('button[title="New folder"]').click();
  await expect(page.getByRole('button', { name: /Projects/ })).toBeVisible();
  await page.locator('.sidebar nav button').first().click();
  const editor = page.locator('textarea');
  await expect(editor).toBeVisible();
  await editor.fill('# Nested Attachment\n\nNested page content');
  await expect(page.locator('.topright small')).toContainText('Saved locally', { timeout: 8000 });
  await page.locator('input[type="file"]').setInputFiles({ name: 'nested.txt', mimeType: 'text/plain', buffer: Buffer.from('nested attachment bytes') });
  await expect(editor).toHaveValue(/\.\.\/\.\.\/assets\/nested\.txt/);
  const files = await page.evaluate(async () => {
    const root = (window as any).__waveTestRoot;
    const assets = await (await root.getDirectoryHandle('.wave')).getDirectoryHandle('assets');
    const names: string[] = [];
    for await (const [name] of assets.entries()) names.push(name);
    return names;
  });
  expect(files).toEqual(expect.arrayContaining(['root.txt', 'nested.txt']));
});

test('Markdown preview renders GFM tables, task lists, footnotes and safe alert callouts', async ({ page }) => {
  await openWorkspace(page);
  const editor = await createPage(page, 'Markdown Compatibility');
  await editor.fill([
    '# Markdown Compatibility',
    '',
    '| Name | Status |',
    '| :--- | :---: |',
    '| Wave | Ready |',
    '',
    '- [x] GFM task',
    '- [ ] Pending task',
    '',
    'A footnote reference[^one].',
    '',
    '[^one]: Footnote content survives preview.',
    '',
    '> [!WARNING]',
    '> Review this before continuing.',
    '',
    '> <img src=x onerror=alert(1)>'
  ].join('\n'));
  await page.getByRole('button', { name: 'Preview' }).click();
  await expect(page.locator('.markdown-preview table')).toBeVisible();
  await expect(page.locator('.markdown-preview input[type=checkbox]')).toHaveCount(2);
  await expect(page.locator('.markdown-preview .footnotes')).toContainText('Footnote content survives preview.');
  await expect(page.locator('.markdown-alert-warning')).toContainText('Review this before continuing.');
  await expect(page.locator('.markdown-preview img')).toHaveCount(0);
  await expect(page.locator('.markdown-preview')).not.toContainText('onerror=alert');
});

test('wiki links navigate to pages and backlinks are derived from Markdown files', async ({ page }) => {
  await openWorkspace(page);
  await createPage(page, 'Linked Page');
  const firstPageFiles = await page.evaluate(async () => {
    const root = (window as any).__waveTestRoot;
    const wave = await root.getDirectoryHandle('.wave');
    const documents = await wave.getDirectoryHandle('documents');
    const files: Array<{ name: string; content: string }> = [];
    for await (const [name, handle] of documents.entries()) {
      if (handle.kind === 'file' && name.endsWith('.md')) files.push({ name, content: await (await handle.getFile()).text() });
    }
    return files;
  });
  expect(firstPageFiles.some(file => file.content.includes('# Linked Page'))).toBe(true);
  await expect(page.getByRole('button', { name: /Linked Page/ })).toBeVisible();
  await page.getByRole('button', { name: /New page/ }).first().click();
  const editor = page.locator('textarea');
  await expect(editor).toHaveValue('# Untitled\n\n', { timeout: 8000 });
  await editor.fill('# Source Page\n\nSee [[untitled|the linked page]].');
  await expect(editor).toHaveValue('# Source Page\n\nSee [[untitled|the linked page]].');
  await expect(page.locator('.topright small')).toContainText('Saved locally', { timeout: 8000 });
  await expect(page.getByRole('button', { name: /Source Page/ })).toBeVisible();
  await page.getByRole('button', { name: 'Preview' }).click();
  const previewHtml = await page.locator('.markdown-preview').innerHTML();
  expect(previewHtml).toContain('the linked page');
  expect(previewHtml).not.toContain('wave.invalid');
  await expect(page.locator('.markdown-preview a[href*="wave.invalid"]')).toHaveCount(0);
  const link = page.locator('.wiki-link');
  await expect(link).toHaveText('the linked page');
  await link.click();
  await expect(editor).toHaveValue(/# Linked Page/);
  const backlinks = page.getByRole('button', { name: /Backlinks/ });
  await expect(backlinks).toContainText('1');
  await backlinks.click();
  await expect(page.locator('.backlinks-list')).toContainText('Source Page');
});

test('Markdown preview renders inline/display math, Mermaid flowcharts and heading anchors', async ({ page }) => {
  await openWorkspace(page);
  const editor = await createPage(page, 'Markdown Extensions');
  await editor.fill([
    '# Markdown Extensions',
    '',
    '## A heading with anchors',
    '',
    'Inline math $E = mc^2$.',
    '',
    '$$',
    '\\frac{a}{b}',
    '$$',
    '',
    '```mermaid',
    'flowchart TD',
    '  A[Write] --> B[Preview]',
    '  B --> C[Save]',
    '```'
  ].join('\n'));
  await page.getByRole('button', { name: 'Preview' }).click();
  await expect(page.locator('.markdown-preview h2#a-heading-with-anchors')).toBeVisible();
  await expect(page.locator('.markdown-math-inline math')).toBeVisible();
  await expect(page.locator('.markdown-math-display math')).toBeVisible();
  await expect(page.locator('.mermaid-diagram svg')).toBeVisible();
});

test('Markdown extended preview highlights code, expands heading anchors, emoji and Mermaid sequence/pie', async ({ page }) => {
  await openWorkspace(page);
  const editor = await createPage(page, 'Markdown Extended Features');
  await editor.fill([
    '# Markdown Extended Features',
    '',
    '## Repeated heading',
    '## Repeated heading',
    '',
    'Emoji shortcodes :rocket: :smile: :+1: stay readable.',
    '',
    '```typescript',
    'const answer = 42;',
    '```',
    '',
    '```mermaid',
    'sequenceDiagram',
    'Alice->>Bob: Hello Bob',
    'Bob-->>Alice: Hello Alice',
    '```',
    '',
    '```mermaid',
    'pie showData',
    'title Browser share',
    '"Chrome" : 65',
    '"Firefox" : 20',
    '"Safari" : 15',
    '```'
  ].join('\n'));
  await page.getByRole('button', { name: 'Preview' }).click();
  await expect(page.locator('.markdown-preview h2#repeated-heading')).toHaveCount(1);
  await expect(page.locator('.markdown-preview h2#repeated-heading-1')).toHaveCount(1);
  await expect(page.locator('.markdown-preview')).toContainText('🚀 😄 👍');
  await expect(page.locator('.markdown-preview .syntax-keyword').filter({ hasText: 'const' }).first()).toBeVisible();
  await expect(page.locator('.markdown-preview .syntax-number')).toContainText('42');
  await expect(page.locator('.markdown-preview .mermaid-diagram svg')).toHaveCount(2);
  await expect(page.locator('.markdown-preview .mermaid-pie')).toBeVisible();
});

test('Markdown CommonMark links, hard breaks, escaped tables and safe image fallbacks', async ({ page }) => {
  await openWorkspace(page);
  const editor = await createPage(page, 'Markdown Conformance');
  await editor.fill([
    '# Markdown Conformance',
    '',
    'First hard-break line  ',
    'Second hard-break line\\',
    'Third line',
    '',
    '[reference link][guide]',
    '',
    '[guide]: https://example.com/docs "Guide title"',
    '',
    '[![Remote image alt][remote-image]][guide]',
    '',
    '[remote-image]: https://example.com/remote.png "Remote image title"',
    '',
    '| Left | Right |',
    '| --- | --- |',
    '| escaped \\| pipe | value |',
    '',
    '[unsafe](javascript:alert(1))',
    '',
    '- Parent',
    '  continuation paragraph',
    '  - Nested child'
  ].join('\n'));
  await page.getByRole('button', { name: 'Preview' }).click();
  const preview = page.locator('.markdown-preview');
  await expect(preview.locator('p').filter({ hasText: 'First hard-break line' })).toContainText('Second hard-break line');
  await expect(preview.locator('p').filter({ hasText: 'Second hard-break line' })).toContainText('Third line');
  await expect(preview.locator('a[title="Guide title"]').first()).toHaveAttribute('href', 'https://example.com/docs');
  await expect(preview.locator('.missing-asset[title="Remote image title"]')).toContainText('Remote image alt');
  await expect(preview.locator('table')).toContainText('escaped | pipe');
  await expect(preview.locator('a[href^="javascript:"]')).toHaveCount(0);
  await expect(preview.locator('ul ul')).toContainText('Nested child');
});

test('Markdown inline syntax, code literal preservation, duplicate slugs, nested lists and diff highlighting', async ({ page, context }) => {
  await openWorkspace(page);
  const editor = await createPage(page, 'Markdown Core Conformance');
  await editor.fill([
    '# Duplicate: Title!',
    '# Duplicate: Title!',
    '## Héading & punctuation?',
    '',
    '==marked== ++underlined++ ^super^ ~sub~ [[kbd:Alt+Shift]] :rocket: :unknown_shortcode:',
    '',
    'Inline code `:rocket: ==literal==` must stay literal.',
    'References remain inert: @waveuser #123 owner/repo#456.',
    'Escapes: \\*bold\\* \\_italic\\_ \\[link\\] \\#hash \\+plus \\.dot \\!bang.',
    '',
    '````text',
    '```',
    ':rocket: ==not transformed==',
    '```',
    '````',
    '',
    '- Outer item',
    '  Continuation paragraph',
    '  - Nested item',
    '    - Deep item',
    '      ```js',
    '      const nested = true;',
    '      ```',
    '',
    '```python',
    'def greet(name):',
    '    return "hello " + name',
    '```',
    '',
    '```diff',
    '--- a/example.txt',
    '+++ b/example.txt',
    '@@ -1 +1 @@',
    '-old value',
    '+new value',
    '```'
  ].join('\n'));
  await page.getByRole('button', { name: 'Preview' }).click();
  const preview = page.locator('.markdown-preview');
  await expect(preview.locator('h1#duplicate-title')).toHaveCount(1);
  await expect(preview.locator('h1#duplicate-title-1')).toHaveCount(1);
  await expect(preview.locator('h2#heading-punctuation')).toHaveCount(1);
  await expect(preview.locator('mark')).toHaveText('marked');
  await expect(preview.locator('u')).toHaveText('underlined');
  await expect(preview.locator('sup')).toHaveText('super');
  await expect(preview.locator('sub')).toHaveText('sub');
  await expect(preview.locator('kbd')).toHaveText('Alt+Shift');
  await expect(preview).toContainText('🚀 :unknown_shortcode:');
  await expect(preview.locator('code').filter({ hasText: ':rocket: ==literal==' })).toHaveCount(1);
  await expect(preview).toContainText('@waveuser #123 owner/repo#456');
  await expect(preview.locator('a').filter({ hasText: /@waveuser|#123|owner\/repo#456/ })).toHaveCount(0);
  await expect(preview.locator('code').filter({ hasText: ':rocket: ==not transformed==' })).toHaveCount(1);
  await expect(preview.locator('ul ul ul')).toContainText('Deep item');
  await expect(preview.locator('.syntax-keyword').filter({ hasText: /^def$/ })).toBeVisible();
  await expect(preview.locator('.syntax-diff-removed')).toHaveText('-old value');
  await expect(preview.locator('.syntax-diff-added')).toHaveText('+new value');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const pythonBlock = preview.locator('.markdown-code').filter({ hasText: 'def greet(name):' });
  await pythonBlock.getByRole('button', { name: 'Copy code block' }).click();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toBe('def greet(name):\n    return "hello " + name\n');
});

test('Technical learning notes template contains real Markdown newlines and previews structurally', async ({ page }) => {
  await openWorkspace(page);
  await page.getByRole('button', { name: 'New from template' }).click();
  await page.locator('.sidebar-templates').getByRole('button', { name: /Technical learning notes/ }).click();
  const editor = page.locator('textarea');
  const markdown = await editor.inputValue();
  expect(markdown).toContain('## Introduction\n\nWhat is this technology');
  expect(markdown).toContain('## Open questions\n\n- [ ]');
  await page.getByRole('button', { name: 'Preview' }).click();
  await expect(page.locator('.markdown-preview').getByRole('heading', { level: 2, name: 'Introduction' })).toBeVisible();
  await expect(page.locator('.markdown-preview').getByRole('heading', { level: 2, name: 'Open questions' })).toBeVisible();
  await expect(page.locator('.markdown-preview pre code')).toContainText('Add a small, self-contained example');
  await expect(page.locator('.markdown-preview table')).toContainText('Symptom');
  await expect(page.locator('.markdown-preview')).toContainText('Trust boundaries:');
});

test('Markdown math renders quadratic formula, matrices, cases, sums, integrals and limits', async ({ page }) => {
  await openWorkspace(page);
  const editor = await createPage(page, 'LaTeX Math Coverage');
  await editor.fill([
    '# LaTeX Math Coverage',
    '',
    '$$',
    'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
    '$$',
    '',
    '$$',
    '\\begin{bmatrix}a & b\\\\ c & d\\end{bmatrix}',
    '$$',
    '',
    '$$',
    'f(x)=\\begin{cases}x^2 & x \\geq 0\\\\-x & x < 0\\end{cases}',
    '$$',
    '',
    '$$',
    '\\sum_{i=1}^{n} i^2 + \\int_0^1 x\\,dx + \\lim_{x\\to 0}\\frac{\\sin x}{x}',
    '$$',
    '',
    '$$',
    '\\binom{n}{k} \\quad \\sqrt[3]{x} \\quad \\overline{AB}',
    '$$'
  ].join('\n'));
  await page.getByRole('button', { name: 'Preview' }).click();
  const math = page.locator('.markdown-math-display math');
  await expect(math).toHaveCount(5);
  await expect(math.nth(0).locator('mfrac')).toHaveCount(1);
  await expect(math.nth(1).locator('mfenced mtable mtr')).toHaveCount(2);
  await expect(math.nth(2).locator('mtable mtr')).toHaveCount(2);
  await expect(math.nth(3).locator('msubsup')).toHaveCount(2);
  await expect(math.nth(3).locator('mfrac')).toHaveCount(1);
  await expect(math.nth(4).locator('mroot')).toHaveCount(1);
  await expect(math.nth(4).locator('mover')).toHaveCount(1);
});

test('Markdown Mermaid class, ER, state, Gantt, git and extended flowchart diagrams render locally', async ({ page }) => {
  await openWorkspace(page);
  const editor = await createPage(page, 'Mermaid Diagram Families');
  await editor.fill([
    '# Mermaid Diagram Families',
    '',
    '```mermaid',
    'flowchart LR',
    'A([Start]) -->|continue| B{Decision}',
    'B -.-> C((Done))',
    'B ==> D[Finish]',
    '```',
    '',
    '```mermaid',
    'classDiagram',
    'class Animal {',
    '  +String name',
    '  +eat()',
    '}',
    'Animal <|-- Duck',
    '```',
    '',
    '```mermaid',
    'erDiagram',
    'CUSTOMER ||--o{ ORDER : places',
    'CUSTOMER {',
    '  string name',
    '}',
    'ORDER {',
    '  int id',
    '}',
    '```',
    '',
    '```mermaid',
    'stateDiagram-v2',
    '[*] --> Still',
    'Still --> Moving : Start',
    'Moving --> [*]',
    '```',
    '',
    '```mermaid',
    'gantt',
    'title Release plan',
    'dateFormat YYYY-MM-DD',
    'section Build',
    'Design :task1, 2026-01-01, 3d',
    'Implementation :after task1, 5d',
    '```',
    '',
    '```mermaid',
    'gitGraph',
    'commit id: "Initial"',
    'branch develop',
    'checkout develop',
    'commit id: "Feature"',
    'checkout main',
    'merge develop',
    '```'
  ].join('\n'));
  await page.getByRole('button', { name: 'Preview' }).click();
  const diagrams = page.locator('.markdown-preview .mermaid-diagram');
  await expect(diagrams).toHaveCount(6);
  await expect(diagrams.nth(0)).toContainText('Start');
  await expect(diagrams.nth(0)).toContainText('Decision');
  await expect(diagrams.nth(0)).toContainText('Done');
  await expect(diagrams.nth(0)).toContainText('Finish');
  await expect(diagrams.nth(1).locator('text').filter({ hasText: 'Animal' })).toBeVisible();
  await expect(diagrams.nth(2).locator('text').filter({ hasText: /^CUSTOMER$/ })).toBeVisible();
  await expect(diagrams.nth(3).locator('text').filter({ hasText: 'Moving' })).toBeVisible();
  await expect(diagrams.nth(4).locator('rect')).toHaveCount(2);
  await expect(diagrams.nth(5).locator('circle')).toHaveCount(3);
  await expect(diagrams.locator('.diagram-source summary')).toHaveCount(6);
});

test('Markdown local DOT, PlantUML, Vega-Lite, D2 and AsciiDoc renderers stay offline', async ({ page }) => {
  await openWorkspace(page);
  const editor = await createPage(page, 'Other Local Renderers');
  await editor.fill([
    '# Other Local Renderers',
    '',
    '```dot',
    'digraph {',
    '  A [label="Start"];',
    '  A -> B;',
    '  B -> C;',
    '}',
    '```',
    '',
    '```plantuml',
    '@startuml',
    'Alice -> Bob : hello',
    'Bob --> Alice : reply',
    '@enduml',
    '```',
    '',
    '```vega-lite',
    '{"title":"Sales","data":{"values":[{"category":"A","amount":5},{"category":"B","amount":9}]},"mark":"bar","encoding":{"x":{"field":"category","type":"nominal"},"y":{"field":"amount","type":"quantitative"}}}',
    '```',
    '',
    '```d2',
    'browser: Browser',
    'api: API',
    'browser -> api: Request',
    '```',
    '',
    '```asciidoc',
    '= Training Notes',
    '',
    '== Overview',
    '',
    'This is *bold* and _italic_.',
    '',
    '* First item',
    '* Second item',
    '',
    '----',
    'const answer = 42;',
    '----',
    '```'
  ].join('\n'));
  await page.getByRole('button', { name: 'Preview' }).click();
  const preview = page.locator('.markdown-preview');
  await expect(preview.locator('.mermaid-diagram')).toHaveCount(4);
  await expect(preview.locator('.mermaid-diagram svg')).toHaveCount(4);
  await expect(preview.locator('.asciidoc-preview h1')).toHaveText('Training Notes');
  await expect(preview.locator('.asciidoc-preview strong')).toHaveText('bold');
  await expect(preview.locator('.asciidoc-preview em')).toHaveText('italic');
  await expect(preview.locator('.asciidoc-preview ul li')).toHaveCount(2);
  await expect(preview.locator('.asciidoc-preview pre code')).toContainText('const answer = 42;');
});

test('Markdown embeds only local audio and video assets and rejects remote media paths', async ({ page }) => {
  await openWorkspace(page);
  await page.evaluate(async () => {
    const root = (window as any).__waveTestRoot;
    const wave = await root.getDirectoryHandle('.wave');
    const assets = await wave.getDirectoryHandle('assets');
    const audio = await assets.getFileHandle('sample.mp3', { create: true });
    const audioWriter = await audio.createWritable();
    await audioWriter.write(new Blob(['local audio fixture'], { type: 'audio/mpeg' }));
    await audioWriter.close();
    const video = await assets.getFileHandle('sample.mp4', { create: true });
    const videoWriter = await video.createWritable();
    await videoWriter.write(new Blob(['local video fixture'], { type: 'video/mp4' }));
    await videoWriter.close();
  });
  const editor = await createPage(page, 'Local Media');
  await editor.fill([
    '# Local Media',
    '',
    '[[audio:assets/sample.mp3]]',
    '',
    '[[video:assets/sample.mp4]]',
    '',
    '[[audio:https://example.com/remote.mp3]]'
  ].join('\n'));
  await page.getByRole('button', { name: 'Preview' }).click();
  const preview = page.locator('.markdown-preview');
  await expect(preview.locator('audio[controls]')).toBeVisible();
  await expect(preview.locator('video[controls]')).toBeVisible();
  await expect(preview.locator('.missing-asset')).toContainText('Only local workspace media can be embedded.');
  await expect(preview.locator('audio[src^="https://"], video[src^="https://"]')).toHaveCount(0);
});

test('Markdown preview is source-preserving across toggle, save and workspace reopen', async ({ page }) => {
  await openWorkspace(page);
  const editor = await createPage(page, 'Source Round Trip');
  const original = [
    '# Source Round Trip',
    '',
    'Two spaces make a hard break  ',
    'and this is the next line.',
    '',
    'A **bold** phrase, a [safe link](https://example.com/docs), and a wiki link [[Missing Page]].',
    '',
    '`inline code with *literal* markup`',
    '',
    '```typescript',
    'const answer: number = 42;',
    '```',
    '',
    '| Column A | Column B |',
    '| --- | --- |',
    '| escaped \\| pipe | value |',
    '',
    '```math',
    '\\frac{1}{\\sqrt{x_1 + \\alpha^2}}',
    '```',
    '',
    '> [!NOTE]',
    '> Preview must not rewrite this source.',
    '',
    '<script>this must remain inert source text</script>',
    ''
  ].join('\n');
  await editor.fill(original);
  await expect(page.locator('.topright small')).toContainText('Saved locally', { timeout: 8000 });
  await page.getByRole('button', { name: 'Preview' }).click();
  await expect(page.locator('.markdown-preview h1')).toHaveText('Source Round Trip');
  await expect(page.locator('.markdown-preview table')).toContainText('escaped | pipe');
  await expect(page.locator('.markdown-preview .markdown-math-display math')).toBeVisible();
  await expect(page.locator('.markdown-preview .wiki-link-unresolved')).toContainText('Missing Page');
  await page.getByRole('button', { name: 'Edit' }).click();
  await expect(page.locator('textarea')).toHaveValue(original);
  const saved = await page.evaluate(async () => {
    const root = (window as any).__waveTestRoot;
    const wave = await root.getDirectoryHandle('.wave');
    const docs = await wave.getDirectoryHandle('documents');
    const file = await docs.getFileHandle('untitled.md');
    return await (await file.getFile()).text();
  });
  expect(saved).toBe(original);
  await page.reload();
  await page.getByRole('button', { name: /Reopen recent workspace/ }).click();
  await expect(page.getByRole('button', { name: /Source Round Trip/ })).toBeVisible();
  await page.getByRole('button', { name: /Source Round Trip/ }).click();
  await expect(page.locator('textarea')).toHaveValue(original);
});

test('Markdown Mermaid mindmap, timeline, quadrant, requirement and architecture renderers expose source', async ({ page }) => {
  await openWorkspace(page);
  const editor = await createPage(page, 'More Mermaid Families');
  await editor.fill([
    '# More Mermaid Families',
    '',
    '```mermaid',
    'mindmap',
    '  root((Wave))',
    '    Writing',
    '      Markdown',
    '    Workspace',
    '```',
    '',
    '```mermaid',
    'timeline',
    'title Wave history',
    '2024 : First notes',
    '2025 : Local workspace',
    '2026 : Markdown preview',
    '```',
    '',
    '```mermaid',
    'quadrantChart',
    'title Priorities',
    'x-axis Low --> High',
    'y-axis Low --> High',
    'quadrant-1 Do next',
    'quadrant-2 Plan',
    'quadrant-3 Later',
    'quadrant-4 Avoid',
    'Reliability: [0.8, 0.9]',
    'Polish: [0.4, 0.6]',
    '```',
    '',
    '```mermaid',
    'requirementDiagram',
    'requirement localStorage {',
    '  id: R1',
    '  text: Local persistence',
    '  risk: high',
    '  verifymethod: test',
    '}',
    'element workspace {',
    '  type: system',
    '}',
    'workspace - satisfies -> localStorage',
    '```',
    '',
    '```mermaid',
    'architecture-beta',
    'group cloud(cloud)[Cloud]',
    'service api(server)[API] in cloud',
    'service db(database)[Database] in cloud',
    'api:R -- L:db',
    '```'
  ].join('\n'));
  await page.getByRole('button', { name: 'Preview' }).click();
  const diagrams = page.locator('.markdown-preview .mermaid-diagram');
  await expect(diagrams).toHaveCount(5);
  await expect(diagrams.nth(0).locator('rect')).toHaveCount(4);
  await expect(diagrams.nth(1).locator('circle')).toHaveCount(3);
  await expect(diagrams.nth(2).locator('circle')).toHaveCount(2);
  await expect(diagrams.nth(3).locator('rect')).toHaveCount(2);
  await expect(diagrams.nth(4).locator('rect')).toHaveCount(3);
  await expect(diagrams.locator('.diagram-source summary')).toHaveCount(5);
});

test('Markdown images preserve decorative semantics, accessible fallbacks and reference links', async ({ page }) => {
  await openWorkspace(page);
  await page.evaluate(async () => {
    const root = (window as any).__waveTestRoot;
    const wave = await root.getDirectoryHandle('.wave');
    const assets = await wave.getDirectoryHandle('assets');
    const image = await assets.getFileHandle('one-pixel.png', { create: true });
    const bytes = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/aKcAAAAASUVORK5CYII='), value => value.charCodeAt(0));
    const writer = await image.createWritable();
    await writer.write(new Blob([bytes], { type: 'image/png' }));
    await writer.close();
  });
  const editor = await createPage(page, 'Image Accessibility');
  await editor.fill([
    '# Image Accessibility',
    '',
    '![Accessible artwork](assets/one-pixel.png "Artwork title")',
    '',
    '![](assets/one-pixel.png)',
    '',
    '![Missing artwork](assets/missing.png "Missing title")',
    '',
    '![](assets/missing-decorative.png)',
    '',
    '[![Linked artwork][reference-art]](https://example.com/gallery "Gallery")',
    '',
    '[reference-art]: assets/one-pixel.png "Reference title"'
  ].join('\n'));
  await page.getByRole('button', { name: 'Preview' }).click();
  const preview = page.locator('.markdown-preview');
  const artwork = preview.getByRole('img', { name: 'Accessible artwork' });
  await expect(artwork).toHaveAttribute('alt', 'Accessible artwork');
  await expect(artwork).toHaveAttribute('title', 'Artwork title');
  await expect(preview.locator('img[alt=""]')).toHaveCount(1);
  const missing = preview.getByRole('img', { name: 'Missing artwork' });
  await expect(missing).toHaveText('Missing artwork');
  await expect(missing).toHaveAttribute('aria-label', 'Missing artwork');
  await expect(preview.locator('.missing-asset[aria-hidden="true"][role="presentation"]')).toHaveCount(1);
  const linkedImage = preview.getByRole('link', { name: 'Linked artwork' });
  await expect(linkedImage).toHaveAttribute('href', 'https://example.com/gallery');
  await linkedImage.focus();
  await expect(linkedImage).toBeFocused();
  await expect(linkedImage.locator('.missing-asset')).toHaveAttribute('title', 'Reference title');
});

test('Math rendering rejects malformed and oversized input within explicit resource limits', async ({ page }) => {
  await openWorkspace(page);
  const editor = await createPage(page, 'Math Safety Limits');
  const nested = '{'.repeat(60) + 'x' + '}'.repeat(60);
  const oversized = 'x+'.repeat(4100);
  await editor.fill([
    '# Math Safety Limits',
    '',
    '```math',
    '\\frac{1}{',
    '```',
    '',
    '```math',
    nested,
    '```',
    '',
    '```math',
    oversized,
    '```'
  ].join('\n'));
  await page.getByRole('button', { name: 'Preview' }).click();
  const fallbacks = page.locator('.markdown-math-fallback');
  await expect(fallbacks).toHaveCount(3);
  await expect(fallbacks.nth(0)).toContainText('unbalanced grouping braces');
  await expect(fallbacks.nth(1)).toContainText('nesting exceeds the 48-level limit');
  await expect(fallbacks.nth(2)).toContainText('expression exceeds the 8192-character limit');
  await expect(fallbacks.nth(2).locator('code')).toContainText('…');
});

test('system dark theme keeps Markdown and workspace controls readable', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await openWorkspace(page);
  const editor = await createPage(page, 'System Dark Theme');
  await editor.fill(['# Readable heading', '', 'Body text with `inline code`.', '', '```js', 'const wave = true;', '```', '', '> A readable quotation', '', '| Name | Value |', '| --- | --- |', '| Wave | Local |'].join('\n'));
  await page.getByRole('button', { name: 'Preview' }).click();
  const preview = page.locator('.markdown-preview');
  await expect(page.locator('[data-testid="wave-app"]')).toHaveClass(/theme-system/);
  await expect(preview.locator('h1')).toHaveCSS('color', 'rgb(237, 242, 233)');
  await expect(preview.locator('pre')).toHaveCSS('background-color', 'rgb(32, 40, 32)');
  await expect(preview.locator('code').first()).toHaveCSS('background-color', 'rgb(37, 47, 38)');
  await expect(page.locator('.view-toggle')).toHaveCSS('background-color', 'rgb(37, 45, 37)');
  await expect(page.locator('.brand')).toHaveCSS('color', 'rgb(229, 233, 225)');
  await expect(page.locator('.backup-button')).toHaveCSS('background-color', 'rgb(37, 45, 37)');
});

test('UI-020 theme and editor/preview matrix keeps representative Markdown readable at desktop and mobile widths', async ({ page }) => {
  await openWorkspace(page);
  const editor = await createPage(page, 'Theme Matrix');
  await editor.fill([
    '# Theme matrix heading',
    '',
    'Readable body text with [a local-first link](https://example.com), **bold**, and \`inline code\`.',
    '',
    String.fromCharCode(96).repeat(3) + 'ts',
    'const wave = "portable";',
    String.fromCharCode(96).repeat(3),
    '',
    '> [!NOTE]',
    '> A readable note callout.',
    '',
    '> [!DETAILS] Disclosure example',
    '> Disclosure body text.',
    '',
    '| Feature | Status |',
    '| --- | --- |',
    '| Markdown | Local |',
    '',
    '\`\`\`math',
    '\\frac{1}{2}',
    '\`\`\`',
    '',
    '\`\`\`mermaid',
    'flowchart TD',
    '  A[Local] --> B[Portable]',
    '\`\`\`',
    '',
    '![Missing illustration](assets/not-present.png)'
  ].join('\n'));

  const themes = [
    { name: 'light', system: 'light', expectedClass: 'theme-light' },
    { name: 'dark', system: 'dark', expectedClass: 'theme-dark' },
    { name: 'system', system: 'dark', expectedClass: 'theme-system' }
  ];
  const states: Array<{ theme: string; viewport: string; mode: string; colors: Record<string, string | number> }> = [];
  for (const theme of themes) {
    await page.emulateMedia({ colorScheme: theme.system as 'light' | 'dark' });
    await page.getByRole('button', { name: 'Settings' }).click();
    const dialog = page.getByRole('dialog', { name: 'Settings' });
    await dialog.getByLabel('Theme').selectOption(theme.name);
    await dialog.getByRole('button', { name: 'Done' }).click();
    await expect(page.locator('[data-testid="wave-app"]')).toHaveClass(new RegExp(theme.expectedClass));

    for (const viewport of [{ name: 'wide', width: 1440, height: 1000 }, { name: 'tablet', width: 1024, height: 900 }, { name: 'small-tablet', width: 768, height: 900 }, { name: 'mobile', width: 390, height: 844 }, { name: 'compact-mobile', width: 320, height: 720 }]) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      for (const mode of ['edit', 'preview']) {
        if (mode === 'preview') await page.getByRole('button', { name: 'Preview' }).click();
        else await page.getByRole('button', { name: 'Edit' }).click();
        let colors: Record<string, string | number> = {};
        if (mode === 'edit') {
          await expect(page.locator('.editor textarea')).toBeVisible();
          await expect(page.locator('.editor textarea')).toHaveValue(/Theme matrix heading/);
          colors = await page.locator('.editor textarea').evaluate(node => ({
            foreground: getComputedStyle(node).color,
            background: getComputedStyle(node).backgroundColor
          }));
        } else {
          const preview = page.locator('.markdown-preview');
          await expect(preview.locator('h1')).toContainText('Theme matrix heading');
          await expect(preview.locator('a')).toHaveCount(1);
          await expect(preview.locator('pre')).toBeVisible();
          await expect(preview.locator('.markdown-alert')).toBeVisible();
          await expect(preview.locator('.markdown-details')).toBeVisible();
          await expect(preview.locator('table')).toBeVisible();
          await expect(preview.locator('.markdown-math-display')).toBeVisible();
          await expect(preview.locator('.mermaid-diagram svg')).toBeVisible();
          await expect(preview.getByRole('img', { name: 'Missing illustration' })).toBeVisible();
          colors = await preview.evaluate(node => {
            const style = (selector: string) => {
              const element = node.querySelector(selector);
              return element ? getComputedStyle(element) : null;
            };
            const rgb = (value: string) => (value.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
            const luminance = (value: string) => {
              const channels = rgb(value).map(channel => {
                const normalized = channel / 255;
                return normalized <= 0.04045 ? normalized / 12.92 : Math.pow((normalized + 0.055) / 1.055, 2.4);
              });
              return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
            };
            let surface: HTMLElement | null = node;
            let background = 'rgb(255, 255, 255)';
            while (surface) {
              const candidate = getComputedStyle(surface).backgroundColor;
              if (candidate !== 'rgba(0, 0, 0, 0)' && !candidate.endsWith(', 0)')) { background = candidate; break; }
              surface = surface.parentElement;
            }
            const contrast = (foreground: string) => {
              const a = luminance(foreground), b = luminance(background);
              return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
            };
            const foreground = getComputedStyle(node).color;
            const heading = style('h1')?.color ?? '';
            return {
              foreground,
              heading,
              codeSurface: style('pre')?.backgroundColor ?? '',
              alertSurface: style('.markdown-alert')?.backgroundColor ?? '',
              detailsSurface: style('.markdown-details')?.backgroundColor ?? '',
              diagramSurface: style('.mermaid-diagram')?.backgroundColor ?? '',
              bodyContrast: contrast(foreground),
              headingContrast: contrast(heading)
            };
          });
          for (const [key, value] of Object.entries(colors)) {
            expect(value).not.toBe('');
            expect(value).not.toBe('rgba(0, 0, 0, 0)');
          }
          expect(colors.bodyContrast).toBeGreaterThanOrEqual(4.5);
          expect(colors.headingContrast).toBeGreaterThanOrEqual(4.5);
        }
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
        expect(overflow).toBe(false);
        states.push({ theme: theme.name, viewport: viewport.name, mode, colors });
      }
    }
  }
  expect(states).toHaveLength(30);
});

test('optional block editing preserves untouched Markdown source and edits one block in place', async ({ page }) => {
  await openWorkspace(page);
  const editor = await createPage(page, 'Block Editor');
  const source = [
    '# Block editor test',
    '',
    'Paragraph stays intact.',
    '',
    '- First item',
    '- Second item',
    '',
    '> [!NOTE]',
    '> Important detail',
    '',
    '\`\`\`ts',
    'const value = 1;',
    '\`\`\`'
  ].join('\n');
  await editor.fill(source);
  await page.getByRole('button', { name: 'Block editing' }).click();
  const blocks = page.getByRole('region', { name: 'Markdown block editor' });
  await expect(blocks.getByRole('textbox', { name: 'Edit heading block 1' })).toHaveValue('# Block editor test');
  await expect(blocks.getByRole('textbox', { name: 'Edit list block 3' })).toHaveValue(/First item/);
  await expect(blocks.getByRole('textbox', { name: 'Edit callout block 4' })).toBeVisible();
  await expect(blocks.getByRole('textbox', { name: 'Edit code block 5' })).toBeVisible();
  await blocks.getByRole('textbox', { name: 'Edit paragraph block 2' }).fill('Edited paragraph text.');
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(blocks.getByRole('textbox', { name: 'Edit paragraph block 2' })).toHaveValue('Paragraph stays intact.');
  await page.getByRole('button', { name: 'Redo' }).click();
  await expect(blocks.getByRole('textbox', { name: 'Edit paragraph block 2' })).toHaveValue('Edited paragraph text.');
  await page.getByRole('button', { name: 'Block editing' }).click();
  await expect(page.locator('.editor textarea')).toHaveValue(source.replace('Paragraph stays intact.', 'Edited paragraph text.'));
});

test('block editor reorders blocks without losing separators and inserts common Markdown blocks', async ({ page }) => {
  await openWorkspace(page);
  const editor = await createPage(page, 'Block Controls');
  const source = '# First\n\nParagraph block.\n\n- List item';
  await editor.fill(source);
  await page.getByRole('button', { name: 'Block editing' }).click();
  const blocks = page.getByRole('region', { name: 'Markdown block editor' });
  await blocks.getByRole('button', { name: 'Move block 2 down' }).click();
  await expect(blocks.getByRole('textbox', { name: 'Edit list block 2' })).toHaveValue('- List item');
  await expect(blocks.getByRole('textbox', { name: 'Edit paragraph block 3' })).toHaveValue('Paragraph block.');
  await blocks.getByRole('button', { name: 'Move block 3 up' }).click();
  await blocks.getByRole('button', { name: 'Drag block 2' }).dragTo(blocks.locator('.markdown-block').nth(2));
  await expect(blocks.getByRole('textbox', { name: 'Edit list block 2' })).toHaveValue('- List item');
  await blocks.getByRole('button', { name: 'Move block 3 up' }).click();
  await blocks.getByRole('button', { name: 'Add block' }).click();
  await blocks.getByRole('menu', { name: 'Add a Markdown block' }).getByRole('menuitem', { name: 'Heading' }).click();
  await expect(blocks.getByRole('textbox', { name: 'Edit heading block 4' })).toHaveValue('## New heading');
  await page.getByRole('button', { name: 'Block editing' }).click();
  await expect(page.locator('.editor textarea')).toHaveValue(source + '\n\n## New heading');
});

test('foreground and background color formatting round-trip through Markdown preview', async ({ page }) => {
  await openWorkspace(page);
  const editor = await createPage(page, 'Color Formatting');
  await editor.fill('Foreground sample\n\nBackground sample\n\nLiteral code: `[[color:#123456|not colored]]`\n\nInvalid directive: [[color:red|plain text]]');
  await editor.evaluate((node: HTMLTextAreaElement) => {
    const start = node.value.indexOf('Foreground sample');
    node.focus(); node.setSelectionRange(start, start + 'Foreground sample'.length);
  });
  await page.locator('input[aria-label="Text color"]').evaluate((node: HTMLInputElement) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(node, '#123456'); node.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await expect(editor).toHaveValue(/\[\[color:#123456\|Foreground sample\]\]/);
  await editor.evaluate((node: HTMLTextAreaElement) => {
    const start = node.value.indexOf('Background sample');
    node.focus(); node.setSelectionRange(start, start + 'Background sample'.length);
  });
  await page.locator('input[aria-label="Text background color"]').evaluate((node: HTMLInputElement) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(node, '#fff0a8'); node.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await expect(editor).toHaveValue(/\[\[bg:#FFF0A8\|Background sample\]\]/);
  await page.getByRole('button', { name: 'Preview' }).click();
  const preview = page.locator('.markdown-preview');
  await expect(preview.locator('span[style*="color: rgb(18, 52, 86)"]')).toContainText('Foreground sample');
  await expect(preview.locator('span[style*="background-color: rgb(255, 240, 168)"]')).toContainText('Background sample');
  await expect(preview.locator('code')).toContainText('[[color:#123456|not colored]]');
  await expect(preview).toContainText('Invalid directive: [[color:red|plain text]]');
  await page.getByRole('button', { name: 'Edit' }).click();
  await expect(editor).toHaveValue(/Literal code: `\[\[color:#123456\|not colored\]\]`/);
});

test('PDF export uses a readable print palette and preserves Markdown content', async ({ page }) => {
  await openWorkspace(page);
  await createPage(page, 'PDF Export Regression');
  const source = [
    '# Print palette regression',
    '',
    'Readable body text and [[color:#365FBA|blue custom text]], [[color:#26734D|green text]], [[color:#C0392B|red text]] and [[bg:#FFF0A8|highlighted background]].',
    '',
    '| Feature | Status | Priority |',
    '|:--|:--:|--:|',
    '| Markdown preview | Ready | 1 |',
    '',
    '> [!DETAILS] Expand for more information',
    '> Disclosure body remains part of the exported document.',
    '',
    '$$',
    '\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}',
    '$$'
  ].join('\\n');
  await page.locator('textarea').fill(source);
  await page.getByRole('button', { name: 'Preview' }).click();
  const preview = page.locator('.markdown-preview');
  await expect(preview).toContainText('Readable body text');
  await expect(preview.locator('.wave-inline-color')).toContainText('blue custom text');
  await expect(preview.locator('.wave-inline-color')).toContainText('green text');
  await expect(preview.locator('.wave-inline-color')).toContainText('red text');
  await expect(preview.locator('.wave-inline-background')).toContainText('highlighted background');
  await expect(preview.locator('tbody tr').first().locator('td').nth(2)).toHaveText('1');
  await expect(preview.locator('.markdown-special-block math')).toBeVisible();
  await expect(preview.locator('details')).toContainText('Disclosure body remains part of the exported document.');
  await page.evaluate(() => {
    (window as any).__wavePrintCalled = false;
    window.print = () => {
      (window as any).__wavePrintCalled = true;
      window.dispatchEvent(new Event('afterprint'));
    };
  });
  const originalTitle = await page.title();
  await page.getByRole('button', { name: 'Export PDF' }).click();
  expect(await page.evaluate(() => (window as any).__wavePrintCalled)).toBe(true);
  await expect(page).toHaveTitle(originalTitle);
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.sidebar')).toHaveCSS('visibility', 'hidden');
  await expect(preview).toHaveCSS('visibility', 'visible');
  await expect(page.locator('.topbar')).toHaveCSS('visibility', 'hidden');
  await expect(preview).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(preview.locator('h1')).toHaveCSS('color', 'rgb(34, 34, 34)');
  await expect(preview.locator('.wave-inline-color').filter({ hasText: 'blue custom text' })).toHaveCSS('color', 'rgb(54, 95, 186)');
  await expect(preview.locator('.wave-inline-color').filter({ hasText: 'green text' })).toHaveCSS('color', 'rgb(38, 115, 77)');
  await expect(preview.locator('.wave-inline-color').filter({ hasText: 'red text' })).toHaveCSS('color', 'rgb(192, 57, 43)');
  await expect(preview.locator('.wave-inline-background')).toHaveCSS('background-color', 'rgb(255, 240, 168)');
  await expect(preview.locator('th').first()).toHaveCSS('background-color', 'rgb(238, 241, 235)');
  await expect(preview.locator('details > p')).toHaveCSS('display', 'block');
  await expect(preview.locator('tbody tr').first().locator('td').nth(2)).toHaveText('1');
  await page.emulateMedia({ media: 'screen' });
});

test('sample library previews Markdown examples and inserts source at the editor selection', async ({ page }) => {
  await openWorkspace(page);
  await createPage(page, 'Sample Library');
  const editor = page.locator('.editor-work-main > textarea');
  const panel = page.getByRole('complementary', { name: 'Markdown sample library' });
  await expect(panel).toBeVisible();
  await panel.getByRole('button', { name: 'Headings' }).click();
  await expect(panel.locator('.snippet-preview')).toContainText('Main heading');
  await panel.getByRole('button', { name: 'Task checklist' }).click();
  await expect(panel.locator('.snippet-preview')).toContainText('To do');
  await editor.evaluate((node: HTMLTextAreaElement) => {
    const start = node.value.indexOf('Browser regression content');
    node.focus();
    node.setSelectionRange(start, start + 'Browser regression content'.length);
  });
  await panel.getByRole('button', { name: 'Insert into document' }).click();
  await expect(editor).toHaveValue(/- \[ \] To do\n- \[x\] Completed\n- \[ \] Follow up/);
  await expect(editor).toHaveValue(/# Sample Library/);
});
