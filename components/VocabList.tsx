import type { VocabEntry } from "@/lib/types";
import PronounceButton from "./PronounceButton";

export default function VocabList({ vocab }: { vocab: VocabEntry[] }) {
  if (vocab.length === 0) {
    return (
      <p className="text-ink-soft italic">
        Unit này không có danh sách từ vựng riêng trong tài liệu gốc.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {vocab.map((v) => (
        <div
          key={v.num}
          className="rounded-lg border-2 border-line bg-paper-light p-4 shadow-[3px_3px_0_var(--color-line)]"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <h4 className="font-display text-lg font-600 text-ink">
                {v.term}
              </h4>
              <PronounceButton text={v.term} size="sm" />
            </div>
            {v.pos && (
              <span className="mt-1 font-mono-tag text-[11px] uppercase text-chalk-blue whitespace-nowrap">
                {v.pos}
              </span>
            )}
          </div>
          {v.ipa && (
            <p className="mt-0.5 font-mono-tag text-sm text-brick">
              /{v.ipa}/
            </p>
          )}
          <p className="mt-2 text-sm leading-snug text-ink-soft">
            {v.meaning}
          </p>
        </div>
      ))}
    </div>
  );
}
