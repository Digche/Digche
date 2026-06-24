// src/store/auth-store.ts

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type UserRole = "customer" | "chef";

export type CurrentUser = {
  id: number;
  name: string;
  role: UserRole;
  lastName?: string;
  username?: string;
  phone?: string;
  location?: string;
  bio?: string;
  avatar?: string;
  chefDisplayName?: string;
};

type UserProfileUpdate = Partial<Omit<CurrentUser, "id" | "role">>;

type AuthStore = {
  currentUser: CurrentUser | null;
  setCurrentUser: (user: CurrentUser) => void;
  updateCurrentUser: (updatedData: UserProfileUpdate) => void;
  logout: () => void;
  switchRoleForTest: (role: UserRole) => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      currentUser: {
        id: 11,
        name: "دیبا",
        lastName: "یانوق ",
        username: "x-chef",
        phone: "09123456789",
        location: "بابل",
        bio: "عاشق آشپزی سنتی با مواد تازه و سالم",
        avatar: "/images/chef.webp",
        chefDisplayName: "دستپخت دیبا ",
        role: "chef",
      },

      setCurrentUser: (user) => {
        set({ currentUser: user });
      },

      updateCurrentUser: (updatedData) => {
        const currentUser = get().currentUser;

        if (!currentUser) return;

        set({
          currentUser: {
            ...currentUser,
            ...updatedData,
          },
        });
      },

      logout: () => {
        set({ currentUser: null });
      },

      switchRoleForTest: (role) => {
        const currentUser = get().currentUser;

        if (!currentUser) return;

        set({
          currentUser: {
            ...currentUser,
            role,
          },
        });
      },
    }),
    {
      name: "digche-auth",
      storage: createJSONStorage(() => localStorage),
    }
  )
);