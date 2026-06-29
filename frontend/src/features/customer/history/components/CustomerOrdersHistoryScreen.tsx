"use client";

import { useMemo, useState } from "react";
import CustomerProfileBadge from "@/features/customer/components/CustomerProfileBadge";
import SearchInput from "@/shared/components/SearchInput";
import { customerOrdersHistory } from "../data/customer-orders-history.mock";
import type { CustomerOrderHistoryItem } from "../types/customer-order-history.types";
import { formatCustomerOrderDate } from "../utils/order-history-date";
import CustomerOrdersHistoryGroup from "./CustomerOrdersHistoryGroup";

type OrdersGroup = {
  title: string;
  orders: CustomerOrderHistoryItem[];
};

function groupOrdersByDate(orders: CustomerOrderHistoryItem[]) {
  const groups = new Map<string, OrdersGroup>();

  orders.forEach((order) => {
    const title = formatCustomerOrderDate(order.orderedAt);
    const existingGroup = groups.get(title);

    if (existingGroup) {
      existingGroup.orders.push(order);
      return;
    }

    groups.set(title, {
      title,
      orders: [order],
    });
  });

  return [...groups.values()];
}

export default function CustomerOrdersHistoryScreen() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOrders = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return customerOrdersHistory;
    }

    return customerOrdersHistory.filter((order) => {
      return (
        order.foodTitle.toLowerCase().includes(normalizedSearch) ||
        order.chefName.toLowerCase().includes(normalizedSearch) ||
        order.deliveryAddress.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [searchTerm]);

  const groups = useMemo(() => groupOrdersByDate(filteredOrders), [filteredOrders]);

  return (
    <section className="relative space-y-8">
      <div className="absolute left-0 top-0 hidden md:block">
        <CustomerProfileBadge />
      </div>

      <div className="mx-auto max-w-5xl space-y-8">
        <div className="rounded-3xl border border-orange-100 bg-white p-5 text-right shadow-sm sm:p-6">
          <h1 className="text-2xl font-extrabold text-gray-950">
            تاریخچه سفارشات
          </h1>

          <p className="mt-2 text-sm leading-7 text-gray-500">
            سفارش‌های قبلی و وضعیت سفارش‌های در جریان شما اینجا نمایش داده می‌شود.
          </p>

          <div className="mt-5 max-w-md">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="جست‌وجو در سفارش‌ها..."
            />
          </div>
        </div>

        {groups.length === 0 ? (
          <div className="rounded-3xl border border-orange-100 bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-bold text-gray-800">
              سفارشی برای نمایش وجود ندارد
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              هنوز سفارشی ثبت نشده یا نتیجه‌ای برای جست‌وجوی شما پیدا نشد.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {groups.map((group) => (
              <CustomerOrdersHistoryGroup
                key={group.title}
                title={group.title}
                orders={group.orders}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
