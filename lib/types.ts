export interface VocabEntry {
  num: number;
  term: string;
  ipa: string;
  pos: string;
  meaning: string;
}

export interface OptionBlock {
  letter: string;
  text: string;
  bold?: boolean; // only present in answer blocks: true = this is the correct option
}

export type ContentBlock =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string; answers?: string[] }
  | { type: "bullet"; text: string; answers?: string[] }
  | { type: "table"; rows: string[][] }
  | {
      type: "item";
      itemType: "mcq" | "exercise" | "subheading";
      num: string;
      text: string;
      options: OptionBlock[];
      answers?: string[];
    };

export interface UnitData {
  number: number;
  titleEn: string;
  titleVi: string;
  vocabulary: VocabEntry[];
  practiceBlocks: ContentBlock[];
  answerBlocks: ContentBlock[];
}

export interface TestData {
  title: string;
  blocks: ContentBlock[];
}

export interface TestsData {
  midterm: TestData;
  final: TestData;
}
