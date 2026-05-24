import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const shop = await db.shop.findFirst({ where: { ownerId: session.user.id } });
  if (!shop) return NextResponse.json({ data: null });

  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [newOrders, pendingReviews, lowStockProducts] = await Promise.all([
    db.order.findMany({
      where: { shopId: shop.id, createdAt: { gte: yesterday } },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, total: true, createdAt: true },
    }),
    db.review.count({
      where: { product: { shopId: shop.id }, isApproved: false },
    }),
    db.product.findMany({
      where: { shopId: shop.id, isActive: true, stock: { lte: 5 } },
      orderBy: { stock: "asc" },
      take: 10,
      select: { id: true, title: true, stock: true },
    }),
  ]);

  return NextResponse.json({
    data: {
      newOrders: newOrders.map((o) => ({
        id: o.id,
        total: Number(o.total),
        createdAt: o.createdAt.toISOString(),
      })),
      pendingReviews,
      lowStockProducts,
    },
  });
}
