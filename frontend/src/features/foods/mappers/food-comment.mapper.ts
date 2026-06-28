import type {
  FoodComment,
  FoodCommentDto,
} from "../types/food-comment.types";

export function mapFoodCommentDtoToFoodComment(
  dto: FoodCommentDto
): FoodComment {
  return {
    id: dto.id,
    foodId: dto.foodId,
    userName: dto.userName,
    userAvatar: dto.userAvatar,
    text: dto.text,
    rating: dto.rating ?? 0,
    createdAt: dto.createdAt ?? "",
  };
}

export function mapFoodCommentDtosToFoodComments(
  dtos: FoodCommentDto[]
): FoodComment[] {
  return dtos.map(mapFoodCommentDtoToFoodComment);
}