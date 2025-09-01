import { HUBS, type HubSlug } from "@/data/hubs";
import { PALETTES } from "@/data/palettes";
import { RPALETTES } from "@/data/rpalettes";
import type { Palette } from "./types";

export function allHubSlugs(): HubSlug[] {
  return HUBS.map((h) => h.slug as HubSlug);
}

export function hubBySlug(slug: string) {
  return HUBS.find((h) => h.slug === slug);
}

export function palettesForHub(slug: string): Palette[] {
  const merged = [...RPALETTES, ...PALETTES];
  if (slug === "all") return merged;
  return merged.filter((p) => p.hubs.includes(slug));
}
