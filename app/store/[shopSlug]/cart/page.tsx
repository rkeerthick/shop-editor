"use client";

import { useEffect, useState } from "react";
import { useCartStore, type CartItem } from "@/store/cart";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { use } from "react";

export default function CartPage({ params }: { params: Promise<{ shopSlug: string }> }) {
  const { shopSlug } = use(params);
  const [hydrated, setHydrated] = useState(false);
  const { items, removeItem, updateQty, clearCart } = useCartStore();

  useEffect(() => setHydrated(true), []);

  if (!hydrated) return null;

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-3">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">Add some products to get started.</p>
        <Link href={`/store/${shopSlug}`}>
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">Your Cart</h1>

      <div className="space-y-4 mb-8">
        {items.map((item: CartItem) => (
          <div key={`${item.productId}:${item.variantId ?? ""}`} className="flex items-center gap-4 border rounded-lg p-4 bg-white">
            <div className="w-16 h-16 rounded bg-gray-100 overflow-hidden shrink-0">
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-200" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{item.title}</p>
              <p className="text-sm text-muted-foreground">₹{item.price.toFixed(2)} each</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQty(item.productId, item.variantId, item.quantity - 1)}
                className="w-7 h-7 rounded border text-sm font-medium hover:bg-gray-50 flex items-center justify-center"
              >
                −
              </button>
              <span className="w-8 text-center text-sm">{item.quantity}</span>
              <button
                onClick={() => updateQty(item.productId, item.variantId, item.quantity + 1)}
                className="w-7 h-7 rounded border text-sm font-medium hover:bg-gray-50 flex items-center justify-center"
              >
                +
              </button>
            </div>
            <p className="w-20 text-right font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
            <button
              onClick={() => removeItem(item.productId, item.variantId)}
              className="text-muted-foreground hover:text-red-500 text-sm ml-2"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="border-t pt-6 flex flex-col items-end gap-4">
        <div className="flex gap-8 text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-semibold text-lg">₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => clearCart()}>Clear Cart</Button>
          <Link href={`/store/${shopSlug}/checkout`}>
            <Button>Proceed to Checkout</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
