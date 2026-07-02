
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cartApi } from "../api/cart.api";

export function useAddCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cartApi.addItem,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["cart"],
      });
    },
  });
}