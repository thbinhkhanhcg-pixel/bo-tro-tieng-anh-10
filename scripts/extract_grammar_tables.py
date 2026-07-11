import fitz
import json

PDF_PATH = "/mnt/user-data/uploads/Bài_bổ_trợ_Global_Success_10_cho_HS.pdf"


def cluster_1d(values, gap_threshold):
    """Sort values and split into clusters wherever the gap between consecutive
    sorted values exceeds gap_threshold. Returns list of (min,max) per cluster."""
    vals = sorted(values)
    clusters = [[vals[0]]]
    for v in vals[1:]:
        if v - clusters[-1][-1] > gap_threshold:
            clusters.append([v])
        else:
            clusters[-1].append(v)
    return [(min(c), max(c)) for c in clusters]


def nearest_cluster(x, boundaries):
    best_i, best_d = 0, abs(x - boundaries[0][0])
    for i, (lo, hi) in enumerate(boundaries):
        d = 0 if lo <= x <= hi else min(abs(x - lo), abs(x - hi))
        if d < best_d:
            best_d, best_i = d, i
    return best_i


def group_physical_lines(words, y_tol=8):
    """Group words (each a tuple with y0 at index 1) into physical lines by y
    proximity, sorted top to bottom, words within a line sorted left to right."""
    lines = []
    for w in sorted(words, key=lambda w: (w[1], w[0])):
        placed = False
        for line in lines:
            if abs(line[0] - w[1]) <= y_tol:
                line[1].append(w)
                placed = True
                break
        if not placed:
            lines.append([w[1], [w]])
    lines.sort(key=lambda l: l[0])
    for _, ws in lines:
        ws.sort(key=lambda w: w[0])
    return lines


def find_column_boundaries(all_words, n_cols, page_width=612):
    """Determine true column split points by finding x-ranges that are NOT
    covered by any word across the WHOLE table region (a real column gap is
    empty on every row, unlike the natural word-to-word gaps within a column,
    which vary row to row)."""
    intervals = sorted((w[0], w[2]) for w in all_words)
    # merge overlapping/adjacent covered intervals
    merged = []
    for lo, hi in intervals:
        if merged and lo <= merged[-1][1] + 3:
            merged[-1] = (merged[-1][0], max(merged[-1][1], hi))
        else:
            merged.append((lo, hi))
    # gaps between merged covered intervals are candidate column separators
    gaps = []
    for i in range(len(merged) - 1):
        gap_start, gap_end = merged[i][1], merged[i + 1][0]
        gaps.append((gap_end - gap_start, gap_start, gap_end))
    gaps.sort(reverse=True)  # widest gaps first
    split_points = sorted(g[1] + (g[2] - g[1]) / 2 for g in gaps[: n_cols - 1])

    left_edge = min(w[0] for w in all_words) - 2
    right_edge = max(w[2] for w in all_words) + 2
    bounds = [left_edge] + split_points + [right_edge]
    return [(bounds[i], bounds[i + 1]) for i in range(len(bounds) - 1)]


def looks_like_new_section(ws, col1_end):
    """A line that starts well to the right of column 1 with digit+period pattern
    (e.g. "2. Cách dùng") signals the table has ended."""
    if not ws:
        return False
    first_word = ws[0][4]
    import re as _re
    return bool(_re.match(r'^\d{1,2}\.$', first_word)) and ws[0][0] <= col1_end + 40


def extract_table_at(page, header_y, n_content_rows=2, search_height=100):
    words = [w for w in page.get_text("words") if header_y - 1 <= w[1] <= header_y + search_height]
    phys_lines = group_physical_lines(words)
    if not phys_lines:
        return None

    header_words = phys_lines[0][1]

    # trim trailing physical lines that clearly belong to the NEXT section, so
    # they don't pollute column-gap detection
    approx_col1_end = header_words[0][2] + 60
    trimmed_lines = [phys_lines[0]]
    for y, ws in phys_lines[1:]:
        if looks_like_new_section(ws, approx_col1_end):
            break
        trimmed_lines.append((y, ws))

    # Only use the header line + the first content line to establish column
    # boundaries. Using every trimmed line (including a trailing note/aside that
    # doesn't follow the 3-column layout at all, e.g. "(will = 'll)" or a "Note:"
    # paragraph) corrupts the gap detection; two clean lines are already enough.
    boundary_source_lines = trimmed_lines[:2] if len(trimmed_lines) >= 2 else trimmed_lines
    table_words = [w for _, ws in boundary_source_lines for w in ws]
    col_bounds = find_column_boundaries(table_words, n_cols=3)
    n_cols = len(col_bounds)
    col1_end = col_bounds[0][1]

    header_cells = [[] for _ in range(n_cols)]
    for w in header_words:
        header_cells[nearest_cluster(w[0], col_bounds)].append(w[4])
    rows = [[" ".join(c) for c in header_cells]]

    row_cells = None
    rows_collected = 0
    for y, ws in trimmed_lines[1:]:
        starts_new_row = any(w[0] <= col1_end for w in ws if nearest_cluster(w[0], col_bounds) == 0)
        if starts_new_row or row_cells is None:
            if row_cells is not None:
                rows.append([" ".join(c).strip() for c in row_cells])
                rows_collected += 1
                if rows_collected >= n_content_rows:
                    break
            row_cells = [[] for _ in range(n_cols)]
        for w in ws:
            row_cells[nearest_cluster(w[0], col_bounds)].append(w[4])
    if row_cells is not None and rows_collected < n_content_rows:
        rows.append([" ".join(c).strip() for c in row_cells])

    return rows


def find_all_tables():
    doc = fitz.open(PDF_PATH)
    results = []
    for pno, page in enumerate(doc):
        for w in page.get_text("words"):
            if w[4] == "Affirmative":
                rows = extract_table_at(page, w[1])
                results.append({"page": pno + 1, "y": w[1], "rows": rows})
    return results


if __name__ == "__main__":
    tables = find_all_tables()
    print(f"Found {len(tables)} tables")
    for t in tables:
        print(f"\n=== page {t['page']} (y={t['y']:.0f}) ===")
        for row in t["rows"]:
            print("  ", row)
    with open("/home/claude/project/scripts/grammar_tables.json", "w", encoding="utf-8") as f:
        json.dump([t["rows"] for t in tables], f, ensure_ascii=False, indent=2)
