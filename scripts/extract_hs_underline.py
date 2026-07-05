import fitz
import re

def get_underline_rects(page):
    """Thin, wide horizontal rectangles/fills are underline strokes.
    Filters out small square-ish icon graphics (width not >> height)."""
    rects = []
    for d in page.get_drawings():
        r = d.get("rect")
        if r is None:
            continue
        w = r.width
        h = r.height
        if h <= 0:
            continue
        if 0 < h <= 2.0 and w >= 3 and w > h * 8:
            rects.append(r)
    return rects


def word_is_underlined(wbox, underline_rects):
    x0, y0, x1, y1 = wbox
    for r in underline_rects:
        # underline sits at/just below the word's baseline; check horizontal overlap
        # and that the rect's vertical position is close under the word's bottom edge
        horiz_overlap = min(x1, r.x1) - max(x0, r.x0)
        if horiz_overlap <= 0:
            continue
        if abs(r.y0 - y1) <= 4 or (y0 - 1 <= r.y0 <= y1 + 4):
            return True
    return False


def reconstruct_page_with_underline(page):
    underline_rects = get_underline_rects(page)
    d = page.get_text("dict")
    lines_out = []
    for block in d["blocks"]:
        for line in block.get("lines", []):
            pieces = []
            for span in line["spans"]:
                text = span["text"]
                if not text:
                    continue
                # split the span into words but keep original inter-word spacing
                # by walking the span's own word list via get_text("words") is more
                # accurate; approximate here by re-finding words within this span's bbox
                pieces.append((span["bbox"], text))
            if not pieces:
                continue
            lines_out.append((line["bbox"][1], pieces))  # keyed by top y for ordering
    return lines_out


def extract_document(pdf_path, max_pages=None):
    doc = fitz.open(pdf_path)
    all_lines = []
    n_pages = len(doc) if max_pages is None else min(max_pages, len(doc))
    for pno in range(n_pages):
        page = doc[pno]
        underline_rects = get_underline_rects(page)
        words = page.get_text("words")  # (x0,y0,x1,y1,text,block,line,word_no)
        # group words by (block, line) to preserve original line structure
        by_line = {}
        for w in words:
            key = (w[5], w[6])
            by_line.setdefault(key, []).append(w)
        # order lines by their first word's vertical position, then block/line id
        line_keys = sorted(by_line.keys(), key=lambda k: (by_line[k][0][1], k))
        for key in line_keys:
            ws = sorted(by_line[key], key=lambda w: w[0])
            pieces = []
            for w in ws:
                x0, y0, x1, y1, text = w[0], w[1], w[2], w[3], w[4]
                if word_is_underlined((x0, y0, x1, y1), underline_rects):
                    pieces.append("@@U@@" + text + "@@E@@")
                else:
                    pieces.append(text)
            all_lines.append(" ".join(pieces))
        all_lines.append("\f")
    return "\n".join(all_lines)


if __name__ == "__main__":
    import sys
    path = "/mnt/user-data/uploads/Bài_bổ_trợ_Global_Success_10_cho_HS.pdf"
    text = extract_document(path)
    with open("/home/claude/work/HS_underline.txt", "w", encoding="utf-8") as f:
        f.write(text)
    print("Total lines:", len(text.split("\n")))
    idx = text.find("Monday to Saturday")
    print(text[max(0, idx - 150):idx + 100])
    total_underlined = text.count("@@U@@")
    print("Total underlined word-runs found:", total_underlined)
