import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ProvinceCityValue } from "@/shared/location/types/location.types";

type LocationStoreState = {
  selectedLocation: ProvinceCityValue;
  setSelectedLocation: (location: ProvinceCityValue) => void;
  clearSelectedLocation: () => void;
};

const emptyLocation: ProvinceCityValue = {
  province: "",
  city: "",
};

export const useLocationStore = create<LocationStoreState>()(
  persist(
    (set) => ({
      selectedLocation: emptyLocation,

      setSelectedLocation: (location) => {
        set({
          selectedLocation: location,
        });
      },

      clearSelectedLocation: () => {
        set({
          selectedLocation: emptyLocation,
        });
      },
    }),
    {
      name: "digche-selected-location",
      storage: createJSONStorage(() => localStorage),
    }
  )
);