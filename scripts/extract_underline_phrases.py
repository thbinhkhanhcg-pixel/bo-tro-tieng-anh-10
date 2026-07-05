import re
import json

UTOKEN_RE = re.compile(r'@@U@@(.*?)@@E@@')


def extract_underline_phrases(underline_txt_path):
    with open(underline_txt_path, encoding="utf-8") as f:
        lines = f.read().split("\n")

    phrases = set()
    for line in lines:
        if "@@U@@" not in line:
            continue
        tokens = line.split()
        total = len(tokens)
        underlined_count = sum(1 for t in tokens if "@@U@@" in t)
        if total == 0 or underlined_count >= total * 0.8:
            continue  # whole-line decorative underline (heading rule) -- skip

        # walk tokens, collecting contiguous runs of underlined words into phrases
        run = []
        for tok in tokens:
            m = UTOKEN_RE.fullmatch(tok)
            if m:
                run.append(m.group(1))
            else:
                if len(run) >= 3:
                    phrase = " ".join(run)
                    if len(phrase) >= 12:
                        phrases.add(phrase)
                run = []
        if len(run) >= 3:
            phrase = " ".join(run)
            if len(phrase) >= 12:
                phrases.add(phrase)

    return phrases


if __name__ == "__main__":
    phrases = extract_underline_phrases("/home/claude/work/HS_underline.txt")
    print("Total unique underline phrases:", len(phrases))
    sample = sorted(phrases, key=len)[:10]
    for s in sample:
        print(repr(s))
    with open("/home/claude/work/underline_phrases.json", "w", encoding="utf-8") as f:
        json.dump(sorted(phrases), f, ensure_ascii=False)
