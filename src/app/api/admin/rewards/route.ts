import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const rewards = await prisma.reward.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ rewards });
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const body = await req.json();
  const { name, description, imageUrl, category, pointCost, stock, isActive } = body;

  if (!name || !description || typeof pointCost !== "number") {
    return NextResponse.json({ error: "name, description, and pointCost are required" }, { status: 400 });
  }

  const reward = await prisma.reward.create({
    data: {
      name,
      description,
      imageUrl: imageUrl || null,
      category: category ?? "digital",
      pointCost,
      stock: stock ?? 0,
      isActive: isActive ?? true,
    },
  });

  return NextResponse.json({ reward }, { status: 201 });
}
