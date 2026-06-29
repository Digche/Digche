import type { Food, FoodDto } from "@/features/foods/types/food.types";

export type ChefFood = Food;

export type ChefFoodDto = FoodDto;

export type CreateChefFoodPayload = {
  title: string;
  category: string;
  remaining: string;
  price: string;
  unit?: string;
  image: string;
  ingredients?: string;
  description: string;
  location?: string;
};

export type UpdateChefFoodPayload = Partial<CreateChefFoodPayload>;
