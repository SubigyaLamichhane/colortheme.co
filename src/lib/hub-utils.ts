import { HUBS, type HubSlug } from "@/data/hubs";
import { PALETTES } from "@/data/palettes";
import type { Palette } from "./types";

export function allHubSlugs(): HubSlug[] {
  return HUBS.map((h) => h.slug as HubSlug);
}

export function hubBySlug(slug: string) {
  return HUBS.find((h) => h.slug === slug);
}

export function palettesForHub(slug: string): Palette[] {
  return PALETTES.filter((p) => p.hubs.includes(slug));
}
