import json, pickle, re, sys
sys.path.insert(0, "/home/claude/project/scripts")
from parse_vocab import extract_vocab_for_unit
from parse_body import parse_body
from parse_body_bold import parse_body_bold, plain

with open("/home/claude/work/units_raw.pkl", "rb") as f:
    data = pickle.load(f)

UNIT_TITLES_VI = {
    1: "Đời sống gia đình",
    2: "Con người và môi trường",
    3: "Âm nhạc",
    4: "Vì một cộng đồng tốt đẹp hơn",
    5: "Những phát minh",
    6: "Bình đẳng giới",
    7: "Việt Nam và các tổ chức quốc tế",
    8: "Phương pháp học tập mới",
    9: "Bảo vệ môi trường",
    10: "Du lịch sinh thái",
}

def block_char_count(blocks):
    total = 0
    for b in blocks:
        if b["type"] == "p":
            total += len(b["text"])
        elif b["type"] == "item":
            total += len(b["text"]) + sum(len(o.get("text","")) for o in b.get("options",[]))
        elif b["type"] == "bullet":
            total += len(b["text"])
        elif b["type"] == "table":
            total += sum(len(c) for row in b["rows"] for c in row)
        elif b["type"] in ("h2","h3"):
            total += len(b["text"])
    return total


def build_answer_index(answer_blocks):
    """Map (h2, h3, item_num) -> first matching GV item block, for high-confidence
    cross-referencing of student (HS) exercise items to their teacher (GV) counterpart."""
    index = {}
    h2 = h3 = None
    for b in answer_blocks:
        if b["type"] == "h2":
            h2 = b["text"]; h3 = None
        elif b["type"] == "h3":
            h3 = b["text"]
        elif b["type"] == "item":
            key = (h2, h3, b["num"])
            if key not in index:
                index[key] = b
    return index


def enrich_with_answers(practice_blocks, answer_index):
    """Attach a verified correct answer to each HS exercise item where a matching,
    unambiguous GV counterpart with a detected (bold-marked) answer exists.
    Never invents an answer: items without a confident match are left un-graded
    and the frontend must treat them as practice-only."""
    h2 = h3 = None
    enriched = []
    stats = {"mcq_total": 0, "mcq_graded": 0, "exercise_total": 0, "exercise_graded": 0}
    for b in practice_blocks:
        nb = dict(b)
        if b["type"] == "h2":
            h2 = b["text"]; h3 = None
        elif b["type"] == "h3":
            h3 = b["text"]
        elif b["type"] == "item":
            if b["itemType"] == "mcq":
                stats["mcq_total"] += 1
            elif b["itemType"] == "exercise":
                stats["exercise_total"] += 1
            match = answer_index.get((h2, h3, b["num"]))
            if match:
                if b["itemType"] == "mcq" and b.get("options"):
                    correct = next(
                        (o["letter"] for o in match.get("options", []) if o.get("bold")),
                        None,
                    )
                    # only trust the match if option letters correspond 1:1 (same set of
                    # letters), guarding against a section-drift mismatch slipping through
                    hs_letters = {o["letter"] for o in b["options"]}
                    gv_letters = {o["letter"] for o in match.get("options", [])}
                    if correct and hs_letters == gv_letters:
                        nb["correctLetter"] = correct
                        stats["mcq_graded"] += 1
                elif b["itemType"] == "exercise" and match.get("answers"):
                    nb["correctAnswers"] = match["answers"]
                    stats["exercise_graded"] += 1
        enriched.append(nb)
    return enriched, stats


units_out = {}
for n in range(1, 11):
    hs_raw = data["hs"][n]["raw"]
    gvb_raw = data["gvb"][n]["raw"]

    vocab, hs_body_raw = extract_vocab_for_unit(hs_raw)
    practice_blocks = parse_body(hs_body_raw)

    # For GV-bold, vocab block is same content (redundant) -- strip markers before locating
    _, gvb_body_raw = extract_vocab_for_unit(plain(gvb_raw))
    # plain() strips bold markers which would break vocab marker detection alignment,
    # so instead locate the vocab-end offset via the plain unit and reuse bold raw from there.
    # Simpler & safe: just run parse_body_bold on the FULL gvb_raw (including vocab section);
    # vocab entries will appear as generic items/paragraphs there, which is fine since this
    # tab is meant to show the complete original GV content anyway.
    answer_blocks = parse_body_bold(gvb_raw)

    answer_index = build_answer_index(answer_blocks)
    practice_blocks, stats = enrich_with_answers(practice_blocks, answer_index)

    units_out[n] = {
        "number": n,
        "titleEn": data["hs"][n]["title"].strip(),
        "titleVi": UNIT_TITLES_VI[n],
        "vocabulary": vocab,
        "practiceBlocks": practice_blocks,
        "answerBlocks": answer_blocks,
    }

    hs_chars = len(hs_raw)
    parsed_chars = sum(len(v.get("term","")+v.get("meaning","")+v.get("pos","")+v.get("ipa","")) for v in vocab) + block_char_count(practice_blocks)
    print(f"Unit {n}: HS raw {hs_chars} chars | parsed(vocab+practice) ~{parsed_chars} chars | "
          f"vocab={len(vocab)} practiceBlocks={len(practice_blocks)} answerBlocks={len(answer_blocks)} | "
          f"MCQ graded {stats['mcq_graded']}/{stats['mcq_total']} | "
          f"Exercise graded {stats['exercise_graded']}/{stats['exercise_total']}")

# ---- Extract the two cumulative tests (mid-term / final) from Unit 5 and Unit 10 answerBlocks ----
def extract_cumulative_test(blocks, key_marker_regex):
    key_idx = None
    for idx, b in enumerate(blocks):
        if b["type"] == "h2" and re.match(key_marker_regex, b["text"]):
            key_idx = idx
            break
    if key_idx is None:
        return None
    # walk backward to nearest "TEST N" h2/h3 heading
    start_idx = None
    for idx in range(key_idx - 1, -1, -1):
        b = blocks[idx]
        if b["type"] in ("h2", "h3") and re.match(r'^TEST\s*\d+', b["text"]):
            start_idx = idx
            break
    if start_idx is None:
        start_idx = 0
    return blocks[start_idx:]

midterm_blocks = extract_cumulative_test(units_out[5]["answerBlocks"], r'^MIDDLE TERM TEST')
final_blocks = extract_cumulative_test(units_out[10]["answerBlocks"], r'^THE SECOND TERM TEST')

print("\nMidterm test blocks:", len(midterm_blocks) if midterm_blocks else 0)
print("Final test blocks:", len(final_blocks) if final_blocks else 0)

tests_out = {
    "midterm": {
        "title": "Kiểm tra giữa kỳ (Units 1–5)",
        "blocks": midterm_blocks or [],
    },
    "final": {
        "title": "Kiểm tra cuối kỳ (Units 6–10)",
        "blocks": final_blocks or [],
    },
}

with open("/home/claude/project/data/units.json", "w", encoding="utf-8") as f:
    json.dump(units_out, f, ensure_ascii=False, indent=None)
with open("/home/claude/project/data/tests.json", "w", encoding="utf-8") as f:
    json.dump(tests_out, f, ensure_ascii=False, indent=None)

import os
print("\nunits.json size:", os.path.getsize("/home/claude/project/data/units.json"), "bytes")
print("tests.json size:", os.path.getsize("/home/claude/project/data/tests.json"), "bytes")
