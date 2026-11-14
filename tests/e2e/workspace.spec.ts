import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    class TestFileHandle {
      kind = 'file';
      name: string;
      data = '';
      modified = Date.now();
      constructor(name: string) { this.name = name; }
      async getFile() { return new File([this.data], this.name, { lastModified: this.modified }); }
      async createWritable() {
        let pending = '';
        return {
          write: async (value: string | Blob) => { pending = typeof value === 'string' ? value : await value.text(); },
          close: async () => { this.data = pending; this.modified = Date.now(); },
          abort: async () => {}
        };
      }
    }
    class TestDirectoryHandle {
      kind = 'directory';
      name: string;
      children = new Map<string, TestDirectoryHandle | TestFileHandle>();
      constructor(name: string) { this.name = name; }
      async getDirectoryHandle(name: string, options: { create?: boolean } = {}) {
        const current = this.children.get(name);
        if (current && current.kind !== 'directory') throw new DOMException('Type mismatch', 'TypeMismatchError');
        if (!current && !options.create) throw new DOMException('Missing directory', 'NotFoundError');
        if (!current) this.children.set(name, new TestDirectoryHandle(name));
        return this.children.get(name) as TestDirectoryHandle;
      }
      async getFileHandle(name: string, options: { create?: boolean } = {}) {
        const current = this.children.get(name);
        if (current && current.kind !== 'file') throw new DOMException('Type mismatch', 'TypeMismatchError');
        if (!current && !options.create) throw new DOMException('Missing file', 'NotFoundError');
        if (!current) this.children.set(name, new TestFileHandle(name));
        return this.children.get(name) as TestFileHandle;
      }
      async removeEntry(name: string) {
        if (!this.children.has(name)) throw new DOMException('Missing entry', 'NotFoundError');
        this.children.delete(name);
      }
      async *entries() { for (const entry of this.children.entries()) yield entry; }
      async isSameEntry(other: unknown) { return this === other; }
      async queryPermission() { return 'granted'; }
      async requestPermission() { return 'granted'; }
    }
    const root = new TestDirectoryHandle('Wave E2E Workspace');
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
