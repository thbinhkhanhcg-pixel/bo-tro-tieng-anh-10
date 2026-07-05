import React from "react";

/** Renders `text`, wrapping each occurrence of an entry from `underline` in a real
 * <u> underline — used to restore the original document's "underlined part of the
 * sentence" emphasis that PDF text-extraction can't otherwise preserve. */
export default function UnderlinedText({
  text,
  underline,
}: {
  text: string;
  underline?: string[];
}) {
  if (!underline || underline.length === 0) {
    return <>{text}</>;
  }

  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  let key = 0;

  for (const phrase of underline) {
    const idx = text.indexOf(phrase, cursor);
    if (idx === -1) continue;
    if (idx > cursor) nodes.push(<span key={key++}>{text.slice(cursor, idx)}</span>);
    nodes.push(
      <u key={key++} className="decoration-2 underline-offset-2">
        {text.slice(idx, idx + phrase.length)}
      </u>
    );
    cursor = idx + phrase.length;
  }
  nodes.push(<span key={key++}>{text.slice(cursor)}</span>);

  return <>{nodes}</>;
}
