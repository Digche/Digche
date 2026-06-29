"use client";

import { useQuery } from "@tanstack/react-query";
import { foodsApi } from "../api/foods.api";

export function useFoodComments(foodId: number | string) {
  return useQuery({
    queryKey: ["foods", foodId, "comments"],
    queryFn: () => foodsApi.getFoodComments(foodId),
    enabled: Boolean(foodId),
  });
}

//کاربردش برای: FoodDetailsClient.tsx