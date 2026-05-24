"use client";

import { useEffect, useState, use } from "react";
import { useCartStore } from "@/store/cart";
import { gtmEvent } from "@/lib/gtm";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function CheckoutSuccessPage({
  params,
}: {
  params: Promise<{ shopSlug: string }>;
}) {
  const { shopSlug } = use(params);
  const { clearCart } = useCartStore();
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("order_id");
    setOrderId(id);
    clearCart();
    if (id) {
      gtmEvent("purchase", { order_id: id, shop_slug: shopSlug });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
      </div>

      <h1 className="text-2xl font-bold text-slate-900 mb-2">Order confirmed!</h1>
      <p className="text-slate-500 mb-1">
        Thanks for your purchase. You&apos;ll receive a confirmation email shortly.
      </p>
      {orderId && (
        <p className="text-xs text-slate-400 font-mono mt-2">Order ID: {orderId}</p>
      )}

      <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href={`/store/${shopSlug}/track`}
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Track your order
        </Link>
        <Link
          href={`/store/${shopSlug}`}
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-700 transition-colors"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
