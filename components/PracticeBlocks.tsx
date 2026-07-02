import type { ContentBlock } from "@/lib/types";
import { groupIntoSections } from "@/lib/groupBlocks";
import TheorySection from "./TheorySection";
import ExerciseGroup from "./ExerciseGroup";

export default function PracticeBlocks({ blocks }: { blocks: ContentBlock[] }) {
  const sections = groupIntoSections(blocks);

  return (
    <div>
      {sections.map((s, i) => {
        if (s.kind === "divider") {
          return (
            <h3
              key={i}
              className="stitch mt-10 pt-5 font-display text-2xl font-700 text-ink first:mt-0 first:border-0 first:pt-0"
            >
              {s.text}
            </h3>
          );
        }
        if (s.kind === "theory") {
          return <TheorySection key={i} heading={s.heading} blocks={s.blocks} />;
        }
        return (
          <ExerciseGroup
            key={i}
            heading={s.heading}
            intro={s.intro}
            entries={s.entries}
          />
        );
      })}
    </div>
  );
}
