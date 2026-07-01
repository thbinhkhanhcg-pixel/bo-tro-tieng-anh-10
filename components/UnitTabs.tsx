"use client";

import { useState } from "react";
import type { UnitData } from "@/lib/types";
import VocabSection from "./VocabSection";
import PracticeBlocks from "./PracticeBlocks";
import AnswerBlocks from "./AnswerBlocks";

type TabKey = "vocab" | "practice" | "answers";

const TABS: { key: TabKey; label: string; hint: string }[] = [
  { key: "vocab", label: "Từ vựng", hint: "Vocabulary" },
  { key: "practice", label: "Luyện tập", hint: "Ngữ pháp & bài tập" },
  { key: "answers", label: "Đáp án & Tài liệu GV", hint: "Answer key" },
];

export default function UnitTabs({ unit }: { unit: UnitData }) {
  const [tab, setTab] = useState<TabKey>("vocab");

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2 border-b-2 border-line">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`relative -mb-[2px] flex flex-col items-start rounded-t-lg border-2 border-b-0 px-4 py-2.5 transition-colors ${
              tab === t.key
                ? "border-line bg-paper-light text-ink"
                : "border-transparent text-ink-soft hover:text-ink"
            }`}
          >
            <span className="font-display text-base font-600">
              {t.label}
            </span>
            <span className="font-mono-tag text-[10px] uppercase tracking-wide text-ink-soft">
              {t.hint}
            </span>
          </button>
        ))}
      </div>

      <div className="rounded-b-lg rounded-tr-lg border-2 border-line bg-paper-light p-4 sm:p-6">
        {tab === "vocab" && <VocabSection vocab={unit.vocabulary} />}
        {tab === "practice" && (
          <>
            <div className="mb-5 rounded-md border-2 border-chalk-blue/40 bg-chalk-blue/5 px-4 py-3 text-sm text-ink-soft">
              💡 Với câu trắc nghiệm, hãy chọn thử đáp án của bạn trước, sau
              đó chuyển sang tab <strong>“Đáp án &amp; Tài liệu GV”</strong>{" "}
              để đối chiếu đáp án gốc.
            </div>
            <PracticeBlocks blocks={unit.practiceBlocks} />
          </>
        )}
        {tab === "answers" && (
          <>
            <div className="mb-5 rounded-md border-2 border-highlight/60 bg-highlight-soft/30 px-4 py-3 text-sm text-ink-soft">
              🖍️ Phần được <mark className="highlight-mark font-600">bôi vàng</mark>{" "}
              là đáp án đúng / từ điền đúng, lấy nguyên văn từ tài liệu dành
              cho giáo viên. Trang này còn gồm bài tập bổ sung &amp; đề kiểm
              tra không có trong bản học sinh.
            </div>
            <AnswerBlocks blocks={unit.answerBlocks} />
          </>
        )}
      </div>
    </div>
  );
}
