import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function markdownFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (entry.name === 'node_modules' || entry.name === '.git') return [];
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(absolute);
    return entry.isFile() && entry.name.toLowerCase().endsWith('.md') ? [absolute] : [];
  });
}

function existsWithExactCase(target) {
  const relative = path.relative(root, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) return false;
  let current = root;
  for (const segment of relative.split(path.sep).filter(Boolean)) {
    let entries;
    try {
      entries = fs.readdirSync(current);
    } catch {
      return false;
    }
    if (!entries.includes(segment)) return false;
    current = path.join(current, segment);
  }
  return true;
}

function localMarkdownTargets(source) {
  const withoutFences = source.replace(/^\s*```[\s\S]*?^\s*```[^\n]*$/gm, '');
  const withoutInlineCode = withoutFences.replace(/`+[^`]*`+/g, '');
  const targets = [];
  for (const match of withoutInlineCode.matchAll(/!?\[[^\]]*\]\((<[^>]+>|(?:\\.|[^)])*)\)/g)) {
    let value = match[1].trim();
    if (value.startsWith('<') && value.endsWith('>')) value = value.slice(1, -1);
    else value = value.match(/^(\S+)/)?.[1] ?? '';
    if (!value || /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(value)) continue;
    const pathname = value.split(/[?#]/, 1)[0];
    if (!pathname) continue;
    let decoded;
    try {
      decoded = decodeURIComponent(pathname);
    } catch {
      decoded = pathname;
    }
    targets.push(decoded);
  }
  return targets;
}

test('all local Markdown links resolve with exact path casing', () => {
  const broken = [];
  for (const file of markdownFiles(root)) {
    const source = fs.readFileSync(file, 'utf8');
    const relativeFile = path.relative(root, file);
    for (const target of localMarkdownTargets(source)) {
      const resolved = path.resolve(path.dirname(file), target);
      if (!existsWithExactCase(resolved)) broken.push(relativeFile + ' -> ' + target);
    }
  }
  assert.deepEqual(broken, [], 'Broken local Markdown links:\n' + broken.join('\n'));
});
