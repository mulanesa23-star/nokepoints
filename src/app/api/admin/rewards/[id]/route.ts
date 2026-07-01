import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const existing = await prisma.reward.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Reward not found" }, { status: 404 });
  }

  const reward = await prisma.reward.update({
    where: { id: params.id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl || null }),
      ...(body.category !== undefined && { category: body.category }),
      ...(body.pointCost !== undefined && { pointCost: body.pointCost }),
      ...(body.stock !== undefined && { stock: body.stock }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    },
  });

  return NextResponse.json({ reward });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const existing = await prisma.reward.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Reward not found" }, { status: 404 });
  }

  await prisma.reward.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
