"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { use } from "react";

export default function CheckoutSuccessPage({
  params,
}: {
  params: Promise<{ shopSlug: string }>;
}) {
  const { shopSlug } = use(params);
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold mb-3">Order Confirmed!</h1>
      <p className="text-muted-foreground mb-8">
        Thank you for your purchase. You'll receive a confirmation email shortly.
      </p>
      <Link href={`/store/${shopSlug}`}>
        <Button>Continue Shopping</Button>
      </Link>
    </div>
  );
}
