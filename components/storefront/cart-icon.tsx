"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cart";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export function CartIcon({ shopSlug }: { shopSlug: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = () =>
      setCount(useCartStore.getState().items.reduce((s, i) => s + i.quantity, 0));
    update();
    return useCartStore.subscribe(update);
  }, []);

  return (
    <Link href={`/store/${shopSlug}/cart`} className="relative flex items-center">
      <ShoppingCart className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
