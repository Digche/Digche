import { apiRequest } from "@/shared/api/api-client";
import { endpoints } from "@/shared/api/endpoints";
import type { ApiResponse, ApiMutationResponse } from "@/shared/api/api-types";
import { useAuthStore } from "@/store/auth-store";
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
  if (response && typeof response === "object" && "data" in response) {
    return (response as ApiResponse<T>).data;
  }

  return response as T;
}

function getCurrentChefId() {
  const currentUser = useAuthStore.getState().currentUser;

  return currentUser?.publicId ?? currentUser?.id;
}

function getCurrentChefPublicId() {
  const currentUser = useAuthStore.getState().currentUser;

  return currentUser?.publicId;
}

function toEnglishDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
}

function parsePositiveNumber(value: string | number | undefined) {
  if (typeof value === "number") return value;

  const normalizedValue = toEnglishDigits(String(value ?? ""))
    .replace(/[^\d.]/g, "")
    .trim();

  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function toCoreCreateDishPayload(payload: CreateChefFoodPayload) {
  const chefId = payload.chefId ?? getCurrentChefPublicId();

  if (!chefId) {
    throw new Error("شناسه عمومی آشپز پیدا نشد. لطفاً دوباره وارد حساب شوید.");
  }

  return {
    title: payload.title ?? "",
    remaining: parsePositiveNumber(payload.remaining),
    chefId: String(chefId),
    price: parsePositiveNumber(payload.price),
    unit: payload.unit ?? "تومان",
    image: payload.image,
    ingredients: payload.ingredients ?? "",
    description: payload.description ?? "",
    isAvailable: payload.isAvailable ?? true,
    category: payload.category ?? "",
  };
}

function toCoreUpdateDishPayload(payload: UpdateChefFoodPayload) {
  return {
    title: payload.title ?? "",
    price: parsePositiveNumber(payload.price),
    description: payload.description ?? "",
    ingredients: payload.ingredients ?? "",
    image: payload.image ?? "",
    remaining: parsePositiveNumber(payload.remaining),
    category: payload.category ?? "",
  };
}

export const chefFoodsApi = {
  async getChefFoods(): Promise<ChefFood[]> {
    const chefId = getCurrentChefId();

    if (!chefId) {
      return [];
    }

    const response = await apiRequest<
      ChefFoodDto[] | ApiResponse<ChefFoodDto[]>
    >(endpoints.chefFoods.list(chefId), {
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
    const response = await apiRequest<string | ApiResponse<string>>(
      endpoints.chefFoods.create,
      {
        method: "POST",
        body: toCoreCreateDishPayload(payload),
        auth: true,
      }
    );

    const foodId = unwrapData(response);

    return chefFoodsApi.getChefFoodById(foodId);
  },

  async updateChefFood(
    foodId: number | string,
    payload: UpdateChefFoodPayload
  ): Promise<ChefFood> {
    await apiRequest<boolean | ApiResponse<boolean>>(
      endpoints.chefFoods.update(foodId),
      {
        method: "PUT",
        body: toCoreUpdateDishPayload(payload),
        auth: true,
      }
    );

    return chefFoodsApi.getChefFoodById(foodId);
  },

  async deleteChefFood(foodId: number | string): Promise<ApiMutationResponse> {
    await apiRequest<unknown>(endpoints.chefFoods.delete(foodId), {
      method: "DELETE",
      auth: true,
    });

    return {
      message: "غذا با موفقیت حذف شد.",
    } satisfies ApiMutationResponse;
  },
};