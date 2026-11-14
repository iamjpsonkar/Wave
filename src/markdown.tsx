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

export function markdownSource(source: string, docs: Array<{ path: string; title: string }> = []): string {
  const lines = source.split('\\n');
  let fence: { character: string; length: number } | null = null;
  const converted = lines.map(line => {
    const opening = line.match(/^\\s*(`{3,}|~{3,})/);
    if (opening) {
      const token = opening[1];
      if (!fence) fence = { character: token[0], length: token.length };
      else if (token[0] === fence.character && token.length >= fence.length) fence = null;
      return line;
    }
    if (fence) return line;
    return line.replace(/(`+)([\\s\\S]*?)\\1|\\[\\[([^\\]|]+)(?:\\|([^\\]]+))?\\]\\]/g, (match, ticks, _code, target, alias) => {
      if (ticks || !target) return match;
      const normalizedTarget = target.trim();
      const path = resolveWikiLinkTarget(normalizedTarget, docs);
      const label = (alias || normalizedTarget).trim();
      const href = path ? '#wave-page=' + encodeURIComponent(path) : '#wave-unresolved=' + encodeURIComponent(normalizedTarget);
      return '[' + label + '](' + href + ')';
    });
  });
  return converted.join('\\n').replace(/^(\\s*>\\s*)\\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\\][ \\t]*/gim, '$1**$2** ');
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


