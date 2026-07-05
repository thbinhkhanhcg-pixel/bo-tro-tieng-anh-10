import type { ContentBlock } from "./types";

export type ExerciseItemBlock = Extract<ContentBlock, { type: "item" }>;
export type ExerciseGroupEntry = ContentBlock; // item | p | bullet | table, in original order

export type Section =
  | { kind: "divider"; text: string }
  | { kind: "theory"; heading: string | null; blocks: ContentBlock[] }
  | {
      kind: "exercise";
      heading: string | null;
      intro: ContentBlock[];
      entries: ExerciseGroupEntry[];
    };

/**
 * Groups a flat block sequence into theory boxes and exercise groups.
 * A section becomes "exercise" the moment it contains at least one gradable
 * item (mcq/exercise); sections with only prose/tables/subheadings are "theory".
 * h2 headings are kept as standalone top-level dividers between chapters
 * (e.g. "B. GRAMMAR"), not absorbed into either box.
 *
 * Everything from the first gradable item onward is kept, in original order,
 * as `entries` (mixing interactive item blocks with any interleaved prose/table
 * blocks) so nothing is ever silently dropped even if a note or table appears
 * mid-exercise.
 */
export function groupIntoSections(blocks: ContentBlock[]): Section[] {
  const sections: Section[] = [];
  let heading: string | null = null;
  let buffer: ContentBlock[] = [];

  function flush() {
    if (buffer.length === 0 && heading === null) return;
    const hasGradable = buffer.some(
      (b) =>
        (b.type === "item" && (b.itemType === "mcq" || b.itemType === "exercise")) ||
        b.type === "cloze"
    );
    if (hasGradable) {
      const intro: ContentBlock[] = [];
      const entries: ExerciseGroupEntry[] = [];
      let seenFirstItem = false;
      for (const b of buffer) {
        const isGradableItem =
          (b.type === "item" && (b.itemType === "mcq" || b.itemType === "exercise")) ||
          b.type === "cloze";
        if (isGradableItem) seenFirstItem = true;
        if (!seenFirstItem) intro.push(b);
        else entries.push(b);
      }
      sections.push({ kind: "exercise", heading, intro, entries });
    } else if (buffer.length > 0) {
      sections.push({ kind: "theory", heading, blocks: buffer });
    }
    heading = null;
    buffer = [];
  }

  for (const b of blocks) {
    if (b.type === "h2") {
      flush();
      sections.push({ kind: "divider", text: b.text });
      continue;
    }
    if (b.type === "h3") {
      flush();
      heading = b.text;
      continue;
    }
    buffer.push(b);
  }
  flush();

  return sections;
}
