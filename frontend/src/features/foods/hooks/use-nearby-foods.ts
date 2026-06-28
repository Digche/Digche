"use client";

import { useQuery } from "@tanstack/react-query";
import { foodsApi } from "../api/foods.api";

export function useNearbyFoods() {
  return useQuery({
    queryKey: ["foods", "nearby"],
    queryFn: foodsApi.getNearbyFoods,
  });
}

//کاربردش برای:FoodScroll.tsx

