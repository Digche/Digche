import { mapFoodDtoToFood, mapFoodDtosToFoods } from "@/features/foods/mappers/food.mapper";
import type { ChefFood, ChefFoodDto } from "../types/chef-food.types";

export function mapChefFoodDtoToChefFood(dto: ChefFoodDto): ChefFood {
  return mapFoodDtoToFood(dto);
}

export function mapChefFoodDtosToChefFoods(dtos: ChefFoodDto[]): ChefFood[] {
  return mapFoodDtosToFoods(dtos);
}