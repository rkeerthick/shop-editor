"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Paintbrush, Settings } from "lucide-react";

const BOTTOM_NAV_ITEMS = [
  { href: "/dashboard",            label: "Overview",   icon: LayoutDashboard },
  { href: "/dashboard/products",   label: "Products",   icon: Package },
  { href: "/dashboard/orders",     label: "Orders",     icon: ShoppingCart },
  { href: "/dashboard/storefront", label: "Storefront", icon: Paintbrush },
  { href: "/dashboard/settings",   label: "Settings",   icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 flex items-stretch"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {BOTTOM_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive =
          pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center flex-1 gap-1 py-2.5 text-xs font-medium transition-colors ${
              isActive ? "text-emerald-700" : "text-slate-400 hover:text-slate-700"
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? "text-emerald-700" : ""}`} />
            <span>{label}</span>
            {isActive && (
              <span className="absolute bottom-0 w-8 h-0.5 rounded-t bg-emerald-700" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
