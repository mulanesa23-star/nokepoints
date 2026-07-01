import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeCode, getKickUser } from "@/lib/kick-api";
import { prisma } from "@/lib/prisma";
import { setSessionCookie, sign } from "@/lib/session";

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

  const isPopup = state.endsWith("_popup");
  const isExtension = !isPopup && state.endsWith("_ext");
  const cleanState = isPopup ? state.slice(0, -6) : isExtension ? state.slice(0, -4) : state;

  if (!savedState || savedState !== cleanState) {
    return NextResponse.redirect(new URL("/?error=invalid_state", req.url));
  }
  if (!codeVerifier) {
    return NextResponse.redirect(new URL("/?error=invalid_verifier", req.url));
  }

  cookieStore.delete("oauth_state");
  cookieStore.delete("oauth_code_verifier");

  try {
    const accessToken = await exchangeCode(code, codeVerifier);
    const kickUser = await getKickUser(accessToken.access_token);

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

    const sessionData = {
      userId: user.id,
      kickId: user.kickId,
      kickUsername: user.kickUsername,
      kickAvatar: user.kickAvatar ?? undefined,
    };

    if (isExtension) {
      const signed = sign(JSON.stringify(sessionData));
      const redirectUrl = new URL("/auth/extension-done", req.url);
      redirectUrl.searchParams.set("token", signed);
      return NextResponse.redirect(redirectUrl);
    }

    const res = NextResponse.redirect(new URL(isPopup ? "/auth/connected" : "/dashboard", req.url));
    setSessionCookie(res, sessionData);
    return res;
  } catch (err) {
    console.error("[auth] OAuth callback error:", err);
    return NextResponse.redirect(new URL("/?error=auth_failed", req.url));
  }
}
