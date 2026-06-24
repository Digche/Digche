// src/store/order-store.ts

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type OrderStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "delivered"
  | "cancelled";

export type ChefOrder = {
  id: number;
  chefId: number;
  customerId?: number;
  customerName: string;
  customerPhone?: string;
  foodId: number;
  foodTitle: string;
  foodImage: string;
  quantity: number;
  price: string;
  unit?: string;
  status: OrderStatus;

  // زمان واقعی ثبت سفارش
  orderedAt: string;
};

type CreateChefOrderPayload = Omit<
  ChefOrder,
  "id" | "status" | "orderedAt"
> & {
  status?: OrderStatus;
  orderedAt?: string;
};

type OrderStore = {
  orders: ChefOrder[];
  addOrders: (newOrders: CreateChefOrderPayload[]) => void;
  updateOrderStatus: (orderID: number | string, status: OrderStatus) => void;
  clearOrders: () => void;
};

const initialOrders: ChefOrder[] = [];

export const useOrderStore = create<OrderStore>()(
  persist(
    (set) => ({
      orders: initialOrders,

      addOrders: (newOrders) => {
        set((state) => {
          const lastId =
            state.orders.length === 0
              ? 0
              : Math.max(...state.orders.map((order) => order.id));

          const fallbackOrderedAt = new Date().toISOString();

          const ordersToAdd: ChefOrder[] = newOrders.map((order, index) => ({
            ...order,
            id: lastId + index + 1,
            status: order.status ?? "preparing",
            orderedAt: order.orderedAt ?? fallbackOrderedAt,
          }));

          return {
            orders: [...ordersToAdd, ...state.orders],
          };
        });
      },

      updateOrderStatus: (orderID, status) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === Number(orderID) ? { ...order, status } : order
          ),
        }));
      },

      clearOrders: () => {
        set({ orders: [] });
      },
    }),
    {
      name: "digche-orders",
      storage: createJSONStorage(() => localStorage),
    }
  )
);