"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  getAccessTokenRefreshDelay,
  useAuthStore,
  type UserRole,
} from "@/store/auth-store";

type AuthSessionProviderProps = {
  children: ReactNode;
};

function getProtectedRouteRole(pathname: string | null): UserRole | null {
  if (!pathname) {
    return null;
  }

  if (pathname === "/chef" || pathname.startsWith("/chef/")) {
    return "chef";
  }

  if (pathname === "/cart" || pathname.startsWith("/cart/")) {
    return "customer";
  }

  return null;
}

function buildAuthRedirect(pathname: string | null) {
  const safePathname = pathname || "/";

  if (safePathname === "/auth") {
    return "/auth";
  }

  return `/auth?next=${encodeURIComponent(safePathname)}`;
}

export function AuthSessionProvider({ children }: AuthSessionProviderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const currentUser = useAuthStore((state) => state.currentUser);
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const authStatus = useAuthStore((state) => state.authStatus);
  const ensureSession = useAuthStore((state) => state.ensureSession);
  const refreshSession = useAuthStore((state) => state.refreshSession);

  useEffect(() => {
    void ensureSession();
  }, [ensureSession]);

  useEffect(() => {
    if (!accessToken || !refreshToken) {
      return;
    }

    const delay = getAccessTokenRefreshDelay(accessToken);

    const timer = window.setTimeout(() => {
      void refreshSession();
    }, delay);

    return () => {
      window.clearTimeout(timer);
    };
  }, [accessToken, refreshToken, refreshSession]);

  useEffect(() => {
    if (authStatus === "idle" || authStatus === "checking") {
      return;
    }

    const protectedRole = getProtectedRouteRole(pathname);

    if (protectedRole && !currentUser) {
      router.replace(buildAuthRedirect(pathname));
      return;
    }

    if (protectedRole && currentUser && currentUser.role !== protectedRole) {
      router.replace(currentUser.role === "chef" ? "/chef" : "/");
      return;
    }

    if (pathname === "/auth" && currentUser) {
      router.replace(currentUser.role === "chef" ? "/chef" : "/");
    }
  }, [authStatus, currentUser, pathname, router]);

  return <>{children}</>;
}