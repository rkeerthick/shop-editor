import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function DashboardPage() {
  const session = await auth();

  const shop = session
    ? await db.shop.findFirst({ where: { ownerId: session.user.id } })
    : null;

  const [productCount, orderCount, revenueResult] = shop
    ? await Promise.all([
        db.product.count({ where: { shopId: shop.id, isActive: true } }),
        db.order.count({ where: { shopId: shop.id } }),
        db.order.aggregate({
          where: { shopId: shop.id, status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] } },
          _sum: { total: true },
        }),
      ])
    : [0, 0, { _sum: { total: null } }];

  const revenue = Number(revenueResult._sum.total ?? 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Welcome back, {session?.user?.name ?? "Merchant"}</h1>
      <p className="text-muted-foreground mb-8">Here&apos;s what&apos;s happening with your shop.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Active Products" value={String(productCount)} />
        <StatCard label="Total Orders" value={String(orderCount)} />
        <StatCard label="Revenue" value={`$${revenue.toFixed(2)}`} />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg border p-6">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}
