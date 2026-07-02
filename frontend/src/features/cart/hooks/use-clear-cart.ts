"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cartApi } from "../api/cart.api";

export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_variables: void) => {
      return cartApi.clearCart();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["cart"],
      });
    },
  });
}