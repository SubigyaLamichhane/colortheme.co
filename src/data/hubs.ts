export const HUBS = [
  // special
  { slug: "all", name: "All Palettes" },
  // single colors
  { slug: "red", name: "Red Palettes" },
  { slug: "blue", name: "Blue Palettes" },
  { slug: "green", name: "Green Palettes" },
  { slug: "yellow", name: "Yellow Palettes" },
  { slug: "pink", name: "Pink Palettes" },
  { slug: "purple", name: "Purple Palettes" },
  { slug: "orange", name: "Orange Palettes" },
  { slug: "black", name: "Black Palettes" },
  { slug: "white", name: "White Palettes" },
  { slug: "grey", name: "Grey Palettes" },
  { slug: "brown", name: "Brown Palettes" },
  { slug: "beige", name: "Beige Palettes" },

  // styles
  { slug: "pastel", name: "Pastel Palettes" },
  { slug: "neon", name: "Neon Palettes" },
  { slug: "earth-tones", name: "Earth Tones" },
  { slug: "muted", name: "Muted Palettes" },
  { slug: "minimalist", name: "Minimalist Palettes" },
  { slug: "dark", name: "Dark Palettes" },
  { slug: "warm", name: "Warm Palettes" },
  { slug: "cool", name: "Cool Palettes" },

  // themes
  { slug: "summer", name: "Summer Palettes" },
  { slug: "winter", name: "Winter Palettes" },
  { slug: "autumn", name: "Autumn Palettes" },
  { slug: "spring", name: "Spring Palettes" },
  { slug: "wedding", name: "Wedding Palettes" },
  { slug: "nature", name: "Nature Palettes" },
  { slug: "luxury", name: "Luxury Palettes" },
] as const;

export type HubSlug = (typeof HUBS)[number]["slug"];
