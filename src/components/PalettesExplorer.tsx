"use client";

import { useEffect, useMemo, useState } from "react";
import type { Palette } from "@/lib/types";
import Link from "next/link";
import { PaletteCard } from "./PaletteCard";
import { useSearchParams } from "next/navigation";
import { RCATEGORIES } from "@/data/rpalettes";
import { SidebarSaved } from "./SidebarSaved";

type Props = {
  items: Palette[];
};

export function PalettesExplorer({ items }: Props) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"trending" | "latest" | "random">(
    "trending"
  );
  const [len, setLen] = useState<number>(0); // 0=any
  const [pkg, setPkg] = useState<string>("all");
  const [typ, setTyp] = useState<string>("all");
  const [cat, setCat] = useState<string>("all");
  const [visible, setVisible] = useState<number>(40); // paging window

  useEffect(() => {
    const q = searchParams.get("q") || "";
    setQuery(q);
  }, [searchParams]);

  const packages = useMemo(() => {
    const s = new Set<string>();
    for (const p of items) {
      const pkgTag = (p.tags || []).find(() => true); // first tag is package in our mapper
      if (pkgTag) s.add(pkgTag);
    }
    return ["all", ...Array.from(s).sort((a, b) => a.localeCompare(b))];
  }, [items]);

  const types = useMemo(() => {
    const s = new Set<string>();
    for (const p of items) {
      const t = (p.tags || [])[1];
      if (t) s.add(t);
    }
    return ["all", ...Array.from(s).sort((a, b) => a.localeCompare(b))];
  }, [items]);

  const filtered = useMemo(() => {
    let out = items;
    if (query.trim()) {
      const q = query.toLowerCase();
      out = out.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.colors.some((c) => c.toLowerCase().includes(q)) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }
    if (len > 0) {
      out = out.filter((p) => p.colors.length === len);
    }
    if (pkg !== "all") {
      out = out.filter((p) => (p.tags || [])[0] === pkg);
    }
    if (typ !== "all") {
      out = out.filter((p) => (p.tags || [])[1] === typ);
    }
    if (cat !== "all") {
      out = out.filter((p) => (p.tags || []).includes(cat));
    }
    if (sort === "trending") {
      out = [...out].sort((a, b) => b.likes - a.likes);
    } else if (sort === "latest") {
      out = [...out].sort(
        (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
      );
    } else if (sort === "random") {
      out = [...out].sort(() => Math.random() - 0.5);
    }
    return out;
  }, [items, query, sort, len, pkg, typ, cat]);

  // Infinite scroll: increase visible on scroll near bottom
  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const vh = window.innerHeight;
      const full = document.documentElement.scrollHeight;
      if (scrollY + vh >= full - 600) {
        setVisible((v) => (v < filtered.length ? v + 40 : v));
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [filtered.length]);

  // Reset visible when filters/query change
  useEffect(() => {
    setVisible(40);
  }, [query, sort, len, pkg, typ, cat]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
      {/* Filters Sidebar (stacks on top for mobile) */}
      <aside className="space-y-4 lg:sticky lg:top-4 h-fit">
        <div className="rounded-2xl border p-4 theme-border theme-surface">
          <h3 className="font-semibold text-sm mb-3">Filter Palettes</h3>
          <div className="space-y-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search palettes, colors, tags"
              className="w-full pl-3 pr-3 py-2 text-sm input-base"
              aria-label="Search palettes"
            />

            <div className="grid grid-cols-1 gap-3">
              <label className="text-xs font-medium text-secondary">
                Sort
                <select
                  value={sort}
                  onChange={(e) =>
                    setSort(e.target.value as "trending" | "latest" | "random")
                  }
                  className="mt-1 w-full px-2 py-2 text-sm input-base"
                  aria-label="Sort palettes"
                >
                  <option value="trending">Trending</option>
                  <option value="latest">Latest</option>
                  <option value="random">Random</option>
                </select>
              </label>

              <label className="text-xs font-medium text-secondary">
                Color count
                <select
                  value={String(len)}
                  onChange={(e) => setLen(Number(e.target.value))}
                  className="mt-1 w-full px-2 py-2 text-sm input-base"
                  aria-label="Color count"
                >
                  <option value="0">Any length</option>
                  <option value="3">3 colors</option>
                  <option value="4">4 colors</option>
                  <option value="5">5 colors</option>
                  <option value="6">6 colors</option>
                  <option value="7">7 colors</option>
                  <option value="8">8 colors</option>
                </select>
              </label>

              <label className="text-xs font-medium text-secondary">
                Package
                <select
                  value={pkg}
                  onChange={(e) => setPkg(e.target.value)}
                  className="mt-1 w-full px-2 py-2 text-sm input-base"
                  aria-label="Package"
                >
                  {packages.map((p) => (
                    <option key={p} value={p}>
                      {p === "all" ? "Any package" : p}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-xs font-medium text-secondary">
                Type
                <select
                  value={typ}
                  onChange={(e) => setTyp(e.target.value)}
                  className="mt-1 w-full px-2 py-2 text-sm input-base"
                  aria-label="Type"
                >
                  {types.map((t) => (
                    <option key={t} value={t}>
                      {t === "all" ? "Any type" : t}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-xs font-medium text-secondary">
                Category
                <select
                  value={cat}
                  onChange={(e) => setCat(e.target.value)}
                  className="mt-1 w-full px-2 py-2 text-sm input-base"
                  aria-label="Category"
                >
                  <option value="all">Any category</option>
                  {RCATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-muted">
                {filtered.length} results
              </div>
              <button
                onClick={() => {
                  setQuery("");
                  setSort("trending");
                  setLen(0);
                  setPkg("all");
                  setTyp("all");
                  setCat("all");
                }}
                className="text-xs px-2 py-1 rounded btn-outline"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
        {/* Saved palettes moved here from global layout */}
        <SidebarSaved />
      </aside>

      {/* Results */}
      <section className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.length ? (
            filtered.slice(0, visible).map((p) => (
              <Link key={p.id} href={`/palette/${encodeURIComponent(p.id)}`}>
                <PaletteCard palette={p} />
              </Link>
            ))
          ) : (
            <div className="text-sm text-secondary">No palettes match.</div>
          )}
        </div>
      </section>
    </div>
  );
}
