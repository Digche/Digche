import { foodCategories } from "../constants/food-categories";

export function getFoodCategoryBySlug(categorySlug: string) {
  return foodCategories.find((category) => category.slug === categorySlug);
}

export function normalizeCategoryText(value: string) {
  return value.trim().toLowerCase();
}