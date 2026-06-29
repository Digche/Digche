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

export type FoodDto = {
  id: number | string;
  title: string;
  category: string;
  rating?: number;
  remaining: number | string;
  chef: string;
  chefId: number | string;
  location: string;
  price: number | string;
  unit?: string;
  image: string;
  ingredients?: string;
  description: string;
};
