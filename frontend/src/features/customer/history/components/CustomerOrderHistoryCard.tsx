import Image from "next/image";
import { MapPin, PackageCheck } from "lucide-react";
import type {
  CustomerOrderHistoryItem,
  CustomerOrderHistoryStatus,
} from "../types/customer-order-history.types";
import { formatCustomerOrderTime } from "../utils/order-history-date";

type CustomerOrderHistoryCardProps = {
  order: CustomerOrderHistoryItem;
};

const statusLabels: Record<CustomerOrderHistoryStatus, string> = {
  registered: "ثبت شده",
  chef_approved: "تایید آشپز",
  paid: "پرداخت شده",
  preparing: "در حال آماده‌سازی",
  shipped: "ارسال شده",
  delivered: "تحویل شده",
  cancelled: "لغو شده",
};

const statusClasses: Record<CustomerOrderHistoryStatus, string> = {
  registered: "bg-amber-50 text-amber-700",
  chef_approved: "bg-blue-50 text-blue-700",
  paid: "bg-emerald-50 text-emerald-700",
  preparing: "bg-orange-50 text-orange-700",
  shipped: "bg-indigo-50 text-indigo-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

export default function CustomerOrderHistoryCard({
  order,
}: CustomerOrderHistoryCardProps) {
  return (
    <article className="grid gap-4 rounded-2xl border border-orange-100 bg-white p-4 shadow-sm sm:grid-cols-[112px_1fr]">
      <div className="relative h-28 overflow-hidden rounded-2xl bg-[#FDF7F2]">
        <Image
          src={order.foodImage}
          alt={order.foodTitle}
          fill
          className="object-cover"
        />
      </div>

      <div className="flex flex-col gap-3 text-right">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-base font-extrabold text-gray-950">
              {order.foodTitle}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              آشپز: {order.chefName}
            </p>
          </div>

          <span
            className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${
              statusClasses[order.status]
            }`}
          >
            {statusLabels[order.status]}
          </span>
        </div>

        <div className="grid gap-2 text-sm text-gray-700 sm:grid-cols-2">
          <span className="flex items-center justify-end gap-2">
            {order.quantity} عدد
            <PackageCheck size={16} />
          </span>

          <span className="font-bold text-gray-900">{order.totalPrice}</span>

          <span className="flex items-center justify-end gap-2 sm:col-span-2">
            {order.deliveryAddress}
            <MapPin size={16} />
          </span>
        </div>

        <p className="text-xs text-gray-400">
          ساعت سفارش: {formatCustomerOrderTime(order.orderedAt)}
        </p>
      </div>
    </article>
  );
}
