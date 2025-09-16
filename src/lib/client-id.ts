import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const TOKEN_COOKIE = "ct_uid"; // HttpOnly identifier
const LAST_COOKIE = "ct_last"; // HttpOnly last-like timestamp (basic cooldown)

function getSecret() {
  return (
    process.env.LIKE_TOKEN_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "dev-like-secret"
  );
}

function randomToken(): string {
  return crypto.randomBytes(24).toString("base64url");
}

function sign(value: string): string {
  const h = crypto
    .createHmac("sha256", getSecret())
    .update(value)
    .digest("base64url");
  return `${value}.${h}`;
}

function verify(signed: string | undefined | null): string | null {
  if (!signed) return null;
  const dot = signed.lastIndexOf(".");
  if (dot <= 0) return null;
  const value = signed.slice(0, dot);
  const sig = signed.slice(dot + 1);
  const expected = crypto
    .createHmac("sha256", getSecret())
    .update(value)
    .digest("base64url");
  // Use timing-safe compare
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  if (!crypto.timingSafeEqual(a, b)) return null;
  return value;
}

export function getClientToken(req: NextRequest): {
  token: string;
  setToken: boolean;
} {
  const cookie = req.cookies.get(TOKEN_COOKIE)?.value;
  const token = verify(cookie);
  if (token) return { token, setToken: false };
  return { token: randomToken(), setToken: true };
}

export function withClientCookies(
  res: NextResponse,
  options: { token?: string; setToken?: boolean; setLastTs?: number | null }
) {
  const { token, setToken, setLastTs } = options;
  if (setToken && token) {
    res.cookies.set(TOKEN_COOKIE, sign(token), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  }
  if (typeof setLastTs === "number") {
    res.cookies.set(LAST_COOKIE, String(setLastTs), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return res;
}

export function readCooldown(req: NextRequest): number | null {
  const raw = req.cookies.get(LAST_COOKIE)?.value;
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}
