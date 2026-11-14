import { useMemo } from 'react';

type BlockType = 'heading' | 'paragraph' | 'list' | 'quote' | 'callout' | 'code' | 'table' | 'divider' | 'image' | 'attachment';
type Block = { type: BlockType; start: number; end: number; source: string };

function classify(line: string): BlockType {
  if (/^\s{0,3}#{1,6}\s/.test(line)) return 'heading';
  if (/^\s*>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION|DETAILS)\]/i.test(line)) return 'callout';
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

export default function MarkdownBlockEditor({ content, onChange }: { content: string; onChange: (value: string) => void }) {
  const blocks = useMemo(() => parseBlocks(content), [content]);
  function update(block: Block, value: string) {
    onChange(content.slice(0, block.start) + value + content.slice(block.end));
  }
  return <section className="markdown-block-editor" aria-label="Markdown block editor">
    <div className="block-editor-intro"><strong>Block editing</strong><span>Each block edits its original Markdown source. Blank lines and untouched blocks are preserved.</span></div>
    {blocks.length ? blocks.map((block, index) => <article className={'markdown-block markdown-block-' + block.type} key={block.start + '-' + block.type}>
      <label><span>{block.type}</span><span>Block {index + 1}</span></label>
      <textarea aria-label={'Edit ' + block.type + ' block ' + (index + 1)} rows={Math.min(12, Math.max(1, block.source.split('\n').length))} spellCheck value={block.source} onChange={event => update(block, event.target.value)}/>
    </article>) : <div className="block-editor-empty"><p>Your page is empty. Start with a paragraph block.</p><textarea aria-label="New paragraph block" rows={3} value={content} onChange={event => onChange(event.target.value)} placeholder="Write a paragraph…"/></div>}
  </section>;
}
