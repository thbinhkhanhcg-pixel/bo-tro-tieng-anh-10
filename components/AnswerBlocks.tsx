import type { ContentBlock } from "@/lib/types";
import HighlightedText from "./HighlightedText";
import StyledParagraph from "./StyledParagraph";

export default function AnswerBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="space-y-3">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "h2":
            return (
              <h3
                key={i}
                className="stitch mt-8 pt-4 font-display text-xl font-700 text-pine first:mt-0 first:border-0 first:pt-0"
              >
                {b.text}
              </h3>
            );
          case "h3":
            return (
              <h4
                key={i}
                className="mt-5 font-display text-base font-600 text-chalk-blue"
              >
                {b.text}
              </h4>
            );
          case "p":
            return (
              <StyledParagraph key={i} text={b.text} answers={b.answers} />
            );
          case "bullet":
            return (
              <ul key={i} className="list-disc pl-6 text-ink">
                <li>
                  <HighlightedText text={b.text} answers={b.answers} />
                </li>
              </ul>
            );
          case "table":
            return (
              <div key={i} className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <tbody>
                    {b.rows.map((row, ri) => (
                      <tr key={ri} className="border-b border-line">
                        {row.map((cell, ci) => (
                          <td key={ci} className="px-2 py-1.5 align-top">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "item": {
            if (b.itemType === "subheading") {
              return (
                <p key={i} className="mt-3 font-600 text-ink">
                  {b.num}. {b.text}
                </p>
              );
            }
            const hasOptions = b.options.length >= 2;
            return (
              <div
                key={i}
                className="rounded-lg border-2 border-line bg-paper-light p-4"
              >
                <p className="mb-2 leading-relaxed">
                  <span className="mr-2 font-mono-tag text-sm font-700 text-pine">
                    {b.num}.
                  </span>
                  <HighlightedText text={b.text} answers={b.answers} />
                </p>
                {hasOptions && (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {b.options.map((o, oi) => (
                      <div
                        key={oi}
                        className={`flex items-start gap-2 rounded-md border-2 px-3 py-2 text-sm ${
                          o.bold
                            ? "border-highlight bg-highlight-soft/60"
                            : "border-line"
                        }`}
                      >
                        <span
                          className={`font-mono-tag font-700 ${
                            o.bold ? "text-brick" : "text-pine"
                          }`}
                        >
                          {o.letter}
                        </span>
                        <span className="leading-snug">
                          {o.bold ? (
                            <mark className="highlight-mark font-600">
                              {o.text}
                            </mark>
                          ) : (
                            o.text
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          default:
            return null;
        }
      })}
    </div>
  );
}
