"use client";

import { Heart } from "lucide-react";
import { useSavedPalettes } from "@/lib/saved-palettes.store";
import type { Palette } from "@/lib/types";
import { CopyHex } from "./CopyHex";
import { useTheme } from "@/lib/theme.store";

export function PaletteCard({ palette }: { palette: Palette }) {
  const { isSaved, toggle } = useSavedPalettes();
  const saved = isSaved(palette.id);
  const { active, applyPalette, clearTheme } = useTheme();
  const isActive = active?.id === palette.id;

  return (
    <article className="rounded-2xl border shadow-sm overflow-hidden theme-border theme-surface">
      <div className="flex">
        {palette.colors.map((hex, i) => (
          <div
            key={`${hex}-${i}`}
            className="flex-1 h-28 sm:h-32 md:h-40 relative"
            style={{ background: hex }}
          >
            <div className="absolute bottom-2 left-2">
              <CopyHex hex={hex} />
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 flex items-center justify-between theme-surface">
        <div className="min-w-0">
          <h3 className="text-sm font-medium truncate text-primary">
            {palette.name}
          </h3>
          <p className="text-xs text-secondary">{palette.colors.join(" · ")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (isActive) clearTheme();
              else applyPalette(palette, "full");
            }}
            className={`inline-flex items-center gap-1 text-xs rounded-lg px-2 py-1 ${
              isActive ? "btn-accent" : "btn-outline"
            }`}
            aria-pressed={isActive}
            aria-label={
              isActive ? "Clear applied theme" : "Apply palette as site theme"
            }
            title={isActive ? "Clear applied theme" : "Apply as site theme"}
          >
            {isActive ? "Applied" : "Apply"}
          </button>
          <button
            onClick={(e) => {
              // Prevent parent link/card navigation when toggling save
              e.preventDefault();
              e.stopPropagation();
              toggle(palette.id);
            }}
            aria-pressed={saved}
            aria-label={saved ? "Unsave palette" : "Save palette"}
            className={`inline-flex items-center gap-1 text-sm rounded-lg px-2 py-1 ${
              saved ? "btn-accent" : "btn-outline"
            }`}
          >
            <Heart className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
            <span>{saved ? "Saved" : "Save"}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
