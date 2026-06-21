// src/data/comments.js

export const comments = [
  {
    id: 1,
    foodId: 1,
    userName: "علی رضایی",
    rating: 5,
    text: "خیلی خوش‌طعم بود، دقیقاً مزه غذای خونگی داشت.",
    createdAt: "۲ روز پیش",
  },
  {
    id: 2,
    foodId: 1,
    userName: "سارا محمدی",
    rating: 4,
    text: "کیفیت غذا خوب بود و بسته‌بندی هم تمیز بود.",
    createdAt: "۵ روز پیش",
  },
  {
    id: 3,
    foodId: 2,
    userName: "رضا احمدی",
    rating: 5,
    text: "مرغش خیلی خوب پخته شده بود.",
    createdAt: "۱ روز پیش",
  },
];

export function getCommentsByFoodId(foodID) {
  return comments.filter((comment) => comment.foodId === Number(foodID));
}