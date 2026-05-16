import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  variantId?: string;
  title: string;
  price: number;
  image?: string;
  quantity: number;
}

interface CartState {
  shopSlug: string | null;
  items: CartItem[];
  addItem: (shopSlug: string, item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQty: (productId: string, variantId: string | undefined, qty: number) => void;
  clearCart: () => void;
}

function itemKey(productId: string, variantId?: string) {
  return variantId ? `${productId}:${variantId}` : productId;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      shopSlug: null,
      items: [],
      addItem(shopSlug, item) {
        set((state) => {
          const base = state.shopSlug !== shopSlug ? [] : state.items;
          const k = itemKey(item.productId, item.variantId);
          const hit = base.find((i) => itemKey(i.productId, i.variantId) === k);
          return {
            shopSlug,
            items: hit
              ? base.map((i) =>
                  itemKey(i.productId, i.variantId) === k ? { ...i, quantity: i.quantity + 1 } : i
                )
              : [...base, { ...item, quantity: 1 }],
          };
        });
      },
      removeItem(productId, variantId) {
        set((state) => ({
          items: state.items.filter(
            (i) => itemKey(i.productId, i.variantId) !== itemKey(productId, variantId)
          ),
        }));
      },
      updateQty(productId, variantId, qty) {
        if (qty <= 0) {
          get().removeItem(productId, variantId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            itemKey(i.productId, i.variantId) === itemKey(productId, variantId)
              ? { ...i, quantity: qty }
              : i
          ),
        }));
      },
      clearCart() {
        set({ shopSlug: null, items: [] });
      },
    }),
    { name: "shop-cart" }
  )
);
