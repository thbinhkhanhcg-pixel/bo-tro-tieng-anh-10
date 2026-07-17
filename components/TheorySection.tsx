import type { ContentBlock } from "@/lib/types";
import HighlightedText from "./HighlightedText";
import StyledParagraph, { EXAMPLE_RE, NOTE_RE } from "./StyledParagraph";

function TheoryBlock({
  block,
  prevType,
}: {
  block: ContentBlock;
  prevType: string | null;
}) {
  if (block.type === "item" && block.itemType === "subheading") {
    return (
      <p className="mt-5 flex items-center gap-2 font-display text-lg font-700 text-pine first:mt-0">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pine font-mono-tag text-[11px] text-paper-light">
          {block.num}
        </span>
        {block.text}
      </p>
    );
  }

  if (block.type === "p") {
    const tight =
      prevType === "bullet" &&
      (EXAMPLE_RE.test(block.text) || NOTE_RE.test(block.text));
    return (
      <StyledParagraph
        text={block.text}
        underline={block.underline}
        tight={tight}
      />
    );
  }
  if (block.type === "bullet") {
    return (
      <div className="flex gap-2 pl-1 font-600 leading-relaxed text-ink">
        <span className="mt-0.5 shrink-0 text-pine">▸</span>
        <span>
          <HighlightedText text={block.text} answers={block.answers} />
        </span>
      </div>
    );
  }
  if (block.type === "table") {
    return (
      <div className="overflow-x-auto rounded-md border-2 border-chalk-blue/30">
        <table className="w-full border-collapse text-sm">
          <tbody>
            {block.rows.map((row, ri) => (
              <tr
                key={ri}
                className={ri % 2 === 0 ? "bg-paper-light" : "bg-chalk-blue/5"}
              >
                {row.map((cell, ci) => (
                  <td key={ci} className="border-b border-chalk-blue/20 px-3 py-1.5 align-top">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return null;
}

export default function TheorySection({
  heading,
  blocks,
}: {
  heading: string | null;
  blocks: ContentBlock[];
}) {
  return (
    <div className="my-5 rounded-xl border-2 border-chalk-blue/50 bg-chalk-blue/[0.06] p-5 shadow-[3px_3px_0_var(--color-chalk-blue)]">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-chalk-blue text-sm text-paper-light">
          📘
        </span>
        <span className="font-mono-tag text-[11px] uppercase tracking-widest text-chalk-blue">
          Ngữ pháp
        </span>
      </div>
      {heading && (
        <h4 className="mb-3 font-display text-xl font-700 text-ink">
          {heading}
        </h4>
      )}
      <div className="space-y-2.5">
        {blocks.map((b, i) => (
          <TheoryBlock
            key={i}
            block={b}
            prevType={i > 0 ? blocks[i - 1].type : null}
          />
        ))}
      </div>
    </div>
  );
}
