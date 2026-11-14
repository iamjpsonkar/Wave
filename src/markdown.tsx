import { Children, cloneElement, createElement, isValidElement, type ReactNode } from 'react';
import { Copy } from 'lucide-react';

type MarkdownElementProps = { children?: ReactNode; className?: string };
type WikiDoc = { path: string; title: string };

const ALERTS = new Set(['NOTE', 'TIP', 'IMPORTANT', 'WARNING', 'CAUTION', 'DETAILS']);

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
    output.push(convertInlineExtensions(line).replace(/\$([^$\n]+)\$/g, (_match, expression: string) => '`math:' + expression.replace(/`/g, '') + '`'));
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
  const marker = text.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION|DETAILS)\]/i);
  const label = text.match(/^(NOTE|TIP|IMPORTANT|WARNING|CAUTION|DETAILS)\b/i);
  const kind = (marker?.[1] || label?.[1])?.toUpperCase();
  if (kind === 'DETAILS' && marker) {
    const items = Children.toArray(children);
    const first = items[0];
    const summary = plainText(first).replace(/^\[!DETAILS\]\s*/i, '').trim() || 'Details';
    return <details className="markdown-details"><summary>{summary}</summary>{items.slice(1)}</details>;
  }
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

export function markdownHeadingId(node: ReactNode, seen?: Map<string, number>): string {
  const value = plainText(node).trim().toLocaleLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  const base = value.replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-') || 'section';
  if (!seen) return base;
  const count = seen.get(base) ?? 0;
  seen.set(base, count + 1);
  return count === 0 ? base : base + '-' + count;
}

const EMOJI_SHORTCODES: Record<string, string> = {
  smile:'😄',smiley:'😃',grin:'😁',joy:'😂',heart:'❤️',heart_eyes:'😍',thumbsup:'👍','+1':'👍',
  '-1':'👎',rocket:'🚀',tada:'🎉',fire:'🔥',star:'⭐',warning:'⚠️',check:'✅',white_check_mark:'✅',
  x:'❌',bulb:'💡',eyes:'👀',wave:'👋',coffee:'☕',thinking:'🤔',sunglasses:'😎',pray:'🙏'
};

function convertInlineExtensions(line: string): string {
  const tick=String.fromCharCode(96);
  return line.replace(/(`+)([\s\S]*?)\1|==([^=\n]+)==|\+\+([^+\n]+)\+\+|\^([^^\n]+)\^|(?<!~)~([^~\n]+)~(?!~)|\[\[kbd:([^\]]+)\]\]|:([a-z0-9_+-]+):/gi,
    (match,ticks,_code,mark,underline,sup,sub,kbd,emoji) => {
      if(ticks)return match;
      if(mark)return tick+'wave-mark:'+mark+tick;
      if(underline)return tick+'wave-underline:'+underline+tick;
      if(sup)return tick+'wave-sup:'+sup+tick;
      if(sub)return tick+'wave-sub:'+sub+tick;
      if(kbd)return tick+'wave-kbd:'+kbd+tick;
      return EMOJI_SHORTCODES[emoji] ?? match;
    });
}

function MathExpression({ source, display = false }: { source: string; display?: boolean }) {
  const greek: Record<string,string> = { alpha:'α', beta:'β', gamma:'γ', delta:'δ', epsilon:'ε', theta:'θ', lambda:'λ', mu:'μ', pi:'π', rho:'ρ', sigma:'σ', phi:'φ', omega:'ω', times:'×', cdot:'·', pm:'±', leq:'≤', geq:'≥', neq:'≠', approx:'≈', infty:'∞', sum:'∑', int:'∫', to:'→', rightarrow:'→', leftarrow:'←' };
  function groupAt(input:string,start:number):{value:string;end:number} {
    if(input[start]!=='{')return {value:input[start]??'',end:start+1};
    let depth=1,index=start+1;
    for(;index<input.length&&depth;index++){if(input[index]==='{')depth++;else if(input[index]==='}')depth--;}
    return {value:input.slice(start+1,depth===0?index-1:index),end:index};
  }
  function parse(input:string):ReactNode[] {
    const nodes:ReactNode[]=[];let i=0;
    while(i<input.length){
      const ch=input[i];
      if(ch==='\\'){
        const command=input.slice(i+1).match(/^[A-Za-z]+/)?.[0]??'';
        if(!command){nodes.push(createElement('mo',{key:'m'+i},'\\\\'));i++;continue;}
        i+=command.length+1;
        if(command==='frac'||command==='dfrac'||command==='tfrac'||command==='sqrt'){
          const a=groupAt(input,i);i=a.end;
          if(command==='sqrt')nodes.push(createElement('msqrt',{key:'r'+i},...parse(a.value)));
          else{const b=groupAt(input,i);i=b.end;nodes.push(createElement('mfrac',{key:'f'+i},createElement('mrow',null,...parse(a.value)),createElement('mrow',null,...parse(b.value))));}
        }else if(greek[command])nodes.push(createElement('mi',{key:'g'+i},greek[command]));
        else if(command==='text'||command==='mathrm'||command==='mathbf'||command==='operatorname'){
          const a=groupAt(input,i);i=a.end;nodes.push(createElement('mtext',{key:'t'+i},a.value));
        }else nodes.push(createElement('mi',{key:'u'+i},command));
        continue;
      }
      if(ch==='^'||ch==='_'){
        const previous=nodes.pop();
        const a=groupAt(input,i+1);i=a.end;
        const script=createElement('mrow',null,...parse(a.value));
        nodes.push(ch==='^'?createElement('msup',{key:'s'+i},previous??createElement('mi',null,''),script):createElement('msub',{key:'s'+i},previous??createElement('mi',null,''),script));
        continue;
      }
      if(ch==='{'){const a=groupAt(input,i);i=a.end;nodes.push(createElement('mrow',{key:'b'+i},...parse(a.value)));continue;}
      if(/\s/.test(ch)){nodes.push(' ');i++;continue;}
      if(/[0-9]/.test(ch)){const token=input.slice(i).match(/^\d+(?:\.\d+)?/)?.[0]??ch;nodes.push(createElement('mn',{key:'n'+i},token));i+=token.length;continue;}
      if(/[A-Za-z]/.test(ch)){const token=input.slice(i).match(/^[A-Za-z]+/)?.[0]??ch;nodes.push(createElement('mi',{key:'i'+i},token));i+=token.length;continue;}
      nodes.push(createElement('mo',{key:'o'+i},ch));i++;
    }
    return nodes;
  }
  return createElement(display?'div':'span',{className:display?'markdown-math-display':'markdown-math-inline'},
    createElement('math',{xmlns:'http://www.w3.org/1998/Math/MathML',display:display?'block':'inline'},
      createElement('mrow',null,...parse(source))));
}

function MermaidFallback({source}:{source:string}) {
  return <div className="mermaid-fallback"><p>This Mermaid syntax is not supported by the local renderer yet. The source remains available:</p><pre>{source}</pre></div>;
}

function MermaidPie({source}:{source:string}) {
  const rows=source.split('\n').slice(1).map(line=>line.match(/^["']?(.+?)["']?\s*:\s*(\d+(?:\.\d+)?)/)).filter(Boolean) as RegExpMatchArray[];
  const total=rows.reduce((sum,row)=>sum+Number(row[2]),0);
  if(!rows.length||!total)return <MermaidFallback source={source}/>;
  let angle=-Math.PI/2;
  const colors=['#55785a','#8c9f77','#c1a36b','#7b91a8','#b47d76','#8e82a9','#6d9c9a'];
  const slices=rows.map((row,index)=>{const value=Number(row[2]),next=angle+value/total*Math.PI*2;const x1=100+80*Math.cos(angle),y1=100+80*Math.sin(angle),x2=100+80*Math.cos(next),y2=100+80*Math.sin(next);const large=next-angle>Math.PI?1:0;const path=`M 100 100 L ${x1} ${y1} A 80 80 0 ${large} 1 ${x2} ${y2} Z`;const item={path,color:colors[index%colors.length],label:row[1],value};angle=next;return item;});
  return <div className="mermaid-diagram mermaid-pie" role="img" aria-label={linesTitle(source)||'Mermaid pie chart'}><svg viewBox="0 0 200 200" width="220">{slices.map((slice,index)=><path key={index} d={slice.path} fill={slice.color} stroke="white" strokeWidth="1"/>)}</svg><ul>{slices.map((slice,index)=><li key={index}><i style={{background:slice.color}}/>{slice.label}: {slice.value}</li>)}</ul></div>;
}
function linesTitle(source:string){return source.split('\n').find(line=>/^title\s+/i.test(line))?.replace(/^title\s+/i,'').trim();}

function MermaidSequence({source}:{source:string}) {
  const lines=source.split('\n').map(line=>line.trim()).filter(Boolean);
  const participants=Array.from(new Set(lines.flatMap(line=>{const m=line.match(/^([\w-]+)\s*[-=]+>>?\s*([\w-]+)\s*:/);return m?[m[1],m[2]]:[]})));
  const messages=lines.map(line=>line.match(/^([\w-]+)\s*([- =]+>>?[- =]*)\s*([\w-]+)\s*:\s*(.+)$/)).filter(Boolean) as RegExpMatchArray[];
  if(!participants.length||!messages.length)return <MermaidFallback source={source}/>;
  const width=Math.max(320,participants.length*150),height=100+messages.length*55;
  const nodes:ReactNode[]=[];
  participants.forEach((name,index)=>{const x=55+index*145;nodes.push(createElement('rect',{key:'p'+name,x:x-48,y:8,width:96,height:30,rx:5,fill:'var(--markdown-diagram-node,#f0f3ed)',stroke:'currentColor'}),createElement('text',{key:'t'+name,x,y:28,textAnchor:'middle',fontSize:11,fill:'currentColor'},name),createElement('line',{key:'l'+name,x1:x,y1:40,x2:x,y2:height-8,stroke:'currentColor',strokeDasharray:'4 4',opacity:.55}));});
  messages.forEach((message,index)=>{const from=participants.indexOf(message[1]),to=participants.indexOf(message[3]);const y=65+index*55,x1=55+from*145,x2=55+to*145;nodes.push(createElement('line',{key:'m'+index,x1,y1:y,x2,y2:y,stroke:'currentColor',strokeWidth:1.5,markerEnd:'url(#wave-seq-arrow)'}),createElement('text',{key:'label'+index,x:(x1+x2)/2,y:y-7,textAnchor:'middle',fontSize:10,fill:'currentColor'},message[4]));});
  return <div className="mermaid-diagram" role="img" aria-label="Mermaid sequence diagram"><svg viewBox={`0 0 ${width} ${height}`} width="100%"><defs><marker id="wave-seq-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0 0 L0 6 L7 3 z" fill="currentColor"/></marker></defs>{nodes}</svg></div>;
}

function MermaidFlowchart({ source }: { source: string }) {
  const lines = source.split('\n').map(line=>line.trim()).filter(Boolean);
  const direction=lines[0]?.match(/^flowchart\s+(TD|TB|LR|RL|BT)/i)?.[1]?.toUpperCase();
  const edges = lines.slice(1).map(line=>line.match(/^([\w-]+)\s*(?:\[(.*?)\])?\s*-->\s*([\w-]+)\s*(?:\[(.*?)\])?/)).filter(Boolean) as RegExpMatchArray[];
  if (!direction || !edges.length) return <MermaidFallback source={source}/>;
  const labels = new Map<string,string>();
  edges.forEach(edge=>{labels.set(edge[1],edge[2]||labels.get(edge[1])||edge[1]);labels.set(edge[3],edge[4]||labels.get(edge[3])||edge[3]);});
  const ids=Array.from(labels.keys()), horizontal=direction==='LR'||direction==='RL';
  const width=horizontal?Math.max(240,ids.length*180):420, height=horizontal?150:Math.max(130,ids.length*95);
  const position=(id:string)=>{const index=ids.indexOf(id);return horizontal?{x:20+index*175,y:30}:{x:135,y:15+index*90};};
  const svgNodes:ReactNode[]=[];
  edges.forEach((edge,index)=>{const a=position(edge[1]),b=position(edge[3]);svgNodes.push(createElement('line',{key:'e'+index,x1:a.x+65,y1:a.y+25,x2:b.x+65,y2:b.y+25,stroke:'currentColor',strokeWidth:1.5,markerEnd:'url(#wave-mermaid-arrow)'}));});
  ids.forEach(id=>{const p=position(id);svgNodes.push(createElement('g',{key:id},createElement('rect',{x:p.x,y:p.y,width:130,height:50,rx:7,fill:'var(--markdown-diagram-node,#f0f3ed)',stroke:'currentColor'}),createElement('text',{x:p.x+65,y:p.y+30,textAnchor:'middle',fontSize:12,fill:'currentColor'},labels.get(id))));});
  return <div className="mermaid-diagram" role="img" aria-label="Mermaid flowchart"><svg viewBox={`0 0 ${width} ${height}`} width="100%"><defs><marker id="wave-mermaid-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L0 6 L7 3 z" fill="currentColor"/></marker></defs>{svgNodes}</svg></div>;
}

function highlightedCode(source:string, language:string):ReactNode[] {
  const supported=/javascript|typescript|jsx|tsx|json|css|html|xml|bash|sh|python|py|sql|yaml|yml|diff|text|txt/i.test(language);
  if(!supported)return [source];
  const pattern=/(\/\/[^\n]*|#[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b(?:const|let|var|function|return|if|else|for|while|class|new|import|from|export|default|async|await|true|false|null|undefined|def|print|select|from|where|insert|update|delete|create|table|as|and|or|not)\b|\b\d+(?:\.\d+)?\b|[{}()[\];,.]|[=+*/<>!-])/gi;
  const result:ReactNode[]=[];let last=0,index=0;
  for(const match of source.matchAll(pattern)){const at=match.index??0;if(at>last)result.push(source.slice(last,at));const token=match[0];let kind='operator';if(/^\/\/|^#/.test(token))kind='comment';else if(/^["'`]/.test(token))kind='string';else if(/^\d/.test(token))kind='number';else if(/^(const|let|var|function|return|if|else|for|while|class|new|import|from|export|default|async|await|true|false|null|undefined|def|print|select|where|insert|update|delete|create|table|as|and|or|not)$/i.test(token))kind='keyword';result.push(createElement('span',{key:'t'+index++,className:'syntax-'+kind},token));last=at+token.length;}
  if(last<source.length)result.push(source.slice(last));return result;
}

export function MarkdownCode({ children, className }: MarkdownElementProps) {
  const source=plainText(children);
  if (className?.includes('language-mermaid')) {
    if(/^\s*pie\b/i.test(source))return <MermaidPie source={source}/>;
    if(/^\s*sequenceDiagram\b/i.test(source))return <MermaidSequence source={source}/>;
    if(/^\s*flowchart\b/i.test(source))return <MermaidFlowchart source={source}/>;
    return <MermaidFallback source={source}/>;
  }
  if (className?.includes('language-math')) return <MathExpression source={source} display/>;
  if (typeof children==='string' && children.startsWith('math:')) return <MathExpression source={children.slice(5)}/>;
  if(typeof children==='string'&&children.startsWith('wave-')){
    const split=children.indexOf(':');const kind=children.slice(5,split),value=children.slice(split+1);
    if(kind==='mark')return <mark>{value}</mark>;
    if(kind==='underline')return <u>{value}</u>;
    if(kind==='sup')return <sup>{value}</sup>;
    if(kind==='sub')return <sub>{value}</sub>;
    if(kind==='kbd')return <kbd>{value}</kbd>;
  }
  const language=className?.replace(/^language-/,'')??'';
  return <code className={className}>{className?highlightedCode(source,language):children}</code>;
}
