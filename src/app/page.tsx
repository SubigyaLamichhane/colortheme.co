import Link from "next/link";
import { PALETTES } from "@/data/palettes";
import { HUBS } from "@/data/hubs";
import { PaletteCard } from "@/components/PaletteCard";

export const dynamic = "force-static";

export default function Home() {
  const trending = [...PALETTES].sort((a, b) => b.likes - a.likes).slice(0, 8);
  const hubs = HUBS.filter((h) => h.slug !== "all").slice(0, 12);

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="rounded-2xl border p-6 md:p-8 theme-surface theme-border">
        <div className="max-w-3xl space-y-4">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Find the perfect color palette
          </h1>
          <p className="text-sm text-secondary">
            Explore curated palettes for brands, UI, and marketing. Copy HEX in
            one click and save your favorites.
          </p>
          <form action="/palettes/all" method="GET" className="mt-4">
            <div className="flex gap-2">
              <input
                name="q"
                placeholder="Search palettes, colors, tags"
                className="flex-1 px-3 py-2 text-sm input-base"
                aria-label="Search palettes"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-lg text-sm btn-accent"
              >
                Search
              </button>
            </div>
          </form>
          <div className="pt-3 text-xs text-secondary">
            Or browse hubs below.
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Trending palettes</h2>
          <Link href="/palettes/all" className="text-sm hover:underline">
            Explore all →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {trending.map((p) => (
            <Link key={p.id} href={`/palette/${encodeURIComponent(p.id)}`}>
              <PaletteCard palette={p} />
            </Link>
          ))}
        </div>
      </section>

      {/* Hubs */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Browse by hub</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
          {hubs.map((h) => (
            <Link
              key={h.slug}
              href={`/palettes/${h.slug}`}
              className="block rounded-xl border p-3 text-sm theme-border theme-hover"
            >
              <div className="font-medium">{h.name}</div>
              <div className="text-xs text-secondary">View palettes</div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-2xl border p-5 flex items-center justify-between theme-surface theme-border">
        <div className="text-sm">
          Looking for something specific? Try the full explorer with filters.
        </div>
        <Link
          href="/palettes/all"
          className="text-sm rounded-lg px-3 py-2 btn-outline"
        >
          Open explorer
        </Link>
      </section>
    </div>
  );
}
