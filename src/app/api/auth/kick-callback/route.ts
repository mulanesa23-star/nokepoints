import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeCode, getKickUser } from "@/lib/kick-api";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/session";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error || !code || !state) {
    return NextResponse.redirect(new URL("/?error=auth_failed", req.url));
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get("oauth_state")?.value;
  const codeVerifier = cookieStore.get("oauth_code_verifier")?.value;

  if (!savedState || savedState !== state) {
    return NextResponse.redirect(new URL("/?error=invalid_state", req.url));
  }
  if (!codeVerifier) {
    return NextResponse.redirect(new URL("/?error=invalid_verifier", req.url));
  }

  cookieStore.delete("oauth_state");
  cookieStore.delete("oauth_code_verifier");

  try {
    const token = await exchangeCode(code, codeVerifier);
    const kickUser = await getKickUser(token.access_token);

    const adminUsername = process.env.ADMIN_KICK_USERNAME;
    const role = adminUsername && kickUser.name.toLowerCase() === adminUsername.toLowerCase() ? "admin" : "user";

    const user = await prisma.user.upsert({
      where: { kickId: kickUser.user_id },
      update: {
        kickUsername: kickUser.name,
        kickAvatar: kickUser.profile_picture,
        role,
      },
      create: {
        kickId: kickUser.user_id,
        kickUsername: kickUser.name,
        kickAvatar: kickUser.profile_picture,
        role,
      },
    });

    const res = NextResponse.redirect(new URL("/dashboard", req.url));
    setSessionCookie(res, {
      userId: user.id,
      kickId: user.kickId,
      kickUsername: user.kickUsername,
      kickAvatar: user.kickAvatar ?? undefined,
    });
    return res;
  } catch (err) {
    console.error("[auth] OAuth callback error:", err);
    return NextResponse.redirect(new URL("/?error=auth_failed", req.url));
  }
}
