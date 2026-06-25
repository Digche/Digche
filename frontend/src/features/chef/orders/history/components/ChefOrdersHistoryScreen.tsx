// src/features/chef/orders/components/ChefOrdersHistoryScreen.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useAuthStore } from "@/store/auth-store";
import { ChefOrder, OrderStatus, useOrderStore } from "@/store/order-store";
import SearchInput from "@/shared/components/SearchInput";
import ChefOrdersHistoryGroup from "./ChefOrdersHistoryGroup";

const statusLabels: Record<OrderStatus, string> = {
  pending: "در انتظار تایید",
  preparing: "درحال آماده سازی",
  ready: "آماده تحویل",
  delivered: "تحویل شده",
  cancelled: "لغو شده",
};

type OrdersGroup = {
  key: string;
  label: string;
  sortTime: number;
  orders: ChefOrder[];
};

function getValidDate(value?: string) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function formatPersianDate(value: string | Date) {
  const date = value instanceof Date ? value : getValidDate(value);

  if (!date) return "تاریخ نامشخص";

  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function formatPersianTime(value?: string) {
  const date = getValidDate(value);

  if (!date) return "";

  return new Intl.DateTimeFormat("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isToday(date: Date) {
  return getLocalDateKey(date) === getLocalDateKey(new Date());
}

function getGroupLabel(value?: string) {
  const date = getValidDate(value);

  if (!date) return "تاریخ نامشخص";

  if (isToday(date)) return "امروز";

  return formatPersianDate(date);
}

function getSearchableOrderText(order: ChefOrder) {
  const date = getValidDate(order.orderedAt);

  const persianDate = date ? formatPersianDate(date) : "";
  const persianTime = formatPersianTime(order.orderedAt);
  const statusLabel = statusLabels[order.status];

  return [
    order.customerName,
    order.foodTitle,
    order.customerPhone,
    order.quantity.toString(),
    statusLabel,
    persianDate,
    persianTime,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function groupOrdersByDate(orders: ChefOrder[]): OrdersGroup[] {
  const groups = new Map<string, OrdersGroup>();

  orders.forEach((order) => {
    const date = getValidDate(order.orderedAt);
    const key = date ? getLocalDateKey(date) : "unknown";
    const label = getGroupLabel(order.orderedAt);
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

        return secondDate - firstDate || b.id - a.id;
      }),
    }))
    .sort((a, b) => b.sortTime - a.sortTime);
}

export default function ChefOrdersHistoryScreen() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const orders = useOrderStore((state) => state.orders);
  const seedFakeOrders = useOrderStore((state) => state.seedFakeOrders);

  const [searchTerm, setSearchTerm] = useState("");

  const today = formatPersianDate(new Date());

  useEffect(() => {
    if (!currentUser || currentUser.role !== "chef") return;

    const hasOrdersForCurrentChef = orders.some(
      (order) => Number(order.chefId) === Number(currentUser.id)
    );

    if (hasOrdersForCurrentChef) return;

    seedFakeOrders(Number(currentUser.id));
  }, [currentUser, orders, seedFakeOrders]);

  const groupedOrders = useMemo(() => {
    if (!currentUser || currentUser.role !== "chef") return [];

    const normalizedSearch = searchTerm.trim().toLowerCase();

    const chefOrders = orders
      .filter((order) => Number(order.chefId) === Number(currentUser.id))
      .filter((order) => {
        if (!normalizedSearch) return true;

        return getSearchableOrderText(order).includes(normalizedSearch);
      });

    return groupOrdersByDate(chefOrders);
  }, [orders, currentUser, searchTerm]);

  if (!currentUser || currentUser.role !== "chef") {
    return (
      <section className="rounded-3xl border border-orange-100 bg-white p-10 text-center shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">دسترسی غیرمجاز</h1>

        <p className="mt-2 text-sm text-gray-500">
          فقط آشپزها می‌توانند تاریخچه سفارش‌ها را ببینند.
        </p>
      </section>
    );
  }

  return (
    <section
      dir="rtl"
      className="relative overflow-hidden rounded-[1.7rem] border border-orange-100 bg-white shadow-sm"
    >
      <div className="relative px-5 py-7 sm:px-8 lg:px-10">
        <div
          dir="ltr"
          className="mb-12 grid gap-6 lg:grid-cols-[1fr_420px_1fr] lg:items-start"
        >
          <div className="order-2 flex justify-center lg:order-1 lg:justify-start">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="جست و جو در سفارش ها..."
              className="max-w-[420px]"
            />
          </div>

          <div className="order-1 text-center lg:order-3 lg:text-right">
            <div className="flex flex-col items-center justify-center gap-3 lg:items-end">
              <div className="flex flex-row items-center gap-2">
                <h1 className="text-3xl font-extrabold text-gray-950">
                  تاریخچه سفارش ها
                </h1>

                <div className="relative h-12 w-12">
                  <Image
                    src="/icons/orders.svg"
                    alt="تاریخچه سفارش ها"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              <p className="text-sm text-gray-500">{today}</p>
            </div>
          </div>

          <div className="hidden lg:block" />
        </div>

        <div className="mx-auto max-w-[980px]">
          {groupedOrders.length === 0 ? (
            <div className="rounded-3xl border border-orange-100 bg-[#FFF9F4] p-10 text-center">
              <h2 className="text-xl font-bold text-gray-800">
                سفارشی برای نمایش وجود ندارد
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                هنوز سفارشی ثبت نشده یا نتیجه‌ای برای جست‌وجوی شما پیدا نشد.
              </p>
            </div>
          ) : (
            <div className="max-h-[650px] space-y-4 overflow-y-auto pb-2 pl-2">
              {groupedOrders.map((group) => (
                <ChefOrdersHistoryGroup
                  key={group.key}
                  title={group.label}
                  orders={group.orders}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}