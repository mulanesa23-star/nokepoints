import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);
  const offset = parseInt(searchParams.get("offset") ?? "0");

  const users = await prisma.user.findMany({
    where: { totalEarned: { gt: 0 } },
    orderBy: { totalEarned: "desc" },
    take: limit,
    skip: offset,
    select: {
      kickUsername: true,
      kickAvatar: true,
      totalEarned: true,
      points: true,
    },
  });

  const total = await prisma.user.count({
    where: { totalEarned: { gt: 0 } },
  });

  return NextResponse.json({ users, total, limit, offset });
}
