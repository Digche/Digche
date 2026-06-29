export type OrderHistoryStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "delivered"
  | "cancelled";

export type OrderHistoryBaseOrder = {
  id: number | string;
  orderedAt: string;
};

export type OrderHistoryGroupData<TOrder> = {
  key: string;
  label: string;
  sortTime: number;
  orders: TOrder[];
};