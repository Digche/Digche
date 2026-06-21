import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { foods as initialFoods } from "@/data/foods";

export type Food = {
  id: number;
  title: string;
  category: string;
  rating: number;
  remaining: string;
  chef: string;
  chefId: number;
  location: string;
  price: string;
  unit?: string;
  image: string;
  description: string;
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
  >
>;

type FoodStore = {
  foods: Food[];

  getFoodById: (foodID: number | string) => Food | undefined;

  updateFood: (foodID: number | string, updatedData: UpdateFoodPayload) => void;

  deleteFood: (foodID: number | string) => void;

  resetFoods: () => void;
};

export const useFoodStore = create<FoodStore>()(
  persist(
    (set, get) => ({
      foods: initialFoods as Food[],

      getFoodById: (foodID) => {
        return get().foods.find((food) => food.id === Number(foodID));
      },

      updateFood: (foodID, updatedData) => {
        set((state) => ({
          foods: state.foods.map((food) =>
            food.id === Number(foodID)
              ? {
                  ...food,
                  ...updatedData,
                }
              : food
          ),
        }));
      },

      resetFoods: () => {
        set({
          foods: initialFoods as Food[],
        });
      },
      
      deleteFood: (foodID) => {
        set((state) => ({
          foods: state.foods.filter((food) => food.id !== Number(foodID)),
        }));
      },
    }),
    {
      name: "digche-foods",
      storage: createJSONStorage(() => localStorage),
    }
    
  )
);