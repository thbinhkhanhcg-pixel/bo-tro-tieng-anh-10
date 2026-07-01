"use client";

import { useState } from "react";
import type { VocabEntry } from "@/lib/types";
import VocabList from "./VocabList";
import VocabFlashcards from "./VocabFlashcards";
import VocabQuiz from "./VocabQuiz";

type Mode = "list" | "flashcard" | "quiz";

const MODES: { key: Mode; label: string; icon: string }[] = [
  { key: "list", label: "Danh sách", icon: "📋" },
  { key: "flashcard", label: "Flashcard", icon: "🗂️" },
  { key: "quiz", label: "Đố từ", icon: "🧠" },
];

export default function VocabSection({ vocab }: { vocab: VocabEntry[] }) {
  const [mode, setMode] = useState<Mode>("list");

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            className={`rounded-full border-2 px-4 py-1.5 font-mono-tag text-xs uppercase tracking-wide transition-colors ${
              mode === m.key
                ? "border-pine bg-pine text-paper-light"
                : "border-line bg-paper text-ink-soft hover:border-pine hover:text-pine"
            }`}
          >
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      {mode === "list" && <VocabList vocab={vocab} />}
      {mode === "flashcard" && (
        <VocabFlashcards key={`fc-${vocab.length}`} vocab={vocab} />
      )}
      {mode === "quiz" && <VocabQuiz key={`qz-${vocab.length}`} vocab={vocab} />}
    </div>
  );
}
