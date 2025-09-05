"use client";

import { Heart } from "lucide-react";
import { useSavedPalettes } from "@/lib/saved-palettes.store";
import type { Palette } from "@/lib/types";
import { CopyHex } from "./CopyHex";
import { useTheme, componentVars } from "@/lib/theme.store";
import { LikeButton } from "./LikeButton";

export function PaletteCard({ palette }: { palette: Palette }) {
  const { isSaved, toggle } = useSavedPalettes();
  const saved = isSaved(palette.id);
  const { active, applyPalette, clearTheme } = useTheme();
  const isActive = active?.id === palette.id;

  return (
    <article
      className="rounded-2xl border shadow-sm theme-border theme-surface transition-shadow hover:shadow-md focus-within:shadow-md p-3 sm:p-4"
      style={componentVars(palette.colors)}
    >
      {" "}
      {/* Colors as horizontal shades (original style) */}
      <div className="mb-3 flex overflow-hidden rounded-xl border theme-border">
        {palette.colors.map((hex, i) => (
          <div
            key={`${hex}-${i}`}
            className="relative flex-1 h-28 sm:h-32 md:h-40"
            style={{ background: `var(--color-${i + 1}, ${hex})` }}
            aria-label={`Color ${i + 1} ${hex}`}
            title={hex}
          >
            <div className="absolute bottom-2 left-2">
              <CopyHex hex={hex} />
            </div>
          </div>
        ))}
      </div>
      {/* Title row */}
      <h3 className="text-base font-semibold leading-tight truncate text-primary">
        {palette.name}
      </h3>
      {/* Actions row */}
      <div className="mt-2 flex items-center gap-2">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isActive) clearTheme();
            else applyPalette(palette, "full");
          }}
          className={`inline-flex items-center gap-1 text-xs rounded-lg px-2.5 py-1.5 ${
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
        <LikeButton
          palette={{
            id: palette.id,
            slug: palette.id,
            name: palette.name,
            colors: palette.colors,
          }}
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggle(palette.id);
          }}
          aria-pressed={saved}
          aria-label={saved ? "Remove bookmark" : "Bookmark palette"}
          className={`inline-flex items-center gap-1 text-xs rounded-lg px-2.5 py-1.5 ${
            saved ? "btn-accent" : "btn-outline"
          }`}
        >
          <Heart className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
          <span className="hidden sm:inline">
            {saved ? "Bookmarked" : "Bookmark"}
          </span>
        </button>
      </div>
    </article>
  );
}
