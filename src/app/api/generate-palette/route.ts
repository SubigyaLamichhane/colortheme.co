import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

export const runtime = "nodejs"; // ensure Node runtime for SDK
export const dynamic = "force-dynamic"; // disable caching for this route

const MODEL = "gpt-4o-mini";

type Color = { hex: string; name?: string };
type Palette = { name: string; colors: Color[] };

const BodySchema = z.object({
  prompt: z.string().max(200).optional(),
  count: z.number().int().min(3).max(8).optional(),
});

const AiSchema = z.object({
  name: z.string().min(1).max(60),
  colors: z
    .array(
      z.object({
        hex: z.string(),
        name: z.string().optional(),
      })
    )
    .min(1),
});

function normalizeHex(hex: string): string | null {
  const h = hex.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{6}$/.test(h)) return `#${h.toUpperCase()}`;
  if (/^[0-9a-fA-F]{3}$/.test(h)) {
    const [r, g, b] = h.split("");
    return `#${(r + r + g + g + b + b).toUpperCase()}`;
  }
  return null;
}

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY" },
      { status: 500 }
    );
  }

  let incoming: unknown;
  try {
    incoming = await req.json();
  } catch {
    incoming = {};
  }

  const parsedBody = BodySchema.safeParse(incoming);
  const prompt =
    parsedBody.success && parsedBody.data.prompt
      ? parsedBody.data.prompt
      : "modern UI, accessible, balanced";
  const count =
    parsedBody.success && typeof parsedBody.data.count === "number"
      ? parsedBody.data.count
      : 5;

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const system = `You are a color palette designer. Generate a concise JSON object with a palette name and ${count} distinct, harmonious hex colors. Return ONLY JSON. Prefer accessible contrast and avoid near-duplicates.`;
    const user = `Theme/description: ${prompt}\nJSON schema:\n{\n  "name": "string",\n  "colors": [\n    { "hex": "#RRGGBB", "name": "optional human-friendly color name" }\n  ]\n}`;

    const completion = await client.chat.completions.create({
      model: MODEL,
      temperature: 0.8,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });

    const content = completion.choices?.[0]?.message?.content ?? "{}";
    let modelPalette: Palette | null = null;
    try {
      const json = JSON.parse(content);
      const validated = AiSchema.safeParse(json);
      if (validated.success) modelPalette = validated.data;
    } catch {
      // ignore parse errors; we'll fallback below
    }

    const seen = new Set<string>();
    const cleanColors: Color[] = [];
    const colorsIn = modelPalette?.colors ?? [];
    for (const c of colorsIn) {
      const norm = c?.hex ? normalizeHex(String(c.hex)) : null;
      if (!norm || seen.has(norm)) continue;
      seen.add(norm);
      cleanColors.push({
        hex: norm,
        name: c?.name ? String(c.name).slice(0, 40) : undefined,
      });
      if (cleanColors.length >= count) break;
    }

    if (cleanColors.length < count) {
      const fallbacks = [
        "#FF6B6B",
        "#4D96FF",
        "#FFD166",
        "#06D6A0",
        "#8338EC",
        "#EF476F",
        "#118AB2",
        "#073B4C",
      ];
      for (const f of fallbacks) {
        if (cleanColors.length >= count) break;
        if (!seen.has(f)) {
          seen.add(f);
          cleanColors.push({ hex: f });
        }
      }
    }

    const result: Palette = {
      name: String(modelPalette?.name || "AI Palette").slice(0, 60),
      colors: cleanColors,
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("AI palette error:", err);
    return NextResponse.json(
      { error: "Failed to generate palette" },
      { status: 500 }
    );
  }
}
