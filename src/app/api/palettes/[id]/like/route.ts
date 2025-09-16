import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ALLOWED_ORIGINS, LIKE_COOLDOWN_SECONDS } from "@/lib/constants";
import {
  getClientToken,
  withClientCookies,
  readCooldown,
} from "@/lib/client-id";

function sanitizeIp(raw?: string | null): string | null {
  if (!raw) return null;
  // Take first if comma-separated and trim
  let ip = raw.split(",")[0]?.trim();
  if (!ip) return null;
  // Remove IPv6 IPv4-mapped prefix
  ip = ip.replace(/^::ffff:/, "");
  // Strip brackets and port if present
  const m = ip.match(/^\[?([a-fA-F0-9:.]+)\]?(:\d+)?$/);
  return m?.[1] ?? ip;
}

function getClientIp(req: NextRequest): string {
  // Prefer Next provided ip when available
  const maybeIp = (req as unknown as { ip?: string | null }).ip;
  const fromReq = sanitizeIp(maybeIp ?? undefined);
  if (fromReq) return fromReq;

  const headersToCheck = [
    "x-forwarded-for",
    "x-real-ip",
    "cf-connecting-ip",
    "x-client-ip",
    "x-vercel-ip",
  ];
  for (const h of headersToCheck) {
    const v = sanitizeIp(req.headers.get(h));
    if (v) return v;
  }
  // Fallback for local dev
  return "127.0.0.1";
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { token, setToken } = getClientToken(req);
  const paletteId = params.id;
  try {
    const like = await prisma.like.findUnique({
      where: { clientId_paletteId: { clientId: token, paletteId } },
      select: { id: true },
    });
    const count = await prisma.like.count({ where: { paletteId } });
    const res = NextResponse.json({ liked: Boolean(like), count });
    return withClientCookies(res, { token, setToken, setLastTs: null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Failed to load like status: ${message}` },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const ip = getClientIp(req);
  const { token, setToken } = getClientToken(req);
  // Basic origin check (skip in development without env)
  const origin = req.headers.get("origin") || undefined;
  if (ALLOWED_ORIGINS.length && origin && !ALLOWED_ORIGINS.includes(origin)) {
    return NextResponse.json({ error: "Origin not allowed" }, { status: 403 });
  }

  // Simple cooldown using cookie timestamp
  const last = readCooldown(req);
  const now = Math.floor(Date.now() / 1000);
  if (last && now - last < LIKE_COOLDOWN_SECONDS) {
    return NextResponse.json(
      { error: "Please wait before toggling again." },
      { status: 429 }
    );
  }
  const paletteId = params.id;
  try {
    // Ensure palette exists, create if missing with minimal data
    const body = (await req.json().catch(() => ({}))) as {
      slug?: string;
      name?: string;
      colors?: string[];
    };
    await prisma.palette.upsert({
      where: { id: paletteId },
      update: {},
      create: {
        id: paletteId,
        slug: body.slug ?? paletteId,
        name: body.name ?? body.slug ?? paletteId,
        colors: body.colors ?? [],
      },
    });

    const existing = await prisma.like.findUnique({
      where: { clientId_paletteId: { clientId: token, paletteId } },
      select: { id: true },
    });

    if (existing) {
      await prisma.like.delete({
        where: { clientId_paletteId: { clientId: token, paletteId } },
      });
    } else {
      await prisma.like.create({ data: { ip, clientId: token, paletteId } });
    }

    const liked = !existing;
    const count = await prisma.like.count({ where: { paletteId } });
    const res = NextResponse.json({ liked, count });
    return withClientCookies(res, { token, setToken, setLastTs: now });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Failed to toggle like: ${message}` },
      { status: 500 }
    );
  }
}
