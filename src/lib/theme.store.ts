"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Palette } from "@/lib/types";
import {
  getLuminance,
  getBestTextColor,
  mixColors,
  getReadableTextColor,
} from "@/lib/color-utils";

type ActiveTheme = {
  id?: string;
  name?: string;
  colors: string[];
  mode?: "full" | "accent";
};

type ThemeState = {
  active: ActiveTheme | null;
  applyPalette: (palette: Palette, mode?: "full" | "accent") => void;
  setThemeMode: (mode: "full" | "accent") => void;
  clearTheme: () => void;
};

const THEME_STORAGE_KEY = "palettehub:activeTheme";

/**
 * Enhanced theme application with better legibility
 */
function setCssVarsFromColors(
  colors: string[],
  mode: "full" | "accent" = "accent"
) {
  const root = document.documentElement;
  const cols = colors.slice(0, 8);

  if (!cols.length) {
    root.removeAttribute("data-theme-active");
    return;
  }

  // Sort colors by luminance for better role assignment
  const sortedByLight = [...cols].sort(
    (a, b) => getLuminance(b) - getLuminance(a)
  );
  const sortedByDark = [...cols].sort(
    (a, b) => getLuminance(a) - getLuminance(b)
  );

  const lightest = sortedByLight[0] || cols[0];
  const darkest = sortedByDark[0] || cols[0];

  // Choose background and foreground with accessibility in mind
  const background = lightest;
  const foreground = getBestTextColor(background);

  // Choose accent with good contrast against both light and dark backgrounds
  let accent = cols[Math.min(2, cols.length - 1)];

  // If accent doesn't have good contrast, find a better one
  const isLightTheme = getLuminance(background) > 0.5;
  if (isLightTheme && getLuminance(accent) > 0.7) {
    // For light themes, prefer darker accents
    accent = sortedByDark.find((c) => getLuminance(c) < 0.5) || accent;
  } else if (!isLightTheme && getLuminance(accent) < 0.3) {
    // For dark themes, prefer lighter accents
    accent = sortedByLight.find((c) => getLuminance(c) > 0.5) || accent;
  }

  const accentContrast = getBestTextColor(accent);
  const border = mixColors(background, foreground, 0.15);
  const muted = mixColors(background, darkest, 0.75);

  const set = (k: string, v: string) => root.style.setProperty(k, v);

  // Always set accent variables
  set("--accent", accent);
  set("--accent-contrast", accentContrast);

  // Set readable text colors for all palette colors
  cols.forEach((color, i) => {
    set(`--palette-${i + 1}`, color);
    set(
      `--palette-${i + 1}-text`,
      getReadableTextColor(color, "high-contrast")
    );
    set(
      `--palette-${i + 1}-text-subtle`,
      getReadableTextColor(color, "subtle")
    );
  });

  // Only override surfaces in full mode
  if (mode === "full") {
    set("--background", background);
    set("--foreground", foreground);
    set("--surface", background);
    set("--border", border);
    set("--muted", muted);

    // Set semantic text colors for better legibility
    set("--text-primary", foreground);
    set(
      "--text-secondary",
      getReadableTextColor(background, "medium-contrast")
    );
    set("--text-muted", getReadableTextColor(background, "subtle"));

    document.documentElement.style.colorScheme = isLightTheme
      ? "light"
      : "dark";
    root.setAttribute("data-theme-active", "true");
  } else {
    // Accent mode: keep defaults; mark state for reference
    root.setAttribute("data-theme-active", "accent");
  }
}

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      active: null,
      applyPalette: (palette, mode) => {
        const payload: ActiveTheme = {
          id: palette.id,
          name: palette.name,
          colors: palette.colors as string[],
          mode:
            mode ||
            (typeof window !== "undefined"
              ? JSON.parse(localStorage.getItem(THEME_STORAGE_KEY) || "{}")
                  ?.mode || "full"
              : "full"),
        };
        try {
          localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(payload));
          setCssVarsFromColors(payload.colors, payload.mode || "accent");
        } catch {}
        set({ active: payload });
      },
      setThemeMode: (mode) => {
        const curr = (
          typeof window !== "undefined"
            ? JSON.parse(localStorage.getItem(THEME_STORAGE_KEY) || "{}")
            : null
        ) as ActiveTheme | null;
        const updated: ActiveTheme | null = curr ? { ...curr, mode } : null;
        if (updated) {
          try {
            localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(updated));
            setCssVarsFromColors(updated.colors, mode);
          } catch {}
          set({ active: updated });
        }
      },
      clearTheme: () => {
        try {
          localStorage.removeItem(THEME_STORAGE_KEY);
          const root = document.documentElement;
          root.removeAttribute("data-theme-active");
          // Reset color-scheme back to stylesheet/defaults
          document.documentElement.style.colorScheme = "";
          // Remove custom vars to let defaults/dark-mode apply
          const varsToRemove = [
            "--accent",
            "--accent-contrast",
            "--background",
            "--foreground",
            "--surface",
            "--border",
            "--muted",
            "--text-primary",
            "--text-secondary",
            "--text-muted",
          ];

          // Remove palette color variables
          for (let i = 1; i <= 8; i++) {
            varsToRemove.push(`--palette-${i}`);
            varsToRemove.push(`--palette-${i}-text`);
            varsToRemove.push(`--palette-${i}-text-subtle`);
          }

          varsToRemove.forEach((k) => root.style.removeProperty(k));
        } catch {}
        set({ active: null });
      },
    }),
    {
      name: "palettehub:state",
      onRehydrateStorage: () => (state) => {
        // Ensure CSS variables are applied after client rehydration
        try {
          const active = state?.active as ActiveTheme | null;
          if (active && Array.isArray(active.colors) && active.colors.length) {
            setCssVarsFromColors(active.colors, active.mode || "full");
          }
        } catch {}
      },
    }
  )
);

// Re-export helpers for reuse
export const __internal = { setCssVarsFromColors };
