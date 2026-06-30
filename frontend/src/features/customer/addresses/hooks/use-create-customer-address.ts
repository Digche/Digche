"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { customerAddressesApi } from "../api/customer-addresses.api";

export function useCreateCustomerAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: customerAddressesApi.createCustomerAddress,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["customer", "addresses"],
      });
    },
  });
}