import { PALETTES } from "@/data/palettes";
import { PaletteCard } from "@/components/PaletteCard";

export const dynamic = "force-static";

export default function HomePage() {
  const trending = [...PALETTES].sort((a, b) => b.likes - a.likes);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Trending Palettes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {trending.map((p) => (
          <PaletteCard key={p.id} palette={p} />
        ))}
      </div>
    </div>
  );
}
