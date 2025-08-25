"use client";

import { Heart } from "lucide-react";
import { useSavedPalettes } from "@/lib/saved-palettes.store";
import type { Palette } from "@/lib/types";
import { CopyHex } from "./CopyHex";

export function PaletteCard({ palette }: { palette: Palette }) {
  const { isSaved, toggle } = useSavedPalettes();
  const saved = isSaved(palette.id);

  return (
    <article className="rounded-2xl border shadow-sm overflow-hidden dark:border-slate-800">
      <div className="flex">
        {palette.colors.map((hex) => (
          <div
            key={hex}
            className="flex-1 h-24 sm:h-28 md:h-32 relative"
            style={{ background: hex }}
          >
            <div className="absolute bottom-2 left-2">
              <CopyHex hex={hex} />
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 flex items-center justify-between bg-white dark:bg-slate-900">
        <div className="min-w-0">
          <h3 className="text-sm font-medium truncate">{palette.name}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {palette.colors.join(" · ")}
          </p>
        </div>
        <button
          onClick={() => toggle(palette.id)}
          aria-pressed={saved}
          aria-label={saved ? "Unsave palette" : "Save palette"}
          className={`inline-flex items-center gap-1 text-sm rounded-lg border px-2 py-1 ${
            saved
              ? "bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900"
              : "hover:bg-slate-50 dark:hover:bg-slate-800 dark:border-slate-800"
          }`}
        >
          <Heart
            className={`h-4 w-4 ${saved ? "fill-rose-500 text-rose-500" : ""}`}
          />
          <span>{saved ? "Saved" : "Save"}</span>
        </button>
      </div>
    </article>
  );
}
