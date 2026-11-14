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
  await expect(editor).toBeVisible();
  await editor.fill('# Source Page\n\nSee [[untitled|the linked page]].');
  await expect(page.locator('.topright small')).toContainText('Saved locally', { timeout: 8000 });
  await expect(page.getByRole('button', { name: /Source Page/ })).toBeVisible();
  await page.getByRole('button', { name: 'Preview' }).click();
  const previewHtml = await page.locator('.markdown-preview').innerHTML();
  expect(previewHtml).toContain('the linked page');
  expect(previewHtml).toContain('wave.invalid');
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
  await expect(page.locator('.markdown-preview .syntax-keyword')).toContainText('const');
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
