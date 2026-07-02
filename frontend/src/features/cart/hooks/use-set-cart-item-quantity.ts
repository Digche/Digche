"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cartApi } from "../api/cart.api";

export function useSetCartItemQuantity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cartApi.setItemQuantity,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["cart"],
      });
    },
  });
}