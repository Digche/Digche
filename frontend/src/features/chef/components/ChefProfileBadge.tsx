// src/features/chef/components/ChefProfileBadge.tsx

"use client";

import Image from "next/image";
import { useAuthStore } from "@/store/auth-store";

const defaultAvatar = "/images/chef-avatar.webp";

export default function ChefProfileBadge() {
  const currentUser = useAuthStore((state) => state.currentUser);

  if (!currentUser || currentUser.role !== "chef") return null;

  const avatarSrc = currentUser.avatar || defaultAvatar;
  const isBase64Avatar = avatarSrc.startsWith("data:");

  return (
    <div className="flex h-24 w-full items-center gap-5 rounded-[1.5rem] bg-white px-6 shadow-[0_0_0_2px_rgba(17,24,39,0.08),8px_8px_16px_rgba(0,0,0,0.18)] sm:w-[360px]">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-[#F2CDB5]">
        <Image
          src={avatarSrc}
          alt={currentUser.chefDisplayName || currentUser.name}
          fill
          className="object-cover"
          unoptimized={isBase64Avatar}
        />
      </div>

      <p className="truncate text-2xl font-bold text-gray-950">
        {currentUser.chefDisplayName || currentUser.name}
      </p>
    </div>
  );
}