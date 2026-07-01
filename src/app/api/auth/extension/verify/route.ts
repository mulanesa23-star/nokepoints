import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  
  if (!session.userId) {
    return NextResponse.json({ authenticated: false });
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

  if (!user) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    user,
  });
}
