import { cookies } from "next/headers";
import crypto from "crypto";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export interface SessionData {
  userId?: string;
  kickId?: number;
  kickUsername?: string;
  kickAvatar?: string;
}

const SESSION_KEY =
  process.env.SESSION_SECRET ??
  "complex_password_at_least_32_characters_long_for_security";
const COOKIE_NAME = "nokepoints-session";

export function sign(data: string): string {
  const hmac = crypto.createHmac("sha256", SESSION_KEY).update(data).digest("hex");
  return `${data}.${hmac}`;
}

function verify(signed: string): string | null {
  const lastDot = signed.lastIndexOf(".");
  if (lastDot === -1) return null;
  const data = signed.slice(0, lastDot);
  const sig = signed.slice(lastDot + 1);
  const expected = crypto.createHmac("sha256", SESSION_KEY).update(data).digest("hex");
  if (sig.length !== expected.length) return null;
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  return data;
}

export async function getSession(req?: NextRequest): Promise<SessionData> {
  if (req) {
    const headerToken = req.headers.get("X-Session-Token");
    if (headerToken) {
      const json = verify(headerToken);
      if (json) {
        try {
          return JSON.parse(json);
        } catch {
          // fall through to cookie check
        }
      }
    }
  }

  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return {};

  const json = verify(raw);
  if (!json) return {};

  try {
    return JSON.parse(json);
  } catch {
    return {};
  }
}

export function setSessionCookie(res: NextResponse, data: SessionData): void {
  const json = JSON.stringify(data);
  const signed = sign(json);
  res.cookies.set(COOKIE_NAME, signed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 0,
    path: "/",
  });
}
