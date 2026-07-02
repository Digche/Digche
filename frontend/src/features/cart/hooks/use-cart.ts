"use client";

import { useQuery } from "@tanstack/react-query";
import { cartApi } from "../api/cart.api";

export function useCart(enabled = true) {
  return useQuery({
    queryKey: ["cart"],
    queryFn: cartApi.getCart,
    enabled,
  });
}