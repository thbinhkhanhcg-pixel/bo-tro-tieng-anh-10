import Link from "next/link";
import { getTests } from "@/lib/content";

export const metadata = {
  title: "Kiểm tra giữa kỳ & cuối kỳ | Bổ Trợ Tiếng Anh 10",
};

export default function KiemTraPage() {
  const tests = getTests();
  const cards = [
    {
      key: "giua-ky",
      title: tests.midterm.title,
      desc: "Tổng hợp kiến thức Unit 1 → 5, kèm đáp án gốc từ tài liệu giáo viên.",
      color: "bg-pine",
    },
    {
      key: "cuoi-ky",
      title: tests.final.title,
      desc: "Tổng hợp kiến thức Unit 6 → 10, kèm đáp án gốc từ tài liệu giáo viên.",
      color: "bg-chalk-blue",
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <span className="font-mono-tag text-xs uppercase tracking-widest text-pine">
        Ôn tập tổng hợp
      </span>
      <h1 className="mt-1 font-display text-3xl font-700 text-ink sm:text-4xl">
        Kiểm tra giữa kỳ &amp; cuối kỳ
      </h1>
      <p className="mt-3 max-w-2xl text-ink-soft leading-relaxed">
        Hai đề kiểm tra tổng hợp trích từ tài liệu bổ trợ dành cho giáo viên,
        giữ nguyên toàn bộ câu hỏi và đáp án gốc.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.key}
            href={`/kiem-tra/${c.key}`}
            className={`tab-notch group relative flex flex-col justify-between rounded-lg border-2 border-ink/70 p-6 pt-8 text-paper-light shadow-[4px_4px_0_var(--color-line)] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_var(--color-line)] ${c.color}`}
          >
            <div>
              <h2 className="font-display text-xl font-700">{c.title}</h2>
              <p className="mt-2 text-sm text-paper-light/90">{c.desc}</p>
            </div>
            <span className="mt-6 inline-flex w-fit items-center gap-1 font-mono-tag text-xs uppercase tracking-wide text-highlight">
              Xem đề &amp; đáp án <span aria-hidden>→</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
