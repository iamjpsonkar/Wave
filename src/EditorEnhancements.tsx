import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { ChevronDown, ChevronUp, Clock3, FileSearch, ListTree, Redo2, Undo2, X } from 'lucide-react';

type Props = { content: string; onChange: (value: string) => void; editorRef: RefObject<HTMLTextAreaElement>; preview: boolean; blockMode: boolean; onBlockModeChange: (value: boolean) => void };

export default function EditorEnhancements({ content, onChange, editorRef, preview, blockMode, onBlockModeChange }: Props) {
  const past = useRef<string[]>([]), future = useRef<string[]>([]), previous = useRef(content), applyingHistory = useRef(false);
  const [canUndo, setCanUndo] = useState(false), [canRedo, setCanRedo] = useState(false);
  const [findOpen, setFindOpen] = useState(false), [outlineOpen, setOutlineOpen] = useState(false);
  const [query, setQuery] = useState(''), [replacement, setReplacement] = useState(''), [caseSensitive, setCaseSensitive] = useState(false), [matchIndex, setMatchIndex] = useState(0);
  const findRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (content === previous.current) return;
    if (applyingHistory.current) applyingHistory.current = false;
    else { past.current.push(previous.current); if (past.current.length > 200) past.current.shift(); future.current = []; }
    previous.current = content; setCanUndo(past.current.length > 0); setCanRedo(future.current.length > 0);
  }, [content]);

  const matches = useMemo(() => {
    if (!query) return [] as number[];
    const haystack = caseSensitive ? content : content.toLocaleLowerCase(), needle = caseSensitive ? query : query.toLocaleLowerCase();
    const found: number[] = []; let cursor = 0;
    while (cursor <= haystack.length - needle.length) { const at = haystack.indexOf(needle, cursor); if (at < 0) break; found.push(at); cursor = at + Math.max(needle.length, 1); if (found.length >= 5000) break; }
    return found;
  }, [content, query, caseSensitive]);

  const headings = useMemo(() => {
    const seen = new Map<string, number>();
    return content.split('\n').flatMap((line, index) => {
      const match = line.match(/^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/); if (!match) return [];
      const text = match[2].replace(/[*_\x60~]/g, '').trim();
      const base = text.toLocaleLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s+/g, '-');
      const count = (seen.get(base) || 0) + 1; seen.set(base, count);
      return [{ level: match[1].length, text, line: index, id: count > 1 ? base + '-' + (count - 1) : base }];
    });
  }, [content]);

  function restore(from: 'undo' | 'redo') {
    const stack = from === 'undo' ? past.current : future.current, value = stack.pop(); if (value === undefined) return;
    (from === 'undo' ? future.current : past.current).push(content);
    applyingHistory.current = true; onChange(value);
    setCanUndo(past.current.length > 0); setCanRedo(future.current.length > 0);
    requestAnimationFrame(() => editorRef.current?.focus());
  }

  function navigateMatch(direction: 1 | -1) {
    if (!matches.length) return;
    const next = (matchIndex + direction + matches.length) % matches.length; setMatchIndex(next);
    const at = matches[next];
    if (!preview && editorRef.current) { editorRef.current.focus(); editorRef.current.setSelectionRange(at, at + query.length); const line = content.slice(0, at).split('\n').length; editorRef.current.scrollTop = Math.max(0, (line - 3) * 22); }
  }
  function replaceCurrent() { if (!matches.length) return; const at = matches[Math.min(matchIndex, matches.length - 1)]; onChange(content.slice(0, at) + replacement + content.slice(at + query.length)); }
  function replaceAll() {
    if (!matches.length) return;
    const escaped = query.replace(/[.*+?^$\x7b\x7d()|[\]\\]/g, '\\$&');
    onChange(content.replace(new RegExp(escaped, caseSensitive ? 'g' : 'gi'), () => replacement)); setMatchIndex(0);
  }
  function jumpToHeading(heading: (typeof headings)[number]) {
    if (preview) {
      const target = Array.from(document.querySelectorAll('.markdown-preview h1,.markdown-preview h2,.markdown-preview h3,.markdown-preview h4,.markdown-preview h5,.markdown-preview h6')).find(node => node.textContent?.trim() === heading.text);
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (editorRef.current) {
      const lines = content.split('\n'), before = lines.slice(0, heading.line).join('\n'), start = before.length + (heading.line ? 1 : 0);
      editorRef.current.focus(); editorRef.current.setSelectionRange(start, start + lines[heading.line].length); editorRef.current.scrollTop = Math.max(0, heading.line * 22 - 80);
    }
  }

  useEffect(() => {
    function shortcuts(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;\n      if (target !== editorRef.current && !target?.closest('.markdown-block-editor textarea')) return;
      const mod = event.metaKey || event.ctrlKey;
      if (mod && event.key.toLowerCase() === 'f') { event.preventDefault(); setFindOpen(true); requestAnimationFrame(() => findRef.current?.focus()); }
      else if (mod && event.key.toLowerCase() === 'z' && !event.shiftKey) { event.preventDefault(); if (past.current.length) restore('undo'); }
      else if (mod && (event.key.toLowerCase() === 'y' || (event.key.toLowerCase() === 'z' && event.shiftKey))) { event.preventDefault(); if (future.current.length) restore('redo'); }
    }
    window.addEventListener('keydown', shortcuts); return () => window.removeEventListener('keydown', shortcuts);
  });
  useEffect(() => { if (findOpen) requestAnimationFrame(() => findRef.current?.focus()); }, [findOpen]);

  const words = content.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu)?.length || 0;
  const minutes = Math.max(1, Math.ceil(words / 200)), characters = Array.from(content).length;

  return <section className="editor-enhancements" aria-label="Document tools">
    <div className="editor-utility-bar"><div className="editor-utility-actions">
      <button type="button" title="Undo (Ctrl/Cmd+Z)" aria-label="Undo" disabled={!canUndo} onClick={() => restore('undo')}><Undo2 size={15}/> <span>Undo</span></button>
      <button type="button" title="Redo (Ctrl/Cmd+Shift+Z)" aria-label="Redo" disabled={!canRedo} onClick={() => restore('redo')}><Redo2 size={15}/> <span>Redo</span></button>
      <button type="button" title="Find in document (Ctrl/Cmd+F)" aria-label="Find in document" aria-expanded={findOpen} onClick={() => setFindOpen(value => !value)}><FileSearch size={15}/> <span>Find</span></button>
      <button type="button" title="Block editing" aria-label="Block editing" aria-pressed={blockMode} disabled={preview} onClick={() => onBlockModeChange(!blockMode)}><ListTree size={15}/> <span>{blockMode ? 'Blocks on' : 'Blocks'}</span></button>
      <button type="button" title="Document outline" aria-label="Document outline" aria-expanded={outlineOpen} onClick={() => setOutlineOpen(value => !value)}><ListTree size={15}/> <span>Outline</span><span className="utility-count">{headings.length}</span></button>
    </div><div className="document-statistics" aria-label="Document statistics"><span>{words.toLocaleString()} words</span><span>{characters.toLocaleString()} characters</span><span><Clock3 size={12}/> {minutes} min read</span></div></div>
    {findOpen && <div className="document-find" role="search" aria-label="Find and replace">
      <div className="find-fields">
        <label><span>Find</span><input ref={findRef} aria-label="Find text" value={query} onChange={event => { setQuery(event.target.value); setMatchIndex(0); }} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); navigateMatch(event.shiftKey ? -1 : 1); } if (event.key === 'Escape') setFindOpen(false); }} placeholder="Find in this page"/></label>
        <label><span>Replace</span><input aria-label="Replace text" value={replacement} onChange={event => setReplacement(event.target.value)} onKeyDown={event => { if (event.key === 'Escape') setFindOpen(false); }}/></label>
        <label className="find-case"><input type="checkbox" checked={caseSensitive} onChange={event => setCaseSensitive(event.target.checked)}/> Match case</label>
      </div>
      <div className="find-actions"><span aria-live="polite">{matches.length ? (matchIndex + 1) + ' of ' + matches.length : query ? 'No matches' : 'Enter text to find'}</span>
        <button type="button" aria-label="Previous match" disabled={!matches.length} onClick={() => navigateMatch(-1)}><ChevronUp size={14}/></button>
        <button type="button" aria-label="Next match" disabled={!matches.length} onClick={() => navigateMatch(1)}><ChevronDown size={14}/></button>
        <button type="button" disabled={!matches.length || preview} onClick={replaceCurrent}>Replace</button>
        <button type="button" disabled={!matches.length || preview} onClick={replaceAll}>Replace all</button>
        <button type="button" aria-label="Close find" onClick={() => setFindOpen(false)}><X size={14}/></button>
      </div>
    </div>}
    {outlineOpen && <nav className="document-outline" aria-label="Document outline">{headings.length ? headings.map((heading, index) => <button type="button" key={heading.id + '-' + index} className={'outline-level-' + heading.level} onClick={() => jumpToHeading(heading)}>{heading.text}</button>) : <p>No headings yet. Add Markdown headings to build an outline.</p>}</nav>}
  </section>;
}
