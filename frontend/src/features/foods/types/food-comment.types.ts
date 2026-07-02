export type FoodComment = {
  id: number | string;
  foodId: number | string;
  userName: string;
  username?: string | null;
  userAvatar?: string | null;
  text: string;
  rating?: number;
  createdAt?: string;
};

export type FoodCommentDto = {
  id: number | string;

  foodId?: number | string;
  dishId?: number | string;

  userId?: number | string;

  userName?: string | null;
  username?: string | null;

  firstName?: string | null;
  lastName?: string | null;

  userAvatar?: string | null;
  photoUrl?: string | null;
  userPhotoUrl?: string | null;

  user?: {
    username?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    photoUrl?: string | null;
  } | null;

  text: string;
  rating?: number;
  createdAt?: string;
};

export type CreateFoodCommentPayload = {
  dishId: number | string;
  text: string;
  rating: number;
};