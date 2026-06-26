"use client";

import { Eye, EyeOff } from "lucide-react";
import type { AdminSupportMessage } from "../../types/admin.types";
import MessageStatusBadge from "./MessageStatusBadge";

type MessageRowProps = {
  message: AdminSupportMessage;
  isSelected: boolean;
  onSelect: () => void;
  onToggleStatus: () => void;
};

export default function MessageRow({
  message,
  isSelected,
  onSelect,
  onToggleStatus,
}: MessageRowProps) {
  const SeenIcon = message.isSeen ? Eye : EyeOff;

  return (
    <article
      className={`grid h-10 grid-cols-[1.2fr_0.8fr_1.2fr_0.9fr_1fr_0.8fr] items-center px-3 text-center text-xs text-gray-950 transition ${
        isSelected ? "bg-[#FFF1EA]" : "bg-white hover:bg-[#FFF9F4]"
      }`}
    >
      <span className="truncate px-1">{message.userFullName}</span>
      <span>{message.role}</span>
      <span className="truncate px-1">{message.subject}</span>
      <span>{message.date}</span>

      <span className="flex justify-center">
        <MessageStatusBadge
          status={message.status}
          isSeen={message.isSeen}
          onClick={onToggleStatus}
        />
      </span>

      <span className="flex justify-center">
        <button
          type="button"
          onClick={onSelect}
          className={`flex h-7 items-center gap-1 rounded-full px-3 text-[11px] font-medium text-gray-950 transition ${
            message.isSeen
              ? "bg-[#FFC7A6] hover:bg-[#ffb98f]"
              : "bg-[#FFD9C4] hover:bg-[#FFC7A6]"
          }`}
          title={message.isSeen ? "مشاهده شده" : "مشاهده نشده"}
        >
          <SeenIcon size={13} />
          <span>مشاهده</span>
        </button>
      </span>
    </article>
  );
}
