"use client";

import Link from "next/link";
import { Moon, Sun, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSavedPalettes } from "@/lib/saved-palettes.store";
import { useTheme } from "@/lib/theme.store";
import { ThemeSelectorButton } from "./ThemeSelectorButton";
import { useThemePreset } from "@/lib/theme-preset.store";
import type { PresetTheme } from "@/lib/theme-preset.store";

export function HeaderNav() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [q, setQ] = useState("");
  const router = useRouter();
  const savedCount = Object.keys(useSavedPalettes((s) => s.savedIds)).length;
  const { active, clearTheme } = useTheme();
  const { preset, setPreset } = useThemePreset();

  useEffect(() => {
    try {
      const saved = localStorage.getItem("colortheme:theme");
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      const initial =
        saved === "dark" || saved === "light"
          ? (saved as "light" | "dark")
          : prefersDark
          ? "dark"
          : "light";
      setTheme(initial);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      const root = document.documentElement;
      root.classList.toggle("dark", theme === "dark");
      document.documentElement.style.colorScheme = theme;
      localStorage.setItem("colortheme:theme", theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <header
      className="border-b backdrop-blur theme-border"
      style={{
        backgroundColor: "color-mix(in oklab, var(--surface), transparent 20%)",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight">
          colortheme.co
        </Link>
        <nav className="flex items-center gap-3">
          <Link href="/palettes/all" className="text-sm hover:underline">
            Explore Palettes
          </Link>
          <ThemeSelectorButton />
          <select
            className="h-8 text-xs rounded-lg input-base px-1"
            value={preset}
            onChange={(e) => setPreset(e.target.value as PresetTheme)}
            aria-label="Select preset theme"
            title="Preset theme"
          >
            <option value="system">System</option>
            <option value="ocean">Ocean</option>
            <option value="forest">Forest</option>
            <option value="sunset">Sunset</option>
            <option value="grape">Grape</option>
            <option value="slate">Slate</option>
            <option value="latte">Latte</option>
            <option value="none">None</option>
          </select>
          <Link
            href="/saved"
            className="text-sm hover:underline inline-flex items-center gap-1"
          >
            Saved
            {savedCount > 0 && (
              <span
                className="ml-1 inline-flex items-center justify-center text-[10px] leading-none px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor:
                    "color-mix(in oklab, var(--foreground), transparent 85%)",
                  color: "var(--foreground)",
                  border: "1px solid var(--border)",
                }}
              >
                {savedCount}
              </span>
            )}
          </Link>
          <div className="relative hidden sm:block">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const dest = q.trim()
                    ? `/palettes/all?q=${encodeURIComponent(q.trim())}`
                    : "/palettes/all";
                  router.push(dest);
                }
              }}
              className="pl-9 pr-3 py-1.5 text-sm w-64 input-base"
              placeholder="Search palettes…"
              aria-label="Search palettes"
            />
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4" />
          </div>
          {active && (
            <button
              onClick={clearTheme}
              className="hidden sm:inline-flex h-8 items-center justify-center px-2 text-xs rounded-lg btn-outline"
              aria-label="Clear applied theme"
              title="Clear applied theme"
            >
              Clear theme
            </button>
          )}
          <button
            onClick={toggleTheme}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg btn-outline"
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
