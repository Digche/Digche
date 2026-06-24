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
  orderedAt: string;
};

type CreateChefOrderPayload = Omit<ChefOrder, "id" | "status" | "orderedAt"> & {
  status?: OrderStatus;
};

type OrderStore = {
  orders: ChefOrder[];
  addOrders: (newOrders: CreateChefOrderPayload[]) => void;
  updateOrderStatus: (orderID: number | string, status: OrderStatus) => void;
  clearOrders: () => void;
};

const initialOrders: ChefOrder[] = [];

function getPersianToday() {
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: initialOrders,

      addOrders: (newOrders) => {
        set((state) => {
          const lastId =
            state.orders.length === 0
              ? 0
              : Math.max(...state.orders.map((order) => order.id));

          const today = getPersianToday();

          const ordersToAdd: ChefOrder[] = newOrders.map((order, index) => ({
            id: lastId + index + 1,
            status: order.status ?? "preparing",
            orderedAt: today,
            ...order,
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