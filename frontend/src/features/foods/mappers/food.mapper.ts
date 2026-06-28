import type { Food, FoodDto } from "../types/food.types";

export function mapFoodDtoToFood(dto: FoodDto): Food {
  return {
    id: dto.id,
    title: dto.title ?? "",
    category: dto.category ?? "",
    rating: dto.rating ?? 0,
    remaining: dto.remaining ?? "",
    chef: dto.chef ?? "",
    chefId: dto.chefId,
    location: dto.location ?? "",
    price: dto.price ?? "",
    unit: dto.unit ?? "تومان",
    image: dto.image || "/images/cake.webp",
    ingredients: dto.ingredients ?? "",
    description: dto.description ?? "",
  };
}

export function mapFoodDtosToFoods(dtos: FoodDto[]): Food[] {
  return dtos.map(mapFoodDtoToFood);
}