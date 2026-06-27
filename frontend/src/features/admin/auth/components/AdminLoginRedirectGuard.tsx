"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAdminAuthStore } from "../store/admin-auth-store";

type AdminLoginRedirectGuardProps = {
  children: ReactNode;
};

function getSafeRedirectPath(nextPath: string | null) {
  if (
    nextPath &&
    (nextPath === "/admin" || nextPath.startsWith("/admin/")) &&
    !nextPath.startsWith("//")
  ) {
    return nextPath;
  }

  return "/admin/dashboard";
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => {
      window.setTimeout(() => resolve(null), timeoutMs);
    }),
  ]);
}

export default function AdminLoginRedirectGuard({
  children,
}: AdminLoginRedirectGuardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasStartedCheckRef = useRef(false);

  const hasHydrated = useAdminAuthStore((state) => state.hasHydrated);
  const ensureSession = useAdminAuthStore((state) => state.ensureSession);
  const clearSession = useAdminAuthStore((state) => state.clearSession);

  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const redirectPath = getSafeRedirectPath(searchParams.get("next"));

  useEffect(() => {
    if (!hasHydrated || hasStartedCheckRef.current) {
      return;
    }

    hasStartedCheckRef.current = true;
    let isActive = true;

    async function checkSession() {
      try {
        const admin = await withTimeout(ensureSession(), 2500);

        if (!isActive) return;

        if (admin) {
          router.replace(redirectPath);
          return;
        }

        clearSession();
        setIsCheckingSession(false);
      } catch {
        if (!isActive) return;

        clearSession();
        setIsCheckingSession(false);
      }
    }

    void checkSession();

    return () => {
      isActive = false;
    };
  }, [clearSession, ensureSession, hasHydrated, redirectPath, router]);

  useEffect(() => {
    if (hasHydrated) {
      return;
    }

    const fallbackTimer = window.setTimeout(() => {
      clearSession();
      setIsCheckingSession(false);
    }, 3000);

    return () => {
      window.clearTimeout(fallbackTimer);
    };
  }, [clearSession, hasHydrated]);

  if (!hasHydrated || isCheckingSession) {
    return (
      <div
        dir="rtl"
        className="rounded-2xl bg-[#FFF9F4] px-5 py-4 text-center text-sm font-bold text-gray-700"
      >
        در حال بررسی نشست ادمین...
      </div>
    );
  }

  return <>{children}</>;
}
