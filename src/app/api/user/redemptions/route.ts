import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const redemptions = await prisma.rewardRedemption.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: {
      reward: {
        select: { name: true, pointCost: true, imageUrl: true, category: true },
      },
    },
  });

  return NextResponse.json({ redemptions });
}
