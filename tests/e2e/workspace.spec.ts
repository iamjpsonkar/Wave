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
  await page.getByRole('button', { name: /Backup/ }).click();
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
  await openWorkspace(page);
  const firstEditor = await createPage(page, 'Cross-tab Recovery');
  await firstEditor.fill('# Cross-tab Recovery\n\nUnsaved change owned by first tab');
  await expect(page.locator('.topright small')).toContainText('Recovery draft saved', { timeout: 5000 });

  const second = await context.newPage();
  await installWorkspaceFixture(second);
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
