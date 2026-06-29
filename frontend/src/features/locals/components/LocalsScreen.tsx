"use client";

import { useMemo, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import SearchInput from "@/shared/components/SearchInput";
import PageHeader from "@/shared/components/SharedHeader";
import FoodDetailsHero from "@/features/foods/components/FoodDetailsHero";
import { useFoods } from "@/features/foods/hooks/use-foods";

function toSearchableText(value?: string | number | null) {
  return String(value ?? "").toLowerCase();
}

export default function LocalsScreen() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: foods = [], isLoading, isError } = useFoods();

  const filteredFoods = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) return foods;

    return foods.filter((food) => {
      const ingredientsText = food.ingredients ?? "";

      return (
        toSearchableText(food.title).includes(normalizedSearch) ||
        toSearchableText(food.category).includes(normalizedSearch) ||
        toSearchableText(food.chef).includes(normalizedSearch) ||
        toSearchableText(food.location).includes(normalizedSearch) ||
        toSearchableText(food.description).includes(normalizedSearch) ||
        toSearchableText(ingredientsText).includes(normalizedSearch)
      );
    });
  }, [foods, searchTerm]);

  return (
    <main dir="rtl" className="min-h-screen bg-[#FFF9F4] px-4 py-6">
      <section className="mx-auto max-w-6xl">
        <PageHeader
          title="غذاهای محلی"
          description="غذاهای خانگی و محلی اطراف شما"
        />

        <div className="mb-6 flex justify-center">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="جست‌وجوی غذا، آشپز، محله یا مواد اولیه..."
            className="max-w-md"
          />
        </div>

        {isLoading ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <h3 className="text-xl font-bold text-gray-800">
              در حال دریافت غذاها...
            </h3>
          </div>
        ) : isError ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <h3 className="text-xl font-bold text-gray-800">
              خطا در دریافت غذاها
            </h3>

            <p className="mt-2 text-sm text-red-500">
              لطفاً دوباره تلاش کنید.
            </p>
          </div>
        ) : filteredFoods.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <h3 className="text-xl font-bold text-gray-800">
              غذایی برای نمایش وجود ندارد
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              نتیجه‌ای مطابق جست‌وجوی شما پیدا نشد.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredFoods.map((food) => {
              const canAddToCart = currentUser?.role === "customer";

              const canEditFood =
                currentUser?.role === "chef" &&
                String(food.chefId) === String(currentUser.publicId ?? currentUser.id);

              return (
                <FoodDetailsHero
                  key={food.id}
                  food={food}
                  canAddToCart={canAddToCart}
                  canEditFood={canEditFood}
                  isClickable
                />
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
