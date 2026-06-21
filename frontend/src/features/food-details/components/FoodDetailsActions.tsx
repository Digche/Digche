// src/features/food-details/components/FoodDetailsActions.tsx

"use client";

import Link from "next/link";
import { Edit3, ShoppingCart, Plus, Minus } from "lucide-react";
import { useCartStore } from "@/store/cart-store";

interface FoodDetailsActionsProps {
  food: {
    id: number;
    title: string;
    category: string;
    rating: number;
    remaining: string;
    chef: string;
    location: string;
    price: string;
    unit?: string;
    image: string;
  };
  canEditFood: boolean;
  canAddToCart: boolean;
}

export default function FoodDetailsActions({
  food,
  canEditFood,
  canAddToCart,
}: FoodDetailsActionsProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);

  const cartItem = useCartStore((state) =>
    state.items.find((cartItem) => cartItem.id === food.id)
  );

  const quantity = cartItem?.quantity ?? 0;

  if (canEditFood) {
    return (
      <Link
        href={`/chef/foods/${food.id}/edit`}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-gray-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-gray-800 md:w-fit"
      >
        <Edit3 size={18} />
        ویرایش اطلاعات غذا
      </Link>

    );
  }

  if (canAddToCart) {
    if (quantity === 0) {
      return (
        <button
          type="button"
          onClick={() => addToCart(food)}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#D48B8B] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#c97b7b] md:w-fit"
        >
          <ShoppingCart size={18} />
          افزودن به سبد خرید
        </button>
      );
    }

    return (
      <div className="flex w-fit items-center gap-3 rounded-full border border-gray-200 bg-white p-1 shadow-sm">
        <button
          type="button"
          onClick={() => decreaseQuantity(food.id)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FDF7F2] text-gray-700 transition hover:bg-gray-100"
          aria-label="کم کردن تعداد"
        >
          <Minus size={18} />
        </button>

        <span className="min-w-8 text-center font-bold text-gray-900">
          {quantity}
        </span>

        <button
          type="button"
          onClick={() => increaseQuantity(food.id)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D48B8B] text-white transition hover:bg-[#c97b7b]"
          aria-label="زیاد کردن تعداد"
        >
          <Plus size={18} />
        </button>
      </div>
    );
  }

  return null;
}