import re, json

def find_unit_boundaries(lines, tolerate_bold=False):
    """Return list of (line_index, unit_number, title) for the 10 primary unit headings,
    using sequential-number logic to skip duplicate/secondary mentions."""
    boundaries = []
    expected = 1
    if tolerate_bold:
        pat = re.compile(r'^\s*\**\s*(UNIT|Unit)\s*(\d{1,2})\s*[:\.\-–—]\s*\**\s*(.*)$')
    else:
        pat = re.compile(r'^\s*(UNIT|Unit)\s*(\d{1,2})\s*[:\.\-–]\s*(.*)$')
    for i, ln in enumerate(lines):
        match_line = ln.replace("**", "") if tolerate_bold else ln
        m = pat.match(match_line)
        if not m:
            continue
        num = int(m.group(2))
        if num == expected:
            title = m.group(3).strip().replace("**", "").strip()
            boundaries.append((i, num, title))
            expected += 1
        if expected > 10:
            break
    return boundaries

def split_units(text, tolerate_bold=False):
    lines = text.split("\n")
    boundaries = find_unit_boundaries(lines, tolerate_bold=tolerate_bold)
    assert len(boundaries) == 10, f"Expected 10 units, found {len(boundaries)}: {boundaries}"
    units = {}
    for idx, (line_i, num, title) in enumerate(boundaries):
        start = line_i + 1
        end = boundaries[idx+1][0] if idx+1 < len(boundaries) else len(lines)
        body = "\n".join(lines[start:end]).strip("\n")
        units[num] = {"number": num, "title": title, "raw": body}
    return units

if __name__ == "__main__":
    with open("/home/claude/work/HS_clean.txt", encoding="utf-8") as f:
        hs_text = f.read()
    with open("/home/claude/work/GV_clean.txt", encoding="utf-8") as f:
        gv_text = f.read()
    with open("/home/claude/work/GV_bold_clean.txt", encoding="utf-8") as f:
        gvb_text = f.read()

    hs_units = split_units(hs_text)
    gv_units = split_units(gv_text)
    gvb_units = split_units(gvb_text, tolerate_bold=True)

    print("HS units:")
    for n, u in hs_units.items():
        print(n, "-", u["title"], "-", len(u["raw"].split(chr(10))), "lines")
    print("\nGV units:")
    for n, u in gv_units.items():
        print(n, "-", u["title"], "-", len(u["raw"].split(chr(10))), "lines")
    print("\nGV-bold units:")
    for n, u in gvb_units.items():
        print(n, "-", u["title"], "-", len(u["raw"].split(chr(10))), "lines")

    import pickle
    with open("/home/claude/work/units_raw.pkl", "wb") as f:
        pickle.dump({"hs": hs_units, "gv": gv_units, "gvb": gvb_units}, f)
