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
  | { type: "p"; text: string; answers?: string[]; underline?: string[] }
  | { type: "bullet"; text: string; answers?: string[] }
  | { type: "table"; rows: string[][] }
  | {
      type: "cloze";
      text: string; // passage with {N} placeholders marking each blank
      blanks: string[]; // blank numbers in order, e.g. ["1","2",...]
      correctAnswers?: string[]; // verified answers, same order as blanks
    }
  | {
      type: "item";
      itemType: "mcq" | "exercise" | "subheading";
      num: string;
      text: string;
      options: OptionBlock[];
      answers?: string[];
      /** Verified correct option letter, cross-referenced from the teacher's file.
       *  Only present when a high-confidence match was found — never guessed. */
      correctLetter?: string;
      /** Verified correct fill-in answer(s), cross-referenced from the teacher's file. */
      correctAnswers?: string[];
      /** Substring(s) of `text` that are underlined in the original document
       *  (e.g. "make a question about the underlined part"). Best-effort:
       *  underlines are vector graphics in the PDF, recovered by matching
       *  known underlined phrases back into the text. */
      underline?: string[];
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
