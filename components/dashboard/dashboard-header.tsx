import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Search, CircleHelp, Store } from "lucide-react";
import { NotificationsBell } from "./notifications-bell";

interface DashboardHeaderProps {
  shopId: string;
  shopName: string;
  shopSlug: string;
}

export async function DashboardHeader({ shopId, shopName, shopSlug }: DashboardHeaderProps) {
  const session = await auth();
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

  // Build initials from name or email
  const nameOrEmail = session?.user?.name ?? session?.user?.email ?? "M";
  const initials = nameOrEmail
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join("");

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center gap-3 shrink-0">

      {/* Logo — mobile only (sidebar shows it on desktop) */}
      <a
        href={`/store/${shopSlug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="md:hidden flex items-center gap-2 shrink-0 mr-1"
      >
        <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center shadow-sm">
          <Store className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-slate-900 text-sm tracking-tight leading-none truncate max-w-30">
          {shopName}
        </span>
      </a>

      {/* Search — desktop only */}
      <div className="relative flex-1 max-w-md hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <input
          placeholder="Search products, orders, customers…"
          className="w-full h-9 pl-8 pr-3 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all"
        />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 ml-auto">
        {/* Help — desktop only */}
        <button
          className="hidden md:flex w-9 h-9 rounded-lg items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Help"
        >
          <CircleHelp className="w-4 h-4" />
        </button>
        <NotificationsBell initialData={data} />
        {/* User avatar */}
        <div
          className="w-8 h-8 rounded-full bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center ml-1 select-none shrink-0"
          title={nameOrEmail}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
