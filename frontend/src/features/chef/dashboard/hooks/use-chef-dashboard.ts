"use client";

import { useQuery } from "@tanstack/react-query";
import { getChefDashboard } from "../api/chef-dashboard.api";

export function useChefDashboard() {
  return useQuery({
    queryKey: ["chef-dashboard"],
    queryFn: getChefDashboard,
  });
}