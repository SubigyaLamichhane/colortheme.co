import type { Metadata } from "next";
import { allHubSlugs, hubBySlug, palettesForHub } from "@/lib/hub-utils";
import { hubMetaDescription, hubMetaTitle } from "@/lib/seo";
import { PalettesExplorer } from "@/components/PalettesExplorer";

export const dynamic = "force-static";

export function generateStaticParams() {
  return allHubSlugs().map((hub) => ({ hub }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ hub: string }>;
}): Promise<Metadata> {
  const { hub: hubSlug } = await params;
  const hub = hubBySlug(hubSlug);
  const count = palettesForHub(hubSlug).length || 500; // placeholder count
  const title = hub ? hubMetaTitle(hub.name, count) : "Color Palettes";
  const description = hub ? hubMetaDescription(hub.name) : "Color palettes";
  return {
    title,
    description,
    robots: { index: true, follow: true },
  };
}

export default async function HubPage({
  params,
}: {
  params: Promise<{ hub: string }>;
}) {
  const { hub: hubSlug } = await params;
  const hub = hubBySlug(hubSlug);
  const items = palettesForHub(hubSlug);

  if (!hub) {
    return <div>Hub not found.</div>;
  }

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">{hub.name}</h1>
        <p className="text-sm text-secondary">
          Curated palettes. Copy HEX instantly. Save favorites.
        </p>
      </header>

      <PalettesExplorer items={items} />
    </div>
  );
}
