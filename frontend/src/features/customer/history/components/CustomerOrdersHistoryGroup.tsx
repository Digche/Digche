import CustomerOrderHistoryCard from "./CustomerOrderHistoryCard";
import type { CustomerOrderHistoryItem } from "../types/customer-order-history.types";

type CustomerOrdersHistoryGroupProps = {
  title: string;
  orders: CustomerOrderHistoryItem[];
};

export default function CustomerOrdersHistoryGroup({
  title,
  orders,
}: CustomerOrdersHistoryGroupProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-right text-lg font-extrabold text-gray-900">
        {title}
      </h2>

      <div className="space-y-3">
        {orders.map((order) => (
          <CustomerOrderHistoryCard key={order.id} order={order} />
        ))}
      </div>
    </section>
  );
}
