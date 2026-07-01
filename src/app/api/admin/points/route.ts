import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const body = await req.json();
  const { kickUsername, amount, note } = body;

  if (!kickUsername || typeof amount !== "number" || amount === 0) {
    return NextResponse.json(
      { error: "kickUsername and a non-zero amount are required" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findFirst({ where: { kickUsername } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (amount < 0 && user.points < Math.abs(amount)) {
    return NextResponse.json(
      { error: `User only has ${user.points} points, cannot remove ${Math.abs(amount)}` },
      { status: 400 }
    );
  }

  const [updated] = await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        points: { increment: amount },
        ...(amount > 0 && { totalEarned: { increment: amount } }),
      },
    }),
    prisma.pointsTransaction.create({
      data: {
        userId: user.id,
        amount,
        type: "admin_adjustment",
        note: note?.trim() || (amount > 0 ? "Ajuste manual (admin)" : "Descuento manual (admin)"),
      },
    }),
  ]);

  return NextResponse.json({
    success: true,
    user: {
      kickUsername: user.kickUsername,
      previousPoints: user.points,
      currentPoints: updated.points,
      change: amount,
    },
  });
}
