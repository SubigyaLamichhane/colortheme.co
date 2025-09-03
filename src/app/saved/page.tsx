"use client";

import { useEffect, useMemo, useState } from "react";
import { useSavedPalettes } from "@/lib/saved-palettes.store";
import { PALETTES } from "@/data/palettes";
import { RPALETTES } from "@/data/rpalettes";
import { PaletteCard } from "@/components/PaletteCard";

export default function SavedPage() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    type PersistAPI = {
      hasHydrated?: () => boolean;
      onFinishHydration?: (cb: () => void) => () => void;
    };
    const persistApi = (
      useSavedPalettes as unknown as {
        persist?: PersistAPI;
      }
    ).persist;
    if (persistApi?.hasHydrated?.()) setHydrated(true);
    const unsub = persistApi?.onFinishHydration?.(() => setHydrated(true));
    // Fallback: if persist API missing, mark hydrated after mount
    if (!persistApi) setHydrated(true);
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, []);
  const savedIds = Object.keys(useSavedPalettes((s) => s.savedIds));

  const allPalettes = useMemo(() => [...RPALETTES, ...PALETTES], []);
  const items = useMemo(
    () => allPalettes.filter((p) => savedIds.includes(p.id)),
    [savedIds, allPalettes]
  );

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">Saved Palettes</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Your favorites live here. Remove any by tapping the heart.
        </p>
      </header>

      {!hydrated ? (
        <div className="rounded-2xl border p-6 text-sm text-slate-600 dark:text-slate-400 dark:border-slate-800">
          Loading saved palettes…
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border p-6 text-sm text-slate-600 dark:text-slate-400 dark:border-slate-800">
          You haven&apos;t saved any palettes yet. Explore and tap the heart to
          save.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {items.map((p) => (
            <PaletteCard key={p.id} palette={p} />
          ))}
        </div>
      )}
    </div>
  );
}
