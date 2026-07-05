"use client";

import { useState } from "react";
import type { ContentBlock } from "@/lib/types";
import type { ExerciseGroupEntry } from "@/lib/groupBlocks";
import { isAnswerCorrect } from "@/lib/textMatch";
import ClozeExercise from "./ClozeExercise";
import UnderlinedText from "./UnderlinedText";

function IntroBlock({ block }: { block: ContentBlock }) {
  if (block.type === "p") {
    return (
      <p className="leading-relaxed text-ink-soft">
        <UnderlinedText text={block.text} underline={block.underline} />
      </p>
    );
  }
  if (block.type === "table") {
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <tbody>
            {block.rows.map((row, ri) => (
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
  }
  if (block.type === "bullet") {
    return (
      <ul className="list-disc pl-6 text-ink-soft">
        <li>{block.text}</li>
      </ul>
    );
  }
  return null;
}

function McqRow({
  item,
  selected,
  submitted,
  onSelect,
}: {
  item: Extract<ContentBlock, { type: "item" }>;
  selected: string | null;
  submitted: boolean;
  onSelect: (letter: string) => void;
}) {
  const graded = !!item.correctLetter;
  return (
    <div className="rounded-lg border-2 border-line bg-paper-light p-4">
      <p className="mb-3 leading-relaxed">
        <span className="mr-2 font-mono-tag text-sm font-700 text-pine">
          {item.num}.
        </span>
        {item.text}
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {item.options.map((o, oi) => {
          const isSelected = selected === o.letter;
          const isCorrectOpt = graded && o.letter === item.correctLetter;
          let style = "border-line bg-paper text-ink hover:border-pine";
          if (submitted && graded) {
            if (isCorrectOpt) style = "border-pine bg-pine text-paper-light";
            else if (isSelected) style = "border-brick bg-brick text-paper-light";
            else style = "border-line bg-paper text-ink-soft opacity-60";
          } else if (isSelected) {
            style = "border-pine bg-pine text-paper-light";
          }
          return (
            <button
              key={oi}
              type="button"
              disabled={submitted}
              onClick={() => onSelect(o.letter)}
              className={`flex items-start gap-2 rounded-md border-2 px-3 py-2 text-left text-sm transition-colors disabled:cursor-default ${style}`}
            >
              <span className="font-mono-tag font-700">{o.letter}</span>
              <span className="leading-snug">{o.text}</span>
              {submitted && graded && isCorrectOpt && " ✓"}
              {submitted && graded && isSelected && !isCorrectOpt && " ✗"}
            </button>
          );
        })}
      </div>
      {submitted && !graded && (
        <p className="mt-2 font-mono-tag text-[11px] uppercase tracking-wide text-ink-soft/70">
          ⚪ Chưa có đáp án đối chiếu — tự kiểm tra ở tab &ldquo;Đáp án &amp; Tài liệu GV&rdquo;
        </p>
      )}
    </div>
  );
}

function ExerciseRow({
  item,
  value,
  submitted,
  onChange,
}: {
  item: Extract<ContentBlock, { type: "item" }>;
  value: string;
  submitted: boolean;
  onChange: (v: string) => void;
}) {
  const graded = !!item.correctAnswers?.length;
  const correct = graded && isAnswerCorrect(value, item.correctAnswers!);

  let ringStyle = "border-line focus:border-pine";
  if (submitted && graded) {
    ringStyle = correct ? "border-pine bg-pine/10" : "border-brick bg-brick/10";
  }

  return (
    <div className="rounded-lg border-2 border-dashed border-line bg-paper-light/60 p-4">
      <p className="mb-2 leading-relaxed">
        <span className="mr-2 font-mono-tag text-sm font-700 text-chalk-blue">
          {item.num}.
        </span>
        <UnderlinedText text={item.text} underline={item.underline} />
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={value}
          disabled={submitted}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Nhập câu trả lời của bạn..."
          className={`min-w-0 flex-1 rounded-md border-2 bg-paper px-3 py-2 text-sm text-ink outline-none disabled:cursor-default ${ringStyle}`}
        />
        {submitted && graded && (
          <span className={`font-mono-tag text-xs ${correct ? "text-pine" : "text-brick"}`}>
            {correct ? "✓ Đúng" : "✗ Sai"}
          </span>
        )}
      </div>
      {submitted && graded && !correct && (
        <p className="mt-2 text-sm text-pine">
          Đáp án đúng:{" "}
          <span className="highlight-mark font-600">
            {item.correctAnswers!.join(" / ")}
          </span>
        </p>
      )}
      {submitted && !graded && (
        <p className="mt-2 font-mono-tag text-[11px] uppercase tracking-wide text-ink-soft/70">
          ⚪ Chưa có đáp án đối chiếu — tự kiểm tra ở tab &ldquo;Đáp án &amp; Tài liệu GV&rdquo;
        </p>
      )}
    </div>
  );
}

export default function ExerciseGroup({
  heading,
  intro,
  entries,
}: {
  heading: string | null;
  intro: ContentBlock[];
  entries: ExerciseGroupEntry[];
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  function gradablePointsFor(e: ExerciseGroupEntry): number {
    if (e.type === "item") {
      return e.correctLetter || (e.correctAnswers && e.correctAnswers.length > 0) ? 1 : 0;
    }
    if (e.type === "cloze") {
      return e.correctAnswers && e.correctAnswers.length === e.blanks.length
        ? e.blanks.length
        : 0;
    }
    return 0;
  }

  const totalGradablePoints = entries.reduce((sum, e) => sum + gradablePointsFor(e), 0);

  function scoreCount() {
    let correct = 0;
    entries.forEach((e, i) => {
      if (e.type === "item") {
        const val = answers[String(i)] ?? "";
        if (e.correctLetter) {
          if (val === e.correctLetter) correct++;
        } else if (e.correctAnswers?.length) {
          if (isAnswerCorrect(val, e.correctAnswers)) correct++;
        }
      } else if (e.type === "cloze" && e.correctAnswers?.length === e.blanks.length) {
        e.blanks.forEach((blankNum, bi) => {
          const val = answers[`${i}:${blankNum}`] ?? "";
          if (isAnswerCorrect(val, [e.correctAnswers![bi]])) correct++;
        });
      }
    });
    return correct;
  }

  function handleSubmit() {
    setSubmitted(true);
  }

  function handleRetry() {
    setAnswers({});
    setSubmitted(false);
  }

  const score = submitted ? scoreCount() : 0;

  return (
    <div className="my-5 rounded-xl border-2 border-brick/40 bg-brick/[0.04] p-5 shadow-[3px_3px_0_var(--color-brick)]">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brick text-sm text-paper-light">
          ✏️
        </span>
        <span className="font-mono-tag text-[11px] uppercase tracking-widest text-brick">
          Bài tập
        </span>
      </div>
      {heading && (
        <h4 className="mb-3 font-display text-xl font-700 text-ink">
          {heading}
        </h4>
      )}

      {intro.length > 0 && (
        <div className="mb-4 space-y-2 rounded-md bg-paper-light/70 p-3">
          {intro.map((b, i) => (
            <IntroBlock key={i} block={b} />
          ))}
        </div>
      )}

      <div className="space-y-3">
        {entries.map((entry, i) => {
          if (entry.type === "cloze") {
            const clozeValues: Record<string, string> = {};
            for (const bn of entry.blanks) {
              clozeValues[bn] = answers[`${i}:${bn}`] ?? "";
            }
            return (
              <ClozeExercise
                key={i}
                block={entry}
                values={clozeValues}
                submitted={submitted}
                onChange={(blankNum, v) =>
                  setAnswers((a) => ({ ...a, [`${i}:${blankNum}`]: v }))
                }
              />
            );
          }
          if (entry.type !== "item") {
            return <IntroBlock key={i} block={entry} />;
          }
          if (entry.itemType === "subheading") {
            return (
              <p key={i} className="mt-2 font-600 text-ink">
                {entry.num ? `${entry.num}. ` : ""}
                {entry.text}
              </p>
            );
          }
          if (entry.itemType === "mcq") {
            return (
              <McqRow
                key={i}
                item={entry}
                selected={answers[String(i)] ?? null}
                submitted={submitted}
                onSelect={(letter) =>
                  setAnswers((a) => ({ ...a, [String(i)]: letter }))
                }
              />
            );
          }
          return (
            <ExerciseRow
              key={i}
              item={entry}
              value={answers[String(i)] ?? ""}
              submitted={submitted}
              onChange={(v) => setAnswers((a) => ({ ...a, [String(i)]: v }))}
            />
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t-2 border-brick/20 pt-4">
        {submitted ? (
          <>
            <span className="font-mono-tag text-sm text-ink">
              {totalGradablePoints > 0 ? (
                <>
                  Điểm:{" "}
                  <strong className="text-brick">
                    {score}/{totalGradablePoints}
                  </strong>{" "}
                  câu có đáp án đối chiếu
                </>
              ) : (
                <span className="text-ink-soft">
                  Bài này chưa có đáp án đối chiếu tự động — hãy xem tab &ldquo;Đáp
                  án &amp; Tài liệu GV&rdquo; để tự kiểm tra.
                </span>
              )}
            </span>
            <button
              onClick={handleRetry}
              className="rounded-md border-2 border-brick px-5 py-2 font-mono-tag text-sm uppercase text-brick transition-colors hover:bg-brick hover:text-paper-light"
            >
              🔁 Làm lại
            </button>
          </>
        ) : (
          <button
            onClick={handleSubmit}
            className="ml-auto rounded-md bg-brick px-6 py-2.5 font-mono-tag text-sm uppercase text-paper-light shadow-[3px_3px_0_var(--color-ink)] transition-transform hover:-translate-y-0.5"
          >
            Nộp bài →
          </button>
        )}
      </div>
    </div>
  );
}
