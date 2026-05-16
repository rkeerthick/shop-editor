import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ shopSlug: string }> }
) {
  const { shopSlug } = await params;

  const shop = await db.shop.findUnique({ where: { slug: shopSlug } });
  if (!shop || !shop.isActive) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const products = await db.product.findMany({
    where: { shopId: shop.id, isActive: true },
    include: { variants: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: products });
}
