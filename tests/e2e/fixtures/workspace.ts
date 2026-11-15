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


export { test, expect, openWorkspace, createPage };
