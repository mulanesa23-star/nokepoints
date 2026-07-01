import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const body = await req.json();
  const { status, note } = body;

  if (!status || !["approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "status must be 'approved' or 'rejected'" }, { status: 400 });
  }

  const existing = await prisma.rewardRedemption.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Redemption not found" }, { status: 404 });
  }

  if (existing.status !== "pending") {
    return NextResponse.json({ error: "Redemption already processed" }, { status: 409 });
  }

  const redemption = await prisma.rewardRedemption.update({
    where: { id: params.id },
    data: {
      status,
      fulfilledAt: status === "approved" ? new Date() : null,
      note: note ?? null,
    },
  });

  return NextResponse.json({ redemption });
}
