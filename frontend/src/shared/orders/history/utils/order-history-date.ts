import type {
  OrderHistoryBaseOrder,
  OrderHistoryGroupData,
} from "../types/order-history.types";

export function getValidDate(value?: string) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export function formatPersianDate(value: string | Date) {
  const date = value instanceof Date ? value : getValidDate(value);

  if (!date) return "تاریخ نامشخص";

  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatPersianTime(value?: string) {
  const date = getValidDate(value);

  if (!date) return "";

  return new Intl.DateTimeFormat("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function getLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function isToday(date: Date) {
  return getLocalDateKey(date) === getLocalDateKey(new Date());
}

export function getOrderHistoryGroupLabel(value?: string) {
  const date = getValidDate(value);

  if (!date) return "تاریخ نامشخص";

  if (isToday(date)) return "امروز";

  return formatPersianDate(date);
}

export function groupOrdersByDate<TOrder extends OrderHistoryBaseOrder>(
  orders: TOrder[]
): OrderHistoryGroupData<TOrder>[] {
  const groups = new Map<string, OrderHistoryGroupData<TOrder>>();

  orders.forEach((order) => {
    const date = getValidDate(order.orderedAt);
    const key = date ? getLocalDateKey(date) : "unknown";
    const label = getOrderHistoryGroupLabel(order.orderedAt);
    const sortTime = date?.getTime() ?? 0;

    const existingGroup = groups.get(key);

    if (existingGroup) {
      existingGroup.orders.push(order);
      existingGroup.sortTime = Math.max(existingGroup.sortTime, sortTime);
      return;
    }

    groups.set(key, {
      key,
      label,
      sortTime,
      orders: [order],
    });
  });

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      orders: [...group.orders].sort((a, b) => {
        const firstDate = getValidDate(a.orderedAt)?.getTime() ?? 0;
        const secondDate = getValidDate(b.orderedAt)?.getTime() ?? 0;

        return secondDate - firstDate || Number(b.id) - Number(a.id);
      }),
    }))
    .sort((a, b) => b.sortTime - a.sortTime);
}