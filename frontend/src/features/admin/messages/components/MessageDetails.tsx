"use client";

import Image from "next/image";
import type { FormEvent } from "react";
import { MessageSquareText } from "lucide-react";
import type { AdminSupportMessage } from "../../types/admin.types";
import MessageReplyForm from "./MessageReplyForm";

type MessageDetailsProps = {
  message: AdminSupportMessage;
  isReplyBoxOpen: boolean;
  replyText: string;
  onReplyTextChange: (value: string) => void;
  onOpenReplyBox: () => void;
  onCloseReplyBox: () => void;
  onSubmitReply: (event: FormEvent<HTMLFormElement>) => void;
};

export default function MessageDetails({
  message,
  isReplyBoxOpen,
  replyText,
  onReplyTextChange,
  onOpenReplyBox,
  onCloseReplyBox,
  onSubmitReply,
}: MessageDetailsProps) {
  return (
    <section className="min-h-0 flex-1 overflow-hidden rounded-lg border-2 border-[#FF6A21] bg-white px-4 py-4">
      <div className="flex h-full min-h-[250px] flex-col">
        <header className="flex shrink-0 items-center justify-between border-b border-[#FF6A21] pb-3">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-full border border-gray-200 bg-[#F2CDB5]">
              <Image
                src={message.userAvatar}
                alt={message.userFullName}
                fill
                className="object-cover"
              />
            </div>

            <div>
              <h2 className="text-sm font-medium text-gray-950">
                {message.userFullName}
              </h2>
              <p className="mt-1 text-xs text-gray-500">{message.role}</p>
            </div>
          </div>

          <h3 className="text-sm font-medium text-gray-950">
            {message.subject}
          </h3>
        </header>

        <div className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-2 py-6">
          <div className="w-full max-w-[430px] rounded-md border border-gray-500 bg-white px-4 py-3 text-center text-sm leading-7 text-gray-950">
            <p>{message.message}</p>
            <time className="mt-2 block text-left text-[10px] text-gray-500">
              {message.time}
            </time>
          </div>

          {message.adminReply && !isReplyBoxOpen && (
            <div className="mt-4 w-full max-w-[430px] rounded-md border border-[#FF6A21] bg-[#FFF9F4] px-4 py-3 text-right text-sm leading-7 text-gray-950">
              <p className="mb-1 text-xs font-medium text-[#FF6A21]">
                پاسخ ادمین:
              </p>
              <p>{message.adminReply}</p>
            </div>
          )}

          {isReplyBoxOpen && (
            <MessageReplyForm
              replyText={replyText}
              onReplyTextChange={onReplyTextChange}
              onSubmitReply={onSubmitReply}
              onCloseReplyBox={onCloseReplyBox}
            />
          )}
        </div>

        {!isReplyBoxOpen && (
          <div className="flex shrink-0 justify-center pb-1">
            <button
              type="button"
              onClick={onOpenReplyBox}
              className="flex h-10 w-full max-w-[280px] items-center justify-center gap-2 rounded-lg border border-[#FF6A21] bg-white text-sm font-medium text-[#FF6A21] transition hover:bg-[#FFF1EA]"
            >
              <MessageSquareText size={17} />
              {message.adminReply ? "ویرایش پاسخ" : "به این پیام پاسخ دهید"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
