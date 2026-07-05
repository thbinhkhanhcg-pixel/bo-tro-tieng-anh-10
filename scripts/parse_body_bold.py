import re
from parse_body import (
    MAJOR_HEADING_RE, is_table_line, looks_like_subheading,
    has_no_lowercase_letters, BULLET_RE, NUM_ITEM_RE
)

ROMAN_HEADING_RE = re.compile(
    r'^\s*((?:Exercise\s*\d+\.)|(?:Part\s+[IVXLC]+\.)|(?:Bài\s*\d+\s*:)|(?:[IVXLC]{1,6}[\.\)]))\s+(\S.+)$'
)

OPTION_TOKEN_RE = re.compile(r'\**([A-D])\.\s+')


def plain(line):
    return line.replace("**", "")


def classify_major_heading_b(line):
    return_val = None
    from parse_body import classify_major_heading
    return classify_major_heading(plain(line))


def find_option_tokens(line):
    """Find all valid option-letter tokens (A-D) in a line, tolerant of leading ** markers.
    A token is valid if immediately preceded by start-of-string or whitespace (ignoring any
    leading ** run right before the letter)."""
    matches = []
    for m in OPTION_TOKEN_RE.finditer(line):
        start = m.start()
        if start == 0 or line[start - 1].isspace():
            matches.append(m)
    return matches


def split_options_bold(line):
    """Return list of {'letter','text','bold'} for all options found on this line, or None."""
    tokens = find_option_tokens(line)
    if not tokens:
        return None
    opts = []
    for idx, m in enumerate(tokens):
        seg_start = m.start()
        seg_end = tokens[idx + 1].start() if idx + 1 < len(tokens) else len(line)
        segment = line[seg_start:seg_end]
        letter = m.group(1)
        content_start_in_seg = m.end() - seg_start
        text_part = segment[content_start_in_seg:]
        is_bold = "**" in segment
        clean_text = plain(text_part).strip()
        opts.append({"letter": letter, "text": clean_text, "bold": is_bold})
    return opts


LINE_STARTS_WITH_OPTION_RE = re.compile(r'^\s*\**\s*[A-D]\.\s')


def split_options_bold_strict(line):
    """Like split_options_bold, but only accepted when the option token is the very first
    thing on the line (ignoring leading whitespace/bold markers). This rejects prose
    sentences that merely happen to contain a lone 'X.' somewhere in the middle
    (e.g. 'Circle A, B, C or D.'), which are not option lists."""
    if not LINE_STARTS_WITH_OPTION_RE.match(line):
        return None
    return split_options_bold(line)


def extract_bold_spans(text):
    """Return list of bold substrings (answers) found within text, in order."""
    return re.findall(r'\*\*(.*?)\*\*', text)


def parse_body_bold(raw_body):
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
            if plain(text):
                answers = extract_bold_spans(text)
                blocks.append({"type": "p", "text": plain(text), "answers": answers})
        paragraph_buf = []

    def flush_table():
        nonlocal table_buf
        if table_buf:
            rows = [re.split(r'\s{2,}', plain(r).strip()) for r in table_buf]
            blocks.append({"type": "table", "rows": rows})
        table_buf = []

    cur_item = None

    def flush_item():
        nonlocal cur_item
        if cur_item is not None:
            raw_text = re.sub(r'\s+', ' ', cur_item["text"]).strip()
            clean_text = plain(raw_text)
            answers = extract_bold_spans(raw_text)
            opts = cur_item.get("options", [])
            item_type = "mcq" if opts else (
                "subheading" if looks_like_subheading(clean_text) else "exercise"
            )
            blocks.append({
                "type": "item",
                "itemType": item_type,
                "num": cur_item["num"],
                "text": clean_text,
                "answers": answers,       # bolded fill-in answers found within the stem (if any)
                "options": opts,          # each: {letter, text, bold(=correct)}
            })
        cur_item = None

    while i < n:
        raw_line = lines[i]
        line = raw_line.rstrip()
        stripped_plain = plain(line).strip()

        if stripped_plain == "":
            flush_paragraph()
            flush_table()
            flush_item()
            i += 1
            continue

        # Major heading (classification uses plain text)
        mh = classify_major_heading_b(line)
        if mh and not NUM_ITEM_RE.match(plain(line)):
            flush_paragraph(); flush_table(); flush_item()
            blocks.append({"type": "h2", "text": mh})
            i += 1
            continue

        # numbered item start ALWAYS begins a new item, even if the same line also
        # carries inline A/B/C/D options (e.g. "2. A. bathe   B. finance   C. program   D. cat").
        # This must be checked before the generic inline-option-continuation check below,
        # otherwise a fresh numbered question gets silently merged into whatever item was open.
        # A line with inline options overrides the "looks like a table" heuristic, since
        # wide column gaps between A/B/C/D options are exactly what makes it look table-ish.
        nm = NUM_ITEM_RE.match(plain(line))
        if nm:
            num_match = re.match(r'^\s*(\d{1,3})[\.\)]\s*', line)
            rest = line[num_match.end():] if num_match else plain(line)
            inline_opts_here = split_options_bold(rest)
            if inline_opts_here or not is_table_line(plain(line)):
                flush_paragraph(); flush_table(); flush_item()
                if inline_opts_here:
                    first_tok = find_option_tokens(rest)[0]
                    stem = rest[:first_tok.start()]
                    cur_item = {"num": nm.group(1), "text": stem, "options": inline_opts_here}
                else:
                    cur_item = {"num": nm.group(1), "text": rest}
                i += 1
                continue
            # else: falls through, likely a genuine table row without recognizable options

        # inline multi-option continuation line (only meaningful while inside an item).
        # Uses the STRICT variant: the line must literally start with the option letter,
        # otherwise a stray "X." inside a heading/instruction sentence gets misread.
        # Checked before roman-numeral heading, since a lone "C." collides with the
        # roman numeral for 100 and must be treated as an MCQ option instead.
        opts = split_options_bold_strict(line)
        if opts and cur_item is not None:
            cur_item.setdefault("options", [])
            cur_item["options"].extend(opts)
            i += 1
            continue

        # Roman-numeral / Part / Exercise / Bai heading
        rh = ROMAN_HEADING_RE.match(plain(line))
        if rh:
            flush_paragraph(); flush_table(); flush_item()
            blocks.append({"type": "h3", "text": (rh.group(1) + " " + rh.group(2)).strip()})
            i += 1
            continue

        # bullet
        bm = BULLET_RE.match(plain(line))
        if bm:
            flush_paragraph(); flush_table(); flush_item()
            bullet_match = re.match(r'^\s*[-•●]\s+', line)
            rest = line[bullet_match.end():] if bullet_match else plain(line)
            blocks.append({"type": "bullet", "text": plain(rest).strip(),
                            "answers": extract_bold_spans(rest)})
            i += 1
            continue

        # table-ish line - sticky once started (see parse_body.py for rationale)
        if is_table_line(plain(line)) or table_buf:
            flush_paragraph(); flush_item()
            table_buf.append(line)
            i += 1
            continue
        else:
            flush_table()

        # continuation text
        if cur_item is not None:
            cur_item["text"] += " " + line.strip()
        else:
            paragraph_buf.append(line.strip())
        i += 1

    flush_paragraph(); flush_table(); flush_item()
    return blocks


if __name__ == "__main__":
    import pickle
    from collections import Counter
    with open("/home/claude/work/units_raw.pkl", "rb") as f:
        data = pickle.load(f)
    raw = data["gvb"][1]["raw"]
    blocks = parse_body_bold(raw)
    print("total blocks", len(blocks))
    print(Counter(b["type"] for b in blocks))
    print(Counter(b.get("itemType") for b in blocks if b["type"] == "item"))
    mcqs = [b for b in blocks if b.get("itemType") == "mcq"]
    print("mcq count", len(mcqs))
    with_correct = [b for b in mcqs if any(o["bold"] for o in b["options"])]
    print("mcq with a bold(correct) option:", len(with_correct))
    for b in with_correct[:5]:
        print(b)
    exs = [b for b in blocks if b.get("itemType") == "exercise" and b["answers"]]
    print("\nexercise items with inline bold answer:", len(exs))
    for b in exs[:5]:
        print(b)
