"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingCart, Paintbrush,
  Tag, Settings, BarChart2, FolderOpen, Star, Truck,
} from "lucide-react";

const BOTTOM_NAV_ITEMS = [
  { href: "/dashboard",             label: "Overview",    icon: LayoutDashboard },
  { href: "/dashboard/analytics",   label: "Analytics",   icon: BarChart2 },
  { href: "/dashboard/products",    label: "Products",    icon: Package },
  { href: "/dashboard/categories",  label: "Categories",  icon: FolderOpen },
  { href: "/dashboard/orders",      label: "Orders",      icon: ShoppingCart },
  { href: "/dashboard/reviews",     label: "Reviews",     icon: Star },
  { href: "/dashboard/storefront",  label: "Storefront",  icon: Paintbrush },
  { href: "/dashboard/discounts",   label: "Discounts",   icon: Tag },
  { href: "/dashboard/shipping",    label: "Shipping",    icon: Truck },
  { href: "/dashboard/settings",    label: "Settings",    icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex overflow-x-auto scrollbar-none">
        {BOTTOM_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-col items-center justify-center gap-1 py-2.5 px-3 text-xs font-medium transition-colors shrink-0 min-w-[68px] ${
                isActive ? "text-emerald-700" : "text-slate-400 hover:text-slate-700"
              }`}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-b bg-emerald-700" />
              )}
              <Icon className="w-5 h-5" />
              <span className="leading-none">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
