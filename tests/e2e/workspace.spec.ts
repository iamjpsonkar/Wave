import { test, expect } from '@playwright/test';

async function installWorkspaceFixture(page: import('@playwright/test').Page) {
  await page.addInitScript(async () => {
    // A stable OPFS entry lets multiple tabs open the same workspace while
    // each test still receives an isolated browser context.
    const opfsRoot = await navigator.storage.getDirectory();
    const root = await opfsRoot.getDirectoryHandle('wave-e2e-shared-workspace', { create: true });
    Object.defineProperty(window, '__waveTestRoot', { value: root, configurable: true });
    Object.defineProperty(window, 'showDirectoryPicker', { value: async () => root, configurable: true });
    const permissionPrototype = Object.getPrototypeOf(root);
    Object.defineProperty(permissionPrototype, 'queryPermission', {
      configurable: true,
      value: async () => localStorage.getItem('wave-e2e-permission') || 'granted'
    });
    Object.defineProperty(permissionPrototype, 'requestPermission', {
      configurable: true,
      value: async () => localStorage.getItem('wave-e2e-permission') === 'denied' ? 'denied' : 'granted'
    });
    const originalTransaction = IDBDatabase.prototype.transaction;
    Object.defineProperty(IDBDatabase.prototype, 'transaction', {
      configurable: true,
      value: function(this: IDBDatabase, storeNames: string | string[], mode?: IDBTransactionMode, options?: IDBTransactionOptions) {
        if (this.name === 'wave-draft-journal' && mode === 'readwrite') {
          (window as any).__waveDraftDurability = options?.durability || 'default';
        }
        return originalTransaction.call(this, storeNames, mode, options);
      }
    });
  });
}

test.beforeEach(async ({ page }) => installWorkspaceFixture(page));

async function openWorkspace(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByRole('button', { name: /Choose a workspace/ }).click();
  await expect(page.getByText('YOUR WORKSPACE IS READY')).toBeVisible();
}
async function createPage(page: import('@playwright/test').Page, title: string) {
  await page.getByRole('button', { name: /Create your first page/ }).click();
  const editor = page.locator('textarea');
  await expect(editor).toBeVisible();
  await editor.fill('# ' + title + '\n\nBrowser regression content');
  await expect(page.locator('.topright small')).toContainText('Saved locally', { timeout: 8000 });
  return editor;
}

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

test('mobile navigation drawer opens and closes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openWorkspace(page);
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(page.locator('aside.sidebar')).toHaveClass(/mobile-open/);
  await page.getByRole('button', { name: 'Close navigation' }).click();
  await expect(page.locator('aside.sidebar')).not.toHaveClass(/mobile-open/);
});

test('backup and restore create a separate verified workspace folder', async ({ page }) => {
  await openWorkspace(page);
  await createPage(page, 'Backup Round Trip');
  await page.getByRole('button', { name: 'Backup', exact: true }).click();
  await expect(page.locator('.trash-view')).toContainText('BACKUPS');
  await expect(page.getByRole('button', { name: /Restore to new folder/ })).toBeVisible();
  await page.getByRole('button', { name: /Restore to new folder/ }).click();
  await expect(page.locator('.topright small')).toContainText('Backup restored to', { timeout: 8000 });
  const restored = await page.evaluate(async () => {
    const root = (window as any).__waveTestRoot;
    const names: string[] = [];
    for await (const [name, handle] of root.entries()) if (handle.kind === 'directory' && name.includes('-restore-')) names.push(name);
    return names;
  });
  expect(restored).toHaveLength(1);
});


test('draft journal requests strict durability before reporting a committed recovery draft', async ({ page }) => {
  await openWorkspace(page);
  const editor = await createPage(page, 'Durable Draft');
  await editor.fill('# Durable Draft\n\nStrict durability marker');
  await expect(page.locator('.topright small')).toContainText('Recovery draft saved', { timeout: 5000 });
  const durability = await page.evaluate(() => (window as any).__waveDraftDurability);
  expect(durability).toBe('strict');
});

test('recent workspace permission denial is surfaced without opening the workspace', async ({ page }) => {
  await openWorkspace(page);
  await createPage(page, 'Permission Protected');
  await page.reload();
  await page.evaluate(() => localStorage.setItem('wave-e2e-permission', 'denied'));
  await page.getByRole('button', { name: /Reopen recent workspace/ }).click();
  await expect(page.locator('.error')).toContainText('does not have permission', { timeout: 5000 });
  await expect(page.locator('textarea')).toHaveCount(0);
});

test('two tabs editing the same workspace do not silently overwrite each other', async ({ page, context }) => {
  await openWorkspace(page);
  await createPage(page, 'Concurrent Editing');
  const firstEditor = page.locator('textarea');

  const second = await context.newPage();
  await installWorkspaceFixture(second);
  await second.goto('/');
  await second.getByRole('button', { name: /Reopen recent workspace/ }).click();
  await expect(second.getByRole('button', { name: /Concurrent Editing/ })).toBeVisible();
  await second.getByRole('button', { name: /Concurrent Editing/ }).click();
  const secondEditor = second.locator('textarea');
  await expect(secondEditor).toBeVisible();

  await firstEditor.fill('# Concurrent Editing\n\nChange from first tab');
  await secondEditor.fill('# Concurrent Editing\n\nChange from second tab');
  const readPersistedAndDraftContent = async () => page.evaluate(async () => {
    const root = (window as any).__waveTestRoot;
    const docs = await (await root.getDirectoryHandle('.wave')).getDirectoryHandle('documents');
    const values: string[] = [];
    for await (const [name, handle] of docs.entries()) {
      if (handle.kind !== 'file' || !name.endsWith('.md')) continue;
      values.push(await (await handle.getFile()).text());
    }
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('wave-draft-journal', 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const drafts = await new Promise<string[]>((resolve, reject) => {
      const request = db.transaction('drafts', 'readonly').objectStore('drafts').getAll();
      request.onsuccess = () => resolve((request.result as Array<{ content: string }>).map(record => record.content));
      request.onerror = () => reject(request.error);
    });
    db.close();
    return [...values, ...drafts].join('\n');
  });
  await expect.poll(readPersistedAndDraftContent, { timeout: 12000 }).toContain('Change from first tab');
  await expect.poll(readPersistedAndDraftContent, { timeout: 12000 }).toContain('Change from second tab');
});
test('recovery prompt identifies a draft created in another tab and preserves its record when declined', async ({ page, context }) => {
  await page.clock.install();
  await openWorkspace(page);
  const firstEditor = await createPage(page, 'Cross-tab Recovery');
  await firstEditor.fill('# Cross-tab Recovery\n\nUnsaved change owned by first tab');
  await expect(page.locator('.topright small')).toContainText('Recovery draft saved', { timeout: 5000 });

  const second = await context.newPage();
  await installWorkspaceFixture(second);
  await second.clock.install();
  await second.goto('/');
  await second.getByRole('button', { name: /Reopen recent workspace/ }).click();
  await expect(second.getByRole('button', { name: /Cross-tab Recovery/ })).toBeVisible();

  let promptMessage = '';
  second.once('dialog', async dialog => {
    promptMessage = dialog.message();
    await dialog.dismiss();
  });
  await second.getByRole('button', { name: /Cross-tab Recovery/ }).click();
  await expect(second.locator('textarea')).toHaveValue('# Cross-tab Recovery\n\nBrowser regression content');
  expect(promptMessage).toContain('another browser tab');

  const retainedDrafts = await second.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('wave-draft-journal', 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const drafts = await new Promise<Array<{ content: string }>>((resolve, reject) => {
      const request = db.transaction('drafts', 'readonly').objectStore('drafts').getAll();
      request.onsuccess = () => resolve(request.result as Array<{ content: string }>);
      request.onerror = () => reject(request.error);
    });
    db.close();
    return drafts.map(record => record.content);
  });
  expect(retainedDrafts).toContain('# Cross-tab Recovery\n\nUnsaved change owned by first tab');
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

test('command palette supports filtering and keyboard execution of workspace actions', async ({ page }) => {
  await openWorkspace(page);
  await page.keyboard.press('Control+k');
  const dialog = page.getByRole('dialog', { name: 'Command palette' });
  await expect(dialog).toBeVisible();
  const input = dialog.getByRole('textbox', { name: 'Search commands' });
  await input.fill('new meeting notes');
  await input.press('ArrowDown');
  await input.press('Enter');
  await expect(page.locator('textarea')).toHaveValue(/# Meeting notes/);
  await expect(dialog).toHaveCount(0);
  await page.keyboard.press('Control+k');
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
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


test('Markdown safe inline extensions and disclosure blocks render without raw HTML', async ({ page }) => {
  await openWorkspace(page);
  const editor = await createPage(page, 'Safe Markdown Extensions');
  await editor.fill([
    '# Safe Markdown Extensions',
    '',
    '==highlighted== ++underlined++ ^superscript^ ~subscript~ [[kbd:Ctrl+K]]',
    '',
    '> [!DETAILS] Implementation notes',
    '> This section is collapsible and keyboard operable.',
    '',
    '$$',
    '\\frac{1}{\\sqrt{x_1 + \\alpha^2}}',
    '$$',
    '',
    '<script>alert(1)</script>'
  ].join('\n'));
  await page.getByRole('button', { name: 'Preview' }).click();
  await expect(page.locator('.markdown-preview mark')).toHaveText('highlighted');
  await expect(page.locator('.markdown-preview u')).toHaveText('underlined');
  await expect(page.locator('.markdown-preview sup')).toHaveText('superscript');
  await expect(page.locator('.markdown-preview sub')).toHaveText('subscript');
  await expect(page.locator('.markdown-preview kbd')).toHaveText('Ctrl+K');
  await expect(page.locator('.markdown-preview details summary')).toHaveText('Implementation notes');
  await expect(page.locator('.markdown-preview details')).not.toHaveAttribute('open', '');
  await page.locator('.markdown-preview details summary').click();
  await expect(page.locator('.markdown-preview details')).toHaveAttribute('open', '');
  await expect(page.locator('.markdown-preview .markdown-math-display math mfrac')).toBeVisible();
  await expect(page.locator('.markdown-preview .markdown-math-display math msub')).toBeVisible();
  await expect(page.locator('.markdown-preview .markdown-math-display math msup')).toBeVisible();
  await expect(page.locator('.markdown-preview script')).toHaveCount(0);
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
  await expect(preview.locator('.syntax-keyword')).toContainText('def');
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
  await page.getByRole('button', { name: /Technical learning notes/ }).click();
  const editor = page.locator('textarea');
  const markdown = await editor.inputValue();
  expect(markdown).toContain('## Introduction\\n\\nWhat is this technology');
  expect(markdown).toContain('## Open questions\\n\\n- [ ]');
  await page.getByRole('button', { name: 'Preview' }).click();
  await expect(page.locator('.markdown-preview h2')).toContainText('Introduction');
  await expect(page.locator('.markdown-preview h2')).toContainText('Open questions');
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
  await expect(diagrams.nth(2).locator('text').filter({ hasText: 'CUSTOMER' })).toBeVisible();
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


test('editor inserts selected multiline code as a fenced block and preserves copy fidelity', async ({ page }) => {
  await openWorkspace(page);
  const editor = await createPage(page, 'Multiline Code');
  const source = 'function greet(name: string) {\n  return `Hello, ${name}`;\n}\nconsole.log(greet("Wave"));';
  await editor.fill(source);
  await editor.evaluate((node, value) => {
    const textarea = node as HTMLTextAreaElement;
    textarea.focus();
    textarea.setSelectionRange(0, value.length);
  }, source);
  await page.getByRole('button', { name: 'Insert code block' }).click();
  const expected = '```\n' + source + '\n```';
  await expect(editor).toHaveValue(expected);
  await page.getByRole('button', { name: 'Preview' }).click();
  const block = page.locator('.markdown-preview .markdown-code');
  await expect(block.locator('pre code')).toContainText('function greet(name: string)');
  await expect(block.locator('pre code')).toContainText('console.log(greet("Wave"));');
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await block.getByRole('button', { name: 'Copy code block' }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(source + '\n');
});

test('Markdown preview exposes accessible semantic structure and keyboard-operable controls', async ({ page }) => {
  await openWorkspace(page);
  const editor = await createPage(page, 'Accessible Markdown');
  await editor.fill([
    '# Accessible Markdown',
    '',
    '## Navigation',
    '',
    '[Wave documentation](https://example.com/docs)',
    '',
    '| Feature | Status |',
    '| --- | --- |',
    '| Preview | Ready |',
    '',
    '- [x] Keyboard support',
    '- [ ] Screen reader review',
    '',
    '> [!NOTE]',
    '> Semantic callout content.',
    '',
    '> [!DETAILS] More information',
    '> Disclosure body.',
    '',
    '```javascript',
    'const accessible = true;',
    '```'
  ].join('\n'));
  await page.getByRole('button', { name: 'Preview' }).click();
  const preview = page.locator('.markdown-preview');
  await expect(preview.getByRole('heading', { level: 1, name: 'Accessible Markdown' })).toBeVisible();
  await expect(preview.getByRole('heading', { level: 2, name: 'Navigation' })).toBeVisible();
  await expect(preview.getByRole('link', { name: 'Wave documentation' })).toHaveAttribute('href', 'https://example.com/docs');
  await expect(preview.getByRole('table')).toBeVisible();
  await expect(preview.getByRole('columnheader')).toHaveCount(2);
  await expect(preview.getByRole('checkbox')).toHaveCount(2);
  await expect(preview.getByRole('note', { name: 'NOTE' })).toContainText('Semantic callout content.');
  await expect(preview.getByText('More information')).toBeVisible();
  await expect(preview.locator('details summary')).toHaveText('More information');
  const copyButton = preview.getByRole('button', { name: 'Copy code block' });
  await expect(copyButton).toBeVisible();
  await copyButton.focus();
  await expect(copyButton).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(preview.locator('details summary')).toBeFocused();
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

test('Markdown link schemes and local media paths enforce the preview security boundary', async ({ page }) => {
  await openWorkspace(page);
  await page.evaluate(async () => {
    const root = (window as any).__waveTestRoot;
    const wave = await root.getDirectoryHandle('.wave');
    const assets = await wave.getDirectoryHandle('assets');
    const secret = await assets.getFileHandle('secret.mp3', { create: true });
    const writer = await secret.createWritable();
    await writer.write(new Blob(['must not be exposed by traversal'], { type: 'audio/mpeg' }));
    await writer.close();
  });
  const editor = await createPage(page, 'Markdown Security Matrix');
  await editor.fill([
    '# Markdown Security Matrix',
    '',
    '[HTTPS](https://example.com/safe)',
    '[Mail](mailto:wave@example.com)',
    '[JavaScript](javascript:alert(1))',
    '[Data](data:text/html,alert(1))',
    '[VBScript](vbscript:msgbox(1))',
    '[File](file:///etc/passwd)',
    '[Mixed case](JaVaScRiPt:alert(1))',
    '',
    '[[audio:assets/../secret.mp3]]',
    '[[audio:assets/%2e%2e/secret.mp3]]',
    '[[audio:/assets/secret.mp3]]',
    '[[audio:C:\\secret.mp3]]',
    '[[audio:https://example.com/secret.mp3]]'
  ].join('\n'));
  await page.getByRole('button', { name: 'Preview' }).click();
  const preview = page.locator('.markdown-preview');
  await expect(preview.locator('a[href="https://example.com/safe"]')).toHaveCount(1);
  await expect(preview.locator('a[href="mailto:wave@example.com"]')).toHaveCount(1);
  for (const scheme of ['javascript:', 'data:', 'vbscript:', 'file:']) {
    await expect(preview.locator('a[href^="' + scheme + '"]')).toHaveCount(0);
  }
  await expect(preview.locator('a[href*="JaVaScRiPt"]')).toHaveCount(0);
  await expect(preview.locator('audio[src], video[src]')).toHaveCount(0);
  await expect(preview.locator('.missing-asset')).toHaveCount(5);
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
