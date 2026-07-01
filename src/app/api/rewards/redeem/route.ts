import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { rewardId } = body;

  if (!rewardId) {
    return NextResponse.json({ error: "rewardId is required" }, { status: 400 });
  }

  const [reward, user] = await Promise.all([
    prisma.reward.findUnique({ where: { id: rewardId } }),
    prisma.user.findUnique({ where: { id: session.userId } }),
  ]);

  if (!reward || !reward.isActive) {
    return NextResponse.json({ error: "Reward not found or inactive" }, { status: 404 });
  }

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (reward.stock <= 0) {
    return NextResponse.json({ error: "Out of stock" }, { status: 409 });
  }

  if (user.points < reward.pointCost) {
    return NextResponse.json({ error: "Insufficient points" }, { status: 402 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const redemption = await tx.rewardRedemption.create({
      data: {
        userId: user.id,
        rewardId: reward.id,
      },
    });

    const updatedUser = await tx.user.update({
      where: { id: user.id },
      data: { points: { decrement: reward.pointCost } },
    });

    await tx.reward.update({
      where: { id: reward.id },
      data: { stock: { decrement: 1 } },
    });

    await tx.pointsTransaction.create({
      data: {
        userId: user.id,
        amount: -reward.pointCost,
        type: "redemption",
        reference: redemption.id,
        note: `Redeemed: ${reward.name}`,
      },
    });

    return { updatedUser, redemption };
  });

  return NextResponse.json({
    success: true,
    points: result.updatedUser.points,
    redemption: {
      id: result.redemption.id,
      status: result.redemption.status,
    },
  });
}
