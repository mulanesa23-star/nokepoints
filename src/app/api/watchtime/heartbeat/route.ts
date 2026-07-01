import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { calcWatchtimePoints } from "@/lib/points";

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { channel, tick } = body;

  if (!channel || typeof tick !== "number") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const pointsToAward = await calcWatchtimePoints(user.isSubscriber);

  const [updatedUser] = await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        points: { increment: pointsToAward },
        totalEarned: { increment: pointsToAward },
      },
    }),
    prisma.pointsTransaction.create({
      data: {
        userId: user.id,
        amount: pointsToAward,
        type: "watchtime",
        reference: `tick-${tick}`,
        note: `Watchtime tick on ${channel}`,
      },
    }),
    prisma.watchtimeSession.create({
      data: {
        userId: user.id,
        channel,
        durationSec: 120,
        pointsAwarded: pointsToAward,
        startedAt: new Date(),
        endedAt: new Date(),
      },
    }),
  ]);

  return NextResponse.json({
    points: updatedUser.points,
    awarded: pointsToAward,
  });
}
