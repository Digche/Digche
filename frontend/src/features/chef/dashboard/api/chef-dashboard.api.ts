import type { ChefDashboardDto } from "../types/chef-dashboard.types";
import { mapChefDashboardDtoToData } from "../mappers/chef-dashboard.mapper";
import { API_BASE_URL } from "@/config/api";

function getAuthToken() {
  if (typeof window === "undefined") return null;

  const possibleTokenKeys = ["token", "accessToken", "authToken"];

  for (const key of possibleTokenKeys) {
    const token = localStorage.getItem(key);

    if (token) return token;
  }

  return null;
}

export async function getChefDashboard() {
  const token = getAuthToken();

  const response = await fetch(`${API_BASE_URL}/chef/dashboard`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    },
  });

  if (!response.ok) {
    throw new Error("دریافت اطلاعات داشبورد ناموفق بود.");
  }

  const data = (await response.json()) as ChefDashboardDto;

  return mapChefDashboardDtoToData(data);
}