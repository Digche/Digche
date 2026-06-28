"use client";

import { useFoodStore } from "@/store/food-store";
import { useAuthStore } from "@/store/auth-store";
import { getCommentsByFoodId } from "@/data/comments";
import FoodDetailsHero from "./FoodDetailsHero";
import FoodComments from "./FoodComments";
import { useFoodDetail } from "../hooks/use-food-detail";
import { useFoodComments } from "../hooks/use-food-comments";

type FoodDetailsClientProps = {
  foodID: string;
};

export default function FoodDetailsClient({ foodID }: FoodDetailsClientProps) {
  const currentUser = useAuthStore((state) => state.currentUser);

  const { data: food } = useFoodDetail(foodID);
  const { data: comments = [] } = useFoodComments(foodID);

  if (!food) {
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
    currentUser?.role === "chef" && food.chefId === currentUser.id;

  return (
    <>
      <FoodDetailsHero
        food={food}
        canAddToCart={canAddToCart}
        canEditFood={canEditFood}
      />

      {/* <FoodComments comments={comments} /> */}
    </>
  );
}