// src/features/food-details/components/FoodDetailsActions.tsx

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit3, ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useFoodStore } from "@/store/food-store";

interface FoodDetailsActionsProps {
  food: {
    id: number;
    title: string;
    category: string;
    rating: number;
    remaining: string;
    chef: string;
    chefId: number;
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
  const router = useRouter();

  const addToCart = useCartStore((state) => state.addToCart);
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);

  const deleteFood = useFoodStore((state) => state.deleteFood);

  const cartItem = useCartStore((state) =>
    state.items.find((cartItem) => cartItem.id === food.id)
  );

  const quantity = cartItem?.quantity ?? 0;

  const handleDeleteFood = () => {
    const confirmed = window.confirm("آیا از حذف این غذا مطمئن هستید؟");

    if (!confirmed) return;

    deleteFood(food.id);
    removeFromCart(food.id);
    router.push("/");
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
          className="flex h-14 w-28 shrink-0 items-center justify-center gap-2 rounded-full bg-red-100 px-4 text-sm font-bold text-red-600 transition hover:bg-red-200 sm:w-40"
        >
          <Trash2 size={18} />
          حذف غذا
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