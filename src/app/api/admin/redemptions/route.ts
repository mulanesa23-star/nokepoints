import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const redemptions = await prisma.rewardRedemption.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { kickUsername: true, kickAvatar: true } },
      reward: { select: { name: true, pointCost: true } },
    },
  });

  return NextResponse.json({ redemptions });
}
