// src/features/foods/components/FoodCardClient.tsx

"use client";

import { useAuthStore } from "@/store/auth-store";
import FoodCard from "./FoodCard";

interface FoodItemProps {
  id: number | string;
  title: string;
  category: string;
  rating: number;
  remaining: string;
  chef: string;
  chefId: number | string;
  location: string;
  price: string;
  unit?: string;
  image: string;
  description?: string;
}

interface FoodCardClientProps {
  item: FoodItemProps;
  variant?: "customer" | "chef";
  display?: "scroll" | "grid" | "compact";
  isClickable?: boolean;
}

export default function FoodCardClient({
  item,
  variant = "customer",
  display = "grid",
  isClickable = false,
}: FoodCardClientProps) {
  const currentUser = useAuthStore((state) => state.currentUser);

  const canAddToCart = currentUser?.role === "customer";

  const canEditFood =
    currentUser?.role === "chef" &&
    String(item.chefId) === String(currentUser.publicId ?? currentUser.id);

  return (
    <FoodCard
      item={item}
      variant={variant}
      display={display}
      isClickable={isClickable}
      canAddToCart={canAddToCart}
      canEditFood={canEditFood}
    />
  );
}
