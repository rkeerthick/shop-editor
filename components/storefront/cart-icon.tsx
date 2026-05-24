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
    <Link href={`/store/${shopSlug}/cart`} className="relative p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center">
      <ShoppingCart className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute top-0.5 right-0.5 bg-slate-900 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
