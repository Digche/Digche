"use client";

import type { AdminSupportMessage } from "../../types/admin.types";
import MessageRow from "./MessageRow";

type MessagesTableProps = {
  messages: AdminSupportMessage[];
  selectedMessageId: string | null;
  statusError: string;
  onSelectMessage: (messageId: string) => void;
  onToggleStatus: (messageId: string) => void;
};

export default function MessagesTable({
  messages,
  selectedMessageId,
  statusError,
  onSelectMessage,
  onToggleStatus,
}: MessagesTableProps) {
  return (
    <section className="min-h-0 shrink-0 overflow-hidden rounded-lg border-2 border-[#FF6A21] bg-white">
      <div className="max-h-[290px] overflow-y-auto">
        <div className="min-w-[720px]">
          <div className="grid h-10 grid-cols-[1.2fr_0.8fr_1.2fr_0.9fr_1fr_0.8fr] items-center border-b border-gray-300 px-3 text-center text-sm font-medium text-gray-950">
            <span>کاربر</span>
            <span>نقش</span>
            <span>موضوع</span>
            <span>تاریخ</span>
            <span>وضعیت</span>
            <span>پیوست</span>
          </div>

          <div className="divide-y divide-gray-300">
            {messages.map((message) => (
              <MessageRow
                key={message.id}
                message={message}
                isSelected={message.id === selectedMessageId}
                onSelect={() => onSelectMessage(message.id)}
                onToggleStatus={() => onToggleStatus(message.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {statusError && (
        <div className="border-t border-red-100 bg-red-50 px-4 py-2 text-center text-xs font-medium text-red-500">
          {statusError}
        </div>
      )}
    </section>
  );
}
