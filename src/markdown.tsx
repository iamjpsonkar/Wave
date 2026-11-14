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

export function MarkdownBlockquote({ children }: MarkdownElementProps) {
  const match = plainText(children).match(/^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i);
  const kind = match?.[1]?.toUpperCase();
  if (kind && ALERTS.has(kind)) {
    return <aside className={'markdown-alert markdown-alert-' + kind.toLowerCase()} role="note" aria-label={kind}>
      <strong className="markdown-alert-label">{kind}</strong>
      {withoutAlertMarker(children)}
    </aside>;
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
