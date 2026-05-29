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

  // Hide the dashboard nav inside the storefront block editor —
  // it has its own fixed bottom action bar for mobile.
  if (pathname.includes("/editor")) return null;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-t border-slate-200 shadow-[0_-1px_12px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex overflow-x-auto scrollbar-none px-2 py-2 gap-1">
        {BOTTOM_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className="group flex flex-col items-center gap-1.5 shrink-0 min-w-16 py-1"
            >
              {/* Icon container */}
              <div
                className={`
                  w-11 h-11 rounded-xl flex items-center justify-center
                  transition-all duration-200
                  ${isActive
                    ? "bg-emerald-700 shadow-lg shadow-emerald-700/30 scale-105"
                    : "bg-white shadow-md shadow-slate-200 group-hover:shadow-lg group-hover:shadow-slate-300 group-hover:scale-110 group-hover:-translate-y-0.5"
                  }
                `}
              >
                <Icon
                  className={`w-5 h-5 transition-colors duration-200 ${
                    isActive ? "text-white" : "text-slate-400 group-hover:text-slate-700"
                  }`}
                />
              </div>

              {/* Label */}
              <span
                className={`text-[10px] font-medium leading-none transition-colors duration-200 ${
                  isActive ? "text-emerald-700" : "text-slate-400 group-hover:text-slate-600"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
