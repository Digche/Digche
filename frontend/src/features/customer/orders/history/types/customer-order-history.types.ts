import type { OrderHistoryStatus } from "@/shared/orders/history/types/order-history.types";

export type CustomerOrderHistoryItem = {
  id: number | string;
  chefId: number | string;
  chefName?: string;
  customerId: number | string;
  foodId: number | string;
  foodTitle: string;
  foodImage: string;
  quantity: number;
  price: string;
  unit?: string;
  status: OrderHistoryStatus;
  orderedAt: string;
};

export type CustomerOrderHistoryDto = {
  id: number | string;
  chefId?: number | string;
  chefName?: string;
  customerId?: number | string;
  foodId?: number | string;
  foodTitle?: string;
  foodImage?: string;
  quantity?: number;
  price?: string;
  unit?: string;
  status?: OrderHistoryStatus;
  orderedAt?: string;
};