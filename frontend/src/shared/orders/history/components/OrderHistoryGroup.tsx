"use client";

import type { ReactNode } from "react";

type OrderHistoryGroupProps<TOrder extends { id: number | string }> = {
  title: string;
  orders: TOrder[];
  renderCard: (order: TOrder) => ReactNode;
  gridClassName?: string;
};

export default function OrderHistoryGroup<
  TOrder extends { id: number | string },
>({
  title,
  orders,
  renderCard,
  gridClassName = "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4",
}: OrderHistoryGroupProps<TOrder>) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex min-h-12 items-center  border-b border-gray-200 px-5">
        <h2 className="text-base  font-extrabold text-gray-950 sm:text-lg">
          {title}
        </h2>
      </div>

      <div className="p-4">
        <div className={gridClassName}>
          {orders.map((order) => (
            <div key={order.id}>{renderCard(order)}</div>
          ))}
        </div>
      </div>
    </section>
  );
}