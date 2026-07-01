"use client";

import { useMemo, useState } from "react";
import type { VocabEntry } from "@/lib/types";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface Question {
  term: VocabEntry;
  options: string[];
  correctIndex: number;
}

function buildQuestions(vocab: VocabEntry[]): Question[] {
  const numOptions = Math.min(4, vocab.length);
  const order = shuffle(vocab);
  return order.map((term) => {
    const distractPool = vocab.filter((v) => v.num !== term.num);
    const distractors = shuffle(distractPool)
      .slice(0, numOptions - 1)
      .map((v) => v.meaning);
    const options = shuffle([term.meaning, ...distractors]);
    return {
      term,
      options,
      correctIndex: options.indexOf(term.meaning),
    };
  });
}

export default function VocabQuiz({ vocab }: { vocab: VocabEntry[] }) {
  const [round, setRound] = useState(0);
  // `round` intentionally forces a fresh shuffled question set on "Làm lại".
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const questions = useMemo(() => buildQuestions(vocab), [vocab, round]);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  if (vocab.length < 2) {
    return (
      <p className="text-ink-soft italic">
        Unit này chưa đủ từ vựng để tạo bài đố.
      </p>
    );
  }

  const finished = qIndex >= questions.length;

  function handleRestart() {
    setRound((r) => r + 1);
    setQIndex(0);
    setSelected(null);
    setScore(0);
  }

  function handleSelect(i: number) {
    if (selected !== null) return;
    setSelected(i);
    if (i === questions[qIndex].correctIndex) {
      setScore((s) => s + 1);
    }
  }

  function handleNext() {
    setSelected(null);
    setQIndex((i) => i + 1);
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="mx-auto max-w-md rounded-xl border-2 border-ink/70 bg-paper-light p-8 text-center shadow-[5px_5px_0_var(--color-line)]">
        <span className="font-mono-tag text-xs uppercase tracking-widest text-chalk-blue">
          Hoàn thành
        </span>
        <p className="mt-3 font-display text-4xl font-700 text-pine">
          {score}/{questions.length}
        </p>
        <p className="mt-1 text-ink-soft">
          Bạn trả lời đúng {pct}% số câu.
        </p>
        <button
          onClick={handleRestart}
          className="mt-6 rounded-md bg-pine px-6 py-3 font-mono-tag text-sm uppercase text-paper-light shadow-[3px_3px_0_var(--color-ink)] transition-transform hover:-translate-y-0.5"
        >
          🔁 Làm lại
        </button>
      </div>
    );
  }

  const q = questions[qIndex];

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono-tag text-xs uppercase tracking-widest text-ink-soft">
          Câu {qIndex + 1} / {questions.length}
        </span>
        <span className="font-mono-tag text-xs uppercase tracking-widest text-pine">
          Điểm: {score}
        </span>
      </div>

      <div className="rounded-xl border-2 border-ink/70 bg-paper-light p-6 shadow-[5px_5px_0_var(--color-line)]">
        <p className="text-center font-mono-tag text-[11px] uppercase tracking-widest text-chalk-blue">
          Từ này nghĩa là gì?
        </p>
        <h3 className="mt-2 text-center font-display text-3xl font-700 text-ink">
          {q.term.term}
        </h3>
        {q.term.ipa && (
          <p className="mt-1 text-center font-mono-tag text-sm text-brick">
            /{q.term.ipa}/
          </p>
        )}

        <div className="mt-5 flex flex-col gap-2">
          {q.options.map((opt, i) => {
            const isCorrect = i === q.correctIndex;
            const isSelected = i === selected;
            let style =
              "border-line bg-paper hover:border-pine text-ink";
            if (selected !== null) {
              if (isCorrect) {
                style = "border-pine bg-pine text-paper-light";
              } else if (isSelected) {
                style = "border-brick bg-brick text-paper-light";
              } else {
                style = "border-line bg-paper text-ink-soft opacity-60";
              }
            }
            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={selected !== null}
                className={`rounded-md border-2 px-4 py-2.5 text-left text-sm transition-colors ${style}`}
              >
                {opt}
                {selected !== null && isCorrect && " ✓"}
                {selected !== null && isSelected && !isCorrect && " ✗"}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={handleNext}
          disabled={selected === null}
          className="rounded-md bg-pine px-6 py-2.5 font-mono-tag text-sm uppercase text-paper-light shadow-[3px_3px_0_var(--color-ink)] transition-transform enabled:hover:-translate-y-0.5 disabled:opacity-40"
        >
          {qIndex + 1 === questions.length ? "Xem kết quả" : "Câu tiếp →"}
        </button>
      </div>
    </div>
  );
}
