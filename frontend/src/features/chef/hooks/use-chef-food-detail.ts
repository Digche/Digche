"use client";

import { useQuery } from "@tanstack/react-query";
import { chefFoodsApi } from "../api/chef-foods.api";

export function useChefFoodDetail(foodId: number | string) {
  return useQuery({
    queryKey: ["chef", "foods", foodId],
    queryFn: () => chefFoodsApi.getChefFoodById(foodId),
    enabled: Boolean(foodId),
  });
}

//کاربرد برای: EditFoodForm.tsx