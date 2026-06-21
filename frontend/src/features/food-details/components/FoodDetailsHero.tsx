// src/features/food-details/components/FoodDetailsHero.tsx

import Image from "next/image";
import { MapPin, Star, ChefHat } from "lucide-react";
import FoodDetailsActions from "./FoodDetailsActions";

interface FoodDetailsHeroProps {
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
    description: string;
  };
  canEditFood: boolean;
  canAddToCart: boolean;
}

export default function FoodDetailsHero({
  food,
  canEditFood,
  canAddToCart,
}: FoodDetailsHeroProps) {
  return (
    <section className="grid gap-6 rounded-3xl border border-orange-100 bg-white p-4 shadow-sm md:grid-cols-[420px_1fr] md:p-6">
      <div className="relative h-72 overflow-hidden rounded-3xl md:h-full md:min-h-[420px]">
        <Image
          src={food.image}
          alt={food.title}
          fill
          className="object-cover"
          priority
        />

        <div className="absolute right-4 top-4 rounded-full bg-[#D48B8B] px-5 py-1 text-xs font-medium text-white">
          {food.category}
        </div>
      </div>

      <div className="flex flex-col justify-between gap-6 text-right">
        <div>
          <div className="mb-3 flex items-start justify-between gap-4">
            <h1 className="text-2xl font-extrabold text-gray-900 md:text-3xl">
              {food.title}
            </h1>

            <div className="flex items-center gap-1 rounded-full bg-yellow-50 px-3 py-1 text-yellow-500">
              <span className="text-sm font-bold text-gray-700">
                {food.rating}
              </span>
              <Star size={16} fill="currentColor" />
            </div>
          </div>

          <p className="leading-8 text-gray-600">{food.description}</p>

          <div className="mt-6 grid gap-3 text-sm text-gray-600 sm:grid-cols-2">
            <div className="flex items-center gap-2 rounded-2xl bg-[#FFF9F4] p-3">
              <ChefHat size={18} className="text-[#D48B8B]" />
              <span>{food.chef}</span>
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-[#FFF9F4] p-3">
              <MapPin size={18} className="text-orange-400" />
              <span>{food.location}</span>
            </div>

            <div className="rounded-2xl bg-[#FFF9F4] p-3">
              {food.remaining}
            </div>

            <div className="rounded-2xl bg-[#FFF9F4] p-3 font-bold text-gray-900">
              {food.price}
              {food.unit && (
                <span className="mr-1 text-sm font-normal text-gray-500">
                  {food.unit}
                </span>
              )}
            </div>
          </div>
        </div>

        <FoodDetailsActions
          food={food}
          canEditFood={canEditFood}
          canAddToCart={canAddToCart}
        />
      </div>
    </section>
  );
}