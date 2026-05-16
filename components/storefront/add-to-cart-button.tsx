"use client";

import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";

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
    <Button
      size="sm"
      className="w-full mt-2"
      onClick={() => addItem(shopSlug, { productId, title, price, image })}
    >
      Add to Cart
    </Button>
  );
}
