import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { getPointsConfig } from "@/lib/points";

const ALLOWED_KEYS = [
  "POINTS_PER_TICK",
  "SUBSCRIBER_MULTIPLIER",
  "CHAT_BONUS_PER_MSG",
  "DAILY_CHAT_BONUS_LIMIT",
];

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;
  const config = await getPointsConfig();
  return NextResponse.json({ config });
}

export async function PUT(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const body = await req.json();
  const updates: { id: string; value: string }[] = [];

  for (const key of ALLOWED_KEYS) {
    if (body[key] !== undefined) {
      const val = parseInt(body[key], 10);
      if (isNaN(val) || val < 0) {
        return NextResponse.json({ error: `Invalid value for ${key}` }, { status: 400 });
      }
      updates.push({ id: key, value: String(val) });
    }
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: "No valid keys provided" }, { status: 400 });
  }

  for (const u of updates) {
    await prisma.config.upsert({
      where: { id: u.id },
      update: { value: u.value },
      create: { id: u.id, value: u.value },
    });
  }

  const config = await getPointsConfig();
  return NextResponse.json({ config });
}
