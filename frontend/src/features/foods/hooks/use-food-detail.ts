"use client";

import { useQuery } from "@tanstack/react-query";
import { foodsApi } from "../api/foods.api";

export function useFoodDetail(foodId: number | string) {
  return useQuery({
    queryKey: ["foods", foodId],
    queryFn: () => foodsApi.getFoodById(foodId),
    enabled: Boolean(foodId),
  });
}

//کاربردش برای: FoodDetailsClient.tsx