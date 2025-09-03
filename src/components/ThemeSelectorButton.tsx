"use client";

import Link from "next/link";
import { useTheme } from "@/lib/theme.store";

export function ThemeSelectorButton() {
  const { active, setThemeMode } = useTheme();
  const colors = active?.colors?.slice(0, 4) || [];
  return (
    <div className="inline-flex items-center gap-2">
      <Link
        href="/palettes/all"
        className="inline-flex items-center gap-2 rounded-lg border px-2 h-8 theme-border theme-surface hover:bg-slate-50 dark:hover:bg-slate-800"
        aria-label="Choose a site theme"
        title="Choose a site theme"
      >
        <div className="flex -space-x-1">
          {colors.length ? (
            colors.map((c, i) => (
              <span
                key={i}
                className="inline-block h-4 w-4 rounded ring-1 ring-black/5"
                style={{ background: c }}
              />
            ))
          ) : (
            <>
              <span className="inline-block h-4 w-4 rounded bg-[var(--accent)] ring-1 ring-black/5" />
              <span className="inline-block h-4 w-4 rounded bg-[var(--foreground)]/70 ring-1 ring-black/5" />
              <span className="inline-block h-4 w-4 rounded bg-[var(--border)] ring-1 ring-black/5" />
              <span className="inline-block h-4 w-4 rounded bg-[var(--muted)] ring-1 ring-black/5" />
            </>
          )}
        </div>
        <span className="text-xs">Theme</span>
      </Link>
      <select
        className="h-8 text-xs rounded-lg border theme-border theme-surface px-1"
        value={active?.mode || "accent"}
        onChange={(e) => setThemeMode(e.target.value as "full" | "accent")}
        aria-label="Theme mode"
        title="Theme mode"
      >
        <option value="accent">Accent only</option>
        <option value="full">Full</option>
      </select>
    </div>
  );
}
