"use client";

import FoodCard from "@/features/foods/components/FoodCard";
import { useFoodStore } from "@/store/food-store";

export default function FoodListPage() {
  const foods = useFoodStore((state) => state.foods);

  return (
    <section className="max-w-7xl mx-auto px-6 py-12" dir="rtl">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
        تمام غذاهای موجود
      </h2>

      <div className="w-[90%] mx-auto h-[1px] mt-2.5 mb-5 bg-[#D9D9D9]" />

      {foods.length === 0 ? (
        <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
          <h3 className="text-xl font-bold text-gray-800">
            غذایی برای نمایش وجود ندارد
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            هنوز غذایی ثبت نشده یا همه غذاها حذف شده‌اند.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {foods.map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}