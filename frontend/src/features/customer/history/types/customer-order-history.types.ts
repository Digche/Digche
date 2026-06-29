export type CustomerOrderHistoryStatus =
  | "registered"
  | "chef_approved"
  | "paid"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type CustomerOrderHistoryItem = {
  id: number | string;
  chefName: string;
  foodTitle: string;
  foodImage: string;
  quantity: number;
  totalPrice: string;
  status: CustomerOrderHistoryStatus;
  orderedAt: string;
  deliveryAddress: string;
};
