"use client";

import type { Palette } from "@/lib/types";
import { useTheme } from "@/lib/theme.store";

export function ApplyThemeButton({ palette }: { palette: Palette }) {
  const { active, applyPalette, clearTheme } = useTheme();
  const isActive = active?.id === palette.id;
  return (
    <button
      onClick={() => (isActive ? clearTheme() : applyPalette(palette))}
      className={`text-xs inline-flex items-center gap-1 rounded-lg border px-2 py-1 theme-border ${
        isActive
          ? "btn-accent border-transparent"
          : "hover:bg-slate-50 dark:hover:bg-slate-800"
      }`}
      aria-pressed={isActive}
      aria-label={isActive ? "Clear applied theme" : "Apply as site theme"}
    >
      {isActive ? "Applied" : "Apply as site theme"}
    </button>
  );
}
