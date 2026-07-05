"use client";

import { isAnswerCorrect } from "@/lib/textMatch";

type ClozeBlock = Extract<
  import("@/lib/types").ContentBlock,
  { type: "cloze" }
>;

/** Splits "...text {1} more text {2} end" into an array alternating
 * plain-text segments and blank numbers, e.g. ["...text ", "1", " more text ", "2", " end"] */
function splitClozeText(text: string): string[] {
  return text.split(/\{(\d{1,2})\}/g);
}

export default function ClozeExercise({
  block,
  values,
  submitted,
  onChange,
}: {
  block: ClozeBlock;
  values: Record<string, string>;
  submitted: boolean;
  onChange: (blankNum: string, value: string) => void;
}) {
  const parts = splitClozeText(block.text);
  const graded = !!block.correctAnswers?.length && block.correctAnswers.length === block.blanks.length;

  return (
    <div className="rounded-lg border-2 border-dashed border-line bg-paper-light/60 p-4">
      <p className="leading-loose">
        {parts.map((part, i) => {
          const isBlankToken = i % 2 === 1; // odd indices are the captured blank numbers
          if (!isBlankToken) return <span key={i}>{part}</span>;

          const blankNum = part;
          const blankIdx = block.blanks.indexOf(blankNum);
          const value = values[blankNum] ?? "";
          const correctAns = graded ? block.correctAnswers![blankIdx] : undefined;
          const isCorrect = graded && isAnswerCorrect(value, [correctAns!]);

          let style = "border-line focus:border-pine w-24";
          if (submitted && graded) {
            style = isCorrect
              ? "border-pine bg-pine/10 w-24"
              : "border-brick bg-brick/10 w-24";
          }

          return (
            <span key={i} className="inline-flex flex-col items-center align-middle mx-0.5">
              <span className="inline-flex items-center gap-1">
                <span className="font-mono-tag text-[10px] text-chalk-blue">
                  {blankNum}
                </span>
                <input
                  type="text"
                  value={value}
                  disabled={submitted}
                  onChange={(e) => onChange(blankNum, e.target.value)}
                  className={`rounded border-2 bg-paper px-1.5 py-0.5 text-center text-sm outline-none disabled:cursor-default ${style}`}
                />
                {submitted && graded && (
                  <span className={isCorrect ? "text-pine" : "text-brick"}>
                    {isCorrect ? "✓" : "✗"}
                  </span>
                )}
              </span>
              {submitted && graded && !isCorrect && (
                <span className="highlight-mark mt-0.5 font-mono-tag text-[10px] font-600">
                  {correctAns}
                </span>
              )}
            </span>
          );
        })}
      </p>
      {submitted && !graded && (
        <p className="mt-3 font-mono-tag text-[11px] uppercase tracking-wide text-ink-soft/70">
          ⚪ Chưa có đáp án đối chiếu — tự kiểm tra ở tab &ldquo;Đáp án &amp; Tài liệu GV&rdquo;
        </p>
      )}
    </div>
  );
}
