"use client";

import { useState } from "react";
import type { ContentBlock } from "@/lib/types";

function McqItem({
  num,
  text,
  options,
}: {
  num: string;
  text: string;
  options: { letter: string; text: string }[];
}) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="rounded-lg border-2 border-line bg-paper-light p-4">
      <p className="mb-3 leading-relaxed">
        <span className="mr-2 font-mono-tag text-sm font-700 text-pine">
          {num}.
        </span>
        {text}
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((o) => {
          const isSelected = selected === o.letter;
          return (
            <button
              key={o.letter}
              type="button"
              onClick={() => setSelected(isSelected ? null : o.letter)}
              className={`flex items-start gap-2 rounded-md border-2 px-3 py-2 text-left text-sm transition-colors ${
                isSelected
                  ? "border-pine bg-pine text-paper-light"
                  : "border-line bg-paper text-ink hover:border-pine"
              }`}
            >
              <span
                className={`font-mono-tag font-700 ${
                  isSelected ? "text-highlight" : "text-pine"
                }`}
              >
                {o.letter}
              </span>
              <span className="leading-snug">{o.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ExerciseItem({ num, text }: { num: string; text: string }) {
  return (
    <div className="rounded-lg border-2 border-dashed border-line bg-paper-light/60 p-4">
      <p className="leading-relaxed">
        <span className="mr-2 font-mono-tag text-sm font-700 text-chalk-blue">
          {num}.
        </span>
        {text}
      </p>
    </div>
  );
}

export default function PracticeBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="space-y-3">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "h2":
            return (
              <h3
                key={i}
                id={`h-${i}`}
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
              <p key={i} className="leading-relaxed text-ink">
                {b.text}
              </p>
            );
          case "bullet":
            return (
              <ul key={i} className="list-disc pl-6 text-ink">
                <li>{b.text}</li>
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
          case "item":
            if (b.itemType === "subheading") {
              return (
                <p key={i} className="mt-3 font-600 text-ink">
                  {b.num}. {b.text}
                </p>
              );
            }
            if (b.itemType === "mcq" && b.options.length >= 2) {
              return (
                <McqItem
                  key={i}
                  num={b.num}
                  text={b.text}
                  options={b.options}
                />
              );
            }
            return <ExerciseItem key={i} num={b.num} text={b.text} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
