import { test, expect } from '@playwright/test';
import { installWorkspaceFixture, openWorkspace, createPage } from '../fixtures/workspace';

test.beforeEach(async ({ page }) => installWorkspaceFixture(page));

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
  await page.getByRole('button', { name: 'Code block', exact: true }).click();
  const expected = '```\n' + source + '\n```';
  await expect(editor).toHaveValue(expected);
  await page.locator('.view-toggle').getByRole('button', { name: 'Preview', exact: true }).click();
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
  const inlineCode = page.getByRole('button', { name: 'Inline code', exact: true });
  const codeBlock = page.getByRole('button', { name: 'Code block', exact: true });
  await expect(inlineCode).toHaveAttribute('title', 'Inline code');
  await expect(codeBlock).toHaveAttribute('title', 'Code block');
  await expect(inlineCode.locator('svg')).toHaveClass(/lucide-code-xml/);
  await expect(codeBlock.locator('svg')).toHaveClass(/lucide-file-code2/);
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

test('optional block editing preserves untouched Markdown source and edits one block in place', async ({ page }) => {
  await openWorkspace(page);
  const editor = await createPage(page, 'Block Editor');
  const source = [
    '# Block editor test',
    '',
    'Paragraph stays intact.',
    '',
    '- First item',
    '- Second item',
    '',
    '> [!NOTE]',
    '> Important detail',
    '',
    '\`\`\`ts',
    'const value = 1;',
    '\`\`\`'
  ].join('\n');
  await editor.fill(source);
  await page.getByRole('button', { name: 'Block editing' }).click();
  const blocks = page.getByRole('region', { name: 'Markdown block editor' });
  await expect(blocks.getByRole('textbox', { name: 'Edit heading block 1' })).toHaveValue('# Block editor test');
  await expect(blocks.getByRole('textbox', { name: 'Edit list block 3' })).toHaveValue(/First item/);
  await expect(blocks.getByRole('textbox', { name: 'Edit callout block 4' })).toBeVisible();
  await expect(blocks.getByRole('textbox', { name: 'Edit code block 5' })).toBeVisible();
  await blocks.getByRole('textbox', { name: 'Edit paragraph block 2' }).fill('Edited paragraph text.');
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(blocks.getByRole('textbox', { name: 'Edit paragraph block 2' })).toHaveValue('Paragraph stays intact.');
  await page.getByRole('button', { name: 'Redo' }).click();
  await expect(blocks.getByRole('textbox', { name: 'Edit paragraph block 2' })).toHaveValue('Edited paragraph text.');
  await page.getByRole('button', { name: 'Block editing' }).click();
  await expect(page.locator('.editor textarea')).toHaveValue(source.replace('Paragraph stays intact.', 'Edited paragraph text.'));
});

test('block editor reorders blocks without losing separators and inserts common Markdown blocks', async ({ page }) => {
  await openWorkspace(page);
  const editor = await createPage(page, 'Block Controls');
  const source = '# First\n\nParagraph block.\n\n- List item';
  await editor.fill(source);
  await page.getByRole('button', { name: 'Block editing' }).click();
  const blocks = page.getByRole('region', { name: 'Markdown block editor' });
  await blocks.getByRole('button', { name: 'Move block 2 down' }).click();
  await expect(blocks.getByRole('textbox', { name: 'Edit list block 2' })).toHaveValue('- List item');
  await expect(blocks.getByRole('textbox', { name: 'Edit paragraph block 3' })).toHaveValue('Paragraph block.');
  await blocks.getByRole('button', { name: 'Move block 3 up' }).click();
  await blocks.getByRole('button', { name: 'Drag block 2' }).dragTo(blocks.locator('.markdown-block').nth(2));
  await expect(blocks.getByRole('textbox', { name: 'Edit list block 2' })).toHaveValue('- List item');
  await blocks.getByRole('button', { name: 'Move block 3 up' }).click();
  await blocks.getByRole('button', { name: 'Add block' }).click();
  await blocks.getByRole('menu', { name: 'Add a Markdown block' }).getByRole('menuitem', { name: 'Heading' }).click();
  await expect(blocks.getByRole('textbox', { name: 'Edit heading block 4' })).toHaveValue('## New heading');
  await page.getByRole('button', { name: 'Block editing' }).click();
  await expect(page.locator('.editor textarea')).toHaveValue(source + '\n\n## New heading');
});

test('foreground and background color formatting round-trip through Markdown preview', async ({ page }) => {
  await openWorkspace(page);
  const editor = await createPage(page, 'Color Formatting');
  await editor.fill('Foreground sample\n\nBackground sample\n\nLiteral code: `[[color:#123456|not colored]]`\n\nInvalid directive: [[color:red|plain text]]');
  await editor.evaluate((node: HTMLTextAreaElement) => {
    const start = node.value.indexOf('Foreground sample');
    node.focus(); node.setSelectionRange(start, start + 'Foreground sample'.length);
  });
  await page.locator('input[aria-label="Text color"]').evaluate((node: HTMLInputElement) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(node, '#123456'); node.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await expect(editor).toHaveValue(/\[\[color:#123456\|Foreground sample\]\]/);
  await editor.evaluate((node: HTMLTextAreaElement) => {
    const start = node.value.indexOf('Background sample');
    node.focus(); node.setSelectionRange(start, start + 'Background sample'.length);
  });
  await page.locator('input[aria-label="Text background color"]').evaluate((node: HTMLInputElement) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(node, '#fff0a8'); node.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await expect(editor).toHaveValue(/\[\[bg:#FFF0A8\|Background sample\]\]/);
  await page.locator('.view-toggle').getByRole('button', { name: 'Preview', exact: true }).click();
  const preview = page.locator('.markdown-preview');
  await expect(preview.locator('span[style*="color: rgb(18, 52, 86)"]')).toContainText('Foreground sample');
  await expect(preview.locator('span[style*="background-color: rgb(255, 240, 168)"]')).toContainText('Background sample');
  await expect(preview.locator('code')).toContainText('[[color:#123456|not colored]]');
  await expect(preview).toContainText('Invalid directive: [[color:red|plain text]]');
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  await expect(editor).toHaveValue(/Literal code: `\[\[color:#123456\|not colored\]\]`/);
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
  await page.locator('.view-toggle').getByRole('button', { name: 'Preview', exact: true }).click();
  await expect(page.locator('.markdown-preview blockquote.markdown-color-block')).toContainText('Block background text');
  await expect(page.locator('.markdown-preview blockquote.markdown-color-block')).toHaveCSS('background-color', 'rgb(234, 242, 232)');
});

test('block editor applies and updates a block background without leaving block mode', async ({ page }) => {
  await openWorkspace(page);
  await createPage(page, 'Block Color Editing');
  const editor = page.locator('.editor textarea');
  await editor.fill('# Colorable heading\n\nA paragraph to color.');
  await page.getByRole('button', { name: 'Block editing' }).click();
  const blocks = page.getByRole('region', { name: 'Markdown block editor' });
  await blocks.getByRole('textbox', { name: 'Edit paragraph block 2' }).focus();
  await blocks.getByLabel('Block background color for block 2').evaluate((node: HTMLInputElement) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(node, '#eaf2e8');
    node.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await expect(blocks.getByRole('textbox', { name: 'Edit callout block 2' })).toHaveValue('> [!COLOR=#EAF2E8]\n> A paragraph to color.');
  await blocks.getByLabel('Block background color for block 2').evaluate((node: HTMLInputElement) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(node, '#fff0a8');
    node.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await expect(blocks.getByRole('textbox', { name: 'Edit callout block 2' })).toHaveValue('> [!COLOR=#FFF0A8]\n> A paragraph to color.');
  await page.getByRole('button', { name: 'Block editing' }).click();
  await page.locator('.view-toggle').getByRole('button', { name: 'Preview', exact: true }).click();
  await expect(page.locator('.markdown-preview blockquote.markdown-color-block')).toContainText('A paragraph to color.');
});

test('Enter continues ordered, bulleted and task lists and exits an empty item', async ({ page }) => {
  await openWorkspace(page);
  await createPage(page, 'List Enter Behavior');
  const editor = page.locator('.editor-work-main > textarea');

  await editor.fill('1. First step');
  await editor.press('End');
  await editor.press('Enter');
  await expect(editor).toHaveValue('1. First step\n2. ');
  await expect.poll(() => editor.evaluate(node => node === document.activeElement && node.selectionStart === node.value.length)).toBe(true);
  await editor.type('Second step');
  await editor.press('Enter');
  await expect(editor).toHaveValue('1. First step\n2. Second step\n3. ');

  await editor.fill('- First item');
  await editor.press('End');
  await editor.press('Enter');
  await expect(editor).toHaveValue('- First item\n- ');
  await expect.poll(() => editor.evaluate(node => node === document.activeElement && node.selectionStart === node.value.length)).toBe(true);
  await editor.type('Second item');
  await editor.press('Enter');
  await expect(editor).toHaveValue('- First item\n- Second item\n- ');

  await editor.fill('- [ ] First task');
  await editor.press('End');
  await editor.press('Enter');
  await expect(editor).toHaveValue('- [ ] First task\n- [ ] ');
  await expect.poll(() => editor.evaluate(node => node === document.activeElement && node.selectionStart === node.value.length)).toBe(true);
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
