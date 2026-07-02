"use client";

import { useAuthStore } from "@/store/auth-store";
import FoodDetailsHero from "./FoodDetailsHero";
import FoodComments from "./FoodComments";
import { useFoodDetail } from "../hooks/use-food-detail";
import { useFoodComments } from "../hooks/use-food-comments";

type FoodDetailsClientProps = {
  foodID: string;
};

export default function FoodDetailsClient({ foodID }: FoodDetailsClientProps) {
  const currentUser = useAuthStore((state) => state.currentUser);

  const {
    data: food,
    isLoading: isFoodLoading,
    isError: isFoodError,
  } = useFoodDetail(foodID);

  const {
    data: comments = [],
    isLoading: isCommentsLoading,
    isError: isCommentsError,
  } = useFoodComments(foodID);

  if (isFoodLoading) {
    return (
      <div className="rounded-3xl border border-orange-100 bg-white p-10 text-center shadow-sm">
        <h2 className="text-xl font-bold text-gray-800">
          در حال دریافت اطلاعات غذا...
        </h2>
      </div>
    );
  }

  if (isFoodError || !food) {
    return (
      <div className="rounded-3xl border border-orange-100 bg-white p-10 text-center shadow-sm">
        <h2 className="text-xl font-bold text-gray-800">غذا پیدا نشد</h2>

        <p className="mt-2 text-sm text-gray-500">
          غذای مورد نظر وجود ندارد یا حذف شده است.
        </p>
      </div>
    );
  }

  const canAddToCart = currentUser?.role === "customer";

  const canEditFood =
    currentUser?.role === "chef" &&
    String(food.chefId) === String(currentUser.publicId ?? currentUser.id);

  return (
    <>
      <FoodDetailsHero
        food={food}
        canAddToCart={canAddToCart}
        canEditFood={canEditFood}
      />

      {isCommentsLoading ? (
        <section dir="rtl" className="space-y-4">
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              در حال دریافت نظر کاربران...
            </h2>
          </div>
        </section>
      ) : isCommentsError ? (
        <section dir="rtl" className="space-y-4">
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">نظر کاربران</h2>

            <p className="mt-2 text-sm text-red-500">
              دریافت نظر کاربران ناموفق بود.
            </p>
          </div>
        </section>
      ) : (

        <FoodComments
          foodId={foodID}
          comments={comments}
          canComment={currentUser?.role === "customer"}
        />
      )}
    </>
  );
}
