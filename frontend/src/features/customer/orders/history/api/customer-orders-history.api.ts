import { apiRequest } from "@/shared/api/api-client";
import { endpoints } from "@/shared/api/endpoints";
import type { ApiResponse } from "@/shared/api/api-types";
import {
  mapCustomerOrderHistoryDtosToItems,
} from "../mappers/customer-order-history.mapper";
import type {
  CustomerOrderHistoryDto,
  CustomerOrderHistoryItem,
} from "../types/customer-order-history.types";

function unwrapData<T>(response: T | ApiResponse<T>): T {
  if (response && typeof response === "object" && "data" in response) {
    return (response as ApiResponse<T>).data;
  }

  return response as T;
}

export const customerOrdersHistoryApi = {
  async getCustomerOrdersHistory(): Promise<CustomerOrderHistoryItem[]> {
    const response = await apiRequest<
      CustomerOrderHistoryDto[] | ApiResponse<CustomerOrderHistoryDto[]>
    >(endpoints.customerOrders.history, {
      auth: true,
    });

    const data = unwrapData(response);

    return mapCustomerOrderHistoryDtosToItems(data);
  },
};