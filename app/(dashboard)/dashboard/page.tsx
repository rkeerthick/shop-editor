import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Package, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  const shop = session
    ? await db.shop.findFirst({ where: { ownerId: session.user.id } })
    : null;

  const [productCount, orderCount, revenueResult, pendingCount] = shop
    ? await Promise.all([
        db.product.count({ where: { shopId: shop.id, isActive: true } }),
        db.order.count({ where: { shopId: shop.id } }),
        db.order.aggregate({
          where: { shopId: shop.id, status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] } },
          _sum: { total: true },
        }),
        db.order.count({ where: { shopId: shop.id, status: "PENDING" } }),
      ])
    : [0, 0, { _sum: { total: null } }, 0];

  const revenue = Number(revenueResult._sum.total ?? 0);
  const firstName = session?.user?.name?.split(" ")[0] ?? "Merchant";

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {firstName}</h1>
        <p className="text-slate-500 mt-1">Here&apos;s what&apos;s happening with your shop today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatCard
          label="Revenue"
          value={`$${revenue.toFixed(2)}`}
          icon={DollarSign}
          color="indigo"
          sub="from paid orders"
        />
        <StatCard
          label="Total Orders"
          value={String(orderCount)}
          icon={ShoppingCart}
          color="violet"
          sub={`${pendingCount} pending`}
        />
        <StatCard
          label="Active Products"
          value={String(productCount)}
          icon={Package}
          color="sky"
          sub="in your catalog"
        />
        <StatCard
          label="Conversion"
          value={orderCount > 0 ? `${Math.round((orderCount / Math.max(orderCount, 1)) * 100)}%` : "—"}
          icon={TrendingUp}
          color="emerald"
          sub="orders this month"
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <QuickAction
          href="/dashboard/products/new"
          title="Add a product"
          description="List a new item in your store catalog"
          emoji="📦"
        />
        <QuickAction
          href="/dashboard/storefront"
          title="Edit storefront"
          description="Customize your public-facing store pages"
          emoji="🎨"
        />
        <QuickAction
          href="/dashboard/discounts"
          title="Create discount"
          description="Run a promotion with a coupon code"
          emoji="🏷️"
        />
      </div>
    </div>
  );
}

const colorMap = {
  indigo: { bg: "bg-indigo-50", icon: "bg-indigo-600", text: "text-indigo-600" },
  violet: { bg: "bg-violet-50", icon: "bg-violet-600", text: "text-violet-600" },
  sky:    { bg: "bg-sky-50",    icon: "bg-sky-600",    text: "text-sky-600"    },
  emerald:{ bg: "bg-emerald-50",icon: "bg-emerald-600",text: "text-emerald-600"},
};

function StatCard({
  label, value, icon: Icon, color, sub,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: keyof typeof colorMap;
  sub: string;
}) {
  const c = colorMap[color];
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className={`w-9 h-9 rounded-lg ${c.icon} flex items-center justify-center`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-400 mt-1">{sub}</p>
    </div>
  );
}

function QuickAction({
  href, title, description, emoji,
}: {
  href: string;
  title: string;
  description: string;
  emoji: string;
}) {
  return (
    <a
      href={href}
      className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group"
    >
      <span className="text-2xl mb-3 block">{emoji}</span>
      <p className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{title}</p>
      <p className="text-sm text-slate-400 mt-1">{description}</p>
    </a>
  );
}
