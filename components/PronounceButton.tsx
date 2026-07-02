"use client";

import { useEffect, useState } from "react";

function pickVoice(voices: SpeechSynthesisVoice[]) {
  return (
    voices.find((v) => v.lang === "en-GB") ||
    voices.find((v) => v.lang?.startsWith("en-GB")) ||
    voices.find((v) => v.lang?.startsWith("en")) ||
    voices[0]
  );
}

/** Shared hook: loads available browser TTS voices (list loads async in some browsers). */
export function useSpeechVoices() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      // one-time client-side feature detection; window is unavailable during SSR.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSupported(false);
      return;
    }
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () =>
      window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, []);

  return { voices, supported };
}

export function speakText(text: string, voices: SpeechSynthesisVoice[]) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  const v = pickVoice(voices);
  if (v) utter.voice = v;
  utter.lang = v?.lang || "en-GB";
  utter.rate = 0.85;
  window.speechSynthesis.speak(utter);
}

export default function PronounceButton({
  text,
  size = "md",
  className = "",
}: {
  text: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { voices, supported } = useSpeechVoices();
  const [playing, setPlaying] = useState(false);

  if (!supported) return null;

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    const v = pickVoice(voices);
    if (v) utter.voice = v;
    utter.lang = v?.lang || "en-GB";
    utter.rate = 0.85;
    utter.onstart = () => setPlaying(true);
    utter.onend = () => setPlaying(false);
    utter.onerror = () => setPlaying(false);
    window.speechSynthesis.speak(utter);
  }

  const dims =
    size === "lg"
      ? "h-11 w-11 text-lg"
      : size === "sm"
        ? "h-7 w-7 text-xs"
        : "h-9 w-9 text-sm";

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Nghe phát âm: ${text}`}
      title="Nghe phát âm"
      className={`inline-flex shrink-0 items-center justify-center rounded-full border-2 transition-colors ${dims} ${
        playing
          ? "border-chalk-blue bg-chalk-blue text-paper-light"
          : "border-chalk-blue/60 text-chalk-blue hover:border-chalk-blue hover:bg-chalk-blue hover:text-paper-light"
      } ${className}`}
    >
      {playing ? "🔊" : "🔈"}
    </button>
  );
}
