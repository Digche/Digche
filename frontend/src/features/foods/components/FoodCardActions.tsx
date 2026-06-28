// src/features/foods/components/FoodCardActions.tsx

"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import type { Food } from "../types/food.types";
import { useDeleteChefFood } from "@/features/chef/hooks/use-delete-chef-food";

interface FoodCardActionsProps {
  food: Food;
  canEditFood: boolean;
  canAddToCart: boolean;
  compact?: boolean;
}

export default function FoodCardActions({
  food,
  canEditFood,
  canAddToCart,
  compact = false,
}: FoodCardActionsProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);

  const deleteFood = useDeleteChefFood();

  const cartItem = useCartStore((state) =>
    state.items.find((cartItem) => cartItem.id === food.id)
  );

  const quantity = cartItem?.quantity ?? 0;

  const stopActionClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  const handleAddToCart = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    addToCart(food);
  };

  const handleIncreaseQuantity = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    increaseQuantity(food.id);
  };

  const handleDecreaseQuantity = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    decreaseQuantity(food.id);
  };

  const handleDeleteFood = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    const confirmed = window.confirm("آیا از حذف این غذا مطمئن هستید؟");

    if (!confirmed) return;

    deleteFood.mutate(food.id, {
      onSuccess: () => {
        removeFromCart(food.id);
      },
      onError: (error) => {
        alert(error instanceof Error ? error.message : "حذف غذا ناموفق بود.");
      },
    });
  };

  if (canEditFood) {
    if (compact) {
      return (
        <div className="flex shrink-0 items-center gap-1.5">
          <Link
            href={`/chef/foods/${food.id}/edit`}
            onClick={stopActionClick}
            className="rounded-full bg-[#D48B8B] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#c97b7b]"
          >
            ویرایش
          </Link>

          <button
            type="button"
            onClick={handleDeleteFood}
            disabled={deleteFood.isPending}
            className="rounded-full bg-[#FDF7F2] px-3 py-1.5 text-xs font-bold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleteFood.isPending ? "..." : "حذف"}
          </button>
        </div>
      );
    }

    return (
      <div className="grid w-full grid-cols-2 gap-2 min-[420px]:w-auto">
        <Link
          href={`/chef/foods/${food.id}/edit`}
          onClick={stopActionClick}
          className="flex items-center justify-center gap-2 rounded-full bg-[#D48B8B] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#c97b7b]"
        >
          ویرایش
        </Link>

        <button
          type="button"
          onClick={handleDeleteFood}
          disabled={deleteFood.isPending}
          className="flex items-center justify-center gap-2 rounded-full bg-[#FDF7F2] px-4 py-2 text-sm font-bold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Trash2 size={16} />
          {deleteFood.isPending ? "در حال حذف..." : "حذف"}
        </button>
      </div>
    );
  }

  if (canAddToCart) {
    if (quantity === 0) {
      return (
        <button
          type="button"
          onClick={handleAddToCart}
          className={
            compact
              ? "rounded-full bg-[#D48B8B] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#c97b7b]"
              : "flex items-center justify-center gap-2 rounded-full bg-[#D48B8B] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#c97b7b] min-[420px]:justify-start"
          }
        >
          {!compact && <ShoppingCart size={16} />}
          افزودن
        </button>
      );
    }

    return (
      <div
        className={
          compact
            ? "flex items-center gap-2 rounded-full border border-gray-200 bg-white px-1 py-1 shadow-sm"
            : "flex w-full items-center justify-center gap-3 rounded-full border border-gray-200 bg-white px-2 py-1 shadow-sm min-[420px]:w-auto"
        }
      >
        <button
          type="button"
          onClick={handleIncreaseQuantity}
          className={
            compact
              ? "flex h-7 w-7 items-center justify-center rounded-full bg-[#D48B8B] text-white transition hover:bg-[#c97b7b]"
              : "flex h-8 w-8 items-center justify-center rounded-full bg-[#D48B8B] text-white transition hover:bg-[#c97b7b]"
          }
          aria-label="زیاد کردن تعداد"
        >
          <Plus size={compact ? 14 : 16} />
        </button>

        <span
          className={
            compact
              ? "min-w-5 text-center text-sm font-bold text-gray-800"
              : "min-w-6 text-center font-bold text-gray-800"
          }
        >
          {quantity}
        </span>

        <button
          type="button"
          onClick={handleDecreaseQuantity}
          className={
            compact
              ? "flex h-7 w-7 items-center justify-center rounded-full bg-[#FDF7F2] text-gray-700 transition hover:bg-gray-100"
              : "flex h-8 w-8 items-center justify-center rounded-full bg-[#FDF7F2] text-gray-700 transition hover:bg-gray-100"
          }
          aria-label="کم کردن تعداد"
        >
          <Minus size={compact ? 14 : 16} />
        </button>
      </div>
    );
  }

  return null;
}