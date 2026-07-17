import HighlightedText from "./HighlightedText";
import UnderlinedText from "./UnderlinedText";

const EXAMPLE_RE = /^(E\.?g\.?|Ex\.?)\s*:/i;
const NOTE_RE = /^Note\s*:/i;

function stripLabel(text: string, re: RegExp) {
  const m = text.match(re);
  return m ? text.slice(m[0].length).trim() : text;
}

/** Renders a 'p'-type paragraph, giving "E.g:" examples and "Note:" asides a
 * visually distinct treatment (colored left border + tinted background) so
 * they read as clearly separate from the surrounding rule/explanation text,
 * instead of blending into one undifferentiated wall of text. */
export default function StyledParagraph({
  text,
  answers,
  underline,
  tight,
}: {
  text: string;
  answers?: string[];
  underline?: string[];
  tight?: boolean;
}) {
  if (EXAMPLE_RE.test(text)) {
    const rest = stripLabel(text, EXAMPLE_RE);
    return (
      <div
        className={`rounded-md border-l-4 border-pine bg-pine/[0.07] py-2 pl-3 pr-3 text-[15px] italic leading-relaxed text-ink ${
          tight ? "-mt-1" : ""
        }`}
      >
        <span className="mr-1 shrink-0 font-mono-tag not-italic text-xs font-700 text-pine">
          VD:
        </span>
        {underline ? (
          <UnderlinedText text={rest} underline={underline} />
        ) : (
          <HighlightedText text={rest} answers={answers} />
        )}
      </div>
    );
  }

  if (NOTE_RE.test(text)) {
    const rest = stripLabel(text, NOTE_RE);
    return (
      <div className="rounded-md border-l-4 border-highlight bg-highlight-soft/25 py-2 pl-3 pr-3 text-[15px] leading-relaxed text-ink">
        <span className="mr-1 shrink-0 font-mono-tag text-xs font-700 text-ink-soft">
          💡 LƯU Ý:
        </span>
        {underline ? (
          <UnderlinedText text={rest} underline={underline} />
        ) : (
          <HighlightedText text={rest} answers={answers} />
        )}
      </div>
    );
  }

  return (
    <p className="leading-relaxed text-ink">
      {underline ? (
        <UnderlinedText text={text} underline={underline} />
      ) : (
        <HighlightedText text={text} answers={answers} />
      )}
    </p>
  );
}

export { EXAMPLE_RE, NOTE_RE };
