"use client";

import type { SupportMessageStatus } from "../../types/admin.types";

type MessageStatusBadgeProps = {
  status: SupportMessageStatus;
  isSeen: boolean;
  onClick: () => void;
};

export default function MessageStatusBadge({
  status,
  isSeen,
  onClick,
}: MessageStatusBadgeProps) {
  const isReviewed = status === "reviewed";

  const title = !isSeen
    ? "برای بررسی کردن ابتدا پیام را مشاهده کنید"
    : "تغییر وضعیت پیام";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-6 min-w-[86px] items-center justify-center rounded-full px-3 text-[10px] font-medium transition ${
        isReviewed
          ? "bg-[#9DE2AA] text-gray-950 hover:bg-[#88d996]"
          : isSeen
            ? "bg-[#FF9AA0] text-gray-950 hover:bg-[#ff858c]"
            : "bg-[#FFC4C8] text-gray-500 hover:bg-[#ffb4ba]"
      }`}
      title={title}
    >
      {isReviewed ? "بررسی شده" : "بررسی نشده"}
    </button>
  );
}
