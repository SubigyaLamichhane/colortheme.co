"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PresetTheme =
  | "system"
  | "ocean"
  | "forest"
  | "sunset"
  | "grape"
  | "slate"
  | "latte"
  | "none";

type PresetState = {
  preset: PresetTheme;
  setPreset: (preset: PresetTheme) => void;
};

const STORAGE_KEY = "palettehub:presetTheme";

function applyPreset(preset: PresetTheme) {
  try {
    const root = document.documentElement;
    if (!preset || preset === "system" || preset === "none") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", preset);
    }
  } catch {}
}

export const useThemePreset = create<PresetState>()(
  persist(
    (set) => ({
      preset: "system",
      setPreset: (preset) => {
        // Apply immediately
        applyPreset(preset);
        set({ preset });
      },
    }),
    {
      name: STORAGE_KEY,
      onRehydrateStorage: () => (state) => {
        // Ensure attribute is applied after rehydrate on client
        if (!state) return;
        setTimeout(() => applyPreset(state.preset), 0);
      },
    }
  )
);
