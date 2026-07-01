export type FoodComment = {
  id: number | string;
  foodId: number | string;
  userName: string;
  userAvatar?: string;
  text: string;
  rating?: number;
  createdAt?: string;
};

export type FoodCommentDto = {
  id: number | string;
  foodId?: number | string;
  userId?: number | string;
  userName?: string;
  userAvatar?: string;
  text: string;
  rating?: number;
  createdAt?: string;
};

export type CreateFoodCommentPayload = {
  dishId: number | string;
  text: string;
  rating: number;
};