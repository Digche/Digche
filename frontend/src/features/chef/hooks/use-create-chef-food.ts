"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { chefFoodsApi } from "../api/chef-foods.api";

export function useCreateChefFood() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chefFoodsApi.createChefFood,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["chef", "foods"],
      });

      void queryClient.invalidateQueries({
        queryKey: ["foods"],
      });
    },
  });
}

//کاربرد برای: AddFoodForm.tsx