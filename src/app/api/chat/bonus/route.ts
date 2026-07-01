import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getPointsConfig, getTodayStart } from "@/lib/points";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { messageId, channel } = body;

  if (!messageId || !channel) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const existing = await prisma.chatMessage.findUnique({
    where: { messageId },
  });
  if (existing) {
    return NextResponse.json({ error: "Duplicate" }, { status: 409 });
  }

  const cfg = await getPointsConfig();
  const todayStart = getTodayStart();
  const todayCount = await prisma.chatMessage.count({
    where: {
      userId: session.userId,
      createdAt: { gte: todayStart },
    },
  });

  if (todayCount >= cfg.DAILY_CHAT_BONUS_LIMIT) {
    return NextResponse.json({ error: "Daily limit reached" }, { status: 429 });
  }

  const [updatedUser] = await prisma.$transaction([
    prisma.user.update({
      where: { id: session.userId },
      data: {
        points: { increment: cfg.CHAT_BONUS_PER_MSG },
        totalEarned: { increment: cfg.CHAT_BONUS_PER_MSG },
      },
    }),
    prisma.pointsTransaction.create({
      data: {
        userId: session.userId,
        amount: cfg.CHAT_BONUS_PER_MSG,
        type: "chat_bonus",
        reference: messageId,
        note: `Chat message on ${channel}`,
      },
    }),
    prisma.chatMessage.create({
      data: {
        userId: session.userId,
        messageId,
        channel,
      },
    }),
  ]);

  return NextResponse.json({
    points: updatedUser.points,
    awarded: cfg.CHAT_BONUS_PER_MSG,
    dailyCount: todayCount + 1,
    dailyLimit: cfg.DAILY_CHAT_BONUS_LIMIT,
  });
}
