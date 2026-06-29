"use client";

import { useQuery } from "@tanstack/react-query";
import { chefFoodsApi } from "../api/chef-foods.api";

export function useChefFoods() {
  return useQuery({
    queryKey: ["chef", "foods"],
    queryFn: chefFoodsApi.getChefFoods,
  });
}

//کاربرد برای: ChefFoodsScreen.tsx