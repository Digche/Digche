"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { customerAddressesApi } from "../api/customer-addresses.api";
import type { CustomerAddressPayload } from "../types/customer-address.types";

type UpdateCustomerAddressInput = {
  addressId: number | string;
  payload: CustomerAddressPayload;
};

export function useUpdateCustomerAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ addressId, payload }: UpdateCustomerAddressInput) =>
      customerAddressesApi.updateCustomerAddress(addressId, payload),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["customer", "addresses"],
      });
    },
  });
}