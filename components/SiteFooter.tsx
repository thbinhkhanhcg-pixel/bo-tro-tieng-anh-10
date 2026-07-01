export default function SiteFooter() {
  return (
    <footer className="stitch mt-16 bg-paper-light">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-ink-soft sm:px-6">
        <p>
          Nội dung học tập được biên soạn dựa trên tài liệu{" "}
          <span className="font-600 text-ink">
            Bài bổ trợ Global Success 10
          </span>{" "}
          (bản dành cho học sinh &amp; giáo viên), trình bày lại để tiện tra
          cứu và tự luyện tập.
        </p>
        <p className="mt-2 font-mono-tag text-xs uppercase tracking-widest text-ink-soft/70">
          Made for Vietnamese Grade-10 English learners
        </p>
      </div>
    </footer>
  );
}
