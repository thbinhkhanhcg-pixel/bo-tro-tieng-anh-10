# Bổ Trợ Tiếng Anh 10 — Global Success

Website học tập &amp; luyện tập Tiếng Anh 10 (Global Success), xây dựng bằng
**Next.js 16 (App Router) + TypeScript + Tailwind CSS v4**.

Toàn bộ nội dung (từ vựng, ngữ pháp, bài tập, đáp án) được trích xuất **nguyên
văn** từ 2 tài liệu gốc:

- `Bài bổ trợ Global Success 10 cho HS.pdf` → nội dung học &amp; luyện tập
  (không có đáp án, để học sinh tự làm).
- `Bài bổ trợ Global Success 10 cho GV.pdf` → nội dung đầy đủ + **đáp án
  đúng** (đáp án được phát hiện tự động dựa trên định dạng **in đậm** trong
  file PDF gốc — đúng với cách giáo viên đánh dấu đáp án) + 2 bài kiểm tra
  giữa kỳ / cuối kỳ.

## Cấu trúc dự án

```
app/                   Next.js App Router pages
  page.tsx             Trang chủ — danh sách 10 Unit
  units/[id]/page.tsx  Trang chi tiết 1 Unit (3 tab: Từ vựng / Luyện tập / Đáp án)
  kiem-tra/            Trang kiểm tra giữa kỳ & cuối kỳ
components/            Các component giao diện (VocabList, PracticeBlocks, AnswerBlocks, ...)
data/units.json        Dữ liệu 10 Unit (đã xử lý từ PDF gốc)
data/tests.json        Dữ liệu 2 bài kiểm tra tổng hợp
lib/                   Kiểu dữ liệu & hàm tải nội dung
```

## Chạy thử ở máy local

Yêu cầu: [Node.js](https://nodejs.org) ≥ 18.

```bash
npm install
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # build production
npm run start   # chạy bản build production
```

## Đưa code lên GitHub

```bash
git init
git add .
git commit -m "Initial commit: website bổ trợ Tiếng Anh 10"
git branch -M main
git remote add origin https://github.com/<ten-tai-khoan>/<ten-repo>.git
git push -u origin main
```

> Nếu chưa có repo trên GitHub: vào [github.com/new](https://github.com/new),
> đặt tên repo, **không** tick "Initialize with README" (vì đã có sẵn), rồi
> làm theo hướng dẫn "…or push an existing repository from the command line"
> mà GitHub hiển thị (chính là các lệnh ở trên).

## Deploy lên Vercel (khuyến nghị — tối ưu sẵn cho Next.js)

**Cách 1 — qua giao diện web (không cần cài gì thêm):**

1. Vào [vercel.com](https://vercel.com) → đăng nhập bằng tài khoản GitHub.
2. Bấm **Add New → Project**, chọn repo vừa push ở bước trên.
3. Vercel tự nhận diện đây là dự án Next.js — giữ nguyên cấu hình mặc định,
   bấm **Deploy**.
4. Sau khoảng 1–2 phút, Vercel cấp cho bạn một đường link dạng
   `https://ten-repo.vercel.app` — vào là dùng được ngay.
5. Mỗi lần bạn `git push` code mới lên GitHub, Vercel sẽ tự động build &amp;
   deploy lại.

**Cách 2 — qua dòng lệnh:**

```bash
npm install -g vercel
vercel login
vercel        # deploy bản preview
vercel --prod # deploy bản chính thức (production)
```

## Deploy lên Netlify (cách khác)

1. Vào [app.netlify.com](https://app.netlify.com) → **Add new site → Import
   an existing project** → chọn repo GitHub.
2. Build command: `npm run build` — Publish directory: để Netlify tự nhận
   diện qua plugin Next.js (mặc định khi chọn framework "Next.js"), hoặc
   dùng `.next`.
3. Bấm **Deploy site**.

## Cập nhật nội dung sau này

Nếu tài liệu gốc thay đổi, toàn bộ pipeline xử lý PDF → JSON nằm trong thư
mục `scripts/` (Python) đi kèm dự án (xem `../scripts`), gồm các bước:
trích xuất text có giữ định dạng in đậm từ PDF (`xml_reconstruct.py`), tách
theo 10 Unit (`split_units.py`), phân tích từ vựng (`parse_vocab.py`), phân
tích nội dung luyện tập (`parse_body.py`) và nội dung đáp án GV
(`parse_body_bold.py`), rồi tổng hợp ra `data/units.json` &amp;
`data/tests.json` bằng `build_content.py`.
