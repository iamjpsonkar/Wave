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
  const output: string[] = [],tick=String.fromCharCode(96);
  let fence: {character:string;length:number}|null=null, mathBlock=false;
  for (const line of source.split('\n')) {
    const marker=line.match(/^\s*(\x60{3,}|~{3,})/);
    if(fence){
      if(marker&&marker[1][0]===fence.character&&marker[1].length>=fence.length)fence=null;
      output.push(line);continue;
    }
    if(marker&&!mathBlock){fence={character:marker[1][0],length:marker[1].length};output.push(line);continue;}
    if(line.trim()==='$$'){
      mathBlock=!mathBlock;output.push(mathBlock?tick.repeat(3)+'math':tick.repeat(3));continue;
    }
    if(mathBlock){output.push(line);continue;}
    output.push(convertInlineExtensions(line).replace(/(?<!\\)\$([^$\n]+)(?<!\\)\$/g, (_match, expression: string) => tick+'math:' + expression.replace(/\x60/g, '') + tick));
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
    const withMedia=line.replace(/(\x60+)([\s\S]*?)\1|\[\[(audio|video):([^\]]+)\]\]/gi,(match,ticks,_code,kind,path)=>{if(ticks)return match;const clean=String(path).trim();const label=clean.split('/').pop()||String(kind).toUpperCase();return '['+String(kind).toUpperCase()+': '+label+'](https://wave.invalid/media/'+String(kind).toLowerCase()+'/'+encodeURIComponent(clean)+')';});
    return withMedia.replace(/(\x60+)([\s\S]*?)\1|\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (match, ticks, _code, target, alias) => {
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
  const MAX_SOURCE_LENGTH=8192,MAX_NESTING=48,MAX_PARSE_STEPS=2048;
  let parseSteps=0,limitReason='';
  function fallback(reason:string) {
    const preview=source.length>512?source.slice(0,512)+'…':source;
    return createElement('div',{className:'markdown-math-fallback',role:'note'},
      createElement('p',null,'Math not rendered: '+reason+'.'),
      createElement('code',null,preview));
  }
  if(source.length>MAX_SOURCE_LENGTH)return fallback('expression exceeds the 8192-character limit');
  let braceDepth=0;
  for(let index=0;index<source.length;index++){
    if(source[index]===slash){index++;continue;}
    if(source[index]==='{')braceDepth++;
    else if(source[index]==='}'&&--braceDepth<0)return fallback('unbalanced grouping braces');
  }
  if(braceDepth!==0)return fallback('unbalanced grouping braces');
  function parse(input:string,depth=0):ReactNode[]{
    if(depth>MAX_NESTING){limitReason='nesting exceeds the 48-level limit';return [];}
    const nodes:ReactNode[]=[];let i=0;
    while(i<input.length){
      if(++parseSteps>MAX_PARSE_STEPS){limitReason='parser work exceeds the 2048-step limit';break;}
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
            return createElement('mtr',{key:'row'+rowIndex},...cells.map((cell,colIndex)=>createElement('mtd',{key:'cell'+rowIndex+'-'+colIndex},createElement('mrow',null,...parse(cell,depth+1)))));
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
          const frac=createElement('mfrac',{key:'frac'+i,linethickness:command==='binom'?'0':'1'},createElement('mrow',null,...parse(a.value,depth+1)),createElement('mrow',null,...parse(b.value,depth+1)));
          nodes.push(command==='binom'?createElement('mfenced',{key:'binom'+i,open:'(',close:')'},frac):frac);continue;
        }
        if(command==='sqrt'){
          let index:string|undefined;
          if(input[i]==='['){const close=input.indexOf(']',i);if(close>=0){index=input.slice(i+1,close);i=close+1;}}
          const radicand=groupAt(input,i);i=radicand.end;
          nodes.push(index?createElement('mroot',{key:'root'+i},createElement('mrow',null,...parse(radicand.value,depth+1)),createElement('mrow',null,...parse(index,depth+1))):createElement('msqrt',{key:'root'+i},...parse(radicand.value,depth+1)));continue;
        }
        if(['overline','bar','underline','hat','widehat','tilde','widetilde','vec','dot','ddot','overrightarrow','overleftarrow'].includes(command)){
          const a=groupAt(input,i);i=a.end;
          const accent:Record<string,string>={overline:'¯',bar:'¯',underline:'_',hat:'^',widehat:'^',tilde:'~',widetilde:'~',vec:'→',dot:'˙',ddot:'¨',overrightarrow:'→',overleftarrow:'←'};
          const over=command!=='underline';
          nodes.push(over?createElement('mover',{key:'accent'+i},createElement('mrow',null,...parse(a.value,depth+1)),createElement('mo',null,accent[command])):createElement('munder',{key:'accent'+i},createElement('mrow',null,...parse(a.value,depth+1)),createElement('mo',null,accent[command])));continue;
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
        const script=createElement('mrow',null,...parse(arg.value,depth+1));
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
      if(ch==='{'){const a=groupAt(input,i);i=a.end;nodes.push(createElement('mrow',{key:'group'+i},...parse(a.value,depth+1)));continue;}
      if(ch==='}') {nodes.push(createElement('mo',{key:'close'+i},'}'));i++;continue;}
      if(ch==='&'){nodes.push(createElement('mo',{key:'amp'+i},'&'));i++;continue;}
      if(/\s/.test(ch)){nodes.push(' ');i++;continue;}
      if(/[0-9]/.test(ch)){const token=input.slice(i).match(/^\d+(?:\.\d+)?/)?.[0]??ch;nodes.push(createElement('mn',{key:'num'+i},token));i+=token.length;continue;}
      if(/[A-Za-z]/.test(ch)){nodes.push(createElement('mi',{key:'id'+i},ch));i++;continue;}
      nodes.push(createElement('mo',{key:'op'+i},ch));i++;
    }
    return nodes;
  }
  const parsed=parse(source);
  if(limitReason)return fallback(limitReason);
  const tree=createElement('math',{xmlns:'http://www.w3.org/1998/Math/MathML',display:display?'block':'inline'},createElement('mrow',null,...parsed));
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
  return <div className="mermaid-diagram mermaid-pie"><svg role="img" aria-label={linesTitle(source)||'Mermaid pie chart'} viewBox="0 0 200 200" width="220">{slices.map((slice,index)=><path key={index} d={slice.path} fill={slice.color} stroke="white" strokeWidth="1"/>)}</svg><ul>{slices.map((slice,index)=><li key={index}><i style={{background:slice.color}}/>{slice.label}: {slice.value}</li>)}</ul><DiagramSource source={source}/></div>;
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
  return <div className="mermaid-diagram"><svg role="img" aria-label={linesTitle(source)||'Mermaid sequence diagram'} viewBox={`0 0 ${width} ${height}`} width="100%"><defs><marker id="wave-seq-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0 0 L0 6 L7 3 z" fill="currentColor"/></marker></defs>{nodes}</svg><DiagramSource source={source}/></div>;
}

function MermaidFlowchart({ source }: { source: string }) {
  type NodeInfo={id:string;label:string;shape:string};
  type EdgeInfo={from:string;to:string;label:string;kind:string};
  const lines=source.split('\n').map(line=>line.trim()).filter(line=>line&&!line.startsWith('%%'));
  const direction=lines.find(line=>/^flowchart\s+/i.test(line))?.match(/^flowchart\s+(TD|TB|LR|RL|BT)/i)?.[1]?.toUpperCase()??'TD';
  const nodes=new Map<string,NodeInfo>(),edges:EdgeInfo[]=[];
  function readNode(token:string):NodeInfo|null{
    const match=token.trim().match(/^([\w.-]+)([\s\S]*)$/);if(!match)return null;
    const id=match[1],tail=match[2].trim();let label=id,shape='rect';
    const shapes:[RegExp,string][]=[
      [/^\(\(([\s\S]*?)\)\)/,'circle'],[/^\(\[([\s\S]*?)\]\)/,'stadium'],[/^\[\[([\s\S]*?)\]\]/,'subroutine'],
      [/^\[\(([\s\S]*?)\)\]/,'cylinder'],[/^\{([\s\S]*?)\}/,'diamond'],[/^\(([\s\S]*?)\)/,'round'],[/^\[([\s\S]*?)\]/,'rect']
    ];
    for(const [pattern,kind] of shapes){const found=tail.match(pattern);if(found){label=found[1];shape=kind;break;}}
    const info={id,label,shape};nodes.set(id,info);return info;
  }
  for(const line of lines){
    if(/^flowchart\s+/i.test(line)||/^subgraph\b/i.test(line)||/^end$/i.test(line)||/^(classDef|class|style|linkStyle|click)\b/i.test(line))continue;
    const match=line.match(/^(.+?)\s*(-->|---|-.->|==>|--o|--x|o--|x--)\s*(?:\|([^|]*)\|\s*)?(.+)$/);
    if(match){
      const left=readNode(match[1]),right=readNode(match[4]);if(!left||!right)continue;
      edges.push({from:left.id,to:right.id,label:match[3]??'',kind:match[2]});continue;
    }
    const isolated=readNode(line);if(isolated&&/[\[{(]/.test(line))continue;
  }
  if(!edges.length||nodes.size>80||source.length>30000)return <MermaidFallback source={source}/>;
  const ids=Array.from(nodes.keys()),horizontal=direction==='LR'||direction==='RL',ordered=direction==='BT'||direction==='RL'?[...ids].reverse():ids;
  const width=horizontal?Math.max(260,ordered.length*190):560,height=horizontal?Math.max(160,Math.ceil(ordered.length/3)*120):Math.max(150,ordered.length*105);
  const position=(id:string)=>{const index=ordered.indexOf(id);return horizontal?{x:25+index*180,y:40}:{x:215,y:20+index*100};};
  const svgNodes:ReactNode[]=[];
  edges.forEach((edge,index)=>{const a=position(edge.from),b=position(edge.to),x1=a.x+65,y1=a.y+28,x2=b.x+65,y2=b.y+28;
    svgNodes.push(createElement('line',{key:'edge'+index,x1,y1,x2,y2,stroke:'currentColor',strokeWidth:edge.kind==='==>'?3:1.5,strokeDasharray:edge.kind==='-.->'?'5 4':undefined,markerEnd:'url(#wave-mermaid-arrow)'}));
    if(edge.label)svgNodes.push(createElement('text',{key:'edge-label'+index,x:(x1+x2)/2,y:(y1+y2)/2-7,textAnchor:'middle',fontSize:10,fill:'currentColor'},edge.label));
  });
  ordered.forEach(id=>{const info=nodes.get(id)!,p=position(id),x=p.x,y=p.y;
    if(info.shape==='diamond')svgNodes.push(createElement('polygon',{key:id,points:String(x+65)+','+y+' '+(x+130)+','+(y+28)+' '+(x+65)+','+(y+56)+' '+x+','+(y+28),fill:'var(--markdown-diagram-node,#f0f3ed)',stroke:'currentColor'}));
    else if(info.shape==='circle')svgNodes.push(createElement('ellipse',{key:id,cx:x+65,cy:y+28,rx:65,ry:28,fill:'var(--markdown-diagram-node,#f0f3ed)',stroke:'currentColor'}));
    else svgNodes.push(createElement('rect',{key:id,x,y,width:130,height:56,rx:info.shape==='round'||info.shape==='stadium'?24:info.shape==='cylinder'?12:info.shape==='subroutine'?2:6,fill:'var(--markdown-diagram-node,#f0f3ed)',stroke:'currentColor'}));
    svgNodes.push(createElement('text',{key:'label'+id,x:x+65,y:y+33,textAnchor:'middle',fontSize:11,fill:'currentColor'},info.label));
  });
  return <div className="mermaid-diagram"><svg role="img" aria-label={linesTitle(source)||'Mermaid flowchart'} viewBox={'0 0 '+width+' '+height} width="100%"><defs><marker id="wave-mermaid-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L0 6 L7 3 z" fill="currentColor"/></marker></defs>{svgNodes}</svg><DiagramSource source={source}/></div>;
}

function MermaidMindmap({source}:{source:string}) {
  const lines=source.split('\n').slice(1).filter(line=>line.trim());
  const items=lines.map((line,index)=>{const indent=line.match(/^\s*/)?.[0].length??0;const raw=line.trim();const root=raw.match(/^root\s*\(\((.+)\)\)$/i);return {label:root?.[1]??raw.replace(/^[([]|[)\]]$/g,''),depth:root?0:Math.max(0,Math.floor(indent/2)),index};});
  if(!items.length||items.length>80)return <MermaidFallback source={source}/>;
  const width=Math.max(320,(Math.max(...items.map(x=>x.depth))+1)*170),height=items.length*62+30,nodes:ReactNode[]=[];
  const lastAtDepth=new Map<number,{x:number;y:number}>();
  items.forEach(item=>{const x=25+item.depth*165,y=25+item.index*62;const parent=lastAtDepth.get(item.depth-1);if(parent)nodes.push(createElement('line',{key:'mind-edge'+item.index,x1:parent.x+55,y1:parent.y+20,x2:x,y2:y+20,stroke:'currentColor'}));nodes.push(createElement('rect',{key:'mind'+item.index,x,y,width:120,height:40,rx:18,fill:'var(--markdown-diagram-node,#f0f3ed)',stroke:'currentColor'}),createElement('text',{key:'mindtext'+item.index,x:x+60,y:y+25,textAnchor:'middle',fontSize:10,fill:'currentColor'},item.label));lastAtDepth.set(item.depth,{x,y});});
  return <div className="mermaid-diagram"><svg role="img" aria-label={linesTitle(source)||'Mermaid mindmap'} viewBox={'0 0 '+width+' '+height} width="100%">{nodes}</svg><DiagramSource source={source}/></div>;
}
function MermaidTimeline({source}:{source:string}) {
  const lines=source.split('\n').map(line=>line.trim()).filter(Boolean);
  const events=lines.map(line=>line.match(/^([\w.-]+)\s*:\s*(.+)$/)).filter(Boolean) as RegExpMatchArray[];
  if(!events.length||events.length>80)return <MermaidFallback source={source}/>;
  const width=Math.max(320,events.length*150),height=170,nodes:ReactNode[]=[];
  nodes.push(createElement('line',{key:'timeline',x1:35,y1:85,x2:width-25,y2:85,stroke:'currentColor',strokeWidth:2}));
  events.forEach((event,index)=>{const x=60+index*140;nodes.push(createElement('circle',{key:'event'+index,cx:x,cy:85,r:7,fill:'var(--markdown-diagram-node,#8c9f77)',stroke:'currentColor'}),createElement('text',{key:'date'+index,x,y:65,textAnchor:'middle',fontSize:11,fill:'currentColor'},event[1]),createElement('text',{key:'eventtext'+index,x,y:112,textAnchor:'middle',fontSize:10,fill:'currentColor'},event[2]));});
  return <div className="mermaid-diagram"><svg role="img" aria-label={linesTitle(source)||'Mermaid timeline'} viewBox={'0 0 '+width+' '+height} width="100%">{nodes}</svg><DiagramSource source={source}/></div>;
}
function MermaidQuadrant({source}:{source:string}) {
  const lines=source.split('\n').map(line=>line.trim()).filter(Boolean);
  const points=lines.map(line=>line.match(/^(.+?)\s*:\s*\[\s*([0-9.]+)\s*,\s*([0-9.]+)\s*\]$/)).filter(Boolean) as RegExpMatchArray[];
  if(!points.length||points.length>100)return <MermaidFallback source={source}/>;
  const labels=lines.filter(line=>/^(?:quadrant-[1-4]|x-axis|y-axis)\s+/i.test(line));
  const width=560,height=360,nodes:ReactNode[]=[createElement('line',{key:'qx',x1:45,y1:180,x2:520,y2:180,stroke:'currentColor'}),createElement('line',{key:'qy',x1:282,y1:25,x2:282,y2:330,stroke:'currentColor'})];
  labels.forEach((line,index)=>{const [key,...rest]=line.split(/\s+/);const text=rest.join(' ');const pos:Record<string,[number,number]>={'quadrant-1':[400,50],'quadrant-2':[100,50],'quadrant-3':[100,310],'quadrant-4':[400,310],'x-axis':[282,350],'y-axis':[15,180]};const [x,y]=pos[key]??[0,0];nodes.push(createElement('text',{key:'qlabel'+index,x,y,fontSize:10,textAnchor:'middle',fill:'currentColor'},text));});
  points.forEach((point,index)=>{const x=55+Number(point[2])*455,y=325-Number(point[3])*285;nodes.push(createElement('circle',{key:'qpoint'+index,cx:x,cy:y,r:5,fill:'var(--markdown-diagram-node,#8c9f77)',stroke:'currentColor'}),createElement('text',{key:'qtext'+index,x:x+8,y:y-7,fontSize:10,fill:'currentColor'},point[1]));});
  return <div className="mermaid-diagram"><svg role="img" aria-label={linesTitle(source)||'Mermaid quadrant chart'} viewBox={'0 0 '+width+' '+height} width="100%">{nodes}</svg><DiagramSource source={source}/></div>;
}
function MermaidRequirement({source}:{source:string}) {
  const entities:Array<{id:string;label:string;kind:string}>=[];
  for(const match of source.matchAll(/(requirement|functionalRequirement|interfaceRequirement|performanceRequirement|designConstraint|element)\s+([\w-]+)\s*\{([\s\S]*?)\}/g)){
    const text=match[3].match(/text:\s*(.+)/)?.[1]?.trim()??match[2];entities.push({id:match[2],label:text,kind:match[1]});
  }
  const relations=Array.from(source.matchAll(/([\w-]+)\s*-\s*(satisfies|verifies|traces|contains|refines|copies)\s*->\s*([\w-]+)/g));
  if(!entities.length||entities.length>60)return <MermaidFallback source={source}/>;
  const width=Math.max(320,entities.length*180),height=180,nodes:ReactNode[]=[];
  entities.forEach((entity,index)=>{const x=15+index*180;nodes.push(createElement('rect',{key:'req'+entity.id,x,y:45,width:155,height:65,rx:4,fill:'var(--markdown-diagram-node,#f0f3ed)',stroke:'currentColor'}),createElement('text',{key:'reqtitle'+entity.id,x:x+77,y:68,textAnchor:'middle',fontSize:10,fontWeight:'bold',fill:'currentColor'},entity.id),createElement('text',{key:'reqtext'+entity.id,x:x+77,y:88,textAnchor:'middle',fontSize:9,fill:'currentColor'},entity.label.slice(0,28)));});
  relations.forEach((relation,index)=>{const a=entities.findIndex(e=>e.id===relation[1]),b=entities.findIndex(e=>e.id===relation[3]);if(a>=0&&b>=0)nodes.push(createElement('line',{key:'reqedge'+index,x1:92+a*180,y1:110,x2:92+b*180,y2:110,stroke:'currentColor'}));});
  return <div className="mermaid-diagram"><svg role="img" aria-label={linesTitle(source)||'Mermaid requirement diagram'} viewBox={'0 0 '+width+' '+height} width="100%">{nodes}</svg><DiagramSource source={source}/></div>;
}
function MermaidArchitecture({source}:{source:string}) {
  const nodes:Array<{id:string;label:string;kind:string}>=[];
  for(const line of source.split('\n')){
    const service=line.trim().match(/^(service|group|junction)\s+([\w-]+)(?:\([^)]*\))?\s*(?:\[[^\]]*\])?/);
    if(service){const label=line.match(/\[([^\]]+)\]/)?.[1]??service[2];nodes.push({id:service[2],label,kind:service[1]});}
  }
  const relations=Array.from(source.matchAll(/([\w-]+):[LRTB]\s*--\s*[LRTB]:([\w-]+)/g));
  if(!nodes.length||nodes.length>60)return <MermaidFallback source={source}/>;
  const width=Math.max(320,nodes.length*170),height=160,svg:ReactNode[]=[];
  relations.forEach((r,index)=>{const a=nodes.findIndex(n=>n.id===r[1]),b=nodes.findIndex(n=>n.id===r[2]);if(a>=0&&b>=0)svg.push(createElement('line',{key:'arch-edge'+index,x1:80+a*165,y1:80,x2:80+b*165,y2:80,stroke:'currentColor'}));});
  nodes.forEach((node,index)=>{const x=80+index*165;svg.push(createElement('rect',{key:'arch'+node.id,x:x-60,y:50,width:120,height:60,rx:node.kind==='group'?10:4,fill:'var(--markdown-diagram-node,#f0f3ed)',stroke:'currentColor',strokeDasharray:node.kind==='group'?'5 3':undefined}),createElement('text',{key:'archtext'+node.id,x,y:84,textAnchor:'middle',fontSize:11,fill:'currentColor'},node.label));});
  return <div className="mermaid-diagram"><svg role="img" aria-label={linesTitle(source)||'Mermaid architecture diagram'} viewBox={'0 0 '+width+' '+height} width="100%">{svg}</svg><DiagramSource source={source}/></div>;
}
function DiagramSource({source}:{source:string}) {
  return <details className="diagram-source"><summary>View diagram source</summary><pre>{source}</pre></details>;
}
function MermaidClass({source}:{source:string}) {
  const lines=source.split('\n').map(line=>line.trim()).filter(line=>line&&!line.startsWith('%%'));
  const classes=new Map<string,string[]>();
  for(const block of source.matchAll(/class\s+([\w.]+)\s*\{([\s\S]*?)\}/g))classes.set(block[1],block[2].split('\n').map(x=>x.trim()).filter(Boolean));
  for(const line of lines){
    const declaration=line.match(/^class\s+([\w.]+)\s*$/);
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
  return <div className="mermaid-diagram"><svg role="img" aria-label={linesTitle(source)||'Mermaid class diagram'} viewBox={'0 0 '+width+' '+height} width="100%"><defs><marker id="wave-class-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L0 6 L7 3 z" fill="currentColor"/></marker></defs>{nodes}</svg><DiagramSource source={source}/></div>;
}
function MermaidEr({source}:{source:string}) {
  const lines=source.split('\n').map(line=>line.trim()).filter(line=>line&&!line.startsWith('%%'));
  const relations=lines.map(line=>line.match(/^([\w-]+)\s+([|o}{]+--[|o}{]+)\s+([\w-]+)\s*:\s*(.+)$/)).filter(Boolean) as RegExpMatchArray[];
  const attributes=new Map<string,string[]>();
  for(const block of source.matchAll(/([\w-]+)\s*\{([\s\S]*?)\}/g))attributes.set(block[1],block[2].split('\n').map(x=>x.trim()).filter(Boolean));
  const entities=Array.from(new Set([...relations.flatMap(r=>[r[1],r[3]]),...attributes.keys()]));
  if(!entities.length||entities.length>40||!relations.length)return <MermaidFallback source={source}/>;
  const width=Math.max(320,entities.length*190),height=170;
  const nodes:ReactNode[]=[];
  entities.forEach((name,index)=>{const x=20+index*190,fields=attributes.get(name)??[];nodes.push(createElement('rect',{key:'er'+name,x,y:45,width:150,height:65+fields.length*17,rx:4,fill:'var(--markdown-diagram-node,#f0f3ed)',stroke:'currentColor'}),createElement('text',{key:'ert'+name,x:x+75,y:67,textAnchor:'middle',fontWeight:'bold',fontSize:12,fill:'currentColor'},name));fields.forEach((field,n)=>nodes.push(createElement('text',{key:'erfield'+name+n,x:x+7,y:87+n*16,fontSize:9,fill:'currentColor'},field)));});
  relations.forEach((r,index)=>{const a=entities.indexOf(r[1]),b=entities.indexOf(r[3]);if(a<0||b<0)return;const x1=95+a*190,x2=95+b*190;nodes.push(createElement('line',{key:'erline'+index,x1,y1:110,x2,y2:110,stroke:'currentColor'}),createElement('text',{key:'erlabel'+index,x:(x1+x2)/2,y:100,textAnchor:'middle',fontSize:10,fill:'currentColor'},r[4]));});
  return <div className="mermaid-diagram"><svg role="img" aria-label={linesTitle(source)||'Mermaid entity relationship diagram'} viewBox={'0 0 '+width+' '+height} width="100%">{nodes}</svg><DiagramSource source={source}/></div>;
}
function MermaidState({source}:{source:string}) {
  const lines=source.split('\n').map(line=>line.trim()).filter(line=>line&&!line.startsWith('%%'));
  const transitions=lines.map(line=>line.match(/^(.+?)\s*(-->|\-\->)\s*(.+?)(?:\s*:\s*(.+))?$/)).filter(Boolean) as RegExpMatchArray[];
  const names=Array.from(new Set(transitions.flatMap(r=>[r[1].trim(),r[3].trim()])));
  if(!transitions.length||names.length>50||source.length>20000)return <MermaidFallback source={source}/>;
  const width=Math.max(320,names.length*155),height=150,nodes:ReactNode[]=[];
  names.forEach((name,index)=>{const x=65+index*150;if(name==='[*]')nodes.push(createElement('circle',{key:'state'+index,cx:x,cy:70,r:9,fill:'currentColor'}));else nodes.push(createElement('rect',{key:'state'+index,x:x-55,y:48,width:110,height:44,rx:16,fill:'var(--markdown-diagram-node,#f0f3ed)',stroke:'currentColor'}),createElement('text',{key:'statet'+index,x,y:75,textAnchor:'middle',fontSize:11,fill:'currentColor'},name));});
  transitions.forEach((r,index)=>{const a=names.indexOf(r[1].trim()),b=names.indexOf(r[3].trim());if(a<0||b<0)return;const x1=65+a*150,x2=65+b*150;nodes.push(createElement('line',{key:'stateedge'+index,x1,y1:70,x2,y2:70,stroke:'currentColor',markerEnd:'url(#wave-state-arrow)'}));if(r[4])nodes.push(createElement('text',{key:'statelabel'+index,x:(x1+x2)/2,y:55,textAnchor:'middle',fontSize:10,fill:'currentColor'},r[4]));});
  return <div className="mermaid-diagram"><svg role="img" aria-label={linesTitle(source)||'Mermaid state diagram'} viewBox={'0 0 '+width+' '+height} width="100%"><defs><marker id="wave-state-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L0 6 L7 3 z" fill="currentColor"/></marker></defs>{nodes}</svg><DiagramSource source={source}/></div>;
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
  return <div className="mermaid-diagram"><svg role="img" aria-label={linesTitle(source)||'Mermaid Gantt chart'} viewBox={'0 0 '+width+' '+height} width="100%">{tasks.map((task,index)=>createElement('g',{key:'task'+index},createElement('text',{x:5,y:40+index*34,fontSize:11,fill:'currentColor'},task.name),createElement('rect',{x:155+task.start*scale,y:24+index*34,width:Math.max(4,task.duration*scale),height:20,rx:4,fill:'var(--markdown-diagram-node,#8c9f77)',stroke:'currentColor'})))}</svg><DiagramSource source={source}/></div>;
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
  return <div className="mermaid-diagram"><svg role="img" aria-label={linesTitle(source)||'Mermaid git graph'} viewBox={'0 0 '+width+' '+height} width="100%">{nodes}</svg><DiagramSource source={source}/></div>;
}
function DotDiagram({source}:{source:string}) {
  const clean=source.replace(/^\s*(?:strict\s+)?(?:di)?graph\b[^{]*\{/i,'').replace(/\}\s*$/,'');
  const labels=new Map<string,string>(),edges:Array<[string,string,string]>=[];
  for(const m of clean.matchAll(/([\w.-]+)\s*\[\s*label\s*=\s*["']([^"']+)["'][^\]]*\]/g))labels.set(m[1],m[2]);
  for(const m of clean.matchAll(/([\w.-]+)\s*(->|--)\s*([\w.-]+)/g)){edges.push([m[1],m[3],m[2]]);if(!labels.has(m[1]))labels.set(m[1],m[1]);if(!labels.has(m[3]))labels.set(m[3],m[3]);}
  const names=Array.from(labels.keys());if(!edges.length||names.length>80||source.length>25000)return <MermaidFallback source={source}/>;
  const width=Math.max(320,names.length*165),height=145,nodes:ReactNode[]=[];
  edges.forEach((edge,index)=>{const a=names.indexOf(edge[0]),b=names.indexOf(edge[1]);nodes.push(createElement('line',{key:'dotedge'+index,x1:80+a*160,y1:65,x2:80+b*160,y2:65,stroke:'currentColor',markerEnd:edge[2]==='->'?'url(#wave-dot-arrow)':undefined}));});
  names.forEach((name,index)=>{const x=80+index*160;nodes.push(createElement('rect',{key:'dotnode'+name,x:x-60,y:40,width:120,height:50,rx:5,fill:'var(--markdown-diagram-node,#f0f3ed)',stroke:'currentColor'}),createElement('text',{key:'dottext'+name,x,y:70,textAnchor:'middle',fontSize:11,fill:'currentColor'},labels.get(name)));});
  return <div className="mermaid-diagram"><svg role="img" aria-label="Graphviz DOT diagram" viewBox={'0 0 '+width+' '+height} width="100%"><defs><marker id="wave-dot-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L0 6 L7 3 z" fill="currentColor"/></marker></defs>{nodes}</svg><DiagramSource source={source}/></div>;
}
function PlantUmlDiagram({source}:{source:string}) {
  const lines=source.split('\n').map(line=>line.trim()).filter(line=>line&&!/^@(?:start|end)uml\b/i.test(line)&&!/^title\s+/i.test(line));
  const sequence=lines.filter(line=>/^[\w.-]+\s*(?:-->|->|<-|<--|->>|-->>)\s*[\w.-]+\s*:/.test(line));
  if(sequence.length){
    const converted=['sequenceDiagram',...sequence.map(line=>line.replace(/^([\w.-]+)\s*(?:-->|->|<-|<--|->>|-->>)\s*([\w.-]+)\s*:\s*(.+)$/,'$1->>$2: $3'))].join('\n');
    return <MermaidSequence source={converted}/>;
  }
  const classes=lines.filter(line=>/^class\s+[\w.-]+/.test(line)||/^[\w.-]+\s+(?:<\|--|\*--|o--|--|\.\.>)\s+[\w.-]+/.test(line));
  if(classes.length)return <MermaidClass source={['classDiagram',...classes].join('\n')}/>;
  const activities=lines.filter(line=>/^:.*;$/.test(line));
  if(activities.length){const labels=activities.map(line=>line.replace(/^:\s*/,'').replace(/;$/,''));const converted=['flowchart TD',...labels.map((label,index)=>'A'+index+'['+label.replace(/[\[\]]/g,'')+']'),...labels.slice(1).map((_label,index)=>'A'+index+' --> A'+(index+1))].join('\n');return <MermaidFlowchart source={converted}/>;}
  return <MermaidFallback source={source}/>;
}
function D2Diagram({source}:{source:string}) {
  const lines=source.split('\n').map(line=>line.trim()).filter(line=>line&&!line.startsWith('#'));
  const nodes=new Map<string,string>(),edges:Array<[string,string,string]>=[];
  for(const line of lines){
    const edge=line.match(/^([\w.-]+)(?:\s*:\s*([^>-]+?))?\s*->\s*([\w.-]+)(?:\s*:\s*(.+))?$/);
    if(edge){nodes.set(edge[1],edge[2]?.trim()||edge[1]);nodes.set(edge[3],edge[4]?.trim()||edge[3]);edges.push([edge[1],edge[3],edge[4]??'']);continue;}
    const node=line.match(/^([\w.-]+)\s*:\s*(.+)$/);if(node)nodes.set(node[1],node[2]);
  }
  if(!edges.length||nodes.size>80||source.length>20000)return <MermaidFallback source={source}/>;
  const converted=['flowchart TD',...Array.from(nodes,([id,label])=>id+'['+label.replace(/[\[\]]/g,'')+']'),...edges.map(([a,b,label])=>a+' -->'+(label?'|'+label+'|':'')+' '+b)].join('\n');
  return <MermaidFlowchart source={converted}/>;
}
function VegaDiagram({source}:{source:string}) {
  let spec:any;try{spec=JSON.parse(source);}catch{return <MermaidFallback source={source}/>;}
  const mark=typeof spec.mark==='string'?spec.mark:spec.mark?.type;
  const values=Array.isArray(spec.data?.values)?spec.data.values:Array.isArray(spec.datasets?.[spec.data?.name])?spec.datasets[spec.data.name]:null;
  const xField=spec.encoding?.x?.field,yField=spec.encoding?.y?.field;
  if(!values||!xField||!yField||!['bar','line','point','circle','area'].includes(mark)||values.length<1||values.length>100||source.length>30000||spec.data?.url)return <MermaidFallback source={source}/>;
  const rows=values.map((row:any)=>({label:String(row[xField]??''),value:Number(row[yField])})).filter((row:any)=>Number.isFinite(row.value));
  if(!rows.length)return <MermaidFallback source={source}/>;
  const max=Math.max(...rows.map((r:any)=>r.value),0),min=Math.min(...rows.map((r:any)=>r.value),0),range=max-min||1,width=640,height=300,plotTop=20,plotBottom=235,slot=560/rows.length;
  const y=(value:number)=>plotBottom-(value-min)/range*(plotBottom-plotTop);
  const shapes:ReactNode[]=[];
  if(mark==='bar')rows.forEach((row:any,index:number)=>{const barWidth=Math.max(4,slot*.65),x=45+index*slot;shapes.push(createElement('rect',{key:'bar'+index,x,y:y(row.value),width:barWidth,height:Math.max(1,plotBottom-y(row.value)),fill:'var(--markdown-diagram-node,#8c9f77)',stroke:'currentColor'}));});
  else{
    const points=rows.map((row:any,index:number)=>(45+index*slot+slot/2)+','+y(row.value)).join(' ');
    if(mark==='line'||mark==='area')shapes.push(createElement('polyline',{key:'series',points,fill:mark==='area'?'rgba(140,159,119,.2)':'none',stroke:'currentColor',strokeWidth:2}));
    rows.forEach((row:any,index:number)=>shapes.push(createElement('circle',{key:'point'+index,cx:45+index*slot+slot/2,cy:y(row.value),r:4,fill:'var(--markdown-diagram-node,#8c9f77)',stroke:'currentColor'})));
  }
  rows.forEach((row:any,index:number)=>shapes.push(createElement('text',{key:'x'+index,x:45+index*slot+slot/2,y:255,textAnchor:'middle',fontSize:10,fill:'currentColor'},row.label),createElement('text',{key:'y'+index,x:30,y:y(row.value)+4,textAnchor:'end',fontSize:9,fill:'currentColor'},String(row.value))));
  return <div className="mermaid-diagram"><svg role="img" aria-label={spec.title||'Vega chart'} viewBox={'0 0 '+width+' '+height} width="100%"><line x1="40" y1={plotTop} x2="40" y2={plotBottom} stroke="currentColor"/><line x1="40" y1={plotBottom} x2="620" y2={plotBottom} stroke="currentColor"/>{shapes}</svg><DiagramSource source={source}/></div>;
}
function AsciiDocInline({text}:{text:string}) {
  const tick=String.fromCharCode(96),pattern=new RegExp('(\\*[^*\\n]+\\*|_[^_\\n]+_|'+tick+'[^'+tick+'\\n]+'+tick+'|link:[^\\[]+\\[[^\\]]*\\])','g');
  const nodes:ReactNode[]=[];let last=0,index=0;
  for(const match of text.matchAll(pattern)){const at=match.index??0;if(at>last)nodes.push(text.slice(last,at));const token=match[0];
    if(token.startsWith('*'))nodes.push(createElement('strong',{key:index++},token.slice(1,-1)));
    else if(token.startsWith('_'))nodes.push(createElement('em',{key:index++},token.slice(1,-1)));
    else if(token.startsWith(tick))nodes.push(createElement('code',{key:index++},token.slice(1,-1)));
    else{const link=token.match(/^link:([^\[]+)\[([^\]]*)\]$/);if(link&&/^https?:\/\//i.test(link[1]))nodes.push(createElement('a',{key:index++,href:link[1],target:'_blank',rel:'noreferrer'},link[2]||link[1]));else nodes.push(token);}
    last=at+token.length;
  }
  if(last<text.length)nodes.push(text.slice(last));return createElement('span',null,...nodes);
}
function AsciiDocBlock({source}:{source:string}) {
  const lines=source.split('\n'),nodes:ReactNode[]=[];let paragraph:string[]=[],listItems:string[]=[],listType='ul',code:string[]|null=null,table:string[]|null=null;
  const flushParagraph=()=>{if(paragraph.length){nodes.push(createElement('p',{key:'p'+nodes.length},createElement(AsciiDocInline,{text:paragraph.join(' ')})));paragraph=[];}};
  const flushList=()=>{if(listItems.length){nodes.push(createElement(listType,{key:'list'+nodes.length},...listItems.map((item,index)=>createElement('li',{key:index},createElement(AsciiDocInline,{text:item})))));listItems=[];}};
  for(const line of lines){
    if(line.trim()==='----'){flushParagraph();flushList();if(code){nodes.push(createElement('pre',{key:'code'+nodes.length},createElement('code',null,code.join('\n'))));code=null;}else code=[];continue;}
    if(line.trim()==='|==='){flushParagraph();flushList();if(table){nodes.push(createElement('table',{key:'table'+nodes.length},createElement('tbody',null,...table.map((row,index)=>createElement('tr',{key:index},...row.split('|').filter(Boolean).map((cell,i)=>createElement('td',{key:i},cell.trim())))))));table=null;}else table=[];continue;}
    if(code){code.push(line);continue;}if(table){table.push(line);continue;}
    const heading=line.match(/^(={1,5})\s+(.+)$/);if(heading){flushParagraph();flushList();nodes.push(createElement('h'+heading[1].length,{key:'h'+nodes.length},createElement(AsciiDocInline,{text:heading[2]})));continue;}
    const bullet=line.match(/^(\*+|-)\s+(.+)$/),ordered=line.match(/^\.+\s+(.+)$/);
    if(bullet||ordered){flushParagraph();const type=ordered?'ol':'ul';if(listItems.length&&type!==listType)flushList();listType=type;listItems.push((bullet?.[2]??ordered?.[1]??'').trim());continue;}
    if(!line.trim()){flushParagraph();flushList();continue;}
    if(/^:[\w-]+:/.test(line)||/^\[source,/.test(line))continue;
    paragraph.push(line.trim());
  }
  flushParagraph();flushList();if(code)nodes.push(createElement('pre',{key:'code'+nodes.length},code.join('\n')));
  if(table)nodes.push(createElement('table',{key:'table'+nodes.length},table.join('\n')));
  return <div className="asciidoc-preview">{nodes}</div>;
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
    if(/^\s*mindmap\b/i.test(source))return <MermaidMindmap source={source}/>;
    if(/^\s*timeline\b/i.test(source))return <MermaidTimeline source={source}/>;
    if(/^\s*quadrantChart\b/i.test(source))return <MermaidQuadrant source={source}/>;
    if(/^\s*requirementDiagram\b/i.test(source))return <MermaidRequirement source={source}/>;
    if(/^\s*architecture-beta\b/i.test(source))return <MermaidArchitecture source={source}/>;
    if(/^\s*flowchart\b/i.test(source))return <MermaidFlowchart source={source}/>;
    return <MermaidFallback source={source}/>;
  }
  if(className?.includes('language-dot')||className?.includes('language-graphviz'))return <DotDiagram source={source}/>;
  if(className?.includes('language-plantuml'))return <PlantUmlDiagram source={source}/>;
  if(className?.includes('language-d2'))return <D2Diagram source={source}/>;
  if(className?.includes('language-vega'))return <VegaDiagram source={source}/>;
  if(className?.includes('language-asciidoc')||className?.includes('language-adoc'))return <AsciiDocBlock source={source}/>;
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
