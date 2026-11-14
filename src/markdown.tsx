import { Children, cloneElement, createElement, isValidElement, type ReactNode } from 'react';
import { Copy } from 'lucide-react';

type MarkdownElementProps = { children?: ReactNode };
type WikiDoc = { path: string; title: string };

const ALERTS = new Set(['NOTE', 'TIP', 'IMPORTANT', 'WARNING', 'CAUTION']);

function plainText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(plainText).join('');
  if (isValidElement(node)) return plainText((node.props as MarkdownElementProps).children);
  return '';
}

function withoutAlertMarker(node: ReactNode): ReactNode {
  if (typeof node === 'string') return node.replace(/^\s*\[!(?:NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i, '');
  if (Array.isArray(node)) return node.map(withoutAlertMarker);
  if (isValidElement(node)) return cloneElement(node, {}, withoutAlertMarker((node.props as MarkdownElementProps).children));
  return node;
}

export function resolveWikiLinkTarget(target: string, docs: WikiDoc[]): string | null {
  const normalized = target.trim().replace(/\.md$/i, '').toLocaleLowerCase();
  if (!normalized) return null;
  const pathMatches = docs.filter(doc => doc.path.replace(/\.md$/i, '').toLocaleLowerCase() === normalized);
  if (pathMatches.length === 1) return pathMatches[0].path;
  if (pathMatches.length > 1) return null;
  const titleMatches = docs.filter(doc => doc.title.trim().toLocaleLowerCase() === normalized);
  return titleMatches.length === 1 ? titleMatches[0].path : null;
}

export function extractWikiLinks(markdown: string): string[] {
  const source = markdown
    .replace(/\x60{3,}[\s\S]*?\x60{3,}/g, '')
    .replace(/~~~[\s\S]*?~~~/g, '')
    .replace(/\x60[^\x60\n]*\x60/g, '');
  return Array.from(source.matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g), match => match[1].trim()).filter(Boolean);
}

function convertMathSource(source: string): string {
  const output: string[] = [];
  let fence = false, mathBlock = false;
  for (const line of source.split('\n')) {
    if (/^\s*(`{3,}|~{3,})/.test(line) && !mathBlock) { fence = !fence; output.push(line); continue; }
    if (fence) { output.push(line); continue; }
    if (line.trim().length === 2 && line.trim()[0] === String.fromCharCode(36) && line.trim()[1] === String.fromCharCode(36)) { mathBlock = !mathBlock; output.push(mathBlock ? '```math' : '```'); continue; }
    if (mathBlock) { output.push(line); continue; }
    output.push(line.replace(/\$([^$\n]+)\$/g, (_match, expression: string) => '`math:' + expression.replace(/`/g, '') + '`'));
  }
  return output.join('\n');
}

export function markdownSource(source: string, docs: WikiDoc[] = []): string {
  const lines = convertMathSource(source).split('\n');
  let fence: { character: string; length: number } | null = null;
  const converted = lines.map(line => {
    const opening = line.match(/^\s*(\x60{3,}|~{3,})/);
    if (opening) {
      const token = opening[1];
      if (!fence) fence = { character: token[0], length: token.length };
      else if (token[0] === fence.character && token.length >= fence.length) fence = null;
      return line;
    }
    if (fence) return line;
    return line.replace(/(\x60+)([\s\S]*?)\1|\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (match, ticks, _code, target, alias) => {
      if (ticks || !target) return match;
      const normalizedTarget = target.trim();
      const path = resolveWikiLinkTarget(normalizedTarget, docs);
      const label = (alias || normalizedTarget).trim();
      const href = path ? 'https://wave.invalid/page/' + encodeURIComponent(path) : 'https://wave.invalid/unresolved/' + encodeURIComponent(normalizedTarget);
      return '[' + label + '](' + href + ')';
    });
  });
  return converted.join('\n').replace(/^(\s*>\s*)\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*/gim, '$1**$2** ');
}

export function MarkdownBlockquote({ children }: MarkdownElementProps) {
  const text = plainText(children).trimStart();
  const marker = text.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i);
  const label = text.match(/^(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\b/i);
  const kind = (marker?.[1] || label?.[1])?.toUpperCase();
  if (kind && ALERTS.has(kind)) {
    return <blockquote className={'markdown-alert markdown-alert-' + kind.toLowerCase()} role="note" aria-label={kind}>
      {marker ? withoutAlertMarker(children) : children}
    </blockquote>;
  }
  return <blockquote>{children}</blockquote>;
}

function codeText(children: ReactNode): string {
  if (typeof children === 'string' || typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(codeText).join('');
  if (isValidElement(children)) return codeText((children.props as MarkdownElementProps).children);
  return '';
}

export function MarkdownPre({ children }: MarkdownElementProps) {
  const source = codeText(children);
  const child = Children.only(children) as React.ReactElement<MarkdownElementProps>;
  const language = child.props.className ?? '';
  if (language.includes('language-mermaid') || language.includes('language-math')) return <div className="markdown-special-block">{children}</div>;
  async function copyCode() {
    try { await navigator.clipboard.writeText(source); }
    catch { /* Clipboard access can be unavailable or denied. */ }
  }
  return <div className="markdown-code">
    <pre>{children}</pre>
    <button type="button" className="markdown-copy" onClick={() => void copyCode()} aria-label="Copy code block" title="Copy code"><Copy size={13}/></button>
  </div>;
}

export function markdownHeadingId(node: ReactNode): string {
  const value = plainText(node).trim().toLocaleLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  return value.replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-') || 'section';
}

function MathExpression({ source, display = false }: { source: string; display?: boolean }) {
  const parts: ReactNode[] = [];
  const fraction = source.match(/^\s*\\frac\{([^{}]+)\}\{([^{}]+)\}\s*$/);
  const root = source.match(/^\s*\\sqrt\{([^{}]+)\}\s*$/);
  const superscript = source.match(/^(.+?)\^\{?([^{}]+)\}?$/);
  const subscript = source.match(/^(.+?)_\{?([^{}]+)\}?$/);
  const greek: Record<string,string> = { alpha:'α', beta:'β', gamma:'γ', delta:'δ', theta:'θ', lambda:'λ', pi:'π', sigma:'σ', omega:'ω', times:'×', cdot:'·', pm:'±', leq:'≤', geq:'≥', neq:'≠', infty:'∞' };
  if (fraction) parts.push(createElement('mfrac', { key:'fraction' }, createElement('mi', null, fraction[1]), createElement('mi', null, fraction[2])));
  else if (root) parts.push(createElement('msqrt', { key:'root' }, createElement('mi', null, root[1])));
  else if (superscript || subscript) { const match = superscript ?? subscript!; parts.push(createElement(superscript ? 'msup' : 'msub', { key:'script' }, createElement('mi', null, match[1]), createElement('mi', null, match[2].replace(/[{}]/g, '')))); }
  else {
    const tokens = source.replace(/\\([A-Za-z]+)/g, (_m, command: string) => greek[command] ?? command);
    for (const [index, token] of Array.from(tokens).entries()) {
      if (/\\s/.test(token)) parts.push(' ');
      else parts.push(createElement(/[0-9]/.test(token) ? 'mn' : /[=+*/<>-]/.test(token) ? 'mo' : 'mi', { key:index }, token));
    }
  }
  return createElement(display ? 'div' : 'span', { className: display ? 'markdown-math-display' : 'markdown-math-inline' },
    createElement('math', { xmlns:'http://www.w3.org/1998/Math/MathML', display:display?'block':'inline' }, createElement('mrow', null, ...parts)));
}

function MermaidFlowchart({ source }: { source: string }) {
  const lines = source.split('\n').map(line=>line.trim()).filter(Boolean);
  const edges = lines.slice(1).map(line=>line.match(/^([\w-]+)\s*(?:\[(.*?)\])?\s*-->\s*([\w-]+)\s*(?:\[(.*?)\])?/)).filter(Boolean) as RegExpMatchArray[];
  if (!/^flowchart\s+(?:TD|TB|LR|RL|BT)/i.test(lines[0] ?? '') || !edges.length)
    return <div className="mermaid-fallback"><p>This Mermaid diagram type is not rendered yet. The source remains available:</p><pre>{source}</pre></div>;
  const labels = new Map<string,string>();
  edges.forEach(edge=>{labels.set(edge[1],edge[2]||labels.get(edge[1])||edge[1]);labels.set(edge[3],edge[4]||labels.get(edge[3])||edge[3]);});
  const ids=Array.from(labels.keys()), horizontal=/flowchart\s+(?:LR|RL)/i.test(lines[0]);
  const width=horizontal?Math.max(240,ids.length*180):420, height=horizontal?130:Math.max(130,ids.length*95);
  const position=(id:string)=>{const index=ids.indexOf(id);return horizontal?{x:20+index*175,y:30}:{x:135,y:15+index*90};};
  const svgNodes:ReactNode[]=[];
  edges.forEach((edge,index)=>{const a=position(edge[1]),b=position(edge[3]);svgNodes.push(createElement('line',{key:'e'+index,x1:a.x+65,y1:a.y+25,x2:b.x+65,y2:b.y+25,stroke:'currentColor',strokeWidth:1.5,markerEnd:'url(#wave-mermaid-arrow)'}));});
  ids.forEach(id=>{const p=position(id);svgNodes.push(createElement('g',{key:id},createElement('rect',{x:p.x,y:p.y,width:130,height:50,rx:7,fill:'var(--markdown-diagram-node,#f0f3ed)',stroke:'currentColor'}),createElement('text',{x:p.x+65,y:p.y+30,textAnchor:'middle',fontSize:12,fill:'currentColor'},labels.get(id))));});
  return <div className="mermaid-diagram" role="img" aria-label="Mermaid flowchart"><svg viewBox={`0 0 ${width} ${height}`} width="100%"><defs><marker id="wave-mermaid-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L0 6 L7 3 z" fill="currentColor"/></marker></defs>{svgNodes}</svg></div>;
}

export function MarkdownCode({ children, className }: MarkdownElementProps) {
  const source=plainText(children);
  if (className?.includes('language-mermaid')) return <MermaidFlowchart source={source}/>;
  if (className?.includes('language-math')) return <MathExpression source={source} display/>;
  if (typeof children==='string' && children.startsWith('math:')) return <MathExpression source={children.slice(5)}/>;
  return <code className={className}>{children}</code>;
}
