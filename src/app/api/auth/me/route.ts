import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ user: null });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      kickId: true,
      kickUsername: true,
      kickAvatar: true,
      points: true,
      totalEarned: true,
      isSubscriber: true,
    },
  });

  return NextResponse.json({ user });
}
