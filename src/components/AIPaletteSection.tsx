"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CopyHex } from "@/components/CopyHex";
import { useTheme, componentVars } from "@/lib/theme.store";
import type { Palette as LibPalette } from "@/lib/types";
import { Sparkles, RefreshCcw, PaintBucket } from "lucide-react";

type ApiColor = { hex: string; name?: string };
type ApiPalette = { name: string; colors: ApiColor[] };

function hashId(input: string) {
  // djb2 simple hash
  let h = 5381;
  for (let i = 0; i < input.length; i++) h = (h * 33) ^ input.charCodeAt(i);
  // convert to unsigned and base36
  return (h >>> 0).toString(36);
}

function toLibPalette(api: ApiPalette): LibPalette {
  const colors = api.colors.map((c) => c.hex);
  const id = `ai-${hashId(`${api.name}-${colors.join("")}`)}`;
  return {
    id,
    name: api.name,
    colors: colors as unknown as LibPalette["colors"],
    hubs: ["ai"],
    likes: 0,
    createdAt: new Date().toISOString(),
    tags: ["ai"],
    source: { package: "AI" },
  };
}

export function AIPaletteSection() {
  const [prompt, setPrompt] = useState("");
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ApiPalette | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const { applyPalette, active, clearTheme } = useTheme();

  const asLib = useMemo(() => (result ? toLibPalette(result) : null), [result]);

  async function generate(p?: string) {
    const usePrompt = (p ?? prompt).trim();
    if (!usePrompt) {
      setError("Enter a prompt to generate");
      return;
    }
    setLoading(true);
    setError(null);
    controllerRef.current?.abort();
    const ctrl = new AbortController();
    controllerRef.current = ctrl;
    try {
      const res = await fetch("/api/generate-palette", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: usePrompt, count }),
        signal: ctrl.signal,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to generate");
      }
      const data = (await res.json()) as ApiPalette;
      setResult(data);
    } catch (e) {
      const err = e as Error & { name?: string };
      if (err?.name === "AbortError") return;
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Listen for global events fired by search bars
  useEffect(() => {
    const handler = (e: CustomEvent<{ prompt?: string }>) => {
      const p = e?.detail?.prompt;
      if (typeof p === "string") {
        setPrompt(p);
        // slight delay to ensure state updates before generating
        setTimeout(() => generate(p), 0);
      }
    };
    window.addEventListener("ai-generate", handler as unknown as EventListener);
    return () =>
      window.removeEventListener(
        "ai-generate",
        handler as unknown as EventListener
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  // Read ?ai= from URL on first mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const ai = params.get("ai");
      if (ai) {
        setPrompt(ai);
        setTimeout(() => generate(ai), 0);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      id="ai"
      className="space-y-4 rounded-2xl border p-6 theme-border theme-surface"
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Generate a palette with AI</h2>
          <p className="text-xs text-secondary max-w-prose">
            Describe your vibe, brand, or scene. The AI will craft a balanced,
            accessible palette.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. warm minimalist fintech dashboard"
          className="flex-1 px-3 py-2 text-sm input-base"
          aria-label="AI prompt"
        />
        <select
          value={String(count)}
          onChange={(e) => setCount(Number(e.target.value))}
          className="px-2 py-2 text-sm input-base"
          aria-label="Color count"
          title="Color count"
        >
          {[3, 4, 5, 6, 7, 8].map((n) => (
            <option key={n} value={n}>
              {n} colors
            </option>
          ))}
        </select>
        <button
          onClick={() => generate()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm btn-accent"
          aria-busy={loading}
        >
          <Sparkles className="h-4 w-4" />{" "}
          {loading ? "Generating..." : "Generate"}
        </button>
        {result && (
          <button
            onClick={() => generate(prompt)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm btn-outline"
            title="Regenerate"
          >
            <RefreshCcw className="h-4 w-4" />
          </button>
        )}
      </div>

      {error && (
        <div className="text-xs text-red-500" role="status">
          {error}
        </div>
      )}

      {result && (
        <div
          className="mt-2 rounded-2xl border p-4 theme-border"
          style={componentVars(result.colors.map((c) => c.hex))}
        >
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="text-base font-semibold truncate">{result.name}</h3>
            {asLib && (
              <button
                onClick={() => {
                  if (active?.id === asLib.id) clearTheme();
                  else applyPalette(asLib, "full");
                }}
                className={`inline-flex items-center gap-2 text-xs rounded-lg px-2.5 py-1.5 ${
                  active?.id === asLib.id ? "btn-accent" : "btn-outline"
                }`}
                aria-label="Apply as site theme"
                title="Apply as site theme"
              >
                <PaintBucket className="h-4 w-4" />
                {active?.id === asLib.id ? "Applied" : "Apply"}
              </button>
            )}
          </div>

          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {result.colors.map((c, i) => (
              <div
                key={`${c.hex}-${i}`}
                className="relative rounded-xl border h-24 theme-border overflow-hidden"
                style={{ background: `var(--color-${i + 1}, ${c.hex})` }}
                title={c.name || c.hex}
                aria-label={c.name || c.hex}
              >
                <div className="absolute bottom-2 left-2">
                  <CopyHex hex={c.hex} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-2 text-xs text-secondary">
            Tip: Click a HEX to copy. Use Apply to theme the site with this
            palette.
          </div>
        </div>
      )}
    </section>
  );
}

export default AIPaletteSection;
