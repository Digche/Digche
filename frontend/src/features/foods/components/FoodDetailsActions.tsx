"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit3, ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import type { Food } from "../types/food.types";
import { useDeleteChefFood } from "@/features/chef/hooks/use-delete-chef-food";

interface FoodDetailsActionsProps {
  food: Food;
  canEditFood: boolean;
  canAddToCart: boolean;
}

export default function FoodDetailsActions({
  food,
  canEditFood,
  canAddToCart,
}: FoodDetailsActionsProps) {
  const router = useRouter();

  const addToCart = useCartStore((state) => state.addToCart);
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);

  const deleteFood = useDeleteChefFood();

  const cartItem = useCartStore((state) =>
    state.items.find((cartItem) => cartItem.id === food.id)
  );

  const quantity = cartItem?.quantity ?? 0;

  const handleDeleteFood = () => {
    const confirmed = window.confirm("آیا از حذف این غذا مطمئن هستید؟");

    if (!confirmed) return;

    deleteFood.mutate(food.id, {
      onSuccess: () => {
        removeFromCart(food.id);
        router.push("/");
      },
      onError: (error) => {
        alert(error instanceof Error ? error.message : "حذف غذا ناموفق بود.");
      },
    });
  };

  if (canEditFood) {
    return (
      <div className="flex w-full items-center justify-center gap-4">
        <Link
          href={`/chef/foods/${food.id}/edit`}
          className="flex h-14 flex-1 items-center justify-center gap-3 rounded-full bg-[#111322] px-5 text-sm font-bold text-white transition hover:bg-gray-800 sm:text-base"
        >
          <Edit3 size={21} />
          ویرایش اطلاعات غذا
        </Link>

        <button
          type="button"
          onClick={handleDeleteFood}
          disabled={deleteFood.isPending}
          className="flex h-14 w-28 shrink-0 items-center justify-center gap-2 rounded-full bg-red-100 px-4 text-sm font-bold text-red-600 transition hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-60 sm:w-40"
        >
          <Trash2 size={18} />
          {deleteFood.isPending ? "در حال حذف..." : "حذف غذا"}
        </button>
      </div>
    );
  }

  if (canAddToCart) {
    if (quantity === 0) {
      return (
        <button
          type="button"
          onClick={() => addToCart(food)}
          className="flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[#D48B8B] px-5 text-sm font-bold text-white transition hover:bg-[#c97b7b] sm:text-base"
        >
          <ShoppingCart size={20} />
          افزودن به سبد خرید
        </button>
      );
    }

    return (
      <div className="mx-auto flex h-14 w-40 max-w-sm items-center justify-between rounded-full border border-gray-200 bg-white p-1 shadow-sm">
        <button
          type="button"
          onClick={() => increaseQuantity(food.id)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D48B8B] text-white transition hover:bg-[#c97b7b]"
          aria-label="زیاد کردن تعداد"
        >
          <Plus size={18} />
        </button>

        <span className="min-w-8 text-center text-lg font-bold text-gray-900">
          {quantity}
        </span>

        <button
          type="button"
          onClick={() => decreaseQuantity(food.id)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FDF7F2] text-gray-700 transition hover:bg-gray-100"
          aria-label="کم کردن تعداد"
        >
          <Minus size={18} />
        </button>
      </div>
    );
  }

  return null;
}