"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  getCurrentAdmin,
  logoutAdminSession,
  refreshAdminSession,
} from "../services/admin-auth-api";
import type {
  AdminApiUser,
  AdminAuthStatus,
  AdminProfileUpdateResponse,
  AdminSessionResponse,
  CurrentAdmin,
} from "../types/admin-auth.types";

type AdminAuthStore = {
  currentAdmin: CurrentAdmin | null;
  accessToken: string | null;
  refreshToken: string | null;
  authStatus: AdminAuthStatus;
  authError: string | null;
  hasHydrated: boolean;
  lastSessionCheckAt: number | null;

  setHasHydrated: (value: boolean) => void;
  setSession: (session: AdminSessionResponse) => void;
  applyProfileUpdate: (profileUpdate: AdminProfileUpdateResponse) => void;
  clearSession: () => void;
  fetchCurrentAdmin: () => Promise<CurrentAdmin | null>;
  refreshSession: () => Promise<AdminSessionResponse | null>;
  ensureFreshAccessToken: () => Promise<string | null>;
  ensureSession: () => Promise<CurrentAdmin | null>;
  logout: () => Promise<void>;
};

const noopStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

let refreshSessionPromise: Promise<AdminSessionResponse | null> | null = null;

function buildAdminName(admin: AdminApiUser) {
  const fullName = [admin.firstName, admin.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || admin.username || admin.phone || "ادمین دیگچه";
}

function toCurrentAdmin(admin: AdminApiUser): CurrentAdmin {
  return {
    id: admin.id,
    phone: admin.phone,
    firstName: admin.firstName,
    lastName: admin.lastName,
    username: admin.username,
    role: admin.role,
    photoUrl: admin.photoUrl ?? null,
    isManager: admin.isManager,
    name: buildAdminName(admin),
  };
}

export const useAdminAuthStore = create<AdminAuthStore>()(
  persist(
    (set, get) => ({
      currentAdmin: null,
      accessToken: null,
      refreshToken: null,
      authStatus: "idle",
      authError: null,
      hasHydrated: false,
      lastSessionCheckAt: null,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      setSession: (session) => {
        set({
          currentAdmin: toCurrentAdmin(session.admin),
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          authStatus: "authenticated",
          authError: null,
          lastSessionCheckAt: Date.now(),
        });
      },

      applyProfileUpdate: (profileUpdate) => {
        set({
          currentAdmin: toCurrentAdmin(profileUpdate.admin),
          accessToken: profileUpdate.accessToken,
          authStatus: "authenticated",
          authError: null,
          lastSessionCheckAt: Date.now(),
        });
      },

      clearSession: () => {
        set({
          currentAdmin: null,
          accessToken: null,
          refreshToken: null,
          authStatus: "guest",
          authError: null,
          lastSessionCheckAt: null,
        });
      },

      fetchCurrentAdmin: async () => {
        const accessToken = get().accessToken;

        if (!accessToken) {
          const refreshedSession = await get().refreshSession();
          return refreshedSession ? toCurrentAdmin(refreshedSession.admin) : null;
        }

        try {
          set({ authStatus: "checking", authError: null });

          const response = await getCurrentAdmin(accessToken);
          const currentAdmin = toCurrentAdmin(response.admin);

          set({
            currentAdmin,
            authStatus: "authenticated",
            authError: null,
            lastSessionCheckAt: Date.now(),
          });

          return currentAdmin;
        } catch {
          const refreshedSession = await get().refreshSession();

          if (refreshedSession) {
            return toCurrentAdmin(refreshedSession.admin);
          }

          get().clearSession();
          return null;
        }
      },

      refreshSession: async () => {
        if (refreshSessionPromise) {
          return refreshSessionPromise;
        }

        refreshSessionPromise = (async () => {
          const refreshToken = get().refreshToken;

          if (!refreshToken) {
            get().clearSession();
            return null;
          }

          try {
            set({ authStatus: "checking", authError: null });

            const session = await refreshAdminSession(refreshToken);

            set({
              currentAdmin: toCurrentAdmin(session.admin),
              accessToken: session.accessToken,
              refreshToken: session.refreshToken,
              authStatus: "authenticated",
              authError: null,
              lastSessionCheckAt: Date.now(),
            });

            return session;
          } catch (error) {
            set({
              currentAdmin: null,
              accessToken: null,
              refreshToken: null,
              authStatus: "guest",
              authError:
                error instanceof Error
                  ? error.message
                  : "نشست ادمین منقضی شده است.",
              lastSessionCheckAt: null,
            });

            return null;
          } finally {
            refreshSessionPromise = null;
          }
        })();

        return refreshSessionPromise;
      },

      ensureFreshAccessToken: async () => {
        const accessToken = get().accessToken;

        if (accessToken && !isJwtExpiredOrClose(accessToken, 45)) {
          return accessToken;
        }

        const refreshedSession = await get().refreshSession();
        return refreshedSession?.accessToken ?? null;
      },

      ensureSession: async () => {
        const { accessToken, refreshToken } = get();

        if (!accessToken && !refreshToken) {
          get().clearSession();
          return null;
        }

        if (!accessToken || isJwtExpiredOrClose(accessToken, 45)) {
          const refreshedSession = await get().refreshSession();
          return refreshedSession ? toCurrentAdmin(refreshedSession.admin) : null;
        }

        return get().fetchCurrentAdmin();
      },

      logout: async () => {
        const refreshToken = get().refreshToken;

        get().clearSession();

        if (!refreshToken) {
          return;
        }

        try {
          await logoutAdminSession(refreshToken);
        } catch {
          // خروج سمت فرانت قطعی است.
        }
      },
    }),
    {
      name: "digche-admin-auth",
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? noopStorage : window.localStorage
      ),
      partialize: (state) => ({
        currentAdmin: state.currentAdmin,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        lastSessionCheckAt: state.lastSessionCheckAt,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

function decodeJwtPayload(token: string): { exp?: number } | null {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return null;

    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );

    return JSON.parse(globalThis.atob(paddedBase64)) as { exp?: number };
  } catch {
    return null;
  }
}

function isJwtExpiredOrClose(token: string, thresholdSeconds = 60) {
  const payload = decodeJwtPayload(token);

  if (!payload?.exp) {
    return true;
  }

  return Date.now() >= payload.exp * 1000 - thresholdSeconds * 1000;
}
