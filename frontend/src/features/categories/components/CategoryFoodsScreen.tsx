"use client";

import { useMemo, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import SearchInput from "@/shared/components/SearchInput";
import PageHeader from "@/shared/components/SharedHeader";
import FoodDetailsHero from "@/features/foods/components/FoodDetailsHero";
import { useFoodsByCategory } from "@/features/foods/hooks/use-foods-by-category";
import { getFoodCategoryBySlug } from "../utils/category-slug";

type CategoryFoodsScreenProps = {
  categorySlug: string;
};

export default function CategoryFoodsScreen({
  categorySlug,
}: CategoryFoodsScreenProps) {
  const currentUser = useAuthStore((state) => state.currentUser);
  const [searchTerm, setSearchTerm] = useState("");

  const category = getFoodCategoryBySlug(categorySlug);

  const {
    data: foods = [],
    isLoading,
    isError,
  } = useFoodsByCategory(category?.title);

  const filteredFoods = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) return foods;

    return foods.filter((food) => {
      const ingredientsText = food.ingredients ?? "";

      return (
        food.title.toLowerCase().includes(normalizedSearch) ||
        food.category.toLowerCase().includes(normalizedSearch) ||
        food.chef.toLowerCase().includes(normalizedSearch) ||
        food.location.toLowerCase().includes(normalizedSearch) ||
        food.description.toLowerCase().includes(normalizedSearch) ||
        ingredientsText.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [foods, searchTerm]);

  if (!category) {
    return (
      <main dir="rtl" className="min-h-screen bg-[#FFF9F4] px-4 py-6">
        <section className="mx-auto max-w-6xl">
          <PageHeader title="دسته‌بندی پیدا نشد" />

          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-bold text-gray-800">
              این دسته‌بندی وجود ندارد
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              لطفاً از صفحه اصلی یک دسته‌بندی معتبر انتخاب کنید.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[#FFF9F4] px-4 py-6">
      <section className="mx-auto max-w-6xl">
        <PageHeader
          title={category.title}
          description={`غذاهای مربوط به دسته‌بندی ${category.title}`}
        />

        <div className="mb-6 flex justify-center">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={`جست‌وجو در ${category.title}...`}
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
              فعلاً غذایی در دسته‌بندی {category.title} پیدا نشد.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredFoods.map((food) => {
              const canAddToCart = currentUser?.role === "customer";

              const canEditFood =
                currentUser?.role === "chef" &&
                String(food.chefId) === String(currentUser.id);

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