import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type UserRole = "customer" | "chef";

export type CurrentUser = {
  id: number;
  name: string;
  role: UserRole;
};

type AuthStore = {
  currentUser: CurrentUser | null;
  setCurrentUser: (user: CurrentUser) => void;
  logout: () => void;
  switchRoleForTest: (role: UserRole) => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      currentUser: {
        id: 11,
        name: "دستپخت خانم ایکس",
        role: "chef",
      },

      setCurrentUser: (user) => {
        set({ currentUser: user });
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