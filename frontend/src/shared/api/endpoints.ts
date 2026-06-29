export const endpoints = {
  foods: {
    list: "/core/Dishes/available",
    nearby: "/core/Dishes/available",
    detail: (foodId: number | string) => `/core/Dishes/${foodId}`,
    comments: (foodId: number | string) => `/core/Comments/dish/${foodId}`,
  },

  chefFoods: {
    list: (chefId: number | string) => `/core/Dishes/chef/${chefId}`,
    detail: (foodId: number | string) => `/core/Dishes/${foodId}`,
    create: "/core/Dishes",
    update: (foodId: number | string) => `/core/Dishes/${foodId}`,
    delete: (foodId: number | string) => `/core/Dishes/${foodId}`,
  },
};
