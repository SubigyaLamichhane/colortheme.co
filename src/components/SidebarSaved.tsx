"use client";

import { useSavedPalettes } from "@/lib/saved-palettes.store";
import { PALETTES } from "@/data/palettes";
import { PaletteCard } from "./PaletteCard";

export function SidebarSaved() {
  const savedIds = Object.keys(useSavedPalettes((s) => s.savedIds));

  if (!savedIds.length) {
    return (
      <div className="rounded-2xl border p-4 dark:border-slate-800">
        <h4 className="font-semibold mb-1">Saved Palettes</h4>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Tap the heart on any palette to save it here.
        </p>
      </div>
    );
  }

  const saved = PALETTES.filter((p) => savedIds.includes(p.id)).slice(0, 3);

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border p-4 dark:border-slate-800">
        <h4 className="font-semibold mb-3">Saved Palettes</h4>
        <div className="space-y-3">
          {saved.map((p) => (
            <PaletteCard key={p.id} palette={p} />
          ))}
        </div>
      </div>
      {/* Ad slot placeholder */}
      <div className="rounded-2xl border p-6 text-center text-sm text-slate-500 dark:text-slate-400 dark:border-slate-800">
        Advertisement
      </div>
    </div>
  );
}
