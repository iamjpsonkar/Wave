import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(async () => {
    // Use Chromium's real Origin Private File System handles as a deterministic
    // browser filesystem fixture. Only the picker gesture is stubbed.
    const opfsRoot = await navigator.storage.getDirectory();
    const root = await opfsRoot.getDirectoryHandle('wave-e2e-' + crypto.randomUUID(), { create: true });
    Object.defineProperty(window, '__waveTestRoot', { value: root, configurable: true });
    Object.defineProperty(window, 'showDirectoryPicker', { value: async () => root, configurable: true });
  });
});

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
  await expect(page.locator('textarea')).toContainText('Draft marker that is not yet in the Markdown file');
  await expect(page.locator('.topright small')).toContainText('Recovered unsaved draft');
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
