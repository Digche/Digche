"use client";

import { ChevronLeft } from "lucide-react";
import FoodCard from "@/features/foods/components/FoodCard";
import Link from "next/link";
import { useFoodStore } from "@/store/food-store";

const FoodScroll = () => {
  const foods = useFoodStore((state) => state.foods);

  return (
    <section className="max-w-7xl mx-auto px-6 py-12 rtl" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">اطراف شما</h2>

        <Link
          href="/locals"
          className="flex items-center text-orange-600 font-medium hover:underline cursor-pointer"
        >
          غذاهای بیشتر
          <ChevronLeft size={18} className="mr-1" />
        </Link>
      </div>

      <div className="flex overflow-x-auto gap-6 pb-6 scrollbar-hide snap-x snap-mandatory">
        {foods.map((item) => (
          <FoodCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
};

export default FoodScroll;