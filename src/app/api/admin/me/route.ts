import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session.userId) {
    return NextResponse.json({ admin: false }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  return NextResponse.json({ admin: user?.role === "admin" });
}
