import { test, expect, openWorkspace, createPage } from '../fixtures/workspace';

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
    '```',
    '',
    '```mermaid',
    'sequenceDiagram',
    'title Checkout sequence',
    'Buyer->>Shop: Place order',
    '```'
  ].join('\n'));
  await page.getByRole('button', { name: 'Preview' }).click();
  const preview = page.locator('.markdown-preview');
  await expect(preview.getByRole('heading', { level: 1, name: 'Accessible Markdown' })).toBeVisible();
  const diagram = preview.getByRole('img', { name: 'Checkout sequence' });
  await expect(diagram).toBeVisible();
  const diagramSource = preview.getByText('View diagram source');
  await expect(diagramSource).toBeVisible();
  await diagramSource.focus();
  await page.keyboard.press('Enter');
  await expect(preview.locator('.diagram-source')).toHaveAttribute('open', '');
  await expect(preview.locator('.diagram-source pre')).toContainText('Buyer->>Shop: Place order');
  await expect(preview.getByRole('heading', { level: 2, name: 'Navigation' })).toBeVisible();
  await expect(preview.getByRole('link', { name: 'Wave documentation' })).toHaveAttribute('href', 'https://example.com/docs');
  await expect(preview.getByRole('table')).toBeVisible();
  await expect(preview.locator('thead th')).toHaveCount(2);
  await expect(preview.getByRole('checkbox')).toHaveCount(2);
  await expect(preview.getByRole('note', { name: 'NOTE' })).toContainText('Semantic callout content.');
  await expect(preview.getByText('More information')).toBeVisible();
  await expect(preview.locator('.markdown-details > summary')).toHaveText('More information');
  const copyButton = preview.getByRole('button', { name: 'Copy code block' });
  await expect(copyButton).toBeVisible();
  await copyButton.focus();
  await expect(copyButton).toBeFocused();
  const summary = preview.locator('.markdown-details > summary');
  await summary.focus();
  await expect(summary).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(preview.locator('.markdown-details')).toHaveAttribute('open', '');
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
