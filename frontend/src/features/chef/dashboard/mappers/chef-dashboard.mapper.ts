import type {
  ChefDashboardData,
  ChefDashboardDto,
} from "../types/chef-dashboard.types";

const defaultChefAvatar = "/images/chef.webp";

export function mapChefDashboardDtoToData(
  dto: ChefDashboardDto
): ChefDashboardData {
  return {
    chefName: dto.chefName?.trim() || "آشپز دیگچه",
    chefAvatar: dto.chefAvatar?.trim() || defaultChefAvatar,
    stats: {
      monthlyIncome: dto.stats?.monthlyIncome ?? 0,
      todayOrdersCount: dto.stats?.todayOrdersCount ?? 0,
      customerRating: dto.stats?.customerRating ?? 0,
      activeFoodsCount: dto.stats?.activeFoodsCount ?? 0,
    },
  };
}