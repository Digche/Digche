import { apiRequest } from "@/shared/api/api-client";
import { endpoints } from "@/shared/api/endpoints";
import type { ApiResponse } from "@/shared/api/api-types";
import {
  mapFoodDtoToFood,
  mapFoodDtosToFoods,
} from "../mappers/food.mapper";
import {
  mapFoodCommentDtoToFoodComment,
  mapFoodCommentDtosToFoodComments,
} from "../mappers/food-comment.mapper";import type { Food, FoodDto } from "../types/food.types";
import type {
  FoodComment,
  FoodCommentDto,
  CreateFoodCommentPayload,

} from "../types/food-comment.types";

function unwrapData<T>(response: T | ApiResponse<T>): T {
  if (
    response &&
    typeof response === "object" &&
    "data" in response
  ) {
    return (response as ApiResponse<T>).data;
  }

  return response as T;
}

export const foodsApi = {
  async getFoods(): Promise<Food[]> {
    const response = await apiRequest<FoodDto[] | ApiResponse<FoodDto[]>>(
      endpoints.foods.list
    );

    const data = unwrapData(response);

    return mapFoodDtosToFoods(data);
  },

  async getNearbyFoods(): Promise<Food[]> {
    const response = await apiRequest<FoodDto[] | ApiResponse<FoodDto[]>>(
      endpoints.foods.nearby
    );

    const data = unwrapData(response);

    return mapFoodDtosToFoods(data);
  },

  async getFoodById(foodId: number | string): Promise<Food> {
    const response = await apiRequest<FoodDto | ApiResponse<FoodDto>>(
      endpoints.foods.detail(foodId)
    );

    const data = unwrapData(response);

    return mapFoodDtoToFood(data);
  },

  async getFoodComments(foodId: number | string): Promise<FoodComment[]> {
    const response = await apiRequest<
      FoodCommentDto[] | ApiResponse<FoodCommentDto[]>
    >(endpoints.foods.comments(foodId));

    const data = unwrapData(response);

    return mapFoodCommentDtosToFoodComments(data);
  },

  async createFoodComment(
  payload: CreateFoodCommentPayload
): Promise<FoodComment> {
  const response = await apiRequest<FoodCommentDto | ApiResponse<FoodCommentDto>>(
    endpoints.foods.createComment,
    {
      method: "POST",
      auth: true,
      body: {
        dishId: payload.dishId,
        text: payload.text,
        rating: payload.rating,
      },
    }
  );

  const data = unwrapData(response);

  return mapFoodCommentDtoToFoodComment(data);
},
};