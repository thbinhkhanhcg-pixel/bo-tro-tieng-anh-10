import re, pickle, json

KEY_MARKER_RE = re.compile(
    r'^\s*\*?\s*(?:'
    r'KEY(?:\s+Bài\s*\d+\s*:.*)?'
    r'|Đáp án.*'
    r'|.*TERM\s+TEST\s*-?\s*KEY\s*'
    r'|.*ANSWER\s+KEY\s*'
    r')\s*$', re.IGNORECASE
)
BAI_LINE_RE = re.compile(r'^\s*Bài\s*\d+\s*:', re.IGNORECASE)

from parse_body import classify_major_heading, NUM_ITEM_RE


def extract_answer_segments(unit_raw_text):
    lines = unit_raw_text.split("\n")
    segments = []
    i = 0
    n = len(lines)
    while i < n:
        line = lines[i]
        if KEY_MARKER_RE.match(line):
            label = line.strip().lstrip("*").strip()
            content_lines = []
            j = i + 1
            while j < n:
                lj = lines[j]
                if KEY_MARKER_RE.match(lj):
                    break
                mh = classify_major_heading(lj)
                if mh and not NUM_ITEM_RE.match(lj):
                    break
                content_lines.append(lj)
                j += 1
            content = "\n".join(content_lines).strip("\n")
            if content.strip():
                segments.append({"label": label, "content": content})
            i = j
        else:
            i += 1
    return segments


if __name__ == "__main__":
    with open("/home/claude/work/units_raw.pkl", "rb") as f:
        data = pickle.load(f)
    total = 0
    for n in range(1, 11):
        segs = extract_answer_segments(data["gv"][n]["raw"])
        total += len(segs)
        if segs:
            print(f"=== unit {n} ({data['gv'][n]['title']}) -> {len(segs)} answer segments ===")
            for s in segs:
                print("  -", s["label"][:70], f"({len(s['content'])} chars)")
    print("TOTAL segments:", total)
