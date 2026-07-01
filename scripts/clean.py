import re

def convert_bold_markers(text):
    text = text.replace("@@B@@", "**").replace("@@E@@", "**")
    # collapse adjacent bold runs with no gap: "**text1****text2**" -> "**text1text2**"
    prev = None
    while prev != text:
        prev = text
        text = text.replace("****", "")
    return text

def clean_lines(raw_text):
    lines = raw_text.split("\n")
    out = []
    for ln in lines:
        s = ln.rstrip()
        stripped = s.strip()
        if stripped == "":
            out.append("")
            continue
        if stripped == "\f":
            continue
        # remove form-feed char if attached
        s = s.replace("\f", "")
        stripped = s.strip()
        if stripped == "":
            out.append("")
            continue
        # footer: [AUTHOR NAME]  <pagenum>
        if re.fullmatch(r"\[AUTHOR NAME\]\s*\d*", stripped):
            continue
        # watermark ad line (may have prefix like "TEST 3" or "KEY :")
        if "cảm ơn thầy cô đã tham khảo tài liệu của Lê Tú" in stripped:
            # strip watermark part, keep any real prefix content before it if meaningful
            prefix = stripped.split("Lê Tú cảm ơn")[0].strip()
            if prefix and prefix not in ("KEY", "KEY :", "KEY:"):
                out.append(prefix)
            continue
        # pure page number line
        if re.fullmatch(r"\d{1,4}", stripped):
            continue
        out.append(s)
    return "\n".join(out)

if __name__ == "__main__":
    for name in ["HS", "GV"]:
        with open(f"/home/claude/work/{name}.txt", encoding="utf-8") as f:
            raw = f.read()
        cleaned = clean_lines(raw)
        with open(f"/home/claude/work/{name}_clean.txt", "w", encoding="utf-8") as f:
            f.write(cleaned)
        print(name, "done", len(cleaned.split(chr(10))))

    # also clean the bold-annotated GV reconstruction
    with open("/home/claude/work/GV_bold.txt", encoding="utf-8") as f:
        raw = f.read()
    raw = convert_bold_markers(raw)
    cleaned = clean_lines(raw)
    with open("/home/claude/work/GV_bold_clean.txt", "w", encoding="utf-8") as f:
        f.write(cleaned)
    print("GV_bold done", len(cleaned.split(chr(10))))
