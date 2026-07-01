import re, pickle, json

with open("/home/claude/work/units_raw.pkl", "rb") as f:
    data = pickle.load(f)

HEADING_STOP_RE = re.compile(
    r'^\s*(?:[A-E]\.\s*)?(GRAMMAR(\s+AND\s+VOCABULARY)?|READING|WRITING|SPEAKING|LISTENING|'
    r'VOCABULARY\s+AND\s+GRAMMAR|Part\s+[IVX]+\.)', re.IGNORECASE
)

VOCAB_MARKER_RE = re.compile(r'^\s*(?:[IVXLC]+\.\s*)?VOCABULARY\s*:?\s*$', re.IGNORECASE)

VOCAB_ENTRY_RE = re.compile(r'^\s*(?:(\d{1,3})[\.\)]\s*|[●•\-]\s+)(\S.*)$')

def parse_vocab_block(lines):
    """lines: list of raw lines starting right after the 'VOCABULARY' marker.
    Returns (entries, consumed_line_count)"""
    entries = []
    i = 0
    cur = None
    auto_num = 0
    n = len(lines)
    started = False
    skip_budget = 3  # allow a couple of subtitle/blank lines before the first real entry
    while i < n:
        line = lines[i]
        stripped = line.strip()
        if stripped == "":
            i += 1
            continue
        m = VOCAB_ENTRY_RE.match(line)
        if m:
            started = True
            if cur:
                entries.append(cur)
            num, rest = m.group(1), m.group(2)
            auto_num += 1
            cur = {"num": int(num) if num else auto_num, "raw": rest}
            i += 1
            continue
        # is this a heading marking end of vocab block?
        if HEADING_STOP_RE.match(line):
            break
        # otherwise: could be a continuation of current vocab entry (wrapped line)
        if cur is not None and len(stripped) > 0:
            cur["raw"] += " " + stripped
            i += 1
            continue
        # not started yet: allow skipping a short subtitle/decorative line
        if not started and skip_budget > 0:
            skip_budget -= 1
            i += 1
            continue
        # unknown content before any entry parsed - stop to be safe
        break
    if cur:
        entries.append(cur)
    return entries, i

IPA_RE = re.compile(r'/([^/]+)/')
POS_RE = re.compile(r'^\s*((?:\([a-zA-Z\. ]{1,8}\)\s*/?\s*)+)\s*:?\s*(.*)$')

def structure_vocab_entry(raw):
    m = IPA_RE.search(raw)
    if m:
        term = raw[:m.start()].strip(" :-")
        remainder = raw[m.end():].strip()
        ipa = m.group(1).strip()
        pm = POS_RE.match(remainder)
        if pm:
            pos_raw = pm.group(1)
            pos = re.sub(r'[()]', '', pos_raw).replace('/', ', ').strip()
            pos = re.sub(r'\s+', ' ', pos)
            meaning = pm.group(2).strip(" :-")
        else:
            pos = ""
            meaning = remainder.strip(" :-")
        return {"term": term.strip(), "ipa": ipa, "pos": pos, "meaning": meaning}
    else:
        # fallback: no IPA present - try term (pos): meaning
        pm2 = re.match(r'^(.*?)\s*\(([a-zA-Z\. ]{1,8})\)\s*:?\s*(.*)$', raw)
        if pm2:
            return {"term": pm2.group(1).strip(), "ipa": "", "pos": pm2.group(2).strip(),
                     "meaning": pm2.group(3).strip(" :-")}
        if ":" in raw:
            term, meaning = raw.split(":", 1)
        else:
            parts = raw.split(None, 1)
            term = parts[0] if parts else raw
            meaning = parts[1] if len(parts) > 1 else ""
        return {"term": term.strip(), "ipa": "", "pos": "", "meaning": meaning.strip()}

def extract_vocab_for_unit(raw_unit_text):
    lines = raw_unit_text.split("\n")
    # find "VOCABULARY" marker line index (first occurrence near top)
    marker_idx = None
    for i, ln in enumerate(lines[:15]):
        if VOCAB_MARKER_RE.match(ln):
            marker_idx = i
            break
    if marker_idx is None:
        return [], raw_unit_text  # no vocab block found near start
    entries_raw, consumed = parse_vocab_block(lines[marker_idx+1:])
    entries = [structure_vocab_entry(e["raw"]) for e in entries_raw]
    body_start = marker_idx + 1 + consumed
    body = "\n".join(lines[body_start:])
    return entries, body

if __name__ == "__main__":
    unit1_hs = data["hs"][1]["raw"]
    vocab, body = extract_vocab_for_unit(unit1_hs)
    print(f"Found {len(vocab)} vocab entries")
    for v in vocab[:8]:
        print(v)
    print("...")
    for v in vocab[-3:]:
        print(v)
    print("\n--- body starts with ---")
    print("\n".join(body.split("\n")[:10]))
