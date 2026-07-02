// src/store/cart-store.ts

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartFoodItem {
  id: number | string;
  title: string;
  category: string;
  rating: number;
  remaining: string;
  chef: string;
  chefId: number | string;
  location: string;
  price: string;
  unit?: string;
  image: string;
}

export interface CartItem extends CartFoodItem {
  quantity: number;
}

interface CartStore {
  items: CartItem[];

  setCartItems: (items: CartItem[]) => void;

  addToCart: (item: CartFoodItem) => void;
  removeFromCart: (id: number | string) => void;
  increaseQuantity: (id: number | string) => void;
  decreaseQuantity: (id: number | string) => void;
  clearCart: () => void;
  totalItems: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      setCartItems: (items) => {
        set({ items });
      },

      addToCart: (item) => {
        const existingItem = get().items.find(
          (cartItem) => String(cartItem.id) === String(item.id)
        );

        if (existingItem) {
          set({
            items: get().items.map((cartItem) =>
              String(cartItem.id) === String(item.id)
                ? { ...cartItem, quantity: cartItem.quantity + 1 }
                : cartItem
            ),
          });
          return;
        }

        set({
          items: [...get().items, { ...item, quantity: 1 }],
        });
      },

      removeFromCart: (id) => {
        set({
          items: get().items.filter(
            (item) => String(item.id) !== String(id)
          ),
        });
      },

      increaseQuantity: (id) => {
        set({
          items: get().items.map((item) =>
            String(item.id) === String(id)
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        });
      },

      decreaseQuantity: (id) => {
        set({
          items: get()
            .items.map((item) =>
              String(item.id) === String(id)
                ? { ...item, quantity: item.quantity - 1 }
                : item
            )
            .filter((item) => item.quantity > 0),
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      totalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: "home-food-cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
);