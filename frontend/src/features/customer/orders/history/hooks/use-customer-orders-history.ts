"use client";

import { useQuery } from "@tanstack/react-query";
import { customerOrdersHistoryApi } from "../api/customer-orders-history.api";

export function useCustomerOrdersHistory() {
  return useQuery({
    queryKey: ["customer", "orders", "history"],
    queryFn: customerOrdersHistoryApi.getCustomerOrdersHistory,
  });
}