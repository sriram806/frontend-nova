import { Fragment, type ReactNode } from 'react';

function inlineFormat(text: string): ReactNode[] {
  const chunks = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);

  return chunks.map((chunk, index) => {
    if (chunk.startsWith('**') && chunk.endsWith('**')) {
      return <strong key={`b-${index}`}>{chunk.slice(2, -2)}</strong>;
    }

    if (chunk.startsWith('`') && chunk.endsWith('`')) {
      return (
        <code key={`c-${index}`} className="rounded bg-white/10 px-1.5 py-0.5 text-[0.92em]">
          {chunk.slice(1, -1)}
        </code>
      );
    }

    return <Fragment key={`t-${index}`}>{chunk}</Fragment>;
  });
}

export function renderMarkdown(content: string): ReactNode {
  const lines = content.split('\n');
  const nodes: ReactNode[] = [];
  let listBuffer: string[] = [];
  let codeBuffer: string[] = [];
  let codeLanguage = '';
  let inCodeBlock = false;

  function flushList() {
    if (listBuffer.length === 0) {
      return;
    }

    nodes.push(
      <ul key={`list-${nodes.length}`} className="list-disc space-y-1 pl-5 text-sm leading-6 text-white/80">
        {listBuffer.map((item, itemIndex) => (
          <li key={`li-${itemIndex}`}>{inlineFormat(item)}</li>
        ))}
      </ul>
    );
    listBuffer = [];
  }

  function flushCodeBlock() {
    if (!inCodeBlock) {
      return;
    }

    nodes.push(
      <div key={`code-${nodes.length}`} className="overflow-x-auto rounded-xl border border-white/10 bg-[#050a14] p-3">
        {codeLanguage ? <p className="mb-2 text-[10px] uppercase tracking-[0.14em] text-white/45">{codeLanguage}</p> : null}
        <pre className="text-xs leading-6 text-cyan-100">
          <code>{codeBuffer.join('\n')}</code>
        </pre>
      </div>
    );

    codeBuffer = [];
    codeLanguage = '';
    inCodeBlock = false;
  }

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock();
      } else {
        flushList();
        inCodeBlock = true;
        codeLanguage = trimmed.slice(3).trim();
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    if (trimmed.startsWith('- ')) {
      listBuffer.push(trimmed.slice(2));
      return;
    }

    flushList();

    if (!trimmed) {
      nodes.push(<div key={`sp-${nodes.length}`} className="h-2" />);
      return;
    }

    if (trimmed.startsWith('### ')) {
      nodes.push(
        <h3 key={`h3-${nodes.length}`} className="text-base font-semibold text-cyan-200">
          {inlineFormat(trimmed.slice(4))}
        </h3>
      );
      return;
    }

    if (trimmed.startsWith('## ')) {
      nodes.push(
        <h2 key={`h2-${nodes.length}`} className="text-lg font-semibold text-white">
          {inlineFormat(trimmed.slice(3))}
        </h2>
      );
      return;
    }

    if (trimmed.startsWith('# ')) {
      nodes.push(
        <h1 key={`h1-${nodes.length}`} className="text-xl font-semibold text-white">
          {inlineFormat(trimmed.slice(2))}
        </h1>
      );
      return;
    }

    nodes.push(
      <p key={`p-${nodes.length}`} className="text-sm leading-6 text-white/80">
        {inlineFormat(trimmed)}
      </p>
    );
  });

  flushList();
  flushCodeBlock();

  return <div className="space-y-2">{nodes}</div>;
}
