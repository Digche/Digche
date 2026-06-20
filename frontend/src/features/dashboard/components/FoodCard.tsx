"use client";

import React from "react";
import Image from "next/image";
import { Star, MapPin, ShoppingCart, Plus, Minus } from "lucide-react";
import { useCartStore } from "@/store/cart-store";

interface FoodItemProps {
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
}

interface FoodCardProps {
  item: FoodItemProps;
}

const FoodCard: React.FC<FoodCardProps> = ({ item }) => {
  const addToCart = useCartStore((state) => state.addToCart);
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);

  const cartItem = useCartStore((state) =>
    state.items.find((cartItem) => cartItem.id === item.id)
  );

  const quantity = cartItem?.quantity ?? 0;

  return (
    <div className="min-w-[280px] md:min-w-[320px] bg-[#FDF7F2] rounded-3xl overflow-hidden border border-gray-100 shadow-sm snap-start">
      <div className="relative h-[248px] w-full">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover p-2 rounded-[2.5rem]"
        />

        <div className="absolute top-4 left-6 bg-[#D48B8B] text-white text-xs px-6 py-1 rounded-full opacity-90">
          {item.category}
        </div>
      </div>

      <div className="p-5 text-right">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-800">{item.title}</h3>

          <div className="flex items-center gap-1 text-yellow-500">
            <span className="text-gray-700 font-bold text-sm">
              {item.rating}
            </span>
            <Star size={14} fill="currentColor" />
          </div>
        </div>

        <div className="space-y-1 mb-6 text-gray-600 text-sm">
          <p>{item.remaining}</p>
          <p>{item.chef}</p>

          <p className="flex items-center justify-end gap-1">
            {item.location}
            <MapPin size={14} className="text-orange-400" />
          </p>
        </div>

        <div className="flex justify-between items-center border-t border-gray-200 pt-4">
          {quantity === 0 ? (
            <button
              type="button"
              onClick={() => addToCart(item)}
              className="flex items-center gap-2 bg-[#D48B8B] text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-[#c97b7b] transition"
            >
              <ShoppingCart size={16} />
              افزودن
            </button>
          ) : (
            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-full px-2 py-1 shadow-sm">
             
              <button
                type="button"
                onClick={() => increaseQuantity(item.id)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#D48B8B] text-white hover:bg-[#c97b7b] transition"
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
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FDF7F2] text-gray-700 hover:bg-gray-100 transition"
                aria-label="کم کردن تعداد"
              >
                <Minus size={16} />
              </button>

            </div>
          )}

          <span className="text-lg font-bold text-gray-900">
            {item.unit && (
              <span className="text-sm font-normal ml-1">{item.unit}</span>
            )}
            {item.price}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;