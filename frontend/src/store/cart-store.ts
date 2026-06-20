// src/store/cart-store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartFoodItem {
  id: number;
  title: string;
  category: string;
  rating: number;
  remaining: string;
  chef: string;
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
  addToCart: (item: CartFoodItem) => void;
  removeFromCart: (id: number) => void;
  increaseQuantity: (id: number) => void;
  decreaseQuantity: (id: number) => void;
  clearCart: () => void;
  totalItems: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (item) => {
        const existingItem = get().items.find(
          (cartItem) => cartItem.id === item.id
        );

        if (existingItem) {
          set({
            items: get().items.map((cartItem) =>
              cartItem.id === item.id
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
          items: get().items.filter((item) => item.id !== id),
        });
      },

      increaseQuantity: (id) => {
        set({
          items: get().items.map((item) =>
            item.id === id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        });
      },

      decreaseQuantity: (id) => {
        set({
          items: get()
            .items.map((item) =>
              item.id === id
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