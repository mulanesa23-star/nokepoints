import { getSession } from "./session";
import { prisma } from "./prisma";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function requireAdmin(req?: NextRequest) {
  const session = await getSession(req);
  if (!session.userId) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || user.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { user, error: null };
}
