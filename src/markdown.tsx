import { Children, cloneElement, isValidElement, type ReactNode } from 'react';
import { Copy } from 'lucide-react';

type MarkdownElementProps = { children?: ReactNode };

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

export function markdownSource(source: string): string {
  return source.replace(/^(\s*>\s*)\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*/gim, '$1**$2** ');
}

export function MarkdownBlockquote({ children }: MarkdownElementProps) {
  const text = plainText(children).trimStart();
  const marker = text.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i);
  const label = text.match(/^(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\b/i);
  const kind = (marker?.[1] || label?.[1])?.toUpperCase();
  if (kind && ALERTS.has(kind)) {
    return <blockquote className={'markdown-alert markdown-alert-' + kind.toLowerCase()} role="note" aria-label={kind}>{marker ? withoutAlertMarker(children) : children}</blockquote>;
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
  async function copyCode() {
    try {
      await navigator.clipboard.writeText(source);
    } catch {
      // Clipboard access can be unavailable in an insecure context or denied by the browser.
    }
  }
  return <div className="markdown-code">
    <pre>{children}</pre>
    <button type="button" className="markdown-copy" onClick={() => void copyCode()} aria-label="Copy code block" title="Copy code">
      <Copy size={13}/>
    </button>
  </div>;
}


type WikiDoc = { path: string; title: string };
type MarkdownNode = {
  type?: string;
  value?: string;
  url?: string;
  title?: string | null;
  children?: MarkdownNode[];
  data?: { hProperties?: Record<string, unknown> };
};

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
    .replace(/\x60{3}[\s\S]*?\x60{3}/g, '')
    .replace(/~~~[\s\S]*?~~~/g, '')
    .replace(/\x60[^\x60\n]*\x60/g, '');
  return Array.from(source.matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g), match => match[1].trim()).filter(Boolean);
}

export function remarkWikiLinks(docs: WikiDoc[]) {
  return function attachWikiLinkTransformer() {
    return function transformWikiLinks(tree: MarkdownNode) {
      function visit(parent: MarkdownNode) {
        if (!Array.isArray(parent.children)) return;
        const next: MarkdownNode[] = [];
        for (const child of parent.children) {
          if (child.type === 'text' && typeof child.value === 'string' && child.value.includes('[[')) {
            const pattern = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
            let cursor = 0;
            for (const match of child.value.matchAll(pattern)) {
              const index = match.index ?? 0;
              if (index > cursor) next.push({ type: 'text', value: child.value.slice(cursor, index) });
              const target = match[1].trim();
              const path = resolveWikiLinkTarget(target, docs);
              const alias = (match[2] || target).trim();
              next.push({
                type: 'link',
                url: path ? '#wave-page:' + encodeURIComponent(path) : '#wave-unresolved:' + encodeURIComponent(target),
                title: path ? 'Open ' + target : 'No page matches ' + target,
                children: [{ type: 'text', value: alias }],
                data: { hProperties: { className: [path ? 'wiki-link' : 'wiki-link-unresolved'] } }
              });
              cursor = index + match[0].length;
            }
            if (cursor < child.value.length) next.push({ type: 'text', value: child.value.slice(cursor) });
          } else {
            if (child.type !== 'link') visit(child);
            next.push(child);
          }
        }
        parent.children = next;
      }
      visit(tree);
    };
  };
}
