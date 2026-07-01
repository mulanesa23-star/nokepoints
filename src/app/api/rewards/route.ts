import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  let userId = session.userId ?? null;

  const rewards = await prisma.reward.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  let userPoints = 0;
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { points: true } });
    if (user) userPoints = user.points;
  }

  return NextResponse.json({ rewards, userPoints });
}
