"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAdminAuthStore } from "../store/admin-auth-store";

type AdminAuthRouteGuardProps = {
  children: ReactNode;
};

function buildAdminLoginRedirect(pathname: string | null) {
  const safePathname =
    pathname && (pathname === "/admin" || pathname.startsWith("/admin/"))
      ? pathname
      : "/admin/dashboard";

  return `/admin-login?next=${encodeURIComponent(safePathname)}`;
}

export default function AdminAuthRouteGuard({ children }: AdminAuthRouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const currentAdmin = useAdminAuthStore((state) => state.currentAdmin);
  const authStatus = useAdminAuthStore((state) => state.authStatus);
  const hasHydrated = useAdminAuthStore((state) => state.hasHydrated);
  const ensureSession = useAdminAuthStore((state) => state.ensureSession);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    void ensureSession();
  }, [hasHydrated, ensureSession]);

  useEffect(() => {
    function handleExpiredSession() {
      router.replace(buildAdminLoginRedirect(pathname));
    }

    window.addEventListener("digche:admin-auth-expired", handleExpiredSession);
    return () => {
      window.removeEventListener("digche:admin-auth-expired", handleExpiredSession);
    };
  }, [pathname, router]);

  useEffect(() => {
    if (!hasHydrated || authStatus === "idle" || authStatus === "checking") {
      return;
    }

    if (!currentAdmin) {
      router.replace(buildAdminLoginRedirect(pathname));
    }
  }, [authStatus, currentAdmin, hasHydrated, pathname, router]);

  if (!hasHydrated || authStatus === "idle" || authStatus === "checking" || !currentAdmin) {
    return (
      <div
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#FFF9F4] px-4 text-center"
      >
        <div className="rounded-3xl bg-white px-8 py-6 text-sm font-bold text-gray-700 shadow-sm">
          در حال بررسی دسترسی ادمین...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
