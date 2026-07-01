import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";
import { getOAuthUrl, generateCodeChallenge } from "@/lib/kick-api";

export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("mode");
  const suffix = mode === "popup" ? "_popup" : mode === "extension" ? "_ext" : "";
  const cleanState = crypto.randomBytes(32).toString("hex");
  const state = cleanState + suffix;
  const codeVerifier = crypto.randomBytes(64).toString("hex");
  const codeChallenge = generateCodeChallenge(codeVerifier);

  const cookieStore = await cookies();
  cookieStore.set("oauth_state", cleanState, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10,
    path: "/",
  });
  cookieStore.set("oauth_code_verifier", codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10,
    path: "/",
  });

  return NextResponse.redirect(getOAuthUrl(state, codeChallenge));
}
