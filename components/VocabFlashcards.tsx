"use client";

import { useState } from "react";
import type { VocabEntry } from "@/lib/types";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function VocabFlashcards({ vocab }: { vocab: VocabEntry[] }) {
  const [order, setOrder] = useState<VocabEntry[]>(vocab);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const current = order[index];
  const progress = `${index + 1} / ${order.length}`;

  function go(delta: number) {
    setFlipped(false);
    setIndex((i) => {
      const next = i + delta;
      if (next < 0) return order.length - 1;
      if (next >= order.length) return 0;
      return next;
    });
  }

  function handleShuffle() {
    setOrder(shuffle(vocab));
    setIndex(0);
    setFlipped(false);
  }

  if (vocab.length === 0) {
    return (
      <p className="text-ink-soft italic">
        Unit này không có danh sách từ vựng riêng trong tài liệu gốc.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex w-full max-w-md items-center justify-between">
        <span className="font-mono-tag text-xs uppercase tracking-widest text-ink-soft">
          Thẻ {progress}
        </span>
        <button
          onClick={handleShuffle}
          className="font-mono-tag text-xs uppercase tracking-widest text-chalk-blue hover:text-pine"
        >
          🔀 Xáo thẻ
        </button>
      </div>

      {/* card */}
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="group h-64 w-full max-w-md [perspective:1200px]"
        aria-label="Bấm để lật thẻ"
      >
        <div
          className="relative h-full w-full rounded-xl transition-transform duration-500 [transform-style:preserve-3d]"
          style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          {/* front */}
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border-2 border-ink/70 bg-paper-light p-6 shadow-[5px_5px_0_var(--color-line)] [backface-visibility:hidden]">
            <span className="font-mono-tag text-[11px] uppercase tracking-widest text-chalk-blue">
              {current.pos || "word"}
            </span>
            <h3 className="mt-2 text-center font-display text-3xl font-700 text-ink">
              {current.term}
            </h3>
            {current.ipa && (
              <p className="mt-2 font-mono-tag text-base text-brick">
                /{current.ipa}/
              </p>
            )}
            <span className="mt-6 font-mono-tag text-[11px] uppercase tracking-widest text-ink-soft">
              👆 Bấm để xem nghĩa
            </span>
          </div>
          {/* back */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border-2 border-pine bg-pine p-6 text-paper-light shadow-[5px_5px_0_var(--color-line)] [backface-visibility:hidden]"
            style={{ transform: "rotateY(180deg)" }}
          >
            <span className="font-mono-tag text-[11px] uppercase tracking-widest text-highlight">
              Nghĩa
            </span>
            <p className="mt-3 text-center font-display text-2xl font-600 leading-snug">
              {current.meaning}
            </p>
          </div>
        </div>
      </button>

      <div className="mt-5 flex items-center gap-4">
        <button
          onClick={() => go(-1)}
          className="rounded-md border-2 border-ink px-4 py-2 font-mono-tag text-sm uppercase text-ink transition-colors hover:bg-ink hover:text-paper"
        >
          ← Trước
        </button>
        <button
          onClick={() => go(1)}
          className="rounded-md bg-pine px-5 py-2 font-mono-tag text-sm uppercase text-paper-light shadow-[3px_3px_0_var(--color-ink)] transition-transform hover:-translate-y-0.5"
        >
          Tiếp →
        </button>
      </div>
    </div>
  );
}
