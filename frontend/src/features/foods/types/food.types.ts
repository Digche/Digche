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
  ingredients?: string;
  description: string;
};

export type FoodDto = {
  id: number;
  title: string;
  category: string;
  rating?: number;
  remaining: string;
  chef: string;
  chefId: number;
  location: string;
  price: string;
  unit?: string;
  image: string;
  ingredients?: string;
  description: string;
};