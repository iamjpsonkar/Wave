import { test, expect } from '@playwright/test';
import { installWorkspaceFixture, openWorkspace, createPage } from '../fixtures/workspace';

test.beforeEach(async ({ page }) => installWorkspaceFixture(page));

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

test('a recently used workspace can be reauthorized after permission returns to prompt', async ({ page }) => {
  await openWorkspace(page);
  await createPage(page, 'Permission Reauthorization');
  await page.reload();
  await page.evaluate(() => {
    localStorage.setItem('wave-e2e-permission', 'prompt');
    localStorage.setItem('wave-e2e-request-result', 'granted');
  });
  await page.getByRole('button', { name: /Reopen recent workspace/ }).click();
  await expect(page.getByRole('button', { name: /Permission Reauthorization/ })).toBeVisible();
  await expect.poll(() => page.evaluate(() => (window as any).__wavePermissionRequests)).toBe(1);
});

test('an external file edit is preserved and the editor reports a save conflict', async ({ page }) => {
  await openWorkspace(page);
  const editor = await createPage(page, 'External Conflict');
  await page.evaluate(async () => {
    const root = (window as any).__waveTestRoot;
    const wave = await root.getDirectoryHandle('.wave');
    const documents = await wave.getDirectoryHandle('documents');
    const file = await documents.getFileHandle('untitled.md');
    const writable = await file.createWritable();
    await writable.write('# External Conflict\n\nChanged by another filesystem writer');
    await writable.close();
  });
  await editor.fill('# External Conflict\n\nMy local draft must not overwrite the external edit');
  await expect(page.locator('.app-error')).toContainText('changed outside Wave', { timeout: 8000 });
  const diskContent = await page.evaluate(async () => {
    const root = (window as any).__waveTestRoot;
    const wave = await root.getDirectoryHandle('.wave');
    const documents = await wave.getDirectoryHandle('documents');
    return (await (await documents.getFileHandle('untitled.md')).getFile()).text();
  });
  expect(diskContent).toContain('Changed by another filesystem writer');
  expect(diskContent).not.toContain('My local draft must not overwrite');
});

test('two tabs editing the same workspace do not silently overwrite each other', async ({ page, context }) => {
  await openWorkspace(page);
  await createPage(page, 'Concurrent Editing');
  const firstEditor = page.locator('textarea');

  const second = await context.newPage();
  const sharedFixtureId = await page.evaluate(() => (window as any).__waveTestFixtureId as string);
  await installWorkspaceFixture(second, sharedFixtureId);
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
  await page.goto('/?waveDebug=1');
  await page.getByRole('button', { name: /Choose a workspace/ }).click();
  await expect(page.getByText('YOUR WORKSPACE IS READY')).toBeVisible();
  const firstEditor = await createPage(page, 'Cross-tab Recovery');
  // Freeze only the source tab's autosave timer after setup. Its recovery
  // journal writes are immediate, but the 600ms Markdown save must not
  // commit the draft before the second tab attempts recovery.
  await page.clock.install();
  await page.clock.pauseAt(new Date());
  await firstEditor.fill('# Cross-tab Recovery\n\nUnsaved change owned by first tab');
  await expect(page.locator('.topright small')).toContainText('Recovery draft saved', { timeout: 5000 });
  const sourceJournal = await page.evaluate(async () => {
    const root = (window as any).__waveTestRoot as FileSystemDirectoryHandle;
    const tabId = sessionStorage.getItem('wave-draft-session-id');
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('wave-draft-journal', 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const records = await new Promise<Array<{ path: string; content: string; tabId?: string; workspace: FileSystemDirectoryHandle }>>((resolve, reject) => {
      const request = db.transaction('drafts', 'readonly').objectStore('drafts').getAll();
      request.onsuccess = () => resolve(request.result as Array<{ path: string; content: string; tabId?: string; workspace: FileSystemDirectoryHandle }>);
      request.onerror = () => reject(request.error);
    });
    const matching = [];
    for (const record of records.filter(item => item.path === 'untitled.md')) {
      matching.push({ content: record.content, tabId: record.tabId, sameWorkspace: await record.workspace.isSameEntry(root) });
    }
    db.close();
    return { tabId, matching };
  });
  expect(sourceJournal.matching).toEqual([expect.objectContaining({
    content: '# Cross-tab Recovery\n\nUnsaved change owned by first tab',
    tabId: sourceJournal.tabId,
    sameWorkspace: true
  })]);

  const second = await context.newPage();
  const sharedFixtureId = await page.evaluate(() => (window as any).__waveTestFixtureId as string);
  await installWorkspaceFixture(second, sharedFixtureId);
  await second.goto('/?waveDebug=1');
  await second.getByRole('button', { name: /Reopen recent workspace/ }).click();
  await expect(second.getByRole('button', { name: /Cross-tab Recovery/ })).toBeVisible();
  const secondJournal = await second.evaluate(async () => {
    const root = (window as any).__waveTestRoot as FileSystemDirectoryHandle;
    const tabId = sessionStorage.getItem('wave-draft-session-id');
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('wave-draft-journal', 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const records = await new Promise<Array<{ path: string; content: string; tabId?: string; workspace: FileSystemDirectoryHandle }>>((resolve, reject) => {
      const request = db.transaction('drafts', 'readonly').objectStore('drafts').getAll();
      request.onsuccess = () => resolve(request.result as Array<{ path: string; content: string; tabId?: string; workspace: FileSystemDirectoryHandle }>);
      request.onerror = () => reject(request.error);
    });
    const matching = [];
    for (const record of records.filter(item => item.path === 'untitled.md')) {
      matching.push({ content: record.content, tabId: record.tabId, sameWorkspace: await record.workspace.isSameEntry(root) });
    }
    db.close();
    return { tabId, matching };
  });
  expect(secondJournal.tabId).not.toBe(sourceJournal.tabId);
  expect(secondJournal.matching).toContainEqual({
    content: '# Cross-tab Recovery\n\nUnsaved change owned by first tab',
    tabId: sourceJournal.tabId,
    sameWorkspace: true
  });

  const sourceRecoveryLogs: string[] = [];
  page.on('console', message => { if (message.text().includes('[Wave]')) sourceRecoveryLogs.push(message.text()); });
  const secondRecoveryLogs: string[] = [];
  second.on('console', message => { if (message.text().includes('[Wave]')) secondRecoveryLogs.push(message.text()); });
  let promptMessage = '';
  const dialogPromise = second.waitForEvent('dialog', { timeout: 5000 }).then(async dialog => {
    promptMessage = dialog.message();
    await dialog.dismiss();
  });
  await second.getByRole('button', { name: /Cross-tab Recovery/ }).click();
  await dialogPromise.catch(error => {
    console.error('[Cross-tab recovery diagnostics]', JSON.stringify({ sourceJournal, secondJournal, sourceLogs: sourceRecoveryLogs, secondLogs: secondRecoveryLogs, dialogError: String(error) }, null, 2));
    throw error;
  });
  expect(promptMessage).toContain('another browser tab');
  await expect(second.locator('textarea')).toHaveValue('# Cross-tab Recovery\n\nBrowser regression content');

  const readRetainedDrafts = () => second.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('wave-draft-journal', 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      const drafts = await new Promise<Array<{ content: string; tabId?: string }>>((resolve, reject) => {
        const request = db.transaction('drafts', 'readonly').objectStore('drafts').getAll();
        request.onsuccess = () => resolve(request.result as Array<{ content: string; tabId?: string }>);
        request.onerror = () => reject(request.error);
      });
      return drafts;
    } finally {
      db.close();
    }
  });
  await expect.poll(async () => {
    const retained = await readRetainedDrafts();
    return retained.some(record =>
      record.content === '# Cross-tab Recovery\n\nUnsaved change owned by first tab' &&
      record.tabId === sourceJournal.tabId
    );
  }, { timeout: 5000, message: 'Declining cross-tab recovery must preserve the source tab journal record' }).toBe(true);
  expect(secondRecoveryLogs.some(line => line.includes('draft-journal:read-result'))).toBe(true);
  expect(secondRecoveryLogs.some(line => line.includes('recovery:stage'))).toBe(true);
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
  await page.locator('.view-toggle').getByRole('button', { name: 'Preview', exact: true }).click();
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

test('workspace settings persist appearance and typography preferences locally', async ({ page }) => {
  await openWorkspace(page);
  await createPage(page, 'Settings Preferences');
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Settings' });
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('button', { name: 'Done' })).toBeFocused();
  await dialog.getByLabel('Theme').selectOption('dark');
  await dialog.getByLabel('Font family').selectOption('serif');
  await dialog.getByLabel('Text size').selectOption('18');
  await dialog.getByLabel('Line spacing').selectOption('1.9');
  await dialog.getByLabel('Content width').selectOption('narrow');
  await dialog.getByLabel('Reduce interface motion').check();
  await expect(dialog.locator('.settings-info')).toContainText('Preferences saved');
  await expect(page.locator('[data-testid="wave-app"]')).toHaveClass(/theme-dark/);
  await expect(page.locator('.editor')).toHaveAttribute('data-content-width', 'narrow');
  await expect(page.locator('.editor textarea')).toHaveCSS('font-size', '18px');
  await expect(page.locator('.editor textarea')).toHaveCSS('line-height', '34.2px');
  await dialog.getByRole('button', { name: 'Done' }).click();
  await page.locator('.view-toggle').getByRole('button', { name: 'Preview', exact: true }).click();
  // 680px is the configured maximum; the editor work column may be narrower
  // while the contextual sample library is open, so assert the cap rather than
  // assuming the available grid column is always at least 680px wide.
  await expect(page.locator('[data-testid="wave-app"]')).toHaveCSS('--editor-content-width', '680px');
  const previewWidth = await page.locator('.markdown-preview').evaluate(node => node.getBoundingClientRect().width);
  expect(previewWidth).toBeGreaterThan(0);
  expect(previewWidth).toBeLessThanOrEqual(680);
  const settings = await page.evaluate(async () => {
    const root = (window as any).__waveTestRoot;
    const wave = await root.getDirectoryHandle('.wave');
    return JSON.parse(await (await (await wave.getFileHandle('settings.json')).getFile()).text());
  });
  expect(settings.appearance).toBe('dark');
  expect(settings.fontFamily).toBe('serif');
  expect(settings.fontSize).toBe(18);
  expect(settings.lineHeight).toBe(1.9);
  expect(settings.contentWidth).toBe('narrow');
  expect(settings.reducedMotion).toBe(true);
  await page.reload();
  await page.getByRole('button', { name: /Reopen recent workspace/ }).click();
  await expect(page.locator('[data-testid="wave-app"]')).toHaveClass(/theme-dark/);
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  const reopenedDialog = page.getByRole('dialog', { name: 'Settings' });
  await expect(reopenedDialog.getByLabel('Font family')).toHaveValue('serif');
  await page.keyboard.press('Escape');
  await expect(reopenedDialog).toBeHidden();
});

test('template gallery searches and previews before creating a local page', async ({ page }) => {
  await openWorkspace(page);
  await page.getByRole('button', { name: 'New from template' }).click();
  await page.locator('.sidebar-templates').getByRole('textbox', { name: 'Search templates' }).fill('meeting');
  const meeting = page.locator('.sidebar-templates').getByRole('button', { name: /Meeting notes/ });
  await expect(meeting).toBeVisible();
  await meeting.click();
  const dialog = page.getByRole('dialog', { name: 'Meeting notes template preview' });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('pre')).toContainText('# Meeting notes');
  const close = dialog.getByRole('button', { name: 'Close template preview' });
  const create = dialog.getByRole('button', { name: 'Create from template' });
  await expect(close).toBeFocused();
  await close.press('Shift+Tab');
  await expect(create).toBeFocused();
  await create.press('Tab');
  await expect(close).toBeFocused();
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(dialog).toBeHidden();
});

test('nested page breadcrumbs navigate to their parent folder', async ({ page }) => {
  await openWorkspace(page);
  await createPage(page, 'Root page');
  page.once('dialog', dialog => dialog.accept('Research'));
  await page.getByTitle('New folder').click();
  await expect(page.locator('.folder-link', { hasText: 'Research' })).toBeVisible();
  await page.locator('.sidebar nav').getByRole('button', { name: /New page/ }).click();
  const editor = page.locator('.editor textarea');
  await expect(editor).toBeVisible();
  await editor.fill('# Nested research note\n\nLocal folder context.');
  await expect(page.locator('.breadcrumbs')).toContainText('Research');
  await page.locator('.breadcrumbs').getByRole('button', { name: 'Research' }).click();
  await expect(page.locator('.folder-link.selected')).toContainText('Research');
});

test('Wave Complete Feature Test template is available and previews its feature sections', async ({ page }) => {
  await openWorkspace(page);
  await page.getByRole('button', { name: 'New from template' }).click();
  await page.locator('.sidebar-templates').getByRole('button', { name: /Wave Complete Feature Test/ }).click();
  await expect(page.getByRole('dialog', { name: /Wave Complete Feature Test template preview/ })).toContainText('Comprehensive Markdown');
  await page.getByRole('button', { name: 'Create from template' }).click();
  const editor = page.locator('.editor textarea');
  const markdown = await editor.inputValue();
  expect(markdown).toContain('## 6. Text colors and block backgrounds');
  expect(markdown).toContain('[[color:#365FBA|blue]]');
  expect(markdown).toContain('```mermaid');
  expect(markdown).toContain('[[audio:sample-audio.mp3]]');
  expect(markdown).toContain('## 15. Editor and workspace checklist');
  await page.locator('.view-toggle').getByRole('button', { name: 'Preview', exact: true }).click();
  const preview = page.locator('.markdown-preview');
  await expect(preview.getByRole('heading', { name: 'Wave Complete Feature Test' })).toBeVisible();
  await expect(preview.locator('span[style*="color: rgb(54, 95, 186)"]')).toContainText('blue');
  await expect(preview.locator('blockquote.markdown-color-block')).toContainText('soft green background');
  await expect(preview.locator('svg[aria-label="Mermaid flowchart"]').first()).toBeVisible();
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  await expect(editor).toHaveValue(markdown);
});

test('autosave write failures are visible and create a sanitized diagnostic event', async ({ page }) => {
  await openWorkspace(page);
  const editor = await createPage(page, 'Autosave Failure Diagnostics');
  await page.evaluate(async () => {
    const root = (window as any).__waveTestRoot as FileSystemDirectoryHandle;
    const documents = await (await root.getDirectoryHandle('.wave')).getDirectoryHandle('documents');
    const handle = await documents.getFileHandle('untitled.md');
    const prototype = Object.getPrototypeOf(handle);
    (window as any).__waveOriginalCreateWritable = prototype.createWritable;
    Object.defineProperty(prototype, 'createWritable', { configurable: true, value: async () => { throw new DOMException('Write failed for /Users/private/notes.md', 'NotAllowedError'); } });
  });
  await editor.fill('# Autosave Failure Diagnostics\\n\\nThe write must fail visibly.');
  await expect(page.locator('.topright small')).toContainText('Save failed', { timeout: 8000 });
  await expect(page.locator('.app-error')).toContainText('Write failed', { timeout: 5000 });
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  const diagnostics = page.locator('.settings-diagnostics');
  await diagnostics.locator('summary').click();
  const report = diagnostics.locator('.diagnostic-report');
  await expect(report).toContainText('workspace:document-save:failed');
  await expect(report).toContainText('NotAllowedError');
  await expect(report).toContainText('Details omitted for privacy.');
  await expect(report).not.toContainText('/Users/private/notes.md');
  const savedDiagnostic = await page.evaluate(() => {
    const raw = (document.querySelector('.diagnostic-report')?.textContent || '[]');
    const records = JSON.parse(raw) as Array<{ operationId: string; event: string; level: string }>;
    return records.filter(record => record.event === 'workspace:document-save:failed').map(record => record.operationId);
  });
  expect(savedDiagnostic).toHaveLength(1);
  expect(savedDiagnostic[0]).toMatch(/.+/);
  await page.evaluate(async () => {
    const root = (window as any).__waveTestRoot as FileSystemDirectoryHandle;
    const documents = await (await root.getDirectoryHandle('.wave')).getDirectoryHandle('documents');
    const file = await documents.getFileHandle('untitled.md');
    Object.defineProperty(Object.getPrototypeOf(file), 'createWritable', { configurable: true, value: (window as any).__waveOriginalCreateWritable });
  });
});

test('recovery traces are quiet by default and debug traces share one operation ID', async ({ page, context }) => {
  const normalLogs: string[] = [];
  page.on('console', message => normalLogs.push(message.text()));
  await openWorkspace(page);
  await createPage(page, 'Quiet Diagnostics');
  await page.getByRole('button', { name: /Quiet Diagnostics/ }).click();
  expect(normalLogs.some(line => line.includes('[Wave]'))).toBe(false);

  const debugPage = await context.newPage();
  const sharedFixtureId = await page.evaluate(() => (window as any).__waveTestFixtureId as string);
  await installWorkspaceFixture(debugPage, sharedFixtureId);

  const debugEvents: Array<{ event: string; operationId: string; level: string }> = [];
  debugPage.on('console', message => {
    if (!message.text().includes('[Wave]')) return;
    const args = message.args();
    void args[1]?.jsonValue().then(record => {
      const typed = record as { event?: string; operationId?: string; level?: string };
      if (typed.event === 'recovery:stage' && typed.operationId && typed.level) {
        debugEvents.push(typed as { event: string; operationId: string; level: string });
      }
    });
  });

  await debugPage.goto('/?waveDebug=1');
  await expect(debugPage.getByRole('button', { name: /Reopen recent workspace/ })).toBeVisible();
  await debugPage.getByRole('button', { name: /Reopen recent workspace/ }).click();
  await expect(debugPage.getByRole('button', { name: /Quiet Diagnostics/ })).toBeVisible();
  await debugPage.getByRole('button', { name: /Quiet Diagnostics/ }).click();

  await expect.poll(() => debugEvents.length, { timeout: 5000 }).toBeGreaterThan(1);
  expect(debugEvents.every(event => event.level === 'debug')).toBe(true);
  expect(debugEvents.every(event => event.event === 'recovery:stage')).toBe(true);
  expect(new Set(debugEvents.map(event => event.operationId)).size).toBe(1);
});
