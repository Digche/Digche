// src/features/customer/components/CustomerProfileBadge.tsx

"use client";

import Image from "next/image";
import { useAuthStore } from "@/store/auth-store";

const defaultAvatar = "/images/customer-avatar.webp";

export default function CustomerProfileBadge() {
  const currentUser = useAuthStore((state) => state.currentUser);

  if (!currentUser || currentUser.role !== "customer") return null;

  const avatarSrc = currentUser.avatar || defaultAvatar;
  const isBase64Avatar = avatarSrc.startsWith("data:");

  const displayName =
    currentUser.name ||
    currentUser.username ||
    currentUser.phone ||
    "کاربر دیگچه";

  return (
    <div className="flex h-24 w-full items-center gap-5 rounded-[1.5rem] bg-white px-6 shadow-[0_0_0_2px_rgba(17,24,39,0.08),8px_8px_16px_rgba(0,0,0,0.18)] sm:w-[360px]">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-[#F2CDB5]">
        <Image
          src={avatarSrc}
          alt={displayName}
          fill
          className="object-cover"
          unoptimized={isBase64Avatar}
        />
      </div>

      <p className="truncate text-2xl font-bold text-gray-950">
        {displayName}
      </p>
    </div>
  );
}