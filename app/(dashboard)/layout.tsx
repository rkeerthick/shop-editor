import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Paintbrush,
  Tag,
  Settings,
  ExternalLink,
  LogOut,
  Store,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard",            label: "Overview",    icon: LayoutDashboard },
  { href: "/dashboard/products",   label: "Products",    icon: Package },
  { href: "/dashboard/orders",     label: "Orders",      icon: ShoppingCart },
  { href: "/dashboard/storefront", label: "Storefront",  icon: Paintbrush },
  { href: "/dashboard/discounts",  label: "Discounts",   icon: Tag },
  { href: "/dashboard/settings",   label: "Settings",    icon: Settings },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";

  const shop = await db.shop.findFirst({ where: { ownerId: session.user.id } });

  if (!shop && !pathname.startsWith("/dashboard/setup")) {
    redirect("/dashboard/setup");
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {shop && (
        <aside className="w-64 bg-slate-900 flex flex-col py-5 px-3 shrink-0 shadow-xl">
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0">
              <Store className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-base tracking-tight">Shop Editor</span>
          </div>

          {/* Shop name chip */}
          <div className="mx-3 mb-5 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700">
            <p className="text-xs text-slate-400 mb-0.5">Current shop</p>
            <p className="text-sm font-medium text-white truncate">{shop.name}</p>
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-0.5 flex-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="mt-4 pt-4 border-t border-slate-800 px-1 flex flex-col gap-2">
            <a
              href={`/store/${shop.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
            >
              <ExternalLink className="w-4 h-4 shrink-0" />
              View Storefront
            </a>
            <div className="px-3 py-2 rounded-lg bg-slate-800">
              <p className="text-xs text-slate-400 truncate mb-2">{session.user?.email}</p>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </aside>
      )}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
