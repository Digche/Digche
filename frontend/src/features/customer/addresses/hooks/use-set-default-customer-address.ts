"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { customerAddressesApi } from "../api/customer-addresses.api";

export function useSetDefaultCustomerAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: customerAddressesApi.setDefaultCustomerAddress,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["customer", "addresses"],
      });
    },
  });
}