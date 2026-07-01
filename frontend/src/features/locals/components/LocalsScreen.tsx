"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useLocationStore } from "@/store/location-store";
import SearchInput from "@/shared/components/SearchInput";
import PageHeader from "@/shared/components/SharedHeader";
import ProvinceCityDropdown, {
  type ProvinceCityValue,
} from "@/shared/location/ProvinceCityDropdown";
import FoodDetailsHero from "@/features/foods/components/FoodDetailsHero";
import { useFoods } from "@/features/foods/hooks/use-foods";
import { getProvinceCityFromAddress } from "@/shared/location/location-text";

function toSearchableText(value?: unknown) {
  if (Array.isArray(value)) {
    return value.join(" ").toLowerCase();
  }

  return String(value ?? "").toLowerCase();
}

function isFoodInSelectedLocation(
  foodLocation?: string | null,
  selectedLocation?: ProvinceCityValue
) {
  if (!selectedLocation?.province || !selectedLocation?.city) {
    return true;
  }

  const normalizedFoodLocation = toSearchableText(foodLocation);

  const normalizedProvince = selectedLocation.province.toLowerCase();
  const normalizedCity = selectedLocation.city.toLowerCase();

  return (
    normalizedFoodLocation.includes(normalizedProvince) ||
    normalizedFoodLocation.includes(normalizedCity)
  );
}

export default function LocalsScreen() {
  const currentUser = useAuthStore((state) => state.currentUser);

  const selectedLocation = useLocationStore((state) => state.selectedLocation);
  const setSelectedLocation = useLocationStore(
    (state) => state.setSelectedLocation
  );

  const [searchTerm, setSearchTerm] = useState("");

  const { data: foods = [], isLoading, isError } = useFoods();

  useEffect(() => {
    const userAddress = currentUser?.address ?? currentUser?.location;

    if (!userAddress) return;

    const locationFromUser = getProvinceCityFromAddress(userAddress);

    if (!locationFromUser.province || !locationFromUser.city) return;

    setSelectedLocation(locationFromUser);
  }, [currentUser?.address, currentUser?.location, setSelectedLocation]);

  const handleLocationChange = (value: ProvinceCityValue) => {
    setSelectedLocation(value);
  };

  const filteredFoods = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const locationFilteredFoods = foods.filter((food) =>
      isFoodInSelectedLocation(food.location, selectedLocation)
    );

    if (!normalizedSearch) return locationFilteredFoods;

    return locationFilteredFoods.filter((food) => {
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
  }, [foods, searchTerm, selectedLocation]);

  return (
    <main dir="rtl" className="min-h-screen bg-[#FFF9F4] px-4 py-6">
      <section className="mx-auto max-w-6xl">
        <PageHeader
          title="غذاهای محلی"
          description="غذاهای خانگی و محلی اطراف شما"
        />

        <div className="mb-6 flex flex-col items-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <ProvinceCityDropdown
              value={selectedLocation}
              onChange={handleLocationChange}
              placeholder="انتخاب شهر برای نمایش غذاها"
              className="max-w-xs"
            />

            <p className="text-xs text-gray-500">
              این انتخاب فقط برای فیلتر غذاهاست و آدرس تحویل را تغییر نمی‌دهد.
            </p>
          </div>

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
              {selectedLocation.province && selectedLocation.city
                ? "در موقعیت انتخاب‌شده غذایی پیدا نشد یا نتیجه‌ای مطابق جست‌وجوی شما وجود ندارد."
                : "نتیجه‌ای مطابق جست‌وجوی شما پیدا نشد."}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredFoods.map((food) => {
              const canAddToCart = currentUser?.role === "customer";

              const canEditFood =
                currentUser?.role === "chef" &&
                String(food.chefId) ===
                  String(currentUser.publicId ?? currentUser.id);

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