"use client";

import { iranLocations } from "../data/iran-locations";

export function useIranLocations() {
  return {
    data: iranLocations,
    isLoading: false,
    isError: false,
  };
}