import re

MAJOR_HEADING_RE = re.compile(
    r'^\s*(?:[A-E]\.\s*|Part\s+[IVXLC]+\.\s*|TEST\s*\d*\s*[:\.]?\s*)?'
    r'([A-ZÀ-Ỹ][A-ZÀ-Ỹ0-9\s&,\'/\-\.\(\):]{1,70})$'
)
ROMAN_HEADING_RE = re.compile(
    r'^\s*((?:Exercise\s*\d+\.)|(?:Part\s+[IVXLC]+\.)|(?:Bài\s*\d+\s*:)|(?:[IVXLC]{1,6}[\.\)]))\s+(\S.+)$'
)
NUM_ITEM_RE = re.compile(r'^\s*(\d{1,3})[\.\)]\s*(.*)$')
BULLET_RE = re.compile(r'^\s*[-•●]\s+(\S.*)$')

# option patterns
OPT_INLINE_SPLIT_RE = re.compile(r'(?=(?<!\S)[A-D]\.\s)')
OPT_SINGLE_RE = re.compile(r'^\s*([A-D])\.\s+(.*)$')


def has_no_lowercase_letters(s):
    letters = [c for c in s if c.isalpha()]
    if not letters:
        return False
    return all(not c.islower() for c in letters)


def classify_major_heading(line):
    stripped = line.strip()
    if len(stripped) < 2 or len(stripped) > 80:
        return None
    m = MAJOR_HEADING_RE.match(stripped)
    if not m:
        return None
    if not has_no_lowercase_letters(stripped):
        return None
    if not re.search(r'[A-ZÀ-Ỹ]{2,}', stripped):
        return None
    return stripped


def try_split_inline_options(line):
    """If a line contains 2-4 lettered options separated by whitespace columns, split them."""
    parts = OPT_INLINE_SPLIT_RE.split(line)
    parts = [p.strip() for p in parts if p.strip()]
    opts = []
    for p in parts:
        m = OPT_SINGLE_RE.match(p)
        if m:
            opts.append({"letter": m.group(1), "text": m.group(2).strip()})
    if 2 <= len(opts) <= 4 and len(opts) == len(parts):
        return opts
    return None


def is_table_line(line):
    return len(re.findall(r'\s{3,}', line.strip())) >= 2 and len(line.strip()) > 20


def looks_like_subheading(text):
    """Numbered theory sub-point like '1. Cấu trúc (Form)' vs an exercise question."""
    if len(text) > 48:
        return False
    if re.search(r'[…_]{2,}|\.{4,}|\?\s*$', text):
        return False
    if re.search(r'\(.*\)\s*$', text) and len(text.split()) <= 6:
        return True
    if len(text.split()) <= 6:
        return True
    return False


def parse_body(raw_body):
    lines = raw_body.split("\n")
    blocks = []
    i = 0
    n = len(lines)

    paragraph_buf = []
    table_buf = []

    def flush_paragraph():
        nonlocal paragraph_buf
        if paragraph_buf:
            text = " ".join(x.strip() for x in paragraph_buf if x.strip())
            text = re.sub(r'\s+', ' ', text).strip()
            if text:
                blocks.append({"type": "p", "text": text})
        paragraph_buf = []

    def flush_table():
        nonlocal table_buf
        if table_buf:
            rows = [re.split(r'\s{2,}', r.strip()) for r in table_buf]
            blocks.append({"type": "table", "rows": rows})
        table_buf = []

    cur_item = None

    def flush_item():
        nonlocal cur_item
        if cur_item is not None:
            text = re.sub(r'\s+', ' ', cur_item["text"]).strip()
            item_type = "mcq" if cur_item.get("options") else (
                "subheading" if looks_like_subheading(text) else "exercise"
            )
            blocks.append({
                "type": "item",
                "itemType": item_type,
                "num": cur_item["num"],
                "text": text,
                "options": cur_item.get("options", []),
            })
        cur_item = None

    while i < n:
        raw_line = lines[i]
        line = raw_line.rstrip()
        stripped = line.strip()

        if stripped == "":
            flush_paragraph()
            flush_table()
            flush_item()
            i += 1
            continue

        # Major (top-level) heading
        mh = classify_major_heading(line)
        if mh and not NUM_ITEM_RE.match(line):
            flush_paragraph(); flush_table(); flush_item()
            blocks.append({"type": "h2", "text": mh})
            i += 1
            continue

        # numbered item start ALWAYS begins a new item, even if the same line also
        # carries inline A/B/C/D options (e.g. "2. A. bathe   B. finance   C. program   D. cat").
        # A line with inline options overrides the "looks like a table" heuristic, since
        # wide column gaps between A/B/C/D options are exactly what makes it look table-ish.
        nm = NUM_ITEM_RE.match(line)
        if nm:
            rest = nm.group(2)
            inline_opts_here = try_split_inline_options(rest)
            if inline_opts_here or not is_table_line(line):
                flush_paragraph(); flush_table(); flush_item()
                if inline_opts_here:
                    first_opt_pos = OPT_SINGLE_RE.match(
                        OPT_INLINE_SPLIT_RE.split(rest)[0]
                    )
                    # stem is whatever precedes the first "A." token
                    m0 = re.search(r'(?<!\S)A\.\s', rest)
                    stem = rest[:m0.start()] if m0 else ""
                    cur_item = {"num": nm.group(1), "text": stem, "options": inline_opts_here}
                else:
                    cur_item = {"num": nm.group(1), "text": rest}
                i += 1
                continue
            # else: falls through, likely a genuine table row without recognizable options

        # inline multi-option line (only meaningful while inside an item or right after one)
        # checked BEFORE roman-numeral heading, since a lone "C." collides with the
        # roman numeral for 100 and must be treated as an MCQ option instead.
        inline_opts = try_split_inline_options(line)
        if inline_opts and (cur_item is not None):
            cur_item.setdefault("options", [])
            cur_item["options"].extend(inline_opts)
            i += 1
            continue

        # single option-per-line, e.g. "   A. text" — must start right at the letter,
        # otherwise a stray "X." inside a heading/instruction sentence gets misread.
        so = OPT_SINGLE_RE.match(line)
        if so and cur_item is not None:
            cur_item.setdefault("options", [])
            cur_item["options"].append({"letter": so.group(1), "text": so.group(2).strip()})
            i += 1
            continue

        # Roman-numeral / Part / Exercise heading
        rh = ROMAN_HEADING_RE.match(line)
        if rh:
            flush_paragraph(); flush_table(); flush_item()
            blocks.append({"type": "h3", "text": (rh.group(1) + " " + rh.group(2)).strip()})
            i += 1
            continue

        # bullet list item (always ends any open item - bullets are theory content, not exercise continuation)
        bm = BULLET_RE.match(line)
        if bm:
            flush_paragraph(); flush_table(); flush_item()
            blocks.append({"type": "bullet", "text": bm.group(1).strip()})
            i += 1
            continue

        # table-ish line (multi-column spacing) - ends any open item too
        if is_table_line(line):
            flush_paragraph(); flush_item()
            table_buf.append(line)
            i += 1
            continue
        else:
            flush_table()

        # otherwise: continuation text
        if cur_item is not None:
            cur_item["text"] += " " + stripped
        else:
            paragraph_buf.append(stripped)
        i += 1

    flush_paragraph(); flush_table(); flush_item()
    return blocks


if __name__ == "__main__":
    import pickle, json
    from parse_vocab import extract_vocab_for_unit
    with open("/home/claude/work/units_raw.pkl", "rb") as f:
        data = pickle.load(f)
    vocab, body = extract_vocab_for_unit(data["hs"][1]["raw"])
    blocks = parse_body(body)
    print(f"Total blocks: {len(blocks)}")
    from collections import Counter
    print(Counter(b["type"] for b in blocks))
    print(Counter(b.get("itemType") for b in blocks if b["type"] == "item"))
    print("\n--- first 40 blocks ---")
    for b in blocks[:40]:
        print(b)
