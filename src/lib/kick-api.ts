import crypto from "crypto";

const KICK_API = "https://api.kick.com/public/v1";
const KICK_AUTH = "https://id.kick.com/oauth";

export interface KickUser {
  user_id: number;
  name: string;
  profile_picture: string | null;
}

export interface KickTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export function generateCodeVerifier(): string {
  return crypto.randomBytes(64).toString("hex");
}

export function generateCodeChallenge(verifier: string): string {
  return crypto.createHash("sha256").update(verifier).digest("base64url");
}

export function getOAuthUrl(
  state: string,
  codeChallenge: string
): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.KICK_CLIENT_ID!,
    redirect_uri: process.env.KICK_REDIRECT_URI!,
    scope: "user:read channel:read chat:write events:subscribe kicks:read",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });
  return `${KICK_AUTH}/authorize?${params}`;
}

export async function exchangeCode(
  code: string,
  codeVerifier: string
): Promise<KickTokenResponse> {
  const res = await fetch(`${KICK_AUTH}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.KICK_CLIENT_ID!,
      client_secret: process.env.KICK_CLIENT_SECRET!,
      code,
      redirect_uri: process.env.KICK_REDIRECT_URI!,
      code_verifier: codeVerifier,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to exchange code: ${res.status} ${text}`);
  }
  return res.json();
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<KickTokenResponse> {
  const res = await fetch(`${KICK_AUTH}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: process.env.KICK_CLIENT_ID!,
      client_secret: process.env.KICK_CLIENT_SECRET!,
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) throw new Error("Failed to refresh token");
  return res.json();
}

export async function getKickUser(accessToken: string): Promise<KickUser> {
  const res = await fetch(`${KICK_API}/users`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to get user: ${res.status} ${text}`);
  }
  const json = await res.json();
  const users = json.data;
  if (!Array.isArray(users) || users.length === 0) {
    throw new Error("No user data returned");
  }
  return users[0];
}

export async function getChannel(channelSlug: string) {
  const res = await fetch(`${KICK_API}/channels?slug=${channelSlug}`);
  if (!res.ok) return null;
  const json = await res.json();
  return json.data?.[0] ?? null;
}

export async function isStreamLive(broadcasterUserId: number): Promise<boolean> {
  const res = await fetch(
    `${KICK_API}/livestreams?broadcaster_user_id=${broadcasterUserId}`
  );
  if (!res.ok) return false;
  const json = await res.json();
  const streams = json.data ?? [];
  return streams.some((s: { is_live: boolean }) => s.is_live);
}
