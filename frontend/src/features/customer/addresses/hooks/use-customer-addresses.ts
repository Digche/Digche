"use client";

import { useQuery } from "@tanstack/react-query";
import { customerAddressesApi } from "../api/customer-addresses.api";

type UseCustomerAddressesOptions = {
  enabled?: boolean;
};

export function useCustomerAddresses(
  options: UseCustomerAddressesOptions = {}
) {
  return useQuery({
    queryKey: ["customer", "addresses"],
    queryFn: customerAddressesApi.getCustomerAddresses,
    enabled: options.enabled ?? true,
  });
}