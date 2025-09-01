"use client";

import { useEffect, useMemo, useState } from "react";
import type { Palette } from "@/lib/types";
import Link from "next/link";
import { PaletteCard } from "./PaletteCard";
import { useSearchParams } from "next/navigation";
import { RCATEGORIES } from "@/data/rpalettes";

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
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search palettes, colors, tags"
            className="pl-3 pr-3 py-1.5 rounded-lg border text-sm w-72 bg-white dark:bg-slate-900 dark:border-slate-800"
            aria-label="Search palettes"
          />
        </div>
        <select
          value={sort}
          onChange={(e) =>
            setSort(e.target.value as "trending" | "latest" | "random")
          }
          className="px-2 py-1.5 rounded-lg border text-sm bg-white dark:bg-slate-900 dark:border-slate-800"
          aria-label="Sort palettes"
        >
          <option value="trending">Trending</option>
          <option value="latest">Latest</option>
          <option value="random">Random</option>
        </select>
        <select
          value={String(len)}
          onChange={(e) => setLen(Number(e.target.value))}
          className="px-2 py-1.5 rounded-lg border text-sm bg-white dark:bg-slate-900 dark:border-slate-800"
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
        <select
          value={pkg}
          onChange={(e) => setPkg(e.target.value)}
          className="px-2 py-1.5 rounded-lg border text-sm bg-white dark:bg-slate-900 dark:border-slate-800"
          aria-label="Package"
        >
          {packages.map((p) => (
            <option key={p} value={p}>
              {p === "all" ? "Any package" : p}
            </option>
          ))}
        </select>
        <select
          value={typ}
          onChange={(e) => setTyp(e.target.value)}
          className="px-2 py-1.5 rounded-lg border text-sm bg-white dark:bg-slate-900 dark:border-slate-800"
          aria-label="Type"
        >
          {types.map((t) => (
            <option key={t} value={t}>
              {t === "all" ? "Any type" : t}
            </option>
          ))}
        </select>
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          className="px-2 py-1.5 rounded-lg border text-sm bg-white dark:bg-slate-900 dark:border-slate-800"
          aria-label="Category"
        >
          <option value="all">Any category</option>
          {RCATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <div className="text-xs text-slate-500 dark:text-slate-400 ml-auto">
          {filtered.length} results
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {filtered.length ? (
          filtered.slice(0, visible).map((p) => (
            <Link key={p.id} href={`/palette/${encodeURIComponent(p.id)}`}>
              <PaletteCard palette={p} />
            </Link>
          ))
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-400">
            No palettes match.
          </div>
        )}
      </div>
    </div>
  );
}
