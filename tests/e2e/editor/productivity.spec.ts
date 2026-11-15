import { test, expect, openWorkspace, createPage } from '../fixtures/workspace';

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

test('toolbar code actions have distinct icons and accessible names', async ({ page }) => {
  await openWorkspace(page);
  await createPage(page, 'Code Toolbar Actions');
  const inlineCode = page.getByRole('button', { name: 'Inline code' });
  const codeBlock = page.getByRole('button', { name: 'Code block' });
  await expect(inlineCode).toHaveAttribute('title', 'Inline code');
  await expect(codeBlock).toHaveAttribute('title', 'Code block');
  await expect(inlineCode.locator('svg')).toHaveClass(/lucide-code-2/);
  await expect(codeBlock.locator('svg')).toHaveClass(/lucide-file-code-2/);
  const editor = page.locator('.editor textarea');
  await editor.fill('const wave = true;');
  await editor.selectText();
  await inlineCode.click();
  await expect(editor).toHaveValue('`const wave = true;`');
  await editor.fill('const wave = true;');
  await editor.selectText();
  await codeBlock.click();
  await expect(editor).toHaveValue('```\nconst wave = true;\n```');
});

test('editor productivity tools support find/replace, undo/redo, outline and live statistics', async ({ page }) => {
  await openWorkspace(page);
  const editor = await createPage(page, 'Editor Productivity');
  const source = [
    '# Project overview',
    '',
    'Alpha is the first milestone.',
    '',
    '## Delivery plan',
    '',
    'Alpha and beta are both planned.',
    '',
    '### Risks',
    '',
    'Review the schedule.'
  ].join('\n');
  await editor.fill(source);

  await expect(page.locator('.document-statistics')).toContainText('words');
  await expect(page.locator('.document-statistics')).toContainText('characters');
  await expect(page.locator('.document-statistics')).toContainText('min read');

  await page.getByRole('button', { name: 'Document outline' }).click();
  await expect(page.getByRole('navigation', { name: 'Document outline' }).getByRole('button')).toHaveCount(3);
  await page.getByRole('navigation', { name: 'Document outline' }).getByRole('button', { name: 'Delivery plan' }).click();

  await page.getByRole('button', { name: 'Find in document' }).click();
  await page.getByRole('textbox', { name: 'Find text' }).fill('Alpha');
  await expect(page.getByRole('search', { name: 'Find and replace' })).toContainText('1 of 2');
  await page.getByRole('textbox', { name: 'Replace text' }).fill('Gamma');
  await page.getByRole('button', { name: 'Replace all' }).click();
  await expect(editor).toHaveValue(/Gamma is the first milestone\./)
  await expect(editor).not.toHaveValue(/Alpha/)

  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(editor).toHaveValue(/Alpha is the first milestone\./)
  await expect(editor).not.toHaveValue(/Gamma/)
  await page.getByRole('button', { name: 'Redo' }).click();
  await expect(editor).toHaveValue(/Gamma is the first milestone\./);
  await expect(editor).not.toHaveValue(/Alpha/);
});

test('template gallery searches and previews before creating a local page', async ({ page }) => {
  await openWorkspace(page);
  await page.getByRole('button', { name: 'New from template' }).click();
  await page.getByRole('textbox', { name: 'Search templates' }).fill('meeting');
  const meeting = page.getByRole('button', { name: /Meeting notes/ });
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

test('color presets, reset and block background formatting are available', async ({ page }) => {
  await openWorkspace(page);
  const editor = await createPage(page, 'Color Palette');
  await editor.fill('Preset text\n\nBlock background text');
  await editor.evaluate((node: HTMLTextAreaElement) => {
    const start = node.value.indexOf('Preset text');
    node.focus(); node.setSelectionRange(start, start + 'Preset text'.length);
  });
  await page.getByRole('button', { name: 'Apply text color #26734D' }).click();
  await expect(editor).toHaveValue(/\[\[color:#26734D\|Preset text\]\]/);
  await editor.evaluate((node: HTMLTextAreaElement) => {
    const start = node.value.indexOf('Preset text');
    node.focus(); node.setSelectionRange(start, start + node.value.slice(start).indexOf(']]') + 2);
  });
  await page.getByRole('button', { name: 'Remove color formatting' }).click();
  await expect(editor).toHaveValue('Preset text\n\nBlock background text');
  await editor.evaluate((node: HTMLTextAreaElement) => {
    const start = node.value.indexOf('Block background text');
    node.focus(); node.setSelectionRange(start, start + 'Block background text'.length);
  });
  await page.locator('input[aria-label="Block background color"]').evaluate((node: HTMLInputElement) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(node, '#eaf2e8');
    node.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await expect(editor).toHaveValue(/> \[!COLOR=#EAF2E8\]\n> Block background text/);
  await page.getByRole('button', { name: 'Preview' }).click();
  await expect(page.locator('.markdown-preview blockquote.markdown-color-block')).toContainText('Block background text');
  await expect(page.locator('.markdown-preview blockquote.markdown-color-block')).toHaveAttribute('style', /background-color:\s*#eaf2e8/i);
});

test('block editor applies and updates a block background without leaving block mode', async ({ page }) => {
  await openWorkspace(page);
  await createPage(page, 'Block Color Editing');
  const editor = page.locator('.editor textarea');
  await editor.fill('# Colorable heading\\n\\nA paragraph to color.');
  await page.getByRole('button', { name: 'Block editing' }).click();
  const blocks = page.getByRole('region', { name: 'Markdown block editor' });
  await blocks.getByRole('textbox', { name: 'Edit paragraph block 2' }).focus();
  await blocks.getByLabel('Block background color for block 2').evaluate((node: HTMLInputElement) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(node, '#eaf2e8');
    node.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await expect(blocks.getByRole('textbox', { name: 'Edit callout block 2' })).toHaveValue('> [!COLOR=#EAF2E8]\\n> A paragraph to color.');
  await blocks.getByLabel('Block background color for block 2').evaluate((node: HTMLInputElement) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(node, '#fff0a8');
    node.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await expect(blocks.getByRole('textbox', { name: 'Edit callout block 2' })).toHaveValue('> [!COLOR=#FFF0A8]\\n> A paragraph to color.');
  await page.getByRole('button', { name: 'Block editing' }).click();
  await page.getByRole('button', { name: 'Preview' }).click();
  await expect(page.locator('.markdown-preview blockquote.markdown-color-block')).toContainText('A paragraph to color.');
});

test('Wave Complete Feature Test template is available and previews its feature sections', async ({ page }) => {
  await openWorkspace(page);
  await page.getByRole('button', { name: 'New from template' }).click();
  await page.locator('.sidebar-templates').getByRole('button', { name: /Wave Complete Feature Test/ }).click();
  await expect(page.getByRole('dialog', { name: 'Template preview' })).toContainText('Comprehensive Markdown');
  await page.getByRole('button', { name: 'Create from template' }).click();
  const editor = page.locator('.editor textarea');
  const markdown = await editor.inputValue();
  expect(markdown).toContain('## 6. Text colors and block backgrounds');
  expect(markdown).toContain('[[color:#365FBA|blue]]');
  expect(markdown).toContain('```mermaid');
  expect(markdown).toContain('[[audio:sample-audio.mp3]]');
  expect(markdown).toContain('## 15. Editor and workspace checklist');
  await page.getByRole('button', { name: 'Preview' }).click();
  const preview = page.locator('.markdown-preview');
  await expect(preview.getByRole('heading', { name: 'Wave Complete Feature Test' })).toBeVisible();
  await expect(preview.locator('span[style*="color: rgb(54, 95, 186)"]')).toContainText('blue');
  await expect(preview.locator('blockquote.markdown-color-block')).toContainText('soft green background');
  await expect(preview.locator('svg[role="img"]')).toBeVisible();
  await page.getByRole('button', { name: 'Edit' }).click();
  await expect(editor).toHaveValue(markdown);
});

test('Enter continues ordered, bulleted and task lists and exits an empty item', async ({ page }) => {
  await openWorkspace(page);
  await createPage(page, 'List Enter Behavior');
  const editor = page.locator('.editor-work-main > textarea');

  await editor.fill('1. First step');
  await editor.press('End');
  await editor.press('Enter');
  await expect(editor).toHaveValue('1. First step\n2. ');
  await editor.type('Second step');
  await editor.press('Enter');
  await expect(editor).toHaveValue('1. First step\n2. Second step\n3. ');

  await editor.fill('- First item');
  await editor.press('End');
  await editor.press('Enter');
  await expect(editor).toHaveValue('- First item\n- ');
  await editor.type('Second item');
  await editor.press('Enter');
  await expect(editor).toHaveValue('- First item\n- Second item\n- ');

  await editor.fill('- [ ] First task');
  await editor.press('End');
  await editor.press('Enter');
  await expect(editor).toHaveValue('- [ ] First task\n- [ ] ');
  await editor.type('Second task');
  await editor.press('Enter');
  await expect(editor).toHaveValue('- [ ] First task\n- [ ] Second task\n- [ ] ');
  await editor.press('Enter');
  await expect(editor).toHaveValue('- [ ] First task\n- [ ] Second task\n\n');

  await editor.fill('  - Nested item');
  await editor.press('End');
  await editor.press('Enter');
  await expect(editor).toHaveValue('  - Nested item\n  - ');

  await editor.fill('```md\n- Literal code line\n```');
  await editor.evaluate((node: HTMLTextAreaElement) => {
    const cursor = node.value.indexOf('Literal code line') + 'Literal code line'.length;
    node.focus(); node.setSelectionRange(cursor, cursor);
  });
  await editor.press('Enter');
  await expect(editor).toHaveValue('```md\n- Literal code line\n\n```');
});
