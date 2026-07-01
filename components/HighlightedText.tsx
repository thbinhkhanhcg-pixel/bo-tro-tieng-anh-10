import React from "react";

/**
 * Renders `text`, wrapping each occurrence of an entry from `answers` (in order,
 * first-match-after-previous-cursor) in a highlighter <mark>. Falls back to plain
 * text if an answer string can't be located (never drops content, just skips the mark).
 */
export default function HighlightedText({
  text,
  answers,
  className,
}: {
  text: string;
  answers?: string[];
  className?: string;
}) {
  if (!answers || answers.length === 0) {
    return <span className={className}>{text}</span>;
  }

  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  let key = 0;

  for (const ans of answers) {
    const cleanAns = ans.trim();
    if (!cleanAns) continue;
    const idx = text.indexOf(cleanAns, cursor);
    if (idx === -1) continue;
    if (idx > cursor) {
      nodes.push(<span key={key++}>{text.slice(cursor, idx)}</span>);
    }
    nodes.push(
      <mark key={key++} className="highlight-mark font-600 text-ink">
        {text.slice(idx, idx + cleanAns.length)}
      </mark>
    );
    cursor = idx + cleanAns.length;
  }
  nodes.push(<span key={key++}>{text.slice(cursor)}</span>);

  return <span className={className}>{nodes}</span>;
}
