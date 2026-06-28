"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { chefFoodsApi } from "../api/chef-foods.api";

export function useDeleteChefFood() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (foodId: number | string) =>
      chefFoodsApi.deleteChefFood(foodId),

    onSuccess: (_response, foodId) => {
      void queryClient.invalidateQueries({
        queryKey: ["chef", "foods"],
      });

      void queryClient.invalidateQueries({
        queryKey: ["foods"],
      });

      void queryClient.invalidateQueries({
        queryKey: ["foods", foodId],
      });
    },
  });
}

//کاربرد برای:

// FoodCardActions.tsx
// FoodDetailsActions.tsx