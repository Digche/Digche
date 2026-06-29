import type { ChefOrder } from "@/store/order-store";
import type {
  CustomerOrderHistoryDto,
  CustomerOrderHistoryItem,
} from "../types/customer-order-history.types";

const FALLBACK_IMAGE = "/images/cake.webp";

function resolveImageSrc(src?: string) {
  const value = src?.trim();

  if (!value || value === "undefined" || value === "null") {
    return FALLBACK_IMAGE;
  }

  if (
    value.startsWith("/") ||
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:image/") ||
    value.startsWith("blob:")
  ) {
    return value;
  }

  return `/images/${value}`;
}

export function mapCustomerOrderHistoryDtoToItem(
  dto: CustomerOrderHistoryDto
): CustomerOrderHistoryItem {
  return {
    id: dto.id,
    chefId: dto.chefId ?? "",
    chefName: dto.chefName ?? "",
    customerId: dto.customerId ?? "",
    foodId: dto.foodId ?? "",
    foodTitle: dto.foodTitle ?? "",
    foodImage: resolveImageSrc(dto.foodImage),
    quantity: dto.quantity ?? 1,
    price: dto.price ?? "",
    unit: dto.unit ?? "تومان",
    status: dto.status ?? "pending",
    orderedAt: dto.orderedAt ?? new Date().toISOString(),
  };
}

export function mapCustomerOrderHistoryDtosToItems(
  dtos: CustomerOrderHistoryDto[]
): CustomerOrderHistoryItem[] {
  return dtos.map(mapCustomerOrderHistoryDtoToItem);
}

export function mapChefOrderToCustomerOrderHistoryItem(
  order: ChefOrder
): CustomerOrderHistoryItem {
  return {
    id: order.id,
    chefId: order.chefId,
    chefName: order.chefName ?? "",
    customerId: order.customerId ?? "",
    foodId: order.foodId,
    foodTitle: order.foodTitle,
    foodImage: resolveImageSrc(order.foodImage),
    quantity: order.quantity,
    price: order.price,
    unit: order.unit,
    status: order.status,
    orderedAt: order.orderedAt,
  };
}

export function mapChefOrdersToCustomerOrderHistoryItems(
  orders: ChefOrder[]
): CustomerOrderHistoryItem[] {
  return orders.map(mapChefOrderToCustomerOrderHistoryItem);
}