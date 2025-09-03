import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Palette } from "@/lib/types";
import { ApplyThemeButton } from "@/components/ApplyThemeButton";
import { RPALETTES } from "@/data/rpalettes";
import { PALETTES } from "@/data/palettes";

export const dynamic = "force-static";

function allPalettes(): Palette[] {
  return [...RPALETTES, ...PALETTES];
}

export function generateStaticParams() {
  return allPalettes()
    .slice(0, 4000)
    .map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const p = allPalettes().find((x) => x.id === params.id);
  if (!p) return { title: "Palette" };
  return {
    title: `${p.name} – Color Palette`,
    description: `Colors: ${p.colors.join(", ")}`,
    robots: { index: true, follow: true },
  };
}

export default function PaletteDetail({ params }: { params: { id: string } }) {
  const p = allPalettes().find((x) => x.id === params.id);
  if (!p) return notFound();
  return (
    <div className="space-y-4">
      <nav className="text-sm text-slate-500 dark:text-slate-400">
        <Link href="/palettes/all">← Back to All Palettes</Link>
      </nav>
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">{p.name}</h1>
        <div className="flex items-center gap-3">
          <p className="text-sm">{p.colors.join(" · ")}</p>
          <ApplyThemeButton palette={p} />
        </div>
      </header>
      <div className="rounded-2xl overflow-hidden border theme-border">
        <div className="flex">
          {p.colors.map((c) => (
            <div
              key={c}
              className="flex-1 h-28 md:h-36"
              style={{ background: c }}
            />
          ))}
        </div>
      </div>
      {p.source && (
        <div className="text-sm text-slate-600 dark:text-slate-400">
          Source: {p.source.package}
          {p.source.palette ? ` – ${p.source.palette}` : ""}
          {p.source.url && (
            <>
              {" · "}
              <a
                className="underline"
                target="_blank"
                rel="noopener noreferrer"
                href={p.source.url}
              >
                View in r-color-palettes
              </a>
            </>
          )}
        </div>
      )}
    </div>
  );
}
