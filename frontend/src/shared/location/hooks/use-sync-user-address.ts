"use client";

import { useCallback, useState } from "react";
import { updatePublicAddress } from "@/features/auth/services/auth-api";
import { useAuthStore } from "@/store/auth-store";
import { useLocationStore } from "@/store/location-store";
import { getProvinceCityFromAddress } from "../location-text";

export function useSyncUserAddress() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const accessToken = useAuthStore((state) => state.accessToken);
  const setSession = useAuthStore((state) => state.setSession);
  const updateCurrentUser = useAuthStore((state) => state.updateCurrentUser);

  const setSelectedLocation = useLocationStore(
    (state) => state.setSelectedLocation
  );

  const [isUpdatingAddress, setIsUpdatingAddress] = useState(false);

  const syncUserAddress = useCallback(
    async (addressText: string) => {
      const nextAddress = addressText.trim();

      if (!nextAddress) return null;

      const provinceCity = getProvinceCityFromAddress(nextAddress);

      if (provinceCity.province && provinceCity.city) {
        setSelectedLocation(provinceCity);
      }

      const currentAddress = (
        currentUser?.address ??
        currentUser?.location ??
        ""
      ).trim();

      if (nextAddress === currentAddress) {
        return null;
      }

      if (currentUser) {
        updateCurrentUser({
          address: nextAddress,
          location: nextAddress,
        });
      }

      if (!currentUser || !accessToken) {
        return null;
      }

      setIsUpdatingAddress(true);

      try {
        const session = await updatePublicAddress({
          accessToken,
          address: nextAddress,
        });

        setSession(session);

        return session;
      } finally {
        setIsUpdatingAddress(false);
      }
    },
    [
      accessToken,
      currentUser,
      setSelectedLocation,
      setSession,
      updateCurrentUser,
    ]
  );

  return {
    syncUserAddress,
    isUpdatingAddress,
  };
}