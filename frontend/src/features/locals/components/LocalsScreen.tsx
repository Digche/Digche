"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import SearchInput from "@/shared/components/SearchInput";
import { useFoodStore } from "@/store/food-store";
import { useAuthStore } from "@/store/auth-store";
import FoodDetailsHero from "@/features/foods/components/FoodDetailsHero";
import PageHeader from "@/shared/components/SharedHeader";
import { useFoods } from "@/features/foods/hooks/use-foods";

export default function LocalsScreen() {
  
  const { data: foods = [] } = useFoods();
  const currentUser = useAuthStore((state) => state.currentUser);

  const [searchTerm, setSearchTerm] = useState("");

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

  return (
    <main dir="rtl" className="min-h-screen bg-[#FFF9F4] px-4 py-6">
      <section className="mx-auto max-w-6xl">
              <div className="mx-auto max-w-6xl">
                <PageHeader
                  title="غذاهای اطراف شما"
                />
                </div>

        <div className="mb-6 flex justify-center ">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="جست و جو در غذاها..."
            className="max-w-md"
          />
        </div>

        <div className="mb-7 overflow-hidden rounded-3xl bg-white shadow-sm">
            <div className="relative flex min-h-[190px] items-center justify-center overflow-hidden bg-[#FFFDF9] bg-[url('/images/local-header.webp')] bg-cover bg-center px-6 py-10 text-center">
              <div className="absolute inset-0 bg-white/45" />

              <div className="absolute -right-16 top-4 h-40 w-40 rounded-full bg-[#F2CDB5]/40 blur-2xl" />
              <div className="absolute -left-16 bottom-4 h-40 w-40 rounded-full bg-[#D48B8B]/20 blur-2xl" />

              <h2 className="relative z-10 text-3xl font-black text-gray-950 sm:text-4xl">
                این غذا با <span className="text-[#E8793E]">عشق</span> پخته شده!
              </h2>
            </div>
        </div>

        {filteredFoods.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <h3 className="text-xl font-bold text-gray-800">
              غذایی برای نمایش وجود ندارد
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              غذایی با این جست‌وجو پیدا نشد.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredFoods.map((food) => {
              const canAddToCart = currentUser?.role === "customer";

              const canEditFood =
                currentUser?.role === "chef" &&
                Number(food.chefId) === Number(currentUser.id);

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