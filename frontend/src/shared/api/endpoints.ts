export const endpoints = {
  foods: {
    list: "/foods",
    nearby: "/foods/nearby",
    detail: (foodId: number | string) => `/foods/${foodId}`,
    comments: (foodId: number | string) => `/foods/${foodId}/comments`,
  },

  chefFoods: {
    list: "/chef/foods",
    detail: (foodId: number | string) => `/chef/foods/${foodId}`,
    create: "/chef/foods",
    update: (foodId: number | string) => `/chef/foods/${foodId}`,
    delete: (foodId: number | string) => `/chef/foods/${foodId}`,
  },
};