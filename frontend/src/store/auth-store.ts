"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  AuthApiError,
  getCurrentPublicUser,
  logoutPublicSession,
  refreshPublicSession,
  toFrontendAuthRole,
  type PublicSessionResponse,
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

  location?: string | null;
  bio?: string | null;
  avatar?: string | null;
  chefDisplayName?: string | null;
};

export type AuthStatus = "idle" | "checking" | "authenticated" | "guest";

type UserProfileUpdate = Partial<Omit<CurrentUser, "id" | "role">>;

type AuthStore = {
  currentUser: CurrentUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  authStatus: AuthStatus;
  authError: string | null;

  setCurrentUser: (user: CurrentUser) => void;
  updateCurrentUser: (updatedData: UserProfileUpdate) => void;
  setSession: (session: PublicSessionResponse) => void;
  clearSession: () => void;
  fetchCurrentUser: () => Promise<CurrentUser | null>;
  refreshSession: () => Promise<PublicSessionResponse | null>;
  ensureSession: () => Promise<CurrentUser | null>;
  logout: () => Promise<void>;
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
  const role = toFrontendAuthRole(user.selectedRole);
  const displayName = buildDisplayName(user);

  return {
    id: createStableNumericId(user.id),
    publicId: user.id,
    phone: user.phone,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    name: displayName,
    role,
    roles: user.roles.map(toFrontendAuthRole),
    photoUrl: user.photoUrl ?? null,
    address: user.address ?? null,
    chef: user.chef ?? null,

    avatar: user.photoUrl ?? null,
    location: user.address ?? null,
    chefDisplayName: role === "chef" ? displayName : null,
  };
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      currentUser: null,
      accessToken: null,
      refreshToken: null,
      authStatus: "idle",
      authError: null,

      setCurrentUser: (user) => {
        set({
          currentUser: user,
          authStatus: "authenticated",
          authError: null,
        });
      },

      updateCurrentUser: (updatedData) => {
        const currentUser = get().currentUser;

        if (!currentUser) {
          return;
        }

        set({
          currentUser: {
            ...currentUser,
            ...updatedData,
          },
        });
      },

      setSession: (session) => {
        set({
          currentUser: toCurrentUser(session.user),
          accessToken: session.accessToken,
          refreshToken: session.refreshToken ?? get().refreshToken,
          authStatus: "authenticated",
          authError: null,
        });
      },

      clearSession: () => {
        set({
          currentUser: null,
          accessToken: null,
          refreshToken: null,
          authStatus: "guest",
          authError: null,
        });
      },

      fetchCurrentUser: async () => {
        const accessToken = get().accessToken;

        if (!accessToken) {
          const session = await get().refreshSession();
          return session ? toCurrentUser(session.user) : null;
        }

        try {
          set({ authStatus: "checking", authError: null });

          const response = await getCurrentPublicUser(accessToken);
          const currentUser = toCurrentUser(response.user);

          set({
            currentUser,
            authStatus: "authenticated",
            authError: null,
          });

          return currentUser;
        } catch (error) {
          if (error instanceof AuthApiError && error.status === 401) {
            const refreshedSession = await get().refreshSession();

            return refreshedSession
              ? toCurrentUser(refreshedSession.user)
              : null;
          }

          set({
            authStatus: get().currentUser ? "authenticated" : "guest",
            authError:
              error instanceof Error
                ? error.message
                : "خطای بررسی نشست کاربری",
          });

          return get().currentUser;
        }
      },

      refreshSession: async () => {
        const refreshToken = get().refreshToken;

        if (!refreshToken) {
          get().clearSession();
          return null;
        }

        try {
          set({ authStatus: "checking", authError: null });

          const session = await refreshPublicSession(refreshToken);

          set({
            currentUser: toCurrentUser(session.user),
            accessToken: session.accessToken,
            refreshToken: session.refreshToken,
            authStatus: "authenticated",
            authError: null,
          });

          return session;
        } catch (error) {
          set({
            currentUser: null,
            accessToken: null,
            refreshToken: null,
            authStatus: "guest",
            authError:
              error instanceof Error
                ? error.message
                : "نشست کاربری منقضی شده است.",
          });

          return null;
        }
      },

      ensureSession: async () => {
        const { accessToken, refreshToken } = get();

        if (!accessToken && !refreshToken) {
          get().clearSession();
          return null;
        }

        if (!accessToken) {
          const refreshedSession = await get().refreshSession();
          return refreshedSession ? toCurrentUser(refreshedSession.user) : null;
        }

        if (isJwtExpiredOrClose(accessToken, 30)) {
          const refreshedSession = await get().refreshSession();
          return refreshedSession ? toCurrentUser(refreshedSession.user) : null;
        }

        return get().fetchCurrentUser();
      },

      logout: async () => {
        const refreshToken = get().refreshToken;

        get().clearSession();

        if (!refreshToken) {
          return;
        }

        try {
          await logoutPublicSession(refreshToken);
        } catch {
          // خروج سمت فرانت انجام شده؛ خطای logout سمت بک را نادیده می‌گیریم.
        }
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

function decodeJwtPayload(token: string): { exp?: number } | null {
  try {
    const payloadPart = token.split(".")[1];

    if (!payloadPart) {
      return null;
    }

    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );

    return JSON.parse(atob(paddedBase64)) as { exp?: number };
  } catch {
    return null;
  }
}

export function isJwtExpiredOrClose(token: string, thresholdSeconds = 60) {
  const payload = decodeJwtPayload(token);

  if (!payload?.exp) {
    return true;
  }

  const expiresAtMs = payload.exp * 1000;
  const thresholdMs = thresholdSeconds * 1000;

  return Date.now() >= expiresAtMs - thresholdMs;
}

export function getAccessTokenRefreshDelay(token: string) {
  const payload = decodeJwtPayload(token);

  if (!payload?.exp) {
    return 0;
  }

  const refreshAtMs = payload.exp * 1000 - 60_000;

  return Math.max(refreshAtMs - Date.now(), 0);
}