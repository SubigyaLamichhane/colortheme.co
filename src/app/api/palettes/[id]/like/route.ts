import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const ip = xff.split(",")[0]?.trim();
    if (ip) return ip;
  }
  const ip = req.headers.get("x-real-ip") || "unknown";
  return ip;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const ip = getClientIp(req);
  const paletteId = params.id;
  try {
    const like = await prisma.like.findUnique({
      where: { ip_paletteId: { ip, paletteId } },
      select: { id: true },
    });
    const count = await prisma.like.count({ where: { paletteId } });
    return NextResponse.json({ liked: Boolean(like), count });
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
      where: { ip_paletteId: { ip, paletteId } },
      select: { id: true },
    });

    if (existing) {
      await prisma.like.delete({ where: { ip_paletteId: { ip, paletteId } } });
    } else {
      await prisma.like.create({ data: { ip, paletteId } });
    }

    const liked = !existing;
    const count = await prisma.like.count({ where: { paletteId } });
    return NextResponse.json({ liked, count });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Failed to toggle like: ${message}` },
      { status: 500 }
    );
  }
}
