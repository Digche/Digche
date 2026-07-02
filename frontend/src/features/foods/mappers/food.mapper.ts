import type { Food, FoodDto } from "../types/food.types";

export function mapFoodDtoToFood(dto: FoodDto): Food {
  const remainingText =
    typeof dto.remaining === "number"
      ? `${dto.remaining} باقیمانده`
      : dto.remaining || "";

  return {
    id: dto.id,
    title: dto.title ?? "",
    category: dto.category ?? "",
    rating: dto.rating ?? 0,
    remaining: remainingText,
    chef: dto.chef ?? "",
    chefId: dto.chefId,
    location: dto.location ?? "",
    price: String(dto.price ?? ""),
    unit: "تومان",
    image: dto.image || "/images/cake.webp",
    ingredients: dto.ingredients ?? "",
    description: dto.description ?? "",
  };
}

export function mapFoodDtosToFoods(dtos: FoodDto[]): Food[] {
  return dtos.map(mapFoodDtoToFood);
}
