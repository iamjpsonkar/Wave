import { useMemo, useState } from 'react';

type BlockType = 'heading' | 'paragraph' | 'list' | 'quote' | 'callout' | 'code' | 'table' | 'divider' | 'image' | 'attachment';
type Block = { type: BlockType; start: number; end: number; source: string };

function classify(line: string): BlockType {
  if (/^\s{0,3}#{1,6}\s/.test(line)) return 'heading';
  if (/^\s*>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION|DETAILS|COLOR=#[0-9a-f]{6})\]/i.test(line)) return 'callout';
  if (/^\s*>/.test(line)) return 'quote';
  if (/^\s*(?:[-*+]\s|\d+[.)]\s)/.test(line)) return 'list';
  if (/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line)) return 'divider';
  if (/^\s*!\[[^\]]*\]\([^)]*\)\s*$/.test(line)) return 'image';
  if (/^\s*\[[^\]]+\]\([^)]*\)\s*$/.test(line)) return 'attachment';
  if (line.includes('|')) return 'table';
  return 'paragraph';
}

function parseBlocks(source: string): Block[] {
  const lines = source.split('\n'), offsets: number[] = [];
  let cursor = 0;
  for (const line of lines) { offsets.push(cursor); cursor += line.length + 1; }
  const blocks: Block[] = [];
  let index = 0;
  while (index < lines.length) {
    if (!lines[index].trim()) { index++; continue; }
    const startIndex = index;
    const opening = lines[index].match(/^\s*(\x60{3,}|~{3,})/);
    const type: BlockType = opening ? 'code' : classify(lines[index]);
    if (opening) {
      index++;
      while (index < lines.length) {
        const close = lines[index].match(/^\s*(\x60{3,}|~{3,})/);
        const done = close && close[1][0] === opening[1][0] && close[1].length >= opening[1].length;
        index++;
        if (done) break;
      }
    } else {
      index++;
      if (type === 'table') {
        while (index < lines.length && lines[index].trim() && lines[index].includes('|')) index++;
      } else if (type === 'list') {
        while (index < lines.length && (/^\s*(?:[-*+]\s|\d+[.)]\s)/.test(lines[index]) || /^\s{2,}\S/.test(lines[index]))) index++;
      } else if (type === 'quote' || type === 'callout') {
        while (index < lines.length && (/^\s*>/.test(lines[index]) || /^\s{2,}\S/.test(lines[index]))) index++;
      } else if (type === 'paragraph') {
        while (index < lines.length && lines[index].trim() && classify(lines[index]) === 'paragraph') index++;
      }
    }
    const endIndex = Math.max(startIndex, index - 1), start = offsets[startIndex], end = offsets[endIndex] + lines[endIndex].length;
    blocks.push({ type, start, end, source: source.slice(start, end) });
  }
  return blocks;
}

const insertions: { label: string; source: string }[] = [
  { label: 'Paragraph', source: 'Write something…' },
  { label: 'Heading', source: '## New heading' },
  { label: 'Bulleted list', source: '- List item' },
  { label: 'Quote', source: '> Quote' },
  { label: 'Callout', source: '> [!NOTE]\n> Important note' },
  { label: 'Code block', source: '\x60\x60\x60text\nCode goes here\n\x60\x60\x60' },
  { label: 'Divider', source: '---' }
];

export default function MarkdownBlockEditor({ content, onChange }: { content: string; onChange: (value: string) => void }) {
  const blocks = useMemo(() => parseBlocks(content), [content]);
  const [insertMenuOpen, setInsertMenuOpen] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  function update(block: Block, value: string) {
    onChange(content.slice(0, block.start) + value + content.slice(block.end));
  }
  function applyBlockColor(block: Block, color: string) {
    const hex = color.toUpperCase();
    const lines = block.source.split('\\n');
    if (/^\\s*>\\s*\\[!COLOR=#[0-9a-f]{6}\\]/i.test(lines[0])) {
      lines[0] = lines[0].replace(/\\[!COLOR=#[0-9a-f]{6}\\]/i, '[!COLOR=' + hex + ']');
    } else {
      const quoted = lines.map(line => '> ' + line);
      quoted.unshift('> [!COLOR=' + hex + ']');
      lines.splice(0, lines.length, ...quoted);
    }
    update(block, lines.join('\\n'));
  }
  function moveTo(index: number, destination: number) {
    if (index < 0 || destination < 0 || index >= blocks.length || destination >= blocks.length || index === destination) return;
    const ordered = [...blocks];
    const [moving] = ordered.splice(index, 1);
    ordered.splice(destination, 0, moving);
    const gaps = blocks.slice(0, -1).map((block, position) => content.slice(block.end, blocks[position + 1].start));
    const prefix = content.slice(0, blocks[0].start), suffix = content.slice(blocks[blocks.length - 1].end);
    onChange(prefix + ordered.map((block, position) => block.source + (gaps[position] ?? '')).join('') + suffix);
  }
  function remove(block: Block) {
    let start = block.start, end = block.end;
    if (content.slice(end, end + 2) === '\n\n') end += 2;
    else if (content.slice(start - 2, start) === '\n\n') start -= 2;
    else if (content[start - 1] === '\n') start--;
    onChange(content.slice(0, start) + content.slice(end));
  }
  function add(source: string) {
    const separator = content ? (content.endsWith('\n\n') ? '' : content.endsWith('\n') ? '\n' : '\n\n') : '';
    onChange(content + separator + source);
    setInsertMenuOpen(false);
  }
  return <section className="markdown-block-editor" aria-label="Markdown block editor">
    <div className="block-editor-intro"><strong>Block editing</strong><span>Move blocks, add common content, or edit their original Markdown source. Untouched source is preserved.</span></div>
    {blocks.length ? blocks.map((block, index) => <article className={'markdown-block markdown-block-' + block.type + (draggingIndex === index ? ' is-dragging' : '')} key={block.start + '-' + block.type} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); if (draggingIndex !== null) moveTo(draggingIndex, index); setDraggingIndex(null); }}>
      <label><span>{block.type}</span><span>Block {index + 1}</span></label>
      <div className="markdown-block-controls">
        <button type="button" className="block-drag-handle" draggable aria-label={'Drag block ' + (index + 1)} title="Drag to reorder" onDragStart={event => { event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', String(index)); setDraggingIndex(index); }} onDragEnd={() => setDraggingIndex(null)}>⠿</button>
        <button type="button" aria-label={'Move block ' + (index + 1) + ' up'} title="Move up" disabled={index === 0} onClick={() => moveTo(index, index - 1)}>↑</button>
        <button type="button" aria-label={'Move block ' + (index + 1) + ' down'} title="Move down" disabled={index === blocks.length - 1} onClick={() => moveTo(index, index + 1)}>↓</button>
        <button type="button" aria-label={'Delete block ' + (index + 1)} title="Delete block" onClick={() => remove(block)}>×</button>\n        <label className="block-color-control" title={'Block background color for block ' + (index + 1)}><span aria-hidden="true">▤</span><input type="color" aria-label={'Block background color for block ' + (index + 1)} defaultValue="#eaf2e8" onChange={event => applyBlockColor(block, event.target.value)}/></label>
      </div>
      <textarea aria-label={'Edit ' + block.type + ' block ' + (index + 1)} rows={Math.min(12, Math.max(1, block.source.split('\n').length))} spellCheck value={block.source} onChange={event => update(block, event.target.value)}/>
    </article>) : <div className="block-editor-empty"><p>Your page is empty. Add a block to begin.</p><textarea aria-label="New paragraph block" rows={3} value={content} onChange={event => onChange(event.target.value)} placeholder="Write a paragraph…"/></div>}
    <div className="block-insert">
      <button type="button" aria-expanded={insertMenuOpen} aria-haspopup="menu" onClick={() => setInsertMenuOpen(value => !value)}>＋ Add block</button>
      {insertMenuOpen && <div className="block-insert-menu" role="menu" aria-label="Add a Markdown block">
        {insertions.map(item => <button type="button" role="menuitem" key={item.label} onClick={() => add(item.source)}>{item.label}</button>)}
      </div>}
    </div>
  </section>;
}
