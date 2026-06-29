import type {
  CreateChefFoodPayload,
  UpdateChefFoodPayload,
} from "../types/chef-food.types";

export type ChefFoodFormErrors = Partial<
  Record<keyof CreateChefFoodPayload, string>
>;

export function validateCreateChefFoodPayload(
  payload: CreateChefFoodPayload
): ChefFoodFormErrors {
  const errors: ChefFoodFormErrors = {};

  if (!payload.title.trim()) {
    errors.title = "نام غذا الزامی است.";
  }

  if (!payload.category.trim()) {
    errors.category = "دسته‌بندی الزامی است.";
  }

  if (!payload.remaining.trim()) {
    errors.remaining = "مقدار غذا الزامی است.";
  }

  if (!payload.price.trim()) {
    errors.price = "قیمت غذا الزامی است.";
  }

  if (!payload.description.trim()) {
    errors.description = "توضیحات غذا الزامی است.";
  }

  return errors;
}

export function validateUpdateChefFoodPayload(
  payload: UpdateChefFoodPayload
): ChefFoodFormErrors {
  const errors: ChefFoodFormErrors = {};

  if (payload.title !== undefined && !payload.title.trim()) {
    errors.title = "نام غذا نمی‌تواند خالی باشد.";
  }

  if (payload.category !== undefined && !payload.category.trim()) {
    errors.category = "دسته‌بندی نمی‌تواند خالی باشد.";
  }

  if (payload.price !== undefined && !payload.price.trim()) {
    errors.price = "قیمت نمی‌تواند خالی باشد.";
  }

  return errors;
}

export function hasChefFoodFormErrors(errors: ChefFoodFormErrors) {
  return Object.keys(errors).length > 0;
}