"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore, type UserRole } from "@/store/auth-store";

type AuthRouteGuardProps = {
  children: ReactNode;
  allowedRoles?: UserRole[];
  fallback?: ReactNode;
};

function buildAuthRedirect(pathname: string | null) {
  const safePathname = pathname || "/";

  if (safePathname === "/auth") {
    return "/auth";
  }

  return `/auth?next=${encodeURIComponent(safePathname)}`;
}

function DefaultFallback() {
  return (
    <div dir="rtl" className="flex min-h-[60vh] items-center justify-center">
      <div className="rounded-3xl border border-orange-100 bg-white px-8 py-6 text-center shadow-sm">
        <p className="text-sm font-bold text-gray-700">
          در حال بررسی دسترسی...
        </p>
      </div>
    </div>
  );
}

export function AuthRouteGuard({
  children,
  allowedRoles,
  fallback = <DefaultFallback />,
}: AuthRouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const currentUser = useAuthStore((state) => state.currentUser);
  const authStatus = useAuthStore((state) => state.authStatus);

  const isChecking = authStatus === "idle" || authStatus === "checking";

  const isAllowed =
    Boolean(currentUser) &&
    (!allowedRoles || allowedRoles.includes(currentUser!.role));

  useEffect(() => {
    if (isChecking) {
      return;
    }

    if (!currentUser) {
      router.replace(buildAuthRedirect(pathname));
      return;
    }

    if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
      router.replace(currentUser.role === "chef" ? "/chef" : "/");
    }
  }, [allowedRoles, authStatus, currentUser, isChecking, pathname, router]);

  if (isChecking || !isAllowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}