"use client";

import { useEffect, useRef, useState } from "react";

// Minimal ambient typing for the (still-experimental) Web Speech Recognition API,
// which isn't part of TypeScript's default DOM lib.
interface SpeechRecognitionResultLike {
  transcript: string;
}
interface SpeechRecognitionEventLike extends Event {
  results: { [i: number]: { [j: number]: SpeechRecognitionResultLike; length: number } };
}
interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  maxAlternatives: number;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: Event) => void) | null;
  onend: (() => void) | null;
}

function getSpeechRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return (
    (w.SpeechRecognition as new () => SpeechRecognitionLike) ||
    (w.webkitSpeechRecognition as new () => SpeechRecognitionLike) ||
    null
  );
}

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s]/g, "")
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

function isCloseMatch(target: string, heard: string): boolean {
  const t = normalize(target);
  const h = normalize(heard);
  if (!t || !h) return false;
  if (t === h || h.includes(t)) return true;
  if (!t.includes(" ")) {
    const dist = levenshtein(t, h);
    const threshold = Math.max(1, Math.floor(t.length * 0.3));
    return dist <= threshold;
  }
  return false;
}

type Status = "idle" | "listening" | "correct" | "wrong" | "unsupported" | "error";

export default function MicCheckButton({
  text,
  alreadyCorrect = false,
  onCorrect,
}: {
  text: string;
  alreadyCorrect?: boolean;
  onCorrect?: () => void;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    if (!getSpeechRecognitionCtor()) {
      // one-time client-side feature detection; the API is unavailable during SSR.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("unsupported");
    }
    return () => {
      recRef.current?.stop();
    };
  }, []);

  const effectiveStatus: Status = alreadyCorrect && status === "idle" ? "correct" : status;

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setStatus("unsupported");
      return;
    }
    if (status === "listening") return;

    const rec = new Ctor();
    recRef.current = rec;
    rec.lang = "en-US";
    rec.maxAlternatives = 3;
    rec.interimResults = false;
    setStatus("listening");

    rec.onresult = (event) => {
      const list = event.results[0];
      const alts: string[] = [];
      for (let i = 0; i < list.length; i++) alts.push(list[i].transcript);
      const matched = alts.some((a) => isCloseMatch(text, a));
      if (matched) {
        setStatus("correct");
        onCorrect?.();
      } else {
        setStatus("wrong");
        setTimeout(() => setStatus("idle"), 1600);
      }
    };
    rec.onerror = () => {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 1600);
    };
    rec.onend = () => {
      setStatus((s) => (s === "listening" ? "idle" : s));
    };
    rec.start();
  }

  if (effectiveStatus === "unsupported") {
    return (
      <span
        title="Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói — hãy thử Google Chrome trên máy tính hoặc Android."
        className="inline-flex items-center gap-1.5 rounded-full border-2 border-line px-3 py-1.5 font-mono-tag text-xs text-ink-soft/60"
      >
        🎙️ Không hỗ trợ
      </span>
    );
  }

  const labelMap: Record<Status, string> = {
    idle: "🎙️ Kiểm tra phát âm",
    listening: "🔴 Đang nghe...",
    correct: "✅ Chính xác!",
    wrong: "❌ Thử lại nhé",
    error: "⚠️ Không nghe rõ",
    unsupported: "",
  };

  const styleMap: Record<Status, string> = {
    idle: "border-chalk-blue text-chalk-blue hover:bg-chalk-blue hover:text-paper-light",
    listening: "border-brick bg-brick text-paper-light animate-pulse",
    correct: "border-pine bg-pine text-paper-light",
    wrong: "border-brick text-brick",
    error: "border-line text-ink-soft",
    unsupported: "",
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={effectiveStatus === "listening"}
      className={`inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 font-mono-tag text-xs uppercase tracking-wide transition-colors ${styleMap[effectiveStatus]}`}
    >
      {labelMap[effectiveStatus]}
    </button>
  );
}
