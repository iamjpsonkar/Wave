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
    const detailText = text.replace(/^\[!DETAILS\]\s*/i, '');
    const detailLines = detailText.split(/\r?\n/);
    const summary = detailLines.shift()?.trim() || 'Details';
    const body = detailLines.join('\n').trim();
    return <details className="markdown-details"><summary>{summary}</summary>{body && <p>{body}</p>}</details>;
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

export function rehypeWaveHeadingIds() {
  return (tree: { children?: any[] }) => {
    const seen = new Map<string, number>();
    const textOf = (node: any): string => {
      if (typeof node?.value === 'string') return node.value;
      return Array.isArray(node?.children) ? node.children.map(textOf).join('') : '';
    };
    const visit = (node: any) => {
      if (node?.type === 'element' && /^h[1-6]$/.test(node.tagName ?? '')) {
        const raw = textOf(node).trim().toLocaleLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
        const base = raw.replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-') || 'section';
        const count = seen.get(base) ?? 0;
        seen.set(base, count + 1);
        node.properties = { ...(node.properties ?? {}), id: count ? base + '-' + count : base };
      }
      if (Array.isArray(node?.children)) node.children.forEach(visit);
    };
    visit(tree);
  };
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
  const slash=String.fromCharCode(92);
  const symbols:Record<string,string>={
    alpha:'α',beta:'β',gamma:'γ',delta:'δ',epsilon:'ε',varepsilon:'ϵ',theta:'θ',vartheta:'ϑ',lambda:'λ',mu:'μ',pi:'π',rho:'ρ',sigma:'σ',phi:'φ',varphi:'ϕ',omega:'ω',
    Gamma:'Γ',Delta:'Δ',Theta:'Θ',Lambda:'Λ',Pi:'Π',Sigma:'Σ',Phi:'Φ',Omega:'Ω',
    times:'×',cdot:'·',pm:'±',mp:'∓',leq:'≤',le:'≤',geq:'≥',ge:'≥',neq:'≠',approx:'≈',equiv:'≡',infty:'∞',partial:'∂',nabla:'∇',
    sum:'∑',prod:'∏',int:'∫',iint:'∬',iiint:'∭',oint:'∮',to:'→',rightarrow:'→',leftarrow:'←',leftrightarrow:'↔',Rightarrow:'⇒',Leftarrow:'⇐',
    cdots:'⋯',ldots:'…',vdots:'⋮',ddots:'⋱',forall:'∀',exists:'∃',in:'∈',notin:'∉',subset:'⊂',subseteq:'⊆',supset:'⊃',supseteq:'⊇',
    cup:'∪',cap:'∩',land:'∧',lor:'∨',neg:'¬',therefore:'∴',because:'∵',perp:'⊥',parallel:'∥',angle:'∠',degree:'°',
    div:'÷',star:'⋆',circ:'∘',bullet:'•',oplus:'⊕',otimes:'⊗',mapsto:'↦',iff:'⟺',implies:'⟹'
  };
  const functions=new Set(['sin','cos','tan','cot','sec','csc','arcsin','arccos','arctan','sinh','cosh','tanh','log','ln','exp','lim','min','max','sup','inf','det','dim','ker','gcd','Pr']);
  function groupAt(input:string,start:number):{value:string;end:number}{
    if(input[start]!=='{')return {value:input[start]??'',end:Math.min(input.length,start+1)};
    let depth=1,index=start+1;
    for(;index<input.length&&depth;index++){if(input[index]==='{')depth++;else if(input[index]==='}')depth--;}
    return {value:input.slice(start+1,depth===0?index-1:index),end:index};
  }
  function splitTopLevel(input:string,separator:string):string[]{
    const parts:string[]=[];let depth=0,start=0;
    for(let i=0;i<input.length;i++){
      if(input[i]==='{')depth++;
      else if(input[i]==='}')depth=Math.max(0,depth-1);
      else if(depth===0&&input.startsWith(separator,i)){parts.push(input.slice(start,i));i+=separator.length-1;start=i+1;}
    }
    parts.push(input.slice(start));return parts;
  }
  function parse(input:string):ReactNode[]{
    const nodes:ReactNode[]=[];let i=0;
    while(i<input.length){
      const ch=input[i];
      if(ch===slash){
        const rest=input.slice(i+1),match=rest.match(/^[A-Za-z]+/),command=match?.[0]??'';
        if(!command){
          const escaped=rest[0]??'';i+=2;
          const widths:Record<string,string>={',':'0.167em',':':'0.222em',';':'0.278em','!':'-0.167em',' ':'0.333em'};
          if(widths[escaped])nodes.push(createElement('mspace',{key:'space'+i,width:widths[escaped]}));
          else nodes.push(createElement('mo',{key:'escape'+i},({'{':'{','}':'}','%':'%','$':'$','#':'#','_':'_','&':'&'} as Record<string,string>)[escaped]??escaped));
          continue;
        }
        i+=command.length+1;
        if(command==='begin'){
          const env=groupAt(input,i);i=env.end;
          if(env.value==='array'){const spec=groupAt(input,i);i=spec.end;}
          const ending=slash+'end{'+env.value+'}',close=input.indexOf(ending,i);
          if(close<0){nodes.push(createElement('mtext',{key:'bad-env'+i},'Unsupported or unclosed '+env.value+' environment'));break;}
          const body=input.slice(i,close);i=close+ending.length;
          const rows=splitTopLevel(body,slash+slash).map(row=>row.trim()).filter(Boolean);
          const table=createElement('mtable',null,...rows.map((row,rowIndex)=>{
            const cells=splitTopLevel(row,'&');
            return createElement('mtr',{key:'row'+rowIndex},...cells.map((cell,colIndex)=>createElement('mtd',{key:'cell'+rowIndex+'-'+colIndex},createElement('mrow',null,...parse(cell)))));
          }));
          if(env.value==='cases')nodes.push(createElement('mrow',{key:'cases'+i},createElement('mo',null,'{'),table));
          else{
            const delimiters:Record<string,[string,string]>={pmatrix:['(',')'],bmatrix:['[',']'],Bmatrix:['{','}'],vmatrix:['|','|'],Vmatrix:['‖','‖']};
            const [open,closeDelimiter]=delimiters[env.value]??['',''];
            nodes.push(open||closeDelimiter?createElement('mfenced',{key:'env'+i,open,close:closeDelimiter},table):table);
          }
          continue;
        }
        if(['end','limits','nolimits','displaystyle','textstyle','scriptstyle'].includes(command))continue;
        if(command==='left'||command==='right')continue;
        if(command==='frac'||command==='dfrac'||command==='tfrac'||command==='binom'){
          const a=groupAt(input,i);i=a.end;const b=groupAt(input,i);i=b.end;
          const frac=createElement('mfrac',{key:'frac'+i,linethickness:command==='binom'?'0':'1'},createElement('mrow',null,...parse(a.value)),createElement('mrow',null,...parse(b.value)));
          nodes.push(command==='binom'?createElement('mfenced',{key:'binom'+i,open:'(',close:')'},frac):frac);continue;
        }
        if(command==='sqrt'){
          let index:string|undefined;
          if(input[i]==='['){const close=input.indexOf(']',i);if(close>=0){index=input.slice(i+1,close);i=close+1;}}
          const radicand=groupAt(input,i);i=radicand.end;
          nodes.push(index?createElement('mroot',{key:'root'+i},createElement('mrow',null,...parse(radicand.value)),createElement('mrow',null,...parse(index))):createElement('msqrt',{key:'root'+i},...parse(radicand.value)));continue;
        }
        if(['overline','bar','underline','hat','widehat','tilde','widetilde','vec','dot','ddot','overrightarrow','overleftarrow'].includes(command)){
          const a=groupAt(input,i);i=a.end;
          const accent:Record<string,string>={overline:'¯',bar:'¯',underline:'_',hat:'^',widehat:'^',tilde:'~',widetilde:'~',vec:'→',dot:'˙',ddot:'¨',overrightarrow:'→',overleftarrow:'←'};
          const over=command!=='underline';
          nodes.push(over?createElement('mover',{key:'accent'+i},createElement('mrow',null,...parse(a.value)),createElement('mo',null,accent[command])):createElement('munder',{key:'accent'+i},createElement('mrow',null,...parse(a.value)),createElement('mo',null,accent[command])));continue;
        }
        if(['text','textrm','textbf','mathrm','mathbf','mathit','operatorname'].includes(command)){
          const a=groupAt(input,i);i=a.end;nodes.push(createElement('mtext',{key:'text'+i},a.value));continue;
        }
        if(command==='quad'||command==='qquad'||command==='enspace'||command==='thinspace'){
          const width:Record<string,string>={quad:'1em',qquad:'2em',enspace:'0.5em',thinspace:'0.167em'};
          nodes.push(createElement('mspace',{key:'space'+i,width:width[command]}));continue;
        }
        if(symbols[command]){nodes.push(createElement('mo',{key:'symbol'+i},symbols[command]));continue;}
        if(functions.has(command)){nodes.push(createElement('mi',{key:'function'+i},command));continue;}
        if(command==='langle'||command==='rangle'){nodes.push(createElement('mo',{key:'angle'+i},command==='langle'?'⟨':'⟩'));continue;}
        if(command==='lbrace'||command==='rbrace'){nodes.push(createElement('mo',{key:'brace'+i},command==='lbrace'?'{':'}'));continue;}
        nodes.push(createElement('mi',{key:'unknown'+i},command));continue;
      }
      if(ch==='^'||ch==='_'){
        const previous=nodes.pop(),arg=groupAt(input,i+1);i=arg.end;
        const script=createElement('mrow',null,...parse(arg.value));
        if(previous&&isValidElement(previous)&&previous.type==='msup'&&ch==='_'){
          const parts=Children.toArray((previous.props as {children?:ReactNode}).children);
          nodes.push(createElement('msubsup',{key:'both'+i},parts[0],script,parts[1]));
        }else if(previous&&isValidElement(previous)&&previous.type==='msub'&&ch==='^'){
          const parts=Children.toArray((previous.props as {children?:ReactNode}).children);
          nodes.push(createElement('msubsup',{key:'both'+i},parts[0],parts[1],script));
        }else{
          nodes.push(ch==='^'?createElement('msup',{key:'sup'+i},previous??createElement('mi',null,''),script):createElement('msub',{key:'sub'+i},previous??createElement('mi',null,''),script));
        }
        continue;
      }
      if(ch==='{'){const a=groupAt(input,i);i=a.end;nodes.push(createElement('mrow',{key:'group'+i},...parse(a.value)));continue;}
      if(ch==='}') {nodes.push(createElement('mo',{key:'close'+i},'}'));i++;continue;}
      if(ch==='&'){nodes.push(createElement('mo',{key:'amp'+i},'&'));i++;continue;}
      if(/\s/.test(ch)){nodes.push(' ');i++;continue;}
      if(/[0-9]/.test(ch)){const token=input.slice(i).match(/^\d+(?:\.\d+)?/)?.[0]??ch;nodes.push(createElement('mn',{key:'num'+i},token));i+=token.length;continue;}
      if(/[A-Za-z]/.test(ch)){nodes.push(createElement('mi',{key:'id'+i},ch));i++;continue;}
      nodes.push(createElement('mo',{key:'op'+i},ch));i++;
    }
    return nodes;
  }
  const tree=createElement('math',{xmlns:'http://www.w3.org/1998/Math/MathML',display:display?'block':'inline'},createElement('mrow',null,...parse(source)));
  return createElement(display?'div':'span',{className:display?'markdown-math-display':'markdown-math-inline'},tree);
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

function DiagramSource({source}:{source:string}) {
  return <details className="diagram-source"><summary>View diagram source</summary><pre>{source}</pre></details>;
}
function MermaidClass({source}:{source:string}) {
  const lines=source.split('\n').map(line=>line.trim()).filter(line=>line&&!line.startsWith('%%'));
  const classes=new Map<string,string[]>();
  for(const line of lines){
    const block=line.match(/^class\s+([\w.]+)\s*\{([\s\S]*)\}$/);
    if(block)classes.set(block[1],block[2].split('\n').map(x=>x.trim()).filter(Boolean));
    const declaration=line.match(/^class\s+([\w.]+)$/);
    if(declaration&&!classes.has(declaration[1]))classes.set(declaration[1],[]);
  }
  const relations=lines.map(line=>line.match(/^([\w.]+)\s+(<\|--|\*--|o--|-->|\.\.>|--|<\.\.)\s+([\w.]+)(?:\s*:\s*(.+))?$/)).filter(Boolean) as RegExpMatchArray[];
  relations.forEach(r=>{if(!classes.has(r[1]))classes.set(r[1],[]);if(!classes.has(r[3]))classes.set(r[3],[]);});
  const names=Array.from(classes.keys());if(!names.length||names.length>40||source.length>20000)return <MermaidFallback source={source}/>;
  const cols=Math.min(3,names.length),width=cols*210,height=Math.ceil(names.length/cols)*150;
  const nodes:ReactNode[]=[];
  names.forEach((name,index)=>{const x=15+(index%cols)*210,y=15+Math.floor(index/cols)*150,items=classes.get(name)??[];
    nodes.push(createElement('rect',{key:'box'+name,x,y,width:180,height:48+items.length*19,rx:5,fill:'var(--markdown-diagram-node,#f0f3ed)',stroke:'currentColor'}));
    nodes.push(createElement('text',{key:'name'+name,x:x+90,y:y+25,textAnchor:'middle',fontWeight:'bold',fontSize:12,fill:'currentColor'},name));
    items.forEach((item,n)=>nodes.push(createElement('text',{key:name+n,x:x+8,y:y+48+n*18,fontSize:10,fill:'currentColor'},item)));
  });
  relations.forEach((r,index)=>{const a=names.indexOf(r[1]),b=names.indexOf(r[3]);if(a<0||b<0)return;const ax=105+(a%cols)*210,ay=55+Math.floor(a/cols)*150, bx=105+(b%cols)*210,by=55+Math.floor(b/cols)*150;nodes.push(createElement('line',{key:'rel'+index,x1:ax,y1:ay,x2:bx,y2:by,stroke:'currentColor',markerEnd:'url(#wave-class-arrow)'}));if(r[4])nodes.push(createElement('text',{key:'label'+index,x:(ax+bx)/2,y:(ay+by)/2-5,textAnchor:'middle',fontSize:10,fill:'currentColor'},r[4]));});
  return <div className="mermaid-diagram" role="img" aria-label={linesTitle(source)||'Mermaid class diagram'}><svg viewBox={'0 0 '+width+' '+height} width="100%"><defs><marker id="wave-class-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L0 6 L7 3 z" fill="currentColor"/></marker></defs>{nodes}</svg><DiagramSource source={source}/></div>;
}
function MermaidEr({source}:{source:string}) {
  const lines=source.split('\n').map(line=>line.trim()).filter(line=>line&&!line.startsWith('%%'));
  const names=Array.from(new Set(lines.flatMap(line=>{const m=line.match(/^([\w-]+)\s+(?:\|\||\|o|o\||\}\||\}o|o\{|\|\{|\{\{)[-o|{}]+\s+([\w-]+)\s*:/);return m?[m[1],m[2]]:[]})));
  const relations=lines.map(line=>line.match(/^([\w-]+)\s+([|o}{]+--[|o}{]+)\s+([\w-]+)\s*:\s*(.+)$/)).filter(Boolean) as RegExpMatchArray[];
  const entities=Array.from(new Set([...names,...lines.map(line=>line.match(/^([\w-]+)\s*\{$/)?.[1]).filter(Boolean) as string[]]));
  if(!entities.length||entities.length>40||!relations.length)return <MermaidFallback source={source}/>;
  const width=Math.max(320,entities.length*190),height=170;
  const nodes:ReactNode[]=[];
  entities.forEach((name,index)=>{const x=20+index*190;nodes.push(createElement('rect',{key:'er'+name,x,y:45,width:150,height:65,rx:4,fill:'var(--markdown-diagram-node,#f0f3ed)',stroke:'currentColor'}),createElement('text',{key:'ert'+name,x:x+75,y:82,textAnchor:'middle',fontSize:12,fill:'currentColor'},name));});
  relations.forEach((r,index)=>{const a=entities.indexOf(r[1]),b=entities.indexOf(r[3]);if(a<0||b<0)return;const x1=95+a*190,x2=95+b*190;nodes.push(createElement('line',{key:'erline'+index,x1,y1:110,x2,y2:110,stroke:'currentColor'}),createElement('text',{key:'erlabel'+index,x:(x1+x2)/2,y:100,textAnchor:'middle',fontSize:10,fill:'currentColor'},r[4]));});
  return <div className="mermaid-diagram" role="img" aria-label={linesTitle(source)||'Mermaid entity relationship diagram'}><svg viewBox={'0 0 '+width+' '+height} width="100%">{nodes}</svg><DiagramSource source={source}/></div>;
}
function MermaidState({source}:{source:string}) {
  const lines=source.split('\n').map(line=>line.trim()).filter(line=>line&&!line.startsWith('%%'));
  const transitions=lines.map(line=>line.match(/^(.+?)\s*(-->|\-\->)\s*(.+?)(?:\s*:\s*(.+))?$/)).filter(Boolean) as RegExpMatchArray[];
  const names=Array.from(new Set(transitions.flatMap(r=>[r[1].trim(),r[3].trim()])));
  if(!transitions.length||names.length>50||source.length>20000)return <MermaidFallback source={source}/>;
  const width=Math.max(320,names.length*155),height=150,nodes:ReactNode[]=[];
  names.forEach((name,index)=>{const x=65+index*150;if(name==='[*]')nodes.push(createElement('circle',{key:'state'+index,cx:x,cy:70,r:9,fill:'currentColor'}));else nodes.push(createElement('rect',{key:'state'+index,x:x-55,y:48,width:110,height:44,rx:16,fill:'var(--markdown-diagram-node,#f0f3ed)',stroke:'currentColor'}),createElement('text',{key:'statet'+index,x,y:75,textAnchor:'middle',fontSize:11,fill:'currentColor'},name));});
  transitions.forEach((r,index)=>{const a=names.indexOf(r[1].trim()),b=names.indexOf(r[3].trim());if(a<0||b<0)return;const x1=65+a*150,x2=65+b*150;nodes.push(createElement('line',{key:'stateedge'+index,x1,y1:70,x2,y2:70,stroke:'currentColor',markerEnd:'url(#wave-state-arrow)'}));if(r[4])nodes.push(createElement('text',{key:'statelabel'+index,x:(x1+x2)/2,y:55,textAnchor:'middle',fontSize:10,fill:'currentColor'},r[4]));});
  return <div className="mermaid-diagram" role="img" aria-label={linesTitle(source)||'Mermaid state diagram'}><svg viewBox={'0 0 '+width+' '+height} width="100%"><defs><marker id="wave-state-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L0 6 L7 3 z" fill="currentColor"/></marker></defs>{nodes}</svg><DiagramSource source={source}/></div>;
}
function MermaidGantt({source}:{source:string}) {
  const lines=source.split('\n').map(line=>line.trim()).filter(Boolean);
  const tasks:{name:string;start:number;duration:number;section:string}[]=[];let section='Tasks',cursor=0;
  for(const line of lines){
    const sec=line.match(/^section\s+(.+)$/i);if(sec){section=sec[1];continue;}
    if(/^(gantt|title\s|dateFormat|axisFormat|excludes|tickInterval)/i.test(line))continue;
    const parts=line.split(':');if(parts.length<2)continue;
    const name=parts[0].trim(),spec=parts.slice(1).join(':').split(',').map(x=>x.trim()).filter(Boolean);
    const detail=spec[spec.length-1]??'1d',durationMatch=detail.match(/^(\d+(?:\.\d+)?)(d|w|h)?$/i),duration=durationMatch?Number(durationMatch[1])*(durationMatch[2]?.toLowerCase()==='w'?7:durationMatch[2]?.toLowerCase()==='h'?1/24:1):1;
    const after=spec.find(x=>/^after\s+/i.test(x));const date=spec.find(x=>/^\d{4}-\d{2}-\d{2}/.test(x));
    const start=date?Math.max(0,(Date.parse(date)-Date.parse('2020-01-01'))/86400000):after?(tasks.find(t=>t.name===after.replace(/^after\s+/i,''))?.start??cursor):cursor;
    tasks.push({name,start,duration,section});cursor=Math.max(cursor,start+duration);
  }
  if(!tasks.length||tasks.length>100)return <MermaidFallback source={source}/>;
  const max=Math.max(...tasks.map(t=>t.start+t.duration),1),scale=600/max,width=760,height=55+tasks.length*34;
  return <div className="mermaid-diagram" role="img" aria-label={linesTitle(source)||'Mermaid Gantt chart'}><svg viewBox={'0 0 '+width+' '+height} width="100%">{tasks.map((task,index)=>createElement('g',{key:'task'+index},createElement('text',{x:5,y:40+index*34,fontSize:11,fill:'currentColor'},task.name),createElement('rect',{x:155+task.start*scale,y:24+index*34,width:Math.max(4,task.duration*scale),height:20,rx:4,fill:'var(--markdown-diagram-node,#8c9f77)',stroke:'currentColor'})))}</svg><DiagramSource source={source}/></div>;
}
function MermaidGitGraph({source}:{source:string}) {
  const lines=source.split('\n').map(line=>line.trim()).filter(line=>line&&!line.startsWith('%%'));
  const commits:{label:string;lane:number;merge?:number}[]=[];const lanes=new Map<string,number>([['main',0]]);let current='main',nextLane=1;
  for(const line of lines){
    if(/^gitGraph/i.test(line)||/^options:/i.test(line))continue;
    const branch=line.match(/^branch\s+([\w-]+)/i);if(branch){lanes.set(branch[1],nextLane++);continue;}
    const checkout=line.match(/^checkout\s+([\w-]+)/i);if(checkout){current=checkout[1];if(!lanes.has(current))lanes.set(current,nextLane++);continue;}
    const merge=line.match(/^merge\s+([\w-]+)/i);if(merge){commits.push({label:'merge '+merge[1],lane:lanes.get(current)??0,merge:lanes.get(merge[1])??0});continue;}
    if(/^commit\b/i.test(line)){const label=line.match(/(?:id|tag):\s*["']?([^"']+)["']?/i)?.[1]??'commit';commits.push({label,lane:lanes.get(current)??0});}
  }
  if(!commits.length||commits.length>80)return <MermaidFallback source={source}/>;
  const maxLane=Math.max(...Array.from(lanes.values()),0),width=Math.max(320,commits.length*90+40),height=70+maxLane*65,nodes:ReactNode[]=[];
  commits.forEach((commit,index)=>{const x=35+index*90,y=35+commit.lane*60;nodes.push(createElement('circle',{key:'commit'+index,cx:x,cy:y,r:9,fill:'var(--markdown-diagram-node,#8c9f77)',stroke:'currentColor'}),createElement('text',{key:'label'+index,x,y:y+24,textAnchor:'middle',fontSize:9,fill:'currentColor'},commit.label));if(index){const prev=commits[index-1];nodes.push(createElement('line',{key:'edge'+index,x1:x-90,y1:35+prev.lane*60,x2:x,y2:y,stroke:'currentColor'}));}if(commit.merge!==undefined)nodes.push(createElement('line',{key:'merge'+index,x1:x-35,y1:35+commit.merge*60,x2:x,y2:y,stroke:'currentColor',strokeDasharray:'3 3'}));});
  return <div className="mermaid-diagram" role="img" aria-label={linesTitle(source)||'Mermaid git graph'}><svg viewBox={'0 0 '+width+' '+height} width="100%">{nodes}</svg><DiagramSource source={source}/></div>;
}
function highlightedCode(source:string, language:string):ReactNode[] {
  const lang=language.toLowerCase();
  const supported=/^(javascript|js|typescript|ts|jsx|tsx|json|css|scss|html|xml|bash|sh|shell|python|py|sql|yaml|yml|diff|text|txt|markdown|md)$/i.test(lang);
  if(!supported)return [source];
  if(lang==='diff'){
    return source.split(/(\n)/).flatMap((line,index):ReactNode[]=>{
      if(line==='\n')return ['\n'];
      const kind=line.startsWith('+++')||line.startsWith('---')?'header':line.startsWith('+')?'added':line.startsWith('-')?'removed':line.startsWith('@@')?'hunk':'context';
      return [createElement('span',{key:'diff'+index,className:'syntax-diff-'+kind},line)];
    });
  }
  const keywords=/^(const|let|var|function|return|if|else|elif|for|while|class|new|import|from|export|default|async|await|true|false|null|undefined|def|print|pass|with|try|except|finally|raise|yield|lambda|None|True|False|select|where|insert|update|delete|create|table|as|and|or|not|join|left|right|inner|outer|group|by|order|limit|values|into|on|interface|type|extends|implements|public|private|static|void|fn|mut)$/i;
  const pattern=/(\/\*[\s\S]*?\*\/|\/\/[^\n]*|--[^\n]*|#[^\n]*|\x22(?:\\.|[^\x22\\])*\x22|'(?:\\.|[^'\\])*'|\x60(?:\\.|[^\x60\\])*\x60|\b(?:const|let|var|function|return|if|else|elif|for|while|class|new|import|from|export|default|async|await|true|false|null|undefined|def|print|pass|with|try|except|finally|raise|yield|lambda|None|True|False|select|where|insert|update|delete|create|table|as|and|or|not|join|left|right|inner|outer|group|by|order|limit|values|into|on|interface|type|extends|implements|public|private|static|void|fn|mut)\b|\b\d+(?:\.\d+)?\b|[{}()[\];,.]|[=+*/<>!-])/gi;
  const result:ReactNode[]=[];let last=0,index=0;
  for(const match of source.matchAll(pattern)){const at=match.index??0;if(at>last)result.push(source.slice(last,at));const token=match[0];let kind='operator';if(/^\/\*|^\/\/|^--|^#/.test(token))kind='comment';else if(/^[\x22'\x60]/.test(token))kind='string';else if(/^\d/.test(token))kind='number';else if(keywords.test(token))kind='keyword';result.push(createElement('span',{key:'t'+index++,className:'syntax-'+kind},token));last=at+token.length;}
  if(last<source.length)result.push(source.slice(last));return result;
}
export function MarkdownCode({ children, className }: MarkdownElementProps) {
  const source=plainText(children);
  if (className?.includes('language-mermaid')) {
    if(/^\s*pie\b/i.test(source))return <MermaidPie source={source}/>;
    if(/^\s*sequenceDiagram\b/i.test(source))return <MermaidSequence source={source}/>;
    if(/^\s*classDiagram\b/i.test(source))return <MermaidClass source={source}/>;
    if(/^\s*erDiagram\b/i.test(source))return <MermaidEr source={source}/>;
    if(/^\s*stateDiagram(?:-v2)?\b/i.test(source))return <MermaidState source={source}/>;
    if(/^\s*gantt\b/i.test(source))return <MermaidGantt source={source}/>;
    if(/^\s*gitGraph\b/i.test(source))return <MermaidGitGraph source={source}/>;
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
:'
        i+=command.length+1;
        if(command==='begin'){
          const env=groupAt(input,i);i=env.end;
          if(env.value==='array'){const spec=groupAt(input,i);i=spec.end;}
          const ending='\\end{'+env.value+'}',close=input.indexOf(ending,i);
          if(close<0){nodes.push(createElement('mtext',{key:'bad-env'+i},'\\begin{'+env.value+'}'));continue;}
          nodes.push(envNode(env.value,input.slice(i,close)));i=close+ending.length;continue;
        }
        if(command==='end'||command==='limits'||command==='nolimits'||command==='displaystyle'||command==='textstyle'||command==='scriptstyle'||command==='quadskip')continue;
        if(command==='left'||command==='right')continue;
        if(command==='frac'||command==='dfrac'||command==='tfrac'||command==='binom'){
          const a=groupAt(input,i);i=a.end;const b=groupAt(input,i);i=b.end;
          const frac=createElement('mfrac',{key:'frac'+i,linethickness:command==='binom'?'0':'1'},createElement('mrow',null,...parse(a.value)),createElement('mrow',null,...parse(b.value)));
          nodes.push(command==='binom'?createElement('mfenced',{key:'binom'+i,open:'(',close:')'},frac):frac);continue;
        }
        if(command==='sqrt'){
          let index:string|undefined;
          if(input[i]==='['){const close=input.indexOf(']',i);if(close>=0){index=input.slice(i+1,close);i=close+1;}}
          const radicand=groupAt(input,i);i=radicand.end;
          nodes.push(index?createElement('mroot',{key:'root'+i},createElement('mrow',null,...parse(radicand.value)),createElement('mrow',null,...parse(index))):createElement('msqrt',{key:'root'+i},...parse(radicand.value)));continue;
        }
        if(['overline','bar','underline','hat','widehat','tilde','widetilde','vec','dot','ddot','overrightarrow','overleftarrow'].includes(command)){
          const a=groupAt(input,i);i=a.end;
          const accent:Record<string,string>={overline:'¯',bar:'¯',underline:'_',hat:'^',widehat:'^',tilde:'~',widetilde:'~',vec:'→',dot:'˙',ddot:'¨',overrightarrow:'→',overleftarrow:'←'};
          const over=!['underline'].includes(command);
          nodes.push(over?createElement('mover',{key:'accent'+i},createElement('mrow',null,...parse(a.value)),createElement('mo',null,accent[command])):createElement('munder',{key:'accent'+i},createElement('mrow',null,...parse(a.value)),createElement('mo',null,accent[command])));continue;
        }
        if(command==='text'||command==='textrm'||command==='textbf'||command==='mathrm'||command==='mathbf'||command==='mathit'||command==='operatorname'){
          const a=groupAt(input,i);i=a.end;nodes.push(createElement('mtext',{key:'text'+i},a.value));continue;
        }
        if(['\,','\\,',';','!','quad','qquad','enspace','thinspace'].includes(command)){
          const width:Record<string,string>={',':'0.167em',';':'0.278em','!':'-0.167em',quad:'1em',qquad:'2em',enspace:'0.5em',thinspace:'0.167em'};
          nodes.push(createElement('mspace',{key:'space'+i,width:width[command]??'0.167em'}));continue;
        }
        if(command==='\\'){nodes.push(createElement('mspace',{key:'newline'+i,linebreak:'newline'}));continue;}
        if(symbols[command]){nodes.push(createElement('mo',{key:'sym'+i},symbols[command]));continue;}
        if(functions.has(command)){nodes.push(createElement('mi',{key:'fn'+i},command));continue;}
        if(command==='langle'||command==='rangle'){nodes.push(createElement('mo',{key:'angle'+i},command==='langle'?'⟨':'⟩'));continue;}
        if(command==='lbrace'||command==='rbrace'){nodes.push(createElement('mo',{key:'brace'+i},command==='lbrace'?'{':'}'));continue;}
        nodes.push(createElement('mi',{key:'unknown'+i},command));continue;
      }
      if(ch==='^'||ch==='_'){
        const previous=nodes.pop(),arg=groupAt(input,i+1);i=arg.end;
        const script=createElement('mrow',null,...parse(arg.value));
        if(previous&&isValidElement(previous)&&previous.type==='msup'&&ch==='_'){
          const parts=Children.toArray((previous.props as {children?:ReactNode}).children);
          nodes.push(createElement('msubsup',{key:'both'+i},parts[0],script,parts[1]));
        }else if(previous&&isValidElement(previous)&&previous.type==='msub'&&ch==='^'){
          const parts=Children.toArray((previous.props as {children?:ReactNode}).children);
          nodes.push(createElement('msubsup',{key:'both'+i},parts[0],parts[1],script));
        }else{
          nodes.push(ch==='^'?createElement('msup',{key:'sup'+i},previous??createElement('mi',null,''),script):createElement('msub',{key:'sub'+i},previous??createElement('mi',null,''),script));
        }
        continue;
      }
      if(ch==='{'){const a=groupAt(input,i);i=a.end;nodes.push(createElement('mrow',{key:'group'+i},...parse(a.value)));continue;}
      if(ch==='}') {nodes.push(createElement('mo',{key:'close'+i},'}'));i++;continue;}
      if(ch==='&'){nodes.push(createElement('mo',{key:'amp'+i},'&'));i++;continue;}
      if(/\s/.test(ch)){nodes.push(' ');i++;continue;}
      if(/[0-9]/.test(ch)){const token=input.slice(i).match(/^\d+(?:\.\d+)?/)?.[0]??ch;nodes.push(createElement('mn',{key:'num'+i},token));i+=token.length;continue;}
      if(/[A-Za-z]/.test(ch)){nodes.push(createElement('mi',{key:'id'+i},ch));i++;continue;}
      nodes.push(createElement('mo',{key:'op'+i},ch));i++;
    }
    return nodes;
  }
  const tree=createElement('math',{xmlns:'http://www.w3.org/1998/Math/MathML',display:display?'block':'inline'},createElement('mrow',null,...parse(source)));
  return createElement(display?'div':'span',{className:display?'markdown-math-display':'markdown-math-inline'},tree);
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
  const lang=language.toLowerCase();
  const supported=/^(javascript|js|typescript|ts|jsx|tsx|json|css|scss|html|xml|bash|sh|shell|python|py|sql|yaml|yml|diff|text|txt|markdown|md)$/i.test(lang);
  if(!supported)return [source];
  if(lang==='diff'){
    return source.split(/(\n)/).flatMap((line,index):ReactNode[]=>{
      if(line==='\n')return ['\n'];
      const kind=line.startsWith('+++')||line.startsWith('---')?'header':line.startsWith('+')?'added':line.startsWith('-')?'removed':line.startsWith('@@')?'hunk':'context';
      return [createElement('span',{key:'diff'+index,className:'syntax-diff-'+kind},line)];
    });
  }
  const keywords=/^(const|let|var|function|return|if|else|elif|for|while|class|new|import|from|export|default|async|await|true|false|null|undefined|def|print|pass|with|try|except|finally|raise|yield|lambda|None|True|False|select|where|insert|update|delete|create|table|as|and|or|not|join|left|right|inner|outer|group|by|order|limit|values|into|on|interface|type|extends|implements|public|private|static|void|fn|mut)$/i;
  const pattern=/(\/\*[\s\S]*?\*\/|\/\/[^\n]*|--[^\n]*|#[^\n]*|\x22(?:\\.|[^\x22\\])*\x22|'(?:\\.|[^'\\])*'|\x60(?:\\.|[^\x60\\])*\x60|\b(?:const|let|var|function|return|if|else|elif|for|while|class|new|import|from|export|default|async|await|true|false|null|undefined|def|print|pass|with|try|except|finally|raise|yield|lambda|None|True|False|select|where|insert|update|delete|create|table|as|and|or|not|join|left|right|inner|outer|group|by|order|limit|values|into|on|interface|type|extends|implements|public|private|static|void|fn|mut)\b|\b\d+(?:\.\d+)?\b|[{}()[\];,.]|[=+*/<>!-])/gi;
  const result:ReactNode[]=[];let last=0,index=0;
  for(const match of source.matchAll(pattern)){const at=match.index??0;if(at>last)result.push(source.slice(last,at));const token=match[0];let kind='operator';if(/^\/\*|^\/\/|^--|^#/.test(token))kind='comment';else if(/^[\x22'\x60]/.test(token))kind='string';else if(/^\d/.test(token))kind='number';else if(keywords.test(token))kind='keyword';result.push(createElement('span',{key:'t'+index++,className:'syntax-'+kind},token));last=at+token.length;}
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
,'#':'#','_':'_','&':'&'} as Record<string,string>)[escaped]??escaped));continue;}
        i+=command.length+1;
        if(command==='begin'){
          const env=groupAt(input,i);i=env.end;
          if(env.value==='array'){const spec=groupAt(input,i);i=spec.end;}
          const ending='\\end{'+env.value+'}',close=input.indexOf(ending,i);
          if(close<0){nodes.push(createElement('mtext',{key:'bad-env'+i},'\\begin{'+env.value+'}'));continue;}
          nodes.push(envNode(env.value,input.slice(i,close)));i=close+ending.length;continue;
        }
        if(command==='end'||command==='limits'||command==='nolimits'||command==='displaystyle'||command==='textstyle'||command==='scriptstyle'||command==='quadskip')continue;
        if(command==='left'||command==='right')continue;
        if(command==='frac'||command==='dfrac'||command==='tfrac'||command==='binom'){
          const a=groupAt(input,i);i=a.end;const b=groupAt(input,i);i=b.end;
          const frac=createElement('mfrac',{key:'frac'+i,linethickness:command==='binom'?'0':'1'},createElement('mrow',null,...parse(a.value)),createElement('mrow',null,...parse(b.value)));
          nodes.push(command==='binom'?createElement('mfenced',{key:'binom'+i,open:'(',close:')'},frac):frac);continue;
        }
        if(command==='sqrt'){
          let index:string|undefined;
          if(input[i]==='['){const close=input.indexOf(']',i);if(close>=0){index=input.slice(i+1,close);i=close+1;}}
          const radicand=groupAt(input,i);i=radicand.end;
          nodes.push(index?createElement('mroot',{key:'root'+i},createElement('mrow',null,...parse(radicand.value)),createElement('mrow',null,...parse(index))):createElement('msqrt',{key:'root'+i},...parse(radicand.value)));continue;
        }
        if(['overline','bar','underline','hat','widehat','tilde','widetilde','vec','dot','ddot','overrightarrow','overleftarrow'].includes(command)){
          const a=groupAt(input,i);i=a.end;
          const accent:Record<string,string>={overline:'¯',bar:'¯',underline:'_',hat:'^',widehat:'^',tilde:'~',widetilde:'~',vec:'→',dot:'˙',ddot:'¨',overrightarrow:'→',overleftarrow:'←'};
          const over=!['underline'].includes(command);
          nodes.push(over?createElement('mover',{key:'accent'+i},createElement('mrow',null,...parse(a.value)),createElement('mo',null,accent[command])):createElement('munder',{key:'accent'+i},createElement('mrow',null,...parse(a.value)),createElement('mo',null,accent[command])));continue;
        }
        if(command==='text'||command==='textrm'||command==='textbf'||command==='mathrm'||command==='mathbf'||command==='mathit'||command==='operatorname'){
          const a=groupAt(input,i);i=a.end;nodes.push(createElement('mtext',{key:'text'+i},a.value));continue;
        }
        if(['\,','\\,',';','!','quad','qquad','enspace','thinspace'].includes(command)){
          const width:Record<string,string>={',':'0.167em',';':'0.278em','!':'-0.167em',quad:'1em',qquad:'2em',enspace:'0.5em',thinspace:'0.167em'};
          nodes.push(createElement('mspace',{key:'space'+i,width:width[command]??'0.167em'}));continue;
        }
        if(command==='\\'){nodes.push(createElement('mspace',{key:'newline'+i,linebreak:'newline'}));continue;}
        if(symbols[command]){nodes.push(createElement('mo',{key:'sym'+i},symbols[command]));continue;}
        if(functions.has(command)){nodes.push(createElement('mi',{key:'fn'+i},command));continue;}
        if(command==='langle'||command==='rangle'){nodes.push(createElement('mo',{key:'angle'+i},command==='langle'?'⟨':'⟩'));continue;}
        if(command==='lbrace'||command==='rbrace'){nodes.push(createElement('mo',{key:'brace'+i},command==='lbrace'?'{':'}'));continue;}
        nodes.push(createElement('mi',{key:'unknown'+i},command));continue;
      }
      if(ch==='^'||ch==='_'){
        const previous=nodes.pop(),arg=groupAt(input,i+1);i=arg.end;
        const script=createElement('mrow',null,...parse(arg.value));
        if(previous&&isValidElement(previous)&&previous.type==='msup'&&ch==='_'){
          const parts=Children.toArray((previous.props as {children?:ReactNode}).children);
          nodes.push(createElement('msubsup',{key:'both'+i},parts[0],script,parts[1]));
        }else if(previous&&isValidElement(previous)&&previous.type==='msub'&&ch==='^'){
          const parts=Children.toArray((previous.props as {children?:ReactNode}).children);
          nodes.push(createElement('msubsup',{key:'both'+i},parts[0],parts[1],script));
        }else{
          nodes.push(ch==='^'?createElement('msup',{key:'sup'+i},previous??createElement('mi',null,''),script):createElement('msub',{key:'sub'+i},previous??createElement('mi',null,''),script));
        }
        continue;
      }
      if(ch==='{'){const a=groupAt(input,i);i=a.end;nodes.push(createElement('mrow',{key:'group'+i},...parse(a.value)));continue;}
      if(ch==='}') {nodes.push(createElement('mo',{key:'close'+i},'}'));i++;continue;}
      if(ch==='&'){nodes.push(createElement('mo',{key:'amp'+i},'&'));i++;continue;}
      if(/\s/.test(ch)){nodes.push(' ');i++;continue;}
      if(/[0-9]/.test(ch)){const token=input.slice(i).match(/^\d+(?:\.\d+)?/)?.[0]??ch;nodes.push(createElement('mn',{key:'num'+i},token));i+=token.length;continue;}
      if(/[A-Za-z]/.test(ch)){nodes.push(createElement('mi',{key:'id'+i},ch));i++;continue;}
      nodes.push(createElement('mo',{key:'op'+i},ch));i++;
    }
    return nodes;
  }
  const tree=createElement('math',{xmlns:'http://www.w3.org/1998/Math/MathML',display:display?'block':'inline'},createElement('mrow',null,...parse(source)));
  return createElement(display?'div':'span',{className:display?'markdown-math-display':'markdown-math-inline'},tree);
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
  const lang=language.toLowerCase();
  const supported=/^(javascript|js|typescript|ts|jsx|tsx|json|css|scss|html|xml|bash|sh|shell|python|py|sql|yaml|yml|diff|text|txt|markdown|md)$/i.test(lang);
  if(!supported)return [source];
  if(lang==='diff'){
    return source.split(/(\n)/).flatMap((line,index):ReactNode[]=>{
      if(line==='\n')return ['\n'];
      const kind=line.startsWith('+++')||line.startsWith('---')?'header':line.startsWith('+')?'added':line.startsWith('-')?'removed':line.startsWith('@@')?'hunk':'context';
      return [createElement('span',{key:'diff'+index,className:'syntax-diff-'+kind},line)];
    });
  }
  const keywords=/^(const|let|var|function|return|if|else|elif|for|while|class|new|import|from|export|default|async|await|true|false|null|undefined|def|print|pass|with|try|except|finally|raise|yield|lambda|None|True|False|select|where|insert|update|delete|create|table|as|and|or|not|join|left|right|inner|outer|group|by|order|limit|values|into|on|interface|type|extends|implements|public|private|static|void|fn|mut)$/i;
  const pattern=/(\/\*[\s\S]*?\*\/|\/\/[^\n]*|--[^\n]*|#[^\n]*|\x22(?:\\.|[^\x22\\])*\x22|'(?:\\.|[^'\\])*'|\x60(?:\\.|[^\x60\\])*\x60|\b(?:const|let|var|function|return|if|else|elif|for|while|class|new|import|from|export|default|async|await|true|false|null|undefined|def|print|pass|with|try|except|finally|raise|yield|lambda|None|True|False|select|where|insert|update|delete|create|table|as|and|or|not|join|left|right|inner|outer|group|by|order|limit|values|into|on|interface|type|extends|implements|public|private|static|void|fn|mut)\b|\b\d+(?:\.\d+)?\b|[{}()[\];,.]|[=+*/<>!-])/gi;
  const result:ReactNode[]=[];let last=0,index=0;
  for(const match of source.matchAll(pattern)){const at=match.index??0;if(at>last)result.push(source.slice(last,at));const token=match[0];let kind='operator';if(/^\/\*|^\/\/|^--|^#/.test(token))kind='comment';else if(/^[\x22'\x60]/.test(token))kind='string';else if(/^\d/.test(token))kind='number';else if(keywords.test(token))kind='keyword';result.push(createElement('span',{key:'t'+index++,className:'syntax-'+kind},token));last=at+token.length;}
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
