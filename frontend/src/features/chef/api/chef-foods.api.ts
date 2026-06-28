import { apiRequest } from "@/shared/api/api-client";
import { endpoints } from "@/shared/api/endpoints";
import type { ApiResponse, ApiMutationResponse } from "@/shared/api/api-types";
import {
  mapChefFoodDtoToChefFood,
  mapChefFoodDtosToChefFoods,
} from "../mappers/chef-food.mapper";
import type {
  ChefFood,
  ChefFoodDto,
  CreateChefFoodPayload,
  UpdateChefFoodPayload,
} from "../types/chef-food.types";

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

export const chefFoodsApi = {
  async getChefFoods(): Promise<ChefFood[]> {
    const response = await apiRequest<
      ChefFoodDto[] | ApiResponse<ChefFoodDto[]>
    >(endpoints.chefFoods.list, {
      auth: true,
    });

    const data = unwrapData(response);

    return mapChefFoodDtosToChefFoods(data);
  },

  async getChefFoodById(foodId: number | string): Promise<ChefFood> {
    const response = await apiRequest<ChefFoodDto | ApiResponse<ChefFoodDto>>(
      endpoints.chefFoods.detail(foodId),
      {
        auth: true,
      }
    );

    const data = unwrapData(response);

    return mapChefFoodDtoToChefFood(data);
  },

  async createChefFood(payload: CreateChefFoodPayload): Promise<ChefFood> {
    const response = await apiRequest<ChefFoodDto | ApiResponse<ChefFoodDto>>(
      endpoints.chefFoods.create,
      {
        method: "POST",
        body: payload,
        auth: true,
      }
    );

    const data = unwrapData(response);

    return mapChefFoodDtoToChefFood(data);
  },

  async updateChefFood(
    foodId: number | string,
    payload: UpdateChefFoodPayload
  ): Promise<ChefFood> {
    const response = await apiRequest<ChefFoodDto | ApiResponse<ChefFoodDto>>(
      endpoints.chefFoods.update(foodId),
      {
        method: "PATCH",
        body: payload,
        auth: true,
      }
    );

    const data = unwrapData(response);

    return mapChefFoodDtoToChefFood(data);
  },

  async deleteChefFood(
    foodId: number | string
  ): Promise<ApiMutationResponse> {
    return apiRequest<ApiMutationResponse>(
      endpoints.chefFoods.delete(foodId),
      {
        method: "DELETE",
        auth: true,
      }
    );
  },
};