export type FoodComment = {
  id: number;
  foodId: number;
  userName: string;
  userAvatar?: string;
  text: string;
  rating?: number;
  createdAt?: string;
};

export type FoodCommentDto = {
  id: number;
  foodId: number;
  userName: string;
  userAvatar?: string;
  text: string;
  rating?: number;
  createdAt?: string;
};