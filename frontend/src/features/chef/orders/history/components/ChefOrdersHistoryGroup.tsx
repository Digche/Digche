// src/features/chef/orders/components/ChefOrdersHistoryGroup.tsx

"use client";

import { ChefOrder } from "@/store/order-store";
import ChefOrderHistoryCard from "./ChefOrderHistoryCard";

type ChefOrdersHistoryGroupProps = {
  title: string;
  orders: ChefOrder[];
};

export default function ChefOrdersHistoryGroup({
  title,
  orders,
}: ChefOrdersHistoryGroupProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex min-h-12 items-center justify-end border-b border-gray-200 px-5">
        <h2 className="text-base font-extrabold text-gray-950 sm:text-lg">
          {title}
        </h2>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {orders.map((order) => (
            <ChefOrderHistoryCard key={order.id} order={order} />
          ))}
        </div>
      </div>
    </section>
  );
}