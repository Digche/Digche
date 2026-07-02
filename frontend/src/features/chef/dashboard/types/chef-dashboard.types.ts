export type ChefDashboardStats = {
  monthlyIncome: number;
  todayOrdersCount: number;
  customerRating: number;
  activeFoodsCount: number;
};

export type ChefDashboardData = {
  chefName: string;
  chefAvatar: string;
  stats: ChefDashboardStats;
};

export type ChefDashboardDto = {
  chefName?: string;
  chefAvatar?: string;
  stats?: {
    monthlyIncome?: number;
    todayOrdersCount?: number;
    customerRating?: number;
    activeFoodsCount?: number;
  };
};