// src/features/food-details/components/FoodDetailsHero.tsx

import Image from "next/image";
import type { ReactNode } from "react";
import { MapPin, Star, ChefHat, PackageCheck, Wallet } from "lucide-react";
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

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const starNumber = index + 1;
        const isFilled = starNumber <= Math.round(rating);

        return (
          <Star
            key={starNumber}
            size={18}
            className="text-yellow-400"
            fill={isFilled ? "currentColor" : "none"}
            strokeWidth={1.8}
          />
        );
      })}
    </div>
  );
}

function InfoPill({
  icon,
  value,
  label,
  strong = false,
}: {
  icon: ReactNode;
  value: string;
  label?: string;
  strong?: boolean;
}) {
  return (
    <div className="rounded-[1.4rem] bg-[#FFF9F4] px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 text-right">
          {label && <p className="text-xs text-gray-400">{label}</p>}

          <p
            className={`truncate ${
              strong
                ? "text-lg font-extrabold text-gray-950"
                : "text-sm font-bold text-gray-700"
            }`}
          >
            {value}
          </p>
        </div>

        <span className="shrink-0">{icon}</span>
      </div>
    </div>
  );
}

export default function FoodDetailsHero({
  food,
  canEditFood,
  canAddToCart,
}: FoodDetailsHeroProps) {
  const priceText = `${food.price}${food.unit ? ` ${food.unit}` : ""}`;

  return (
    <section
      dir="rtl"
      className="overflow-hidden rounded-[2rem] border border-orange-100 bg-white p-4 shadow-sm sm:p-5"
    >
      {/* Desktop / Tablet */}
      <div className="hidden items-stretch gap-6 lg:flex">
        <div className="flex min-w-0 flex-1 flex-col justify-between text-right">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-950">
              {food.title}
            </h1>

            <div className="mt-3 flex items-center justify-start gap-3">
              <span className="text-base font-bold text-gray-600">
                {food.rating}
              </span>
              <RatingStars rating={food.rating} />
            </div>

            <p className="mt-5 text-base leading-9 text-gray-600">
              {food.description}
            </p>

            <div className="mt-7 grid grid-cols-2 gap-4">
              <InfoPill
                icon={<ChefHat size={21} className="text-[#D48B8B]" />}
                value={food.chef}
              />

              <InfoPill
                icon={<MapPin size={21} className="text-orange-400" />}
                value={food.location}
              />

              <InfoPill
                icon={<PackageCheck size={21} className="text-emerald-500" />}
                value={food.remaining}
              />

              <InfoPill
                icon={<Wallet size={21} className="text-gray-400" />}
                label="قیمت"
                value={priceText}
                strong
              />
            </div>
          </div>

          <div className="mt-8 border-t border-orange-100 pt-6">
            <FoodDetailsActions
              food={food}
              canEditFood={canEditFood}
              canAddToCart={canAddToCart}
            />
          </div>
        </div>

        <div className="relative h-[390px] w-[43%] shrink-0 overflow-hidden rounded-[1.7rem] bg-[#FDF7F2]">
          <Image
            src={food.image}
            alt={food.title}
            fill
            className="object-cover"
            priority
          />

          <div className="absolute left-5 top-5 rounded-full bg-[#D48B8B] px-6 py-2 text-xs font-bold text-white shadow-sm">
            {food.category}
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden">
        <div className="text-right">
          <h1 className="text-3xl font-extrabold text-gray-950">
            {food.title}
          </h1>

          <div className="mt-3 flex items-center justify-start gap-3">
            <span className="text-base font-bold text-gray-600">
              {food.rating}
            </span>
            <RatingStars rating={food.rating} />
          </div>

          <p className="mt-5 text-sm leading-8 text-gray-600">
            {food.description}
          </p>
        </div>

        <div className="mt-5 flex items-start gap-3">
          <div className="min-w-0 flex-1 space-y-3">
            <InfoPill
              icon={<ChefHat size={20} className="text-[#D48B8B]" />}
              value={food.chef}
            />

            <InfoPill
              icon={<MapPin size={20} className="text-orange-400" />}
              value={food.location}
            />

            <InfoPill
              icon={<PackageCheck size={20} className="text-emerald-500" />}
              value={food.remaining}
            />

            <InfoPill
              icon={<Wallet size={20} className="text-gray-400" />}
              label="قیمت"
              value={priceText}
              strong
            />
          </div>

          <div className="relative aspect-square w-[42%] shrink-0 overflow-hidden rounded-[1.5rem] bg-[#FDF7F2]">
            <Image
              src={food.image}
              alt={food.title}
              fill
              className="object-cover"
              priority
            />

            <div className="absolute left-3 top-3 rounded-full bg-[#D48B8B] px-4 py-1 text-[10px] font-bold text-white shadow-sm">
              {food.category}
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-orange-100 pt-5">
          <FoodDetailsActions
            food={food}
            canEditFood={canEditFood}
            canAddToCart={canAddToCart}
          />
        </div>
      </div>
    </section>
  );
}