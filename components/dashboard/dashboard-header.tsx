import { db } from "@/lib/db";
import { NotificationsBell } from "./notifications-bell";

export async function DashboardHeader({ shopId }: { shopId: string }) {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [newOrders, pendingReviews, lowStockProducts] = await Promise.all([
    db.order.findMany({
      where: { shopId, createdAt: { gte: yesterday } },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, total: true, createdAt: true },
    }),
    db.review.count({
      where: { product: { shopId }, isApproved: false },
    }),
    db.product.findMany({
      where: { shopId, isActive: true, stock: { lte: 5 } },
      orderBy: { stock: "asc" },
      take: 10,
      select: { id: true, title: true, stock: true },
    }),
  ]);

  const data = {
    newOrders: newOrders.map((o) => ({
      id: o.id,
      total: Number(o.total),
      createdAt: o.createdAt.toISOString(),
    })),
    pendingReviews,
    lowStockProducts,
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-8 flex items-center justify-end gap-2 shrink-0">
      <NotificationsBell initialData={data} />
    </header>
  );
}
