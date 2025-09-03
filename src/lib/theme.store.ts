"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Palette } from "@/lib/types";

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

function hexToRgb(hex: string) {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return { r, g, b };
}

function luminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const srgb = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

function contrastColor(bg: string) {
  return luminance(bg) > 0.6 ? "#0b0b0b" : "#fafafa";
}

function mix(a: string, b: string, ratio: number) {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  const m = (x: number, y: number) => Math.round(x * (1 - ratio) + y * ratio);
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(m(ca.r, cb.r))}${toHex(m(ca.g, cb.g))}${toHex(
    m(ca.b, cb.b)
  )}`;
}

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
  const sortedByLight = [...cols].sort((a, b) => luminance(b) - luminance(a));
  const lightest = sortedByLight[0] || cols[0];
  const darkest =
    [...cols].sort((a, b) => luminance(a) - luminance(b))[0] || cols[0];
  const background = lightest;
  const foreground = contrastColor(background);
  const accent = cols[Math.min(2, cols.length - 1)];
  const accentContrast = contrastColor(accent);
  const border = mix(background, foreground, 0.15);
  const set = (k: string, v: string) => root.style.setProperty(k, v);
  // Always set accent variables
  set("--accent", accent);
  set("--accent-contrast", accentContrast);
  // Only override surfaces in full mode
  if (mode === "full") {
    set("--background", background);
    set("--foreground", foreground);
    set("--surface", background);
    set("--border", border);
    set("--muted", mix(background, darkest, 0.75));
    document.documentElement.style.colorScheme =
      luminance(background) > 0.6 ? "light" : "dark";
    root.setAttribute("data-theme-active", "true");
  } else {
    // Accent mode: keep defaults; mark state for reference
    root.setAttribute("data-theme-active", "accent");
  }
  cols.forEach((c, i) => set(`--palette-${i + 1}`, c));
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
                  ?.mode || "accent"
              : "accent"),
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
          // Remove custom vars to let defaults/dark-mode apply
          [
            "--accent",
            "--accent-contrast",
            "--background",
            "--foreground",
            "--surface",
            "--border",
            "--muted",
          ].forEach((k) => root.style.removeProperty(k));
        } catch {}
        set({ active: null });
      },
    }),
    { name: "palettehub:state" }
  )
);

// Re-export helpers for reuse
export const __internal = { setCssVarsFromColors };
