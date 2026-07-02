export function normalizeAnswer(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, (m, offset, str) => {
      // keep Vietnamese diacritics (answers here are English, but be safe for
      // any mixed content) — only strip combining marks on plain a-z bases
      return /[a-z]/.test(str[offset - 1] ?? "") ? "" : m;
    })
    .replace(/[.,!?;:"'()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}

/** Lenient equality check for free-text exercise answers: exact match after
 * normalization, or a small edit-distance allowance scaled to answer length
 * (forgives minor typos/spacing without accepting wrong answers). */
export function isAnswerCorrect(given: string, accepted: string[]): boolean {
  const g = normalizeAnswer(given);
  if (!g) return false;
  return accepted.some((ans) => {
    const a = normalizeAnswer(ans);
    if (!a) return false;
    if (g === a) return true;
    const threshold = a.length <= 4 ? 0 : Math.max(1, Math.floor(a.length * 0.15));
    return levenshtein(g, a) <= threshold;
  });
}
