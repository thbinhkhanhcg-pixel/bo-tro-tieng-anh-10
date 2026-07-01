import Link from "next/link";
import { getAllUnits } from "@/lib/content";

const TAB_COLORS = [
  "bg-pine",
  "bg-chalk-blue",
  "bg-brick",
  "bg-pine-dark",
  "bg-chalk-blue",
];

export default function Home() {
  const units = getAllUnits();

  return (
    <div>
      {/* HERO */}
      <section className="mx-auto max-w-6xl px-4 pt-14 pb-10 sm:px-6 sm:pt-20">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <span className="inline-block rounded-full border-2 border-pine px-3 py-1 font-mono-tag text-xs uppercase tracking-widest text-pine">
              Lớp 10 · Global Success · 10 Units
            </span>
            <h1 className="mt-5 font-display text-4xl font-700 leading-[1.08] text-ink sm:text-6xl">
              Sổ tay bổ trợ
              <br />
              <span className="italic text-pine">Tiếng&nbsp;Anh&nbsp;10</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-soft">
              Toàn bộ từ vựng, ngữ pháp và bài tập của{" "}
              <strong className="text-ink">10 Unit</strong> — trình bày lại
              từ tài liệu bổ trợ gốc, giữ nguyên nội dung, dễ tra cứu và tự
              luyện tập ngay trên trình duyệt.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="#units"
                className="rounded-md bg-pine px-6 py-3 font-mono-tag text-sm uppercase tracking-wide text-paper-light shadow-[4px_4px_0_var(--color-ink)] transition-transform hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--color-ink)]"
              >
                Bắt đầu học →
              </Link>
              <Link
                href="/kiem-tra"
                className="rounded-md border-2 border-ink px-6 py-3 font-mono-tag text-sm uppercase tracking-wide text-ink transition-colors hover:bg-ink hover:text-paper"
              >
                Kiểm tra giữa kỳ / cuối kỳ
              </Link>
            </div>
          </div>

          {/* signature: stacked workbook tabs preview */}
          <div className="relative mx-auto hidden h-64 w-full max-w-sm lg:block">
            {units.slice(0, 5).map((u, i) => (
              <div
                key={u.number}
                className={`absolute left-0 right-0 flex items-center justify-between rounded-md border-2 border-ink/80 px-5 py-4 shadow-[3px_3px_0_rgba(36,49,43,0.25)] ${TAB_COLORS[i]}`}
                style={{
                  top: `${i * 26}px`,
                  zIndex: 5 - i,
                }}
              >
                <span className="font-mono-tag text-xs text-paper-light/90">
                  UNIT {String(u.number).padStart(2, "0")}
                </span>
                <span className="truncate pl-3 font-display text-sm font-600 text-paper-light">
                  {u.titleVi}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* UNIT GRID */}
      <section id="units" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-baseline justify-between stitch pt-8">
          <h2 className="font-display text-2xl font-700 text-ink">
            10 Units
          </h2>
          <span className="font-mono-tag text-xs uppercase tracking-widest text-ink-soft">
            Chọn một Unit để học
          </span>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {units.map((u) => (
            <Link
              key={u.number}
              href={`/units/${u.number}`}
              className="tab-notch group relative flex flex-col justify-between rounded-lg border-2 border-ink/70 bg-paper-light p-5 pt-6 shadow-[4px_4px_0_var(--color-line)] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_var(--color-line)]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono-tag text-xs uppercase tracking-widest text-pine">
                    Unit {String(u.number).padStart(2, "0")}
                  </span>
                  <span className="font-mono-tag text-[11px] text-ink-soft">
                    {u.vocabulary.length} từ vựng
                  </span>
                </div>
                <h3 className="mt-2 font-display text-xl font-600 text-ink group-hover:text-pine">
                  {u.titleVi}
                </h3>
                <p className="mt-1 text-sm italic text-ink-soft">
                  {u.titleEn}
                </p>
              </div>
              <span className="mt-4 inline-flex w-fit items-center gap-1 font-mono-tag text-xs uppercase tracking-wide text-pine">
                Vào học <span aria-hidden>→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
