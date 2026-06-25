import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  logoutPublicSession,
  toFrontendAuthRole,
  type PublicAuthSuccessResponse,
  type PublicUser,
} from "@/features/auth/services/auth-api";

export type UserRole = "customer" | "chef";

export type CurrentUser = {
  id: number;
  publicId?: string;
  phone?: string;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  name: string;
  role: UserRole;
  roles?: UserRole[];
  photoUrl?: string | null;
  address?: string | null;
  chef?: PublicUser["chef"];
};

type AuthStore = {
  currentUser: CurrentUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  setCurrentUser: (user: CurrentUser) => void;
  setSession: (session: PublicAuthSuccessResponse) => void;
  logout: () => Promise<void>;
  switchRoleForTest: (role: UserRole) => void;
};

function buildDisplayName(user: PublicUser) {
  const fullName = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || user.username || user.phone || "کاربر دیگچه";
}

function createStableNumericId(value: string) {
  const numericValue = Number(value);

  if (Number.isSafeInteger(numericValue) && numericValue > 0) {
    return numericValue;
  }

  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash || 1;
}

function toCurrentUser(user: PublicUser): CurrentUser {
  return {
    id: createStableNumericId(user.id),
    publicId: user.id,
    phone: user.phone,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    name: buildDisplayName(user),
    role: toFrontendAuthRole(user.selectedRole),
    roles: user.roles.map(toFrontendAuthRole),
    photoUrl: user.photoUrl ?? null,
    address: user.address ?? null,
    chef: user.chef ?? null,
  };
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      currentUser: null,
      accessToken: null,
      refreshToken: null,

      setCurrentUser: (user) => {
        set({ currentUser: user });
      },

      setSession: (session) => {
        set({
          currentUser: toCurrentUser(session.user),
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
        });
      },

      logout: async () => {
        const refreshToken = get().refreshToken;

        set({
          currentUser: null,
          accessToken: null,
          refreshToken: null,
        });

        if (!refreshToken) {
          return;
        }

        try {
          await logoutPublicSession(refreshToken);
        } catch {
          // خروج سمت فرانت انجام شده؛ خطای logout سمت بک را نادیده می‌گیریم.
        }
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
      partialize: (state) => ({
        currentUser: state.currentUser,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);