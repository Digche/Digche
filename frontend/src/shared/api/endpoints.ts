export const endpoints = {
  foods: {
    list: "/core/Dishes/available",
    nearby: "/core/Dishes/available",
    detail: (foodId: number | string) => `/core/Dishes/${foodId}`,
    comments: (foodId: number | string) => `/core/Comments/dish/${foodId}`,
  },

  chefFoods: {
    list: "/chef/foods",
    detail: (foodId: number | string) => `/chef/foods/${foodId}`,
    create: "/chef/foods",
    update: (foodId: number | string) => `/chef/foods/${foodId}`,
    delete: (foodId: number | string) => `/chef/foods/${foodId}`,
  },
};