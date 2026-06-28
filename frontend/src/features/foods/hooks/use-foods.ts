"use client";

import { useQuery } from "@tanstack/react-query";
import { foodsApi } from "../api/foods.api";

export function useFoods() {
  return useQuery({
    queryKey: ["foods"],
    queryFn: foodsApi.getFoods,
  });
}

//کاربردش برای:LocalsScreen.tsx

