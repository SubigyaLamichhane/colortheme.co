"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type SavedState = {
  savedIds: Record<string, true>;
  toggle: (id: string) => void;
  isSaved: (id: string) => boolean;
  clear: () => void;
};

export const useSavedPalettes = create<SavedState>()(
  persist(
    (set, get) => ({
      savedIds: {},
      toggle: (id) => {
        const curr = { ...get().savedIds };
        if (curr[id]) delete curr[id];
        else curr[id] = true;
        set({ savedIds: curr });
      },
      isSaved: (id) => Boolean(get().savedIds[id]),
      clear: () => set({ savedIds: {} }),
    }),
    { name: "palettehub:saved" }
  )
);
