import Link from "next/link";
import { notFound } from "next/navigation";
import { getUnit, UNIT_NUMBERS } from "@/lib/content";
import UnitTabs from "@/components/UnitTabs";

export function generateStaticParams() {
  return UNIT_NUMBERS.map((n) => ({ id: String(n) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const unit = getUnit(id);
  if (!unit) return {};
  return {
    title: `Unit ${unit.number}: ${unit.titleVi} | Bổ Trợ Tiếng Anh 10`,
  };
}

export default async function UnitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const unit = getUnit(id);
  if (!unit) notFound();

  const idx = UNIT_NUMBERS.indexOf(unit.number);
  const prev = idx > 0 ? UNIT_NUMBERS[idx - 1] : null;
  const next = idx < UNIT_NUMBERS.length - 1 ? UNIT_NUMBERS[idx + 1] : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link
        href="/#units"
        className="font-mono-tag text-xs uppercase tracking-widest text-ink-soft hover:text-pine"
      >
        ← Tất cả Units
      </Link>

      <div className="mt-3 mb-8">
        <span className="font-mono-tag text-sm uppercase tracking-widest text-pine">
          Unit {String(unit.number).padStart(2, "0")}
        </span>
        <h1 className="mt-1 font-display text-3xl font-700 text-ink sm:text-4xl">
          {unit.titleVi}
        </h1>
        <p className="mt-1 text-lg italic text-ink-soft">{unit.titleEn}</p>
      </div>

      <UnitTabs unit={unit} />

      <div className="mt-10 flex items-center justify-between border-t-2 border-line pt-6">
        {prev ? (
          <Link
            href={`/units/${prev}`}
            className="font-mono-tag text-sm text-ink-soft hover:text-pine"
          >
            ← Unit {String(prev).padStart(2, "0")}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/units/${next}`}
            className="font-mono-tag text-sm text-ink-soft hover:text-pine"
          >
            Unit {String(next).padStart(2, "0")} →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
