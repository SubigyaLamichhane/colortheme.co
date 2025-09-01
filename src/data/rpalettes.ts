import type { Palette } from "@/lib/types";
import RAW_JSON from "@/data/generated/rpalettes.json";
// This file maps the generated rpalettes.json (if exists) into our Palette type.
// During dev before generation, we fallback to an empty array.

type Raw = {
  id: string;
  name: string;
  group: string;
  palette?: string;
  colors: string[];
  categories?: string[];
  type?: string | null;
  length?: number;
};

// Statically import generated JSON (produced by scripts/extract-palettes.mjs)
const RAW: Raw[] = (RAW_JSON as unknown as Raw[]) || [];

function deriveHubs(raw: Raw): string[] {
  const hubs = new Set<string>();
  // group (package) as a hub category
  if (raw.group) hubs.add(raw.group.toLowerCase());
  // type hub
  if (raw.type) hubs.add(String(raw.type).toLowerCase());
  // categories from frontmatter
  for (const c of raw.categories || []) {
    const slug = c
      .toLowerCase()
      .replace(/\s*[-–—:]\s*/g, "-")
      .replace(/\s+/g, "-");
    hubs.add(slug);
  }
  // add color family hubs crudely based on first color
  const first = raw.colors[0]?.replace("#", "");
  if (first) {
    const r = parseInt(first.slice(0, 2), 16);
    const g = parseInt(first.slice(2, 4), 16);
    const b = parseInt(first.slice(4, 6), 16);
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    const d = max - min;
    const h =
      d === 0
        ? 0
        : max === r
        ? ((g - b) / d) % 6
        : max === g
        ? (b - r) / d + 2
        : (r - g) / d + 4;
    const hue = Math.round(h * 60);
    const add = (s: string) => hubs.add(s);
    if (hue < 20 || hue >= 340) add("red");
    else if (hue < 50) add("orange");
    else if (hue < 70) add("yellow");
    else if (hue < 170) add("green");
    else if (hue < 210) add("cyan");
    else if (hue < 260) add("blue");
    else if (hue < 290) add("purple");
    else add("pink");
  }
  // Always include 'all'
  hubs.add("all");
  return Array.from(hubs);
}

export const RPALETTES: Palette[] = RAW.map((r) => {
  const id = r.id;
  const tags: string[] = [
    r.group,
    r.type || "",
    ...(r.categories || []),
  ].filter(Boolean);
  const pkg = r.group;
  const mapped: Palette = {
    id,
    name: r.name,
    colors: r.colors.slice(0, 8) as Palette["colors"],
    hubs: deriveHubs(r),
    likes: Math.floor(Math.random() * 5000) + 50, // seed fake popularity
    createdAt: new Date(
      2020 + Math.floor(Math.random() * 5),
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1
    ).toISOString(),
    tags,
    source: {
      package: pkg,
      palette: r.palette,
      url: `https://github.com/EmilHvitfeldt/r-color-palettes/tree/master/discrete/${encodeURIComponent(
        pkg
      )}/${encodeURIComponent(r.palette || "")}`,
    },
  };
  return mapped;
});

export const RCATEGORIES: string[] = Array.from(
  new Set(
    (RAW.flatMap((r) => r.categories || []) as string[]).map((c) => c.trim())
  )
).sort((a, b) => a.localeCompare(b));
