export type Hex = `#${string}`;

export type Palette = {
  id: string; // stable id (e.g., slugified name + colors)
  name: string; // short, descriptive
  colors: Hex[]; // default 5
  hubs: string[]; // which hubs this belongs to
  likes: number; // seed / derived
  createdAt: string; // ISO
  tags?: string[]; // style/mood filters
  source?: {
    package: string; // e.g., MetBrewer
    palette?: string; // e.g., VanGogh1
    url?: string; // provenance link
  };
};
