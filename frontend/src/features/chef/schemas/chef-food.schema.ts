import {
  CreateChefFoodPayload,
  UpdateChefFoodPayload,
} from "../types/chef-food.types";

export type ChefFoodFormErrors = Partial<
  Record<keyof CreateChefFoodPayload, string>
>;

function isBlank(value: string | number | undefined | null) {
  return String(value ?? "").trim().length === 0;
}

export function validateCreateChefFoodPayload(
  payload: CreateChefFoodPayload
): ChefFoodFormErrors {
  const errors: ChefFoodFormErrors = {};

  if (isBlank(payload.title)) {
    errors.title = "نام غذا الزامی است.";
  }

  if (isBlank(payload.category)) {
    errors.category = "دسته‌بندی الزامی است.";
  }

  if (isBlank(payload.remaining)) {
    errors.remaining = "مقدار غذا الزامی است.";
  }

  if (isBlank(payload.price)) {
    errors.price = "قیمت غذا الزامی است.";
  }

  if (isBlank(payload.description)) {
    errors.description = "توضیحات غذا الزامی است.";
  }

  return errors;
}

export function validateUpdateChefFoodPayload(
  payload: UpdateChefFoodPayload
): ChefFoodFormErrors {
  const errors: ChefFoodFormErrors = {};

  if (payload.title !== undefined && isBlank(payload.title)) {
    errors.title = "نام غذا نمی‌تواند خالی باشد.";
  }

  if (payload.category !== undefined && isBlank(payload.category)) {
    errors.category = "دسته‌بندی نمی‌تواند خالی باشد.";
  }

  if (payload.remaining !== undefined && isBlank(payload.remaining)) {
    errors.remaining = "مقدار غذا نمی‌تواند خالی باشد.";
  }

  if (payload.price !== undefined && isBlank(payload.price)) {
    errors.price = "قیمت نمی‌تواند خالی باشد.";
  }

  if (payload.description !== undefined && isBlank(payload.description)) {
    errors.description = "توضیحات غذا نمی‌تواند خالی باشد.";
  }

  return errors;
}

export function hasChefFoodFormErrors(errors: ChefFoodFormErrors) {
  return Object.keys(errors).length > 0;
}