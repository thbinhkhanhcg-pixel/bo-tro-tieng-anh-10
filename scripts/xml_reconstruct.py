import xml.etree.ElementTree as ET
import re
import html

def node_text_and_bold(text_el):
    """Return list of (text, is_bold) runs within one <text> element."""
    runs = []
    # direct text before any child
    if text_el.text:
        runs.append((text_el.text, False))
    for child in text_el:
        seg = "".join(child.itertext())
        is_bold = (child.tag == "b")
        if seg:
            runs.append((seg, is_bold))
        if child.tail:
            runs.append((child.tail, False))
    if not runs and text_el.text is None:
        runs = []
    return runs

def reconstruct_page_lines(page_el, line_tol=3):
    text_els = page_el.findall("text")
    items = []
    for t in text_els:
        top = float(t.attrib.get("top", 0))
        left = float(t.attrib.get("left", 0))
        width = float(t.attrib.get("width", 0))
        runs = node_text_and_bold(t)
        if not runs:
            continue
        items.append((top, left, width, runs))
    items.sort(key=lambda x: (x[0], x[1]))

    lines = []  # list of (top, [(left, width, runs)])
    for top, left, width, runs in items:
        placed = False
        for line in lines:
            if abs(line[0] - top) <= line_tol:
                line[1].append((left, width, runs))
                placed = True
                break
        if not placed:
            lines.append([top, [(left, width, runs)]])

    lines.sort(key=lambda l: l[0])
    out_lines = []
    for top, parts in lines:
        parts.sort(key=lambda p: p[0])
        # reconstruct line string with bold markers, inserting spacing based on left gaps
        pieces = []
        prev_right = None
        for left, width, runs in parts:
            # gap detection using the PDF's own reported run width (accurate), not an
            # estimate from character count -- character-count estimates drift enough
            # (bold/serif glyph widths vary) to inject phantom multi-space gaps into
            # ordinary prose, which later gets misread as a table by is_table_line().
            if prev_right is not None:
                gap = left - prev_right
                if gap > 15:
                    pieces.append("    ")  # big gap -> column separation
            for seg, is_bold in runs:
                if seg == "":
                    continue
                if is_bold and seg.strip() != "":
                    pieces.append("@@B@@" + seg + "@@E@@")
                else:
                    pieces.append(seg)
            prev_right = left + width if width > 0 else left + sum(len(s) for s, _ in runs) * 6
        line_str = "".join(pieces)
        line_str = html.unescape(line_str)
        out_lines.append(line_str)
    return out_lines

def reconstruct_document(xml_path):
    tree = ET.parse(xml_path)
    root = tree.getroot()
    all_lines = []
    for page in root.findall("page"):
        page_lines = reconstruct_page_lines(page)
        all_lines.extend(page_lines)
        all_lines.append("\f")  # form feed marker between pages
    return "\n".join(all_lines)

if __name__ == "__main__":
    text = reconstruct_document("/home/claude/work/xml_gv/gv.xml")
    with open("/home/claude/work/GV_bold.txt", "w", encoding="utf-8") as f:
        f.write(text)
    print("Total lines:", len(text.split(chr(10))))
    # quick sanity check around the MCQ example
    idx = text.find("never takes")
    print(text[max(0,idx-200):idx+300])
