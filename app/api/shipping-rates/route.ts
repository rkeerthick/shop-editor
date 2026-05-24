import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  price: z.number().min(0),
  estimatedDays: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const shop = await db.shop.findFirst({ where: { ownerId: session.user.id } });
  if (!shop) return NextResponse.json({ error: "Shop not found" }, { status: 404 });

  const rates = await db.shippingRate.findMany({
    where: { shopId: shop.id },
    orderBy: { price: "asc" },
  });

  return NextResponse.json({ data: rates });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const shop = await db.shop.findFirst({ where: { ownerId: session.user.id } });
  if (!shop) return NextResponse.json({ error: "Shop not found" }, { status: 404 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const rate = await db.shippingRate.create({
    data: { ...parsed.data, shopId: shop.id },
  });

  return NextResponse.json({ data: rate }, { status: 201 });
}
