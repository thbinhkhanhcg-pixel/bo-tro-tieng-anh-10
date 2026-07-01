import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-line bg-paper-light/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-pine text-highlight font-display text-lg font-700 shadow-[3px_3px_0_var(--color-line)] transition-transform group-hover:-translate-y-0.5">
            GS
          </span>
          <span className="leading-tight">
            <span className="block font-display text-lg font-600 text-ink">
              Bổ Trợ Tiếng Anh 10
            </span>
            <span className="block font-mono-tag text-[11px] uppercase tracking-widest text-ink-soft">
              Global Success · Sách bổ trợ
            </span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 font-mono-tag text-sm uppercase tracking-wide text-ink-soft sm:flex">
          <Link href="/" className="hover:text-pine">
            Trang chủ
          </Link>
          <Link href="/#units" className="hover:text-pine">
            10 Units
          </Link>
          <Link href="/kiem-tra" className="hover:text-pine">
            Kiểm tra
          </Link>
        </nav>
      </div>
    </header>
  );
}
