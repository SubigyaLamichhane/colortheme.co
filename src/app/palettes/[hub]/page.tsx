import type { Metadata } from "next";
import { allHubSlugs, hubBySlug, palettesForHub } from "@/lib/hub-utils";
import { hubMetaDescription, hubMetaTitle } from "@/lib/seo";
import { PaletteCard } from "@/components/PaletteCard";

export const dynamic = "force-static";

export function generateStaticParams() {
  return allHubSlugs().map((hub) => ({ hub }));
}

export async function generateMetadata({
  params,
}: {
  params: { hub: string };
}): Promise<Metadata> {
  const hub = hubBySlug(params.hub);
  const count = palettesForHub(params.hub).length || 500; // placeholder count
  const title = hub ? hubMetaTitle(hub.name, count) : "Color Palettes";
  const description = hub ? hubMetaDescription(hub.name) : "Color palettes";
  return {
    title,
    description,
    robots: { index: true, follow: true },
  };
}

export default function HubPage({ params }: { params: { hub: string } }) {
  const hub = hubBySlug(params.hub);
  const items = palettesForHub(params.hub);

  if (!hub) {
    return <div>Hub not found.</div>;
  }

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">{hub.name}</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Curated palettes. Copy HEX instantly. Save favorites.
        </p>
      </header>

      {/* Tabs stub: Latest / Popular / Random — to wire next */}
      <div className="flex gap-2 text-sm">
        <button className="px-3 py-1 rounded-full border bg-white dark:bg-slate-900 dark:border-slate-800">
          Trending
        </button>
        <button className="px-3 py-1 rounded-full border bg-white dark:bg-slate-900 dark:border-slate-800">
          Latest
        </button>
        <button className="px-3 py-1 rounded-full border bg-white dark:bg-slate-900 dark:border-slate-800">
          Random
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {items.length ? (
          items.map((p) => <PaletteCard key={p.id} palette={p} />)
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-400">
            No palettes yet.
          </div>
        )}
      </div>
    </div>
  );
}
