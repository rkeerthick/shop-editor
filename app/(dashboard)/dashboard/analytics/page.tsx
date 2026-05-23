import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { Package, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";

function getDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const shop = await db.shop.findFirst({ where: { ownerId: session.user.id } });
  if (!shop) redirect("/dashboard/setup");

  const thirtyDaysAgo = getDaysAgo(30);
  const sixtyDaysAgo = getDaysAgo(60);

  const [orders, prevOrders, topProducts, recentOrders] = await Promise.all([
    // Current 30 days
    db.order.findMany({
      where: { shopId: shop.id, status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] }, createdAt: { gte: thirtyDaysAgo } },
      select: { total: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    // Previous 30 days for comparison
    db.order.findMany({
      where: { shopId: shop.id, status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] }, createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
      select: { total: true },
    }),
    // Top products by revenue
    db.orderItem.groupBy({
      by: ["productId"],
      where: { order: { shopId: shop.id, status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] } } },
      _sum: { unitPrice: true },
      _count: { productId: true },
      orderBy: { _sum: { unitPrice: "desc" } },
      take: 5,
    }),
    // Recent orders
    db.order.findMany({
      where: { shopId: shop.id },
      include: { customer: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  // Build revenue chart data — group by day
  const revenueByDay: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = getDaysAgo(i);
    const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    revenueByDay[key] = 0;
  }
  for (const order of orders) {
    const key = new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (key in revenueByDay) revenueByDay[key] += Number(order.total);
  }
  const chartData = Object.entries(revenueByDay).map(([date, revenue]) => ({ date, revenue: Math.round(revenue * 100) / 100 }));

  // Stats
  const currentRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
  const prevRevenue = prevOrders.reduce((s, o) => s + Number(o.total), 0);
  const revenueDelta = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : null;

  // Top products with names
  const productIds = topProducts.map((p) => p.productId);
  const productNames = await db.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, title: true, images: true },
  });
  const nameMap = Object.fromEntries(productNames.map((p) => [p.id, p]));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-500 mt-1">Last 30 days performance overview.</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <KpiCard
          label="Revenue (30d)"
          value={`$${currentRevenue.toFixed(2)}`}
          delta={revenueDelta}
          icon={DollarSign}
          color="indigo"
        />
        <KpiCard
          label="Orders (30d)"
          value={String(orders.length)}
          delta={prevOrders.length > 0 ? ((orders.length - prevOrders.length) / prevOrders.length) * 100 : null}
          icon={ShoppingCart}
          color="violet"
        />
        <KpiCard
          label="Avg. Order Value"
          value={orders.length > 0 ? `$${(currentRevenue / orders.length).toFixed(2)}` : "—"}
          icon={TrendingUp}
          color="sky"
        />
        <KpiCard
          label="Top Products"
          value={String(topProducts.length)}
          icon={Package}
          color="emerald"
        />
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
        <h2 className="text-base font-semibold text-slate-800 mb-6">Revenue — last 30 days</h2>
        <RevenueChart data={chartData} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top products */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-5">Top Products</h2>
          {topProducts.length === 0 ? (
            <p className="text-slate-400 text-sm">No sales yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {topProducts.map((p, i) => {
                const product = nameMap[p.productId];
                const revenue = Number(p._sum.unitPrice ?? 0);
                return (
                  <div key={p.productId} className="flex items-center gap-3">
                    <span className="w-6 text-xs font-bold text-slate-400">#{i + 1}</span>
                    {product?.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.images[0]} alt={product.title} className="w-9 h-9 rounded-lg object-cover bg-slate-100 shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-slate-100 shrink-0 flex items-center justify-center text-lg">📦</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{product?.title ?? "Unknown"}</p>
                      <p className="text-xs text-slate-400">{p._count.productId} sold</p>
                    </div>
                    <span className="text-sm font-semibold text-indigo-600">${revenue.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent orders */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-5">Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <p className="text-slate-400 text-sm">No orders yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {recentOrders.map((o) => (
                <a
                  key={o.id}
                  href={`/dashboard/orders/${o.id}`}
                  className="flex items-center justify-between hover:bg-slate-50 rounded-lg px-2 py-1.5 -mx-2 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">{o.customer.name ?? o.customer.email}</p>
                    <p className="text-xs text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-800">${Number(o.total).toFixed(2)}</p>
                    <StatusBadge status={o.status} />
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const colorMap = {
  indigo:  { icon: "bg-indigo-600" },
  violet:  { icon: "bg-violet-600" },
  sky:     { icon: "bg-sky-600" },
  emerald: { icon: "bg-emerald-600" },
};

function KpiCard({ label, value, delta, icon: Icon, color }: {
  label: string; value: string; delta?: number | null; icon: React.ElementType; color: keyof typeof colorMap;
}) {
  const c = colorMap[color];
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
        <div className={`w-8 h-8 rounded-lg ${c.icon} flex items-center justify-center`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      {delta != null && (
        <p className={`text-xs mt-1 font-medium ${delta >= 0 ? "text-emerald-600" : "text-red-500"}`}>
          {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}% vs prev 30d
        </p>
      )}
    </div>
  );
}

const statusColors: Record<string, string> = {
  PENDING:    "text-amber-600",
  PAID:       "text-emerald-600",
  PROCESSING: "text-blue-600",
  SHIPPED:    "text-indigo-600",
  DELIVERED:  "text-green-700",
  CANCELLED:  "text-red-500",
  REFUNDED:   "text-slate-500",
};

function StatusBadge({ status }: { status: string }) {
  return <p className={`text-xs font-medium ${statusColors[status] ?? "text-slate-400"}`}>{status}</p>;
}
