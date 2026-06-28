"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { chefFoodsApi } from "../api/chef-foods.api";
import type { UpdateChefFoodPayload } from "../types/chef-food.types";

type UpdateChefFoodInput = {
  foodId: number | string;
  payload: UpdateChefFoodPayload;
};

export function useUpdateChefFood() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ foodId, payload }: UpdateChefFoodInput) =>
      chefFoodsApi.updateChefFood(foodId, payload),

    onSuccess: (_updatedFood, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["chef", "foods"],
      });

      void queryClient.invalidateQueries({
        queryKey: ["chef", "foods", variables.foodId],
      });

      void queryClient.invalidateQueries({
        queryKey: ["foods"],
      });

      void queryClient.invalidateQueries({
        queryKey: ["foods", variables.foodId],
      });
    },
  });
}

//کاربرد برای: EditFoodForm.tsx