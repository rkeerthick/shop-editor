"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Bell, ShoppingCart, Star, Package, CheckCircle } from "lucide-react";
import Link from "next/link";

export interface NotificationData {
  newOrders: { id: string; total: number; createdAt: string }[];
  pendingReviews: number;
  lowStockProducts: { id: string; title: string; stock: number }[];
}

export function NotificationsBell({ initialData }: { initialData: NotificationData }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<NotificationData>(initialData);
  const ref = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      const json = await res.json();
      if (json.data) setData(json.data);
    } catch {
      // silently ignore — stale data is fine
    }
  }, []);

  // Poll every 30 seconds
  useEffect(() => {
    const id = setInterval(fetchData, 30_000);
    return () => clearInterval(id);
  }, [fetchData]);

  // Refetch immediately when dropdown opens
  useEffect(() => {
    if (open) fetchData();
  }, [open, fetchData]);

  const total = data.newOrders.length + data.pendingReviews + data.lowStockProducts.length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {total > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">Notifications</p>
            {total > 0 && (
              <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">
                {total} new
              </span>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-slate-50">
            {total === 0 && (
              <div className="flex flex-col items-center gap-2 py-10 text-slate-400">
                <CheckCircle className="w-8 h-8" />
                <p className="text-sm font-medium">You&apos;re all caught up!</p>
              </div>
            )}

            {/* New orders */}
            {data.newOrders.length > 0 && (
              <div>
                <p className="px-4 pt-3 pb-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  New orders (last 24h)
                </p>
                {data.newOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/dashboard/orders/${order.id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                      <ShoppingCart className="w-4 h-4 text-emerald-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800">
                        Order #{order.id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-xs text-slate-400">
                        ₹{order.total.toFixed(2)} · {new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pending reviews */}
            {data.pendingReviews > 0 && (
              <div>
                <p className="px-4 pt-3 pb-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Pending reviews
                </p>
                <Link
                  href="/dashboard/reviews"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                    <Star className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">
                      {data.pendingReviews} review{data.pendingReviews !== 1 ? "s" : ""} awaiting approval
                    </p>
                    <p className="text-xs text-slate-400">Go to Reviews →</p>
                  </div>
                </Link>
              </div>
            )}

            {/* Low stock */}
            {data.lowStockProducts.length > 0 && (
              <div>
                <p className="px-4 pt-3 pb-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Low stock
                </p>
                {data.lowStockProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/dashboard/products/${product.id}/edit`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{product.title}</p>
                      <p className="text-xs text-orange-500 font-medium">{product.stock} left in stock</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {total > 0 && (
            <div className="border-t border-slate-100 px-4 py-2.5">
              <Link
                href="/dashboard/orders"
                onClick={() => setOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-700 transition-colors"
              >
                View all orders →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
