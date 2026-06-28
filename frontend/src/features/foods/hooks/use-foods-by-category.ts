"use client";

import { useMemo } from "react";
import { useFoods } from "./use-foods";
import { normalizeCategoryText } from "@/features/categories/utils/category-slug";

export function useFoodsByCategory(categoryTitle?: string) {
  const foodsQuery = useFoods();

  const filteredFoods = useMemo(() => {
    if (!categoryTitle) return [];

    const normalizedCategory = normalizeCategoryText(categoryTitle);

    return (foodsQuery.data ?? []).filter((food) => {
      return normalizeCategoryText(food.category) === normalizedCategory;
    });
  }, [foodsQuery.data, categoryTitle]);

  return {
    ...foodsQuery,
    data: filteredFoods,
  };
}