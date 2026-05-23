"use client";

import { useCartStore } from "@/store/cart";

interface AddToCartButtonProps {
  shopSlug: string;
  productId: string;
  title: string;
  price: number;
  image?: string;
}

export function AddToCartButton({ shopSlug, productId, title, price, image }: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <button
      className="store-btn w-full py-2 px-4 text-sm font-semibold text-white transition-all"
      onClick={() => addItem(shopSlug, { productId, title, price, image })}
    >
      Add to Cart
    </button>
  );
}
