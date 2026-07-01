import Link from "next/link";
import { notFound } from "next/navigation";
import { getTests } from "@/lib/content";
import AnswerBlocks from "@/components/AnswerBlocks";

const MAP = { "giua-ky": "midterm", "cuoi-ky": "final" } as const;

export function generateStaticParams() {
  return Object.keys(MAP).map((type) => ({ type }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const key = MAP[type as keyof typeof MAP];
  if (!key) return {};
  const tests = getTests();
  return { title: `${tests[key].title} | Bổ Trợ Tiếng Anh 10` };
}

export default async function TestPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const key = MAP[type as keyof typeof MAP];
  if (!key) notFound();
  const tests = getTests();
  const test = tests[key];
  if (!test || test.blocks.length === 0) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link
        href="/kiem-tra"
        className="font-mono-tag text-xs uppercase tracking-widest text-ink-soft hover:text-pine"
      >
        ← Kiểm tra giữa kỳ / cuối kỳ
      </Link>
      <h1 className="mt-3 mb-2 font-display text-3xl font-700 text-ink sm:text-4xl">
        {test.title}
      </h1>
      <div className="mb-6 rounded-md border-2 border-highlight/60 bg-highlight-soft/30 px-4 py-3 text-sm text-ink-soft">
        🖍️ Phần <mark className="highlight-mark font-600">bôi vàng</mark> là
        đáp án đúng, lấy nguyên văn từ tài liệu dành cho giáo viên.
      </div>
      <div className="rounded-lg border-2 border-line bg-paper-light p-4 sm:p-6">
        <AnswerBlocks blocks={test.blocks} />
      </div>
    </div>
  );
}
