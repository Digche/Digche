import type {
  FoodComment,
  FoodCommentDto,
} from "../types/food-comment.types";

function getDisplayUserName(dto: FoodCommentDto) {
  const username =
    dto.username?.trim() ||
    dto.userName?.trim() ||
    dto.user?.username?.trim();

  if (username) {
    return username;
  }

  const fullName = [
    dto.firstName?.trim() || dto.user?.firstName?.trim(),
    dto.lastName?.trim() || dto.user?.lastName?.trim(),
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || "کاربر دیگچه";
}

function getUserAvatar(dto: FoodCommentDto) {
  return (
    dto.userAvatar ??
    dto.userPhotoUrl ??
    dto.photoUrl ??
    dto.user?.photoUrl ??
    null
  );
}

export function mapFoodCommentDtoToFoodComment(
  dto: FoodCommentDto
): FoodComment {
  const userName = getDisplayUserName(dto);

  return {
    id: dto.id,
    foodId: dto.foodId ?? dto.dishId ?? "",
    userName,
    username: dto.username ?? dto.user?.username ?? userName,
    userAvatar: getUserAvatar(dto),
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