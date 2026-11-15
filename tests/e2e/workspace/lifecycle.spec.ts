import { test, expect, openWorkspace, createPage } from '../fixtures/workspace';

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
