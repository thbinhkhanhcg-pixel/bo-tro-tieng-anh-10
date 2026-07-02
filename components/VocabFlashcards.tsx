"use client";

import { useState } from "react";
import type { VocabEntry } from "@/lib/types";
import PronounceButton from "./PronounceButton";
import MicCheckButton from "./MicCheckButton";

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
  const [mastered, setMastered] = useState<Set<number>>(new Set());
  const [justCorrect, setJustCorrect] = useState(false);

  const current = order[index];
  const progress = `${index + 1} / ${order.length}`;
  const isMastered = mastered.has(current.num);

  function go(delta: number) {
    setFlipped(false);
    setJustCorrect(false);
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
    setJustCorrect(false);
  }

  function handlePronounceCorrect() {
    setMastered((prev) => {
      const next = new Set(prev);
      next.add(current.num);
      return next;
    });
    setJustCorrect(true);
    // reward: flip the card to reveal the meaning after a brief celebratory pause
    setTimeout(() => setFlipped(true), 700);
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
        <span className="font-mono-tag text-xs uppercase tracking-widest text-pine">
          ✅ Đã thuộc: {mastered.size}/{order.length}
        </span>
        <button
          onClick={handleShuffle}
          className="font-mono-tag text-xs uppercase tracking-widest text-chalk-blue hover:text-pine"
        >
          🔀 Xáo thẻ
        </button>
      </div>

      {/* card */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setFlipped((f) => !f)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setFlipped((f) => !f);
        }}
        className="group relative h-72 w-full max-w-md cursor-pointer [perspective:1200px]"
        aria-label="Bấm để lật thẻ"
      >
        {isMastered && (
          <span className="absolute -top-3 -right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 border-pine bg-highlight text-lg shadow-[2px_2px_0_var(--color-ink)]">
            ✓
          </span>
        )}
        <div
          className="relative h-full w-full rounded-xl transition-transform duration-500 [transform-style:preserve-3d]"
          style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          {/* front */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-ink/70 bg-paper-light p-6 shadow-[5px_5px_0_var(--color-line)] [backface-visibility:hidden]">
            <span className="font-mono-tag text-[11px] uppercase tracking-widest text-chalk-blue">
              {current.pos || "word"}
            </span>
            <div className="flex items-center gap-2">
              <h3 className="text-center font-display text-3xl font-700 text-ink">
                {current.term}
              </h3>
              <PronounceButton text={current.term} size="md" />
            </div>
            {current.ipa && (
              <p className="font-mono-tag text-base text-brick">
                /{current.ipa}/
              </p>
            )}

            <div className="mt-2 flex flex-col items-center gap-2">
              <MicCheckButton
                key={current.num}
                text={current.term}
                alreadyCorrect={isMastered}
                onCorrect={handlePronounceCorrect}
              />
              {justCorrect && (
                <span className="font-mono-tag text-xs text-pine">
                  🎉 Chính xác! Đang lật thẻ...
                </span>
              )}
            </div>

            <span className="mt-1 font-mono-tag text-[11px] uppercase tracking-widest text-ink-soft">
              👆 Bấm vào thẻ để xem nghĩa
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
      </div>

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
