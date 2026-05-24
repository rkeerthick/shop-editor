import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ shopSlug: string }> }
) {
  const { shopSlug } = await params;

  const shop = await db.shop.findUnique({ where: { slug: shopSlug } });
  if (!shop || !shop.isActive) return NextResponse.json({ data: [] });

  const rates = await db.shippingRate.findMany({
    where: { shopId: shop.id, isActive: true },
    orderBy: { price: "asc" },
    select: { id: true, name: true, price: true, estimatedDays: true },
  });

  return NextResponse.json({ data: rates });
}
