"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { customerAddressesApi } from "../api/customer-addresses.api";

export function useDeleteCustomerAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: customerAddressesApi.deleteCustomerAddress,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["customer", "addresses"],
      });
    },
  });
}