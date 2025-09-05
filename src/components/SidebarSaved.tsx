"use client";

import { useSavedPalettes } from "@/lib/saved-palettes.store";
import { PALETTES } from "@/data/palettes";
import { RPALETTES } from "@/data/rpalettes";
import { PaletteCard } from "./PaletteCard";
import Link from "next/link";
import { useTheme } from "@/lib/theme.store";

export function SidebarSaved() {
  const savedIds = Object.keys(useSavedPalettes((s) => s.savedIds));
  const { active, clearTheme } = useTheme();

  if (!savedIds.length) {
    return (
      <div className="rounded-2xl border p-4 theme-border theme-surface">
        <h4 className="font-semibold mb-1">Saved Palettes</h4>
        <p className="text-sm text-secondary">
          Tap the heart on any palette to save it here.
        </p>
        {active && (
          <button
            onClick={clearTheme}
            className="mt-3 text-xs inline-flex items-center gap-1 rounded-lg px-2 py-1 btn-outline"
            aria-label="Clear applied theme"
          >
            Clear applied theme
          </button>
        )}
      </div>
    );
  }

  const all = [...RPALETTES, ...PALETTES];
  const saved = all.filter((p) => savedIds.includes(p.id)).slice(0, 3);

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border p-4 theme-border theme-surface">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold">Saved Palettes</h4>
          <Link href="/saved" className="text-xs text-muted hover:underline">
            View all
          </Link>
        </div>
        {active && (
          <div className="mb-2">
            <button
              onClick={clearTheme}
              className="text-xs inline-flex items-center gap-1 rounded-lg px-2 py-1 btn-outline"
              aria-label="Clear applied theme"
            >
              Clear applied theme
            </button>
          </div>
        )}
        <div className="space-y-3">
          {saved.map((p) => (
            <PaletteCard key={p.id} palette={p} />
          ))}
        </div>
      </div>
      {/* Ad slot placeholder */}
      <div className="rounded-2xl border p-6 text-center text-sm text-muted theme-border theme-surface">
        Advertisement
      </div>
    </div>
  );
}
