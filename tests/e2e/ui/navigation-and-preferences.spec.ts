import { test, expect, openWorkspace, createPage } from '../fixtures/workspace';

test('mobile navigation drawer opens and closes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openWorkspace(page);
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(page.locator('aside.sidebar')).toHaveClass(/mobile-open/);
  await page.getByRole('button', { name: 'Close navigation' }).click();
  await expect(page.locator('aside.sidebar')).not.toHaveClass(/mobile-open/);
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

test('workspace settings persist appearance and typography preferences locally', async ({ page }) => {
  await openWorkspace(page);
  await createPage(page, 'Settings Preferences');
  await page.getByRole('button', { name: 'Settings' }).click();
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
  await page.getByRole('button', { name: 'Preview' }).click();
  await expect(page.locator('.markdown-preview')).toHaveCSS('width', '680px');
  await dialog.getByRole('button', { name: 'Done' }).click();
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
  await page.getByRole('button', { name: 'Settings' }).click();
  const reopenedDialog = page.getByRole('dialog', { name: 'Settings' });
  await expect(reopenedDialog.getByLabel('Font family')).toHaveValue('serif');
  await page.keyboard.press('Escape');
  await expect(reopenedDialog).toBeHidden();
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
