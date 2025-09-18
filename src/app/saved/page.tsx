"use client";

import { useEffect, useMemo, useState } from "react";
import { useSavedPalettes } from "@/lib/saved-palettes.store";
import { PALETTES } from "@/data/palettes";
import { RPALETTES } from "@/data/rpalettes";
import { PaletteCard } from "@/components/PaletteCard";

export default function SavedPage() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    type PersistAPI = {
      hasHydrated?: () => boolean;
      onFinishHydration?: (cb: () => void) => () => void;
    };
    const persistApi = (
      useSavedPalettes as unknown as {
        persist?: PersistAPI;
      }
    ).persist;
    if (persistApi?.hasHydrated?.()) setHydrated(true);
    const unsub = persistApi?.onFinishHydration?.(() => setHydrated(true));
    // Fallback: if persist API missing, mark hydrated after mount
    if (!persistApi) setHydrated(true);
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, []);
  const savedIds = Object.keys(useSavedPalettes((s) => s.savedIds));

  const allPalettes = useMemo(() => [...RPALETTES, ...PALETTES], []);
  const items = useMemo(
    () => allPalettes.filter((p) => savedIds.includes(p.id)),
    [savedIds, allPalettes]
  );

  // AI palette generator state
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiPalette, setAiPalette] = useState<{
    name: string;
    colors: { hex: string; name?: string }[];
  } | null>(null);

  async function generatePalette(e?: React.FormEvent) {
    e?.preventDefault?.();
    setAiError(null);
    setAiLoading(true);
    try {
      const res = await fetch("/api/generate-palette", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt, count: 5 }),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = (await res.json()) as {
        name: string;
        colors: { hex: string; name?: string }[];
      };
      setAiPalette(data);
    } catch {
      setAiError("Could not generate a palette. Try again.");
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">Saved Palettes</h1>
        <p className="text-sm text-secondary">
          Your favorites live here. Remove any by tapping the heart.
        </p>
      </header>

      {/* AI palette generator */}
      <div className="rounded-2xl border p-4 theme-border space-y-3">
        <form onSubmit={generatePalette} className="flex gap-2">
          <input
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Describe a mood, theme, or brand (e.g., calming beach at sunset)"
            className="flex-1 rounded-lg border px-3 py-2 text-sm theme-border bg-transparent"
          />
          <button
            type="submit"
            disabled={aiLoading}
            className="rounded-lg bg-primary px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {aiLoading ? "Generating…" : "Generate with AI"}
          </button>
        </form>
        {aiError && <p className="text-sm text-red-500">{aiError}</p>}
        {aiPalette && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium">{aiPalette.name}</h2>
              <button
                onClick={() => generatePalette()}
                disabled={aiLoading}
                className="text-xs underline disabled:opacity-50"
              >
                Regenerate
              </button>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {aiPalette.colors.map((c) => (
                <button
                  key={c.hex}
                  title={`${c.name ? c.name + " · " : ""}${c.hex}`}
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(c.hex);
                    } catch {}
                  }}
                  className="group relative h-16 rounded-lg border theme-border overflow-hidden"
                  style={{ backgroundColor: c.hex }}
                >
                  <span className="absolute bottom-1 left-1 right-1 rounded px-1 py-0.5 text-[10px] font-medium backdrop-blur-sm bg-black/30 text-white opacity-0 group-hover:opacity-100 transition">
                    {c.hex}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {!hydrated ? (
        <div className="rounded-2xl border p-6 text-sm text-secondary theme-border">
          Loading saved palettes…
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border p-6 text-sm text-secondary theme-border">
          You haven&apos;t saved any palettes yet. Explore and tap the heart to
          save.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {items.map((p) => (
            <PaletteCard key={p.id} palette={p} />
          ))}
        </div>
      )}
    </div>
  );
}
