#!/usr/bin/env ts-node
/**
 * Extract palettes from r-color-palettes/discrete into a JSON file
 * Output: src/data/generated/rpalettes.json
 */
import { promises as fs } from "fs";
import path from "path";

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "r-color-palettes", "discrete");
const OUT_DIR = path.join(ROOT, "src", "data", "generated");
const OUT_FILE = path.join(OUT_DIR, "rpalettes.json");

type Extracted = {
  id: string;
  name: string;
  group: string; // package/family e.g., MetBrewer
  colors: string[];
  categories: string[]; // from frontmatter categories
  type?: string;
};

async function readFileSafe(fp: string) {
  try {
    return await fs.readFile(fp, "utf8");
  } catch {
    return null;
  }
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function parseFrontmatter(md: string) {
  const m = md.match(/^---([\s\S]*?)---/);
  if (!m) return {} as any;
  const yaml = m[1];
  const out: any = {};
  const lines = yaml.split(/\r?\n/);
  let key: string | null = null;
  for (const line of lines) {
    if (!line.trim()) continue;
    const catMatch = line.match(/^\s{2}-\s+(.*)$/);
    if (key === "categories" && catMatch) {
      out.categories = out.categories || [];
      out.categories.push(catMatch[1].trim());
      continue;
    }
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) {
      key = kv[1];
      let val = kv[2];
      if (val === "") continue;
      if (val.startsWith('"') || val.startsWith("'")) {
        val = val.slice(1, -1);
      }
      out[key] = val;
    }
  }
  return out;
}

function parseColors(md: string): string[] | null {
  // Colors appear in an R code block: c("#HEX", "#HEX", ...)
  const rBlock = md.match(/```r[\s\S]*?c\(([^)]*)\)[\s\S]*?```/i);
  if (!rBlock) return null;
  const inner = rBlock[1];
  const hexes = [...inner.matchAll(/#([0-9a-f]{6}|[0-9a-f]{8})/gi)].map(
    (m) => "#" + m[1].toUpperCase()
  );
  return hexes.length ? hexes : null;
}

async function extract(): Promise<Extracted[]> {
  const groups = await fs.readdir(SRC_DIR);
  const results: Extracted[] = [];
  for (const group of groups) {
    const groupPath = path.join(SRC_DIR, group);
    const stats = await fs.lstat(groupPath);
    if (!stats.isDirectory()) continue;
    const palettes = await fs.readdir(groupPath);
    for (const pal of palettes) {
      const palPath = path.join(groupPath, pal);
      const palStats = await fs.lstat(palPath);
      if (!palStats.isDirectory()) continue;
      const mdPath = path.join(palPath, "index.md");
      const md = await readFileSafe(mdPath);
      if (!md) continue;
      const fm = parseFrontmatter(md);
      const colors = parseColors(md);
      if (!colors || colors.length < 3) continue; // skip invalid
      const name = `${group} - ${pal}`;
      const id = `${slugify(group)}-${slugify(pal)}-${colors
        .join("-")
        .replace(/#/g, "")}`.slice(0, 120);
      const categories = Array.isArray(fm.categories) ? fm.categories : [];
      results.push({ id, name, group, colors, categories, type: fm.type });
    }
  }
  return results;
}

async function main() {
  const data = await extract();
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(OUT_FILE, JSON.stringify(data, null, 2));
  console.log(`Extracted ${data.length} palettes -> ${OUT_FILE}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
