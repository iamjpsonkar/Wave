import { useMemo, useState } from 'react';
import { BookOpen, Check, Plus, Search, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { MarkdownBlockquote, MarkdownCode, MarkdownPre, markdownSource, rehypeWaveHeadingIds } from './markdown';

type Sample = { id: string; title: string; category: string; description: string; code: string };

const samples: Sample[] = [
  { id:'heading',title:'Headings',category:'Text',description:'Create a clear document hierarchy.',code:'# Main heading\n\n## Section heading\n\n### Smaller heading' },
  { id:'emphasis',title:'Text emphasis',category:'Text',description:'Emphasize important words.',code:'**Bold text**\n\n*Italic text*\n\n~~Strikethrough~~\n\n==Highlighted text==' },
  { id:'link',title:'Links',category:'Text',description:'Add a useful web link.',code:'[Open the Wave documentation](https://example.com)' },
  { id:'quote',title:'Blockquote',category:'Blocks',description:'Set apart a quotation or note.',code:'> A useful quotation or a thought worth remembering.\n>\n> — Author' },
  { id:'callout',title:'Callout',category:'Blocks',description:'Draw attention to a note or warning.',code:'> [!NOTE]\n> Keep this helpful context close to the related content.' },
  { id:'details',title:'Expandable details',category:'Blocks',description:'Hide supporting information behind a summary.',code:'> [!DETAILS] Show more\n> Add supporting details here.\n> You can include more than one line.' },
  { id:'divider',title:'Divider',category:'Blocks',description:'Separate major sections.',code:'---' },
  { id:'bullets',title:'Bulleted list',category:'Lists',description:'Start a list of related items.',code:'- First item\n- Second item\n- Third item' },
  { id:'numbered',title:'Numbered list',category:'Lists',description:'Show steps in sequence.',code:'1. First step\n2. Second step\n3. Third step' },
  { id:'nested',title:'Nested list',category:'Lists',description:'Group sub-items under a parent.',code:'- Main item\n  - Supporting item\n  - Another detail\n- Next main item' },
  { id:'tasks',title:'Task checklist',category:'Lists',description:'Track work with checkboxes.',code:'- [ ] To do\n- [x] Completed\n- [ ] Follow up' },
  { id:'table',title:'Table',category:'Data',description:'Compare information in columns.',code:'| Feature | Status | Priority |\n|:--|:--:|--:|\n| Search | Ready | 1 |\n| Export | In progress | 2 |' },
  { id:'code',title:'Code block',category:'Code',description:'Share code with language-aware formatting.',code:'\x60\x60\x60ts\nfunction greet(name: string) {\n  return `Hello, ${name}!`;\n}\n\x60\x60\x60' },
  { id:'diff',title:'Code diff',category:'Code',description:'Show additions and removals.',code:'\x60\x60\x60diff\n- const mode = "old";\n+ const mode = "new";\n\x60\x60\x60' },
  { id:'inline-code',title:'Inline code',category:'Code',description:'Reference a command or identifier in a sentence.',code:'Run `npm run build` to create a production build.' },
  { id:'math',title:'Math expression',category:'Advanced',description:'Write a display equation.',code:'$$\nE = mc^2\n$$' },
  { id:'mermaid',title:'Flowchart',category:'Advanced',description:'Explain a process with a Mermaid diagram.',code:'\x60\x60\x60mermaid\nflowchart TD\n  A[Write] --> B[Preview]\n  B --> C[Share]\n\x60\x60\x60' },
  { id:'color',title:'Text colors',category:'Advanced',description:'Use Wave inline color formatting.',code:'[[color:#365FBA|Blue text]] and [[bg:#FFF0A8|highlighted text]]' },
  { id:'wiki',title:'Internal page link',category:'Advanced',description:'Link to another page in this workspace.',code:'Read [[Getting started]] for the next steps.' },
  { id:'image',title:'Local image',category:'Media',description:'Reference an image stored in workspace assets.',code:'![Describe the image](../assets/example.png)' },
  { id:'attachment',title:'File attachment',category:'Media',description:'Link to a local workspace file.',code:'[Open the attached file](../assets/guide.pdf)' }
];

const categories = ['All','Text','Blocks','Lists','Data','Code','Advanced','Media'];

type Props = { onInsert: (source: string) => void };

export default function SnippetLibrary({ onInsert }: Props) {
  const [query,setQuery] = useState('');
  const [category,setCategory] = useState('All');
  const [selectedId,setSelectedId] = useState('heading');
  const [insertedId,setInsertedId] = useState('');
  const filtered = useMemo(() => samples.filter(sample => (category==='All'||sample.category===category) && (sample.title+' '+sample.description+' '+sample.code).toLowerCase().includes(query.toLowerCase())),[category,query]);
  const selected = samples.find(sample => sample.id===selectedId) ?? samples[0];
  function insert() { onInsert(selected.code); setInsertedId(selected.id); window.setTimeout(()=>setInsertedId(''),1400); }

  return <aside className="snippet-library" aria-label="Markdown sample library">
    <header className="snippet-library-header"><div><span className="snippet-eyebrow"><BookOpen size={13}/> QUICK INSERT</span><h2>Sample library</h2><p>Explore an example, preview it, then insert its Markdown at your cursor.</p></div></header>
    <label className="snippet-search"><Search size={14}/><input aria-label="Search samples" placeholder="Find a sample…" value={query} onChange={event=>setQuery(event.target.value)}/>{query&&<button type="button" aria-label="Clear sample search" onClick={()=>setQuery('')}><X size={13}/></button>}</label>
    <div className="snippet-categories" aria-label="Sample categories">{categories.map(item=><button type="button" key={item} className={category===item?'active':''} onClick={()=>setCategory(item)}>{item}</button>)}</div>
    <div className="snippet-library-body">
      <nav className="snippet-list" aria-label="Available Markdown samples">{filtered.map(sample=><button type="button" key={sample.id} className={selectedId===sample.id?'selected':''} onClick={()=>setSelectedId(sample.id)}><strong>{sample.title}</strong><small>{sample.category}</small></button>)}{!filtered.length&&<p className="snippet-empty">No matching samples. Try another search.</p>}</nav>
      <section className="snippet-detail" aria-label="Selected sample preview">
        <div className="snippet-detail-heading"><div><strong>{selected.title}</strong><small>{selected.description}</small></div><span>{selected.category}</span></div>
        <div className="snippet-preview"><ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize,rehypeWaveHeadingIds]} components={{blockquote:MarkdownBlockquote,pre:MarkdownPre,code:MarkdownCode}}>{markdownSource(selected.code,[])}</ReactMarkdown></div>
        <div className="snippet-source"><span>MARKDOWN SOURCE</span><pre>{selected.code}</pre></div>
        <button type="button" className="snippet-insert" onClick={insert}>{insertedId===selected.id?<><Check size={14}/> Inserted</>:<><Plus size={14}/> Insert into document</>}</button>
      </section>
    </div>
    <footer className="snippet-library-footer">{samples.length} ready-to-use examples · Your Markdown stays editable</footer>
  </aside>;
}
