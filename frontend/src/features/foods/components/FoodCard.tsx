// src/features/foods/components/FoodCard.tsx

"use client";

import Image from "next/image";
import Link from "next/link";
import {Star,MapPin,ShoppingCart,Plus,Minus,Pencil,Trash2,} from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useFoodStore } from "@/store/food-store";

interface FoodItemProps {
  id: number;
  title: string;
  category: string;
  rating: number;
  remaining: string;
  chef: string;
  chefId?: number;
  location: string;
  price: string;
  unit?: string;
  image: string;
  description?: string;
}

interface FoodCardProps {
  item: FoodItemProps;
  variant?: "customer" | "chef";
  display?: "scroll" | "grid" | "compact";
}

export default function FoodCard({
  item,
  variant = "customer",
  display = "grid",
}: FoodCardProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);

  const deleteFood = useFoodStore((state) => state.deleteFood);

  const cartItem = useCartStore((state) =>
    state.items.find((cartItem) => cartItem.id === item.id)
  );

  const quantity = cartItem?.quantity ?? 0;

  const isScroll = display === "scroll";
  const isCompact = display === "compact";

  const cardClass = isScroll
    ? "min-w-[260px] sm:min-w-[300px] md:min-w-[320px]"
    : "w-full";

  const imageClass = isCompact
    ? "relative aspect-square w-28 shrink-0 overflow-hidden sm:w-32"
    : isScroll
      ? "relative h-[230px] w-full sm:h-[248px]"
      : "relative aspect-[4/3] w-full";

  const handleDeleteFood = () => {
    const confirmed = window.confirm("آیا از حذف این غذا مطمئن هستید؟");

    if (!confirmed) return;

    deleteFood(item.id);
    removeFromCart(item.id);
  };

  if (isCompact) {
    return (
      <article className="flex w-full gap-3 overflow-hidden rounded-3xl border border-gray-100 bg-[#FDF7F2] p-2 shadow-sm">
        <Link href={`/foods/${item.id}`} className={imageClass}>
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="rounded-[1.5rem] object-cover"
          />
        </Link>

        <div className="flex min-w-0 flex-1 flex-col justify-between py-1 text-right">
          <div>
            <div className="flex items-start justify-between gap-2">
              <Link href={`/foods/${item.id}`} className="min-w-0">
                <h3 className="truncate text-base font-bold text-gray-800">
                  {item.title}
                </h3>
              </Link>

              <div className="flex shrink-0 items-center gap-1 text-yellow-500">
                <span className="text-xs font-bold text-gray-700">
                  {item.rating}
                </span>
                <Star size={13} fill="currentColor" />
              </div>
            </div>

            <p className="mt-1 truncate text-xs text-gray-500">
              {item.remaining}
            </p>

            <p className="mt-1 flex items-center justify-end gap-1 text-xs text-gray-500">
              {item.location}
              <MapPin size={13} className="text-orange-400" />
            </p>
          </div>

          <div className="mt-2 flex items-center justify-between gap-2 border-t border-gray-200 pt-2">
            <span className="truncate text-sm font-bold text-gray-900">
              {item.price}
              {item.unit && (
                <span className="mr-1 text-xs font-normal text-gray-500">
                  {item.unit}
                </span>
              )}
            </span>

            {variant === "chef" ? (
              <Link
                href={`/chef/foods/${item.id}/edit`}
                className="rounded-full bg-[#D48B8B] px-3 py-1.5 text-xs font-bold text-white"
              >
                ویرایش
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => addToCart(item)}
                className="rounded-full bg-[#D48B8B] px-3 py-1.5 text-xs font-bold text-white"
              >
                افزودن
              </button>
            )}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`${cardClass} snap-start overflow-hidden rounded-3xl border border-gray-100 bg-[#FDF7F2] shadow-sm transition hover:shadow-md`}
    >
      <Link href={`/foods/${item.id}`} className="block">
        <div className={imageClass}>
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="rounded-[2.5rem] object-cover p-2"
          />

          <div className="absolute left-6 top-4 rounded-full bg-[#D48B8B] px-5 py-1 text-xs text-white opacity-90 sm:px-6">
            {item.category}
          </div>
        </div>
      </Link>

      <div className="p-4 text-right sm:p-5">
        <div className="mb-2 flex items-start justify-between gap-3">
          <Link href={`/foods/${item.id}`} className="min-w-0">
            <h3 className="truncate text-lg font-bold text-gray-800 sm:text-xl">
              {item.title}
            </h3>
          </Link>

          <div className="flex shrink-0 items-center gap-1 text-yellow-500">
            <span className="text-sm font-bold text-gray-700">
              {item.rating}
            </span>
            <Star size={14} fill="currentColor" />
          </div>
        </div>

        <div className="mb-5 space-y-1 text-sm text-gray-600 sm:mb-6">
          <p className="truncate">{item.remaining}</p>
          <p className="truncate">{item.chef}</p>

          <p className="flex items-center justify-end gap-1">
            <span className="truncate">{item.location}</span>
            <MapPin size={14} className="shrink-0 text-orange-400" />
          </p>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-4 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
          {variant === "chef" ? (
            <div className="grid w-full grid-cols-2 gap-2 min-[420px]:w-auto">
              <button
                type="button"
                onClick={handleDeleteFood}
                className="flex items-center justify-center gap-2 rounded-full bg-[#FDF7F2] px-4 py-2 text-sm font-bold text-red-500 transition hover:bg-red-50"
              >
                <Trash2 size={16} />
                حذف
              </button>

              <Link
                href={`/chef/foods/${item.id}/edit`}
                className="flex items-center justify-center gap-2 rounded-full bg-[#D48B8B] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#c97b7b]"
              >
                <Pencil size={16} />
                ویرایش
              </Link>
            </div>
          ) : quantity === 0 ? (
            <button
              type="button"
              onClick={() => addToCart(item)}
              className="flex items-center justify-center gap-2 rounded-full bg-[#D48B8B] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#c97b7b] min-[420px]:justify-start"
            >
              <ShoppingCart size={16} />
              افزودن
            </button>
          ) : (
            <div className="flex w-full items-center justify-center gap-3 rounded-full border border-gray-200 bg-white px-2 py-1 shadow-sm min-[420px]:w-auto">
              <button
                type="button"
                onClick={() => increaseQuantity(item.id)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D48B8B] text-white transition hover:bg-[#c97b7b]"
                aria-label="زیاد کردن تعداد"
              >
                <Plus size={16} />
              </button>

              <span className="min-w-6 text-center font-bold text-gray-800">
                {quantity}
              </span>

              <button
                type="button"
                onClick={() => decreaseQuantity(item.id)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FDF7F2] text-gray-700 transition hover:bg-gray-100"
                aria-label="کم کردن تعداد"
              >
                <Minus size={16} />
              </button>
            </div>
          )}

          <span className="text-left text-lg font-bold text-gray-900 min-[420px]:text-right">
            {item.unit && (
              <span className="ml-1 text-sm font-normal">{item.unit}</span>
            )}
            {item.price}
          </span>
        </div>
      </div>
    </article>
  );
}