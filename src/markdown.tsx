import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { Copy } from 'lucide-react';

type MarkdownElementProps = { children?: ReactNode };

const ALERTS = new Set(['NOTE', 'TIP', 'IMPORTANT', 'WARNING', 'CAUTION']);

export function MarkdownBlockquote({ children }: MarkdownElementProps) {
  const blocks = Children.toArray(children);
  const first = blocks[0];
  if (isValidElement(first)) {
    const element = first as ReactElement<MarkdownElementProps>;
    const paragraph = Children.toArray(element.props.children);
    const firstText = paragraph[0];
    if (typeof firstText === 'string') {
      const match = firstText.match(/^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i);
      const kind = match?.[1]?.toUpperCase();
      if (kind && ALERTS.has(kind)) {
        const remaining = firstText.slice(match![0].length);
        const nextParagraph = [remaining, ...paragraph.slice(1)].filter(Boolean);
        const cleaned = cloneElement(element, {}, nextParagraph);
        return <aside className={'markdown-alert markdown-alert-' + kind.toLowerCase()} role="note" aria-label={kind}>
          <strong className="markdown-alert-label">{kind}</strong>
          {cleaned}
          {blocks.slice(1)}
        </aside>;
      }
    }
  }
  return <blockquote>{children}</blockquote>;
}

function codeText(children: ReactNode): string {
  return Children.toArray(children).map(child => {
    if (isValidElement(child)) {
      const props = child.props as MarkdownElementProps;
      return Children.toArray(props.children).map(value => typeof value === 'string' ? value : '').join('');
    }
    return typeof child === 'string' ? child : '';
  }).join('');
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
