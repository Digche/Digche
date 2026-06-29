// src/store/food-store.ts

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { foods as initialFoods } from "@/data/foods";

export type Food = {
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
  ingredients?: string;
  description: string;
};

type AddFoodPayload = {
  title: string;
  category: string;
  remaining: string;
  price: string;
  unit?: string;
  image: string;
  ingredients?: string;
  description: string;
  chef: string;
  chefId: number | string;
  location: string;
};

type UpdateFoodPayload = Partial<
  Pick<
    Food,
    | "title"
    | "category"
    | "price"
    | "remaining"
    | "location"
    | "image"
    | "description"
    | "unit"
    | "ingredients"
  >
>;

type FoodStore = {
  foods: Food[];
  getFoodById: (foodID: number | string) => Food | undefined;
  addFood: (foodData: AddFoodPayload) => void;
  updateFood: (foodID: number | string, updatedData: UpdateFoodPayload) => void;
  deleteFood: (foodID: number | string) => void;
  resetFoods: () => void;
};

export const useFoodStore = create<FoodStore>()(
  persist(
    (set, get) => ({
      foods: initialFoods as Food[],

      getFoodById: (foodID) =>
        get().foods.find((food) => String(food.id) === String(foodID)),

      addFood: (foodData) => {
        set((state) => {
          const nextId =
            state.foods.length === 0
              ? 1
              : Math.max(
                  ...state.foods.map((food) =>
                    typeof food.id === "number" ? food.id : 0
                  )
                ) + 1;

          const newFood: Food = {
            id: nextId,
            rating: 0,
            ...foodData,
          };

          return {
            foods: [newFood, ...state.foods],
          };
        });
      },

      updateFood: (foodID, updatedData) => {
        set((state) => ({
          foods: state.foods.map((food) =>
            String(food.id) === String(foodID) ? { ...food, ...updatedData } : food
          ),
        }));
      },

      deleteFood: (foodID) => {
        set((state) => ({
          foods: state.foods.filter((food) => String(food.id) !== String(foodID)),
        }));
      },

      resetFoods: () => {
        set({ foods: initialFoods as Food[] });
      },
    }),
    {
      name: "digche-foods",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
