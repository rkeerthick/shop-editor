"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingCart, Paintbrush,
  Tag, Settings, ExternalLink, LogOut, Store, ChevronLeft, BarChart2, FolderOpen, Star, Truck,
} from "lucide-react";

const NAV_ITEMS = [
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

interface SidebarProps {
  shopName: string;
  shopSlug: string;
  email: string;
}

export function Sidebar({ shopName, shopSlug, email }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`bg-slate-900 hidden md:flex flex-col py-5 shrink-0 shadow-xl transition-all duration-300 sticky top-0 h-screen ${
        collapsed ? "w-17 px-2" : "w-64 px-3"
      }`}
    >
      {/* Logo + collapse toggle */}
      <div className={`flex items-center mb-6 ${collapsed ? "justify-center" : "justify-between px-1"}`}>
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center shrink-0">
              <Store className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-base tracking-tight">Shop Editor</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center">
            <Store className="w-4 h-4 text-white" />
          </div>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all mx-auto mb-4"
          title="Expand sidebar"
        >
          <ChevronLeft className="w-4 h-4 rotate-180" />
        </button>
      )}

      {/* Shop chip */}
      {!collapsed && (
        <div className="mx-1 mb-5 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700">
          <p className="text-xs text-slate-400 mb-0.5">Current shop</p>
          <p className="text-sm font-medium text-white truncate">{shopName}</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 flex-1 overflow-y-auto scrollbar-none">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 rounded-lg text-sm font-medium transition-all ${
                collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5"
              } ${
                isActive
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className={`mt-4 pt-4 border-t border-slate-800 flex flex-col gap-2 ${collapsed ? "items-center" : ""}`}>
        <a
          href={`/store/${shopSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          title={collapsed ? "View Storefront" : undefined}
          className={`flex items-center gap-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-all ${
            collapsed ? "justify-center p-2" : "px-3 py-2"
          }`}
        >
          <ExternalLink className="w-4 h-4 shrink-0" />
          {!collapsed && "View Storefront"}
        </a>

        {!collapsed ? (
          <div className="px-3 py-2 rounded-lg bg-slate-800">
            <p className="text-xs text-slate-400 truncate mb-2">{email}</p>
            <form action="/api/auth/signout" method="POST">
              <button type="submit" className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 transition-colors">
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </form>
          </div>
        ) : (
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              title="Sign out"
              className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </aside>
  );
}
