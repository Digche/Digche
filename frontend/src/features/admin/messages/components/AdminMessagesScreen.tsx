"use client";

import Image from "next/image";
import { Eye, EyeOff, MessageSquareText, Send, X } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import AdminPanel from "../../components/AdminPanel";
import { supportMessages } from "../../data/support-messages";
import type {
  AdminSupportMessage,
  SupportMessageStatus,
} from "../../types/admin.types";

export default function AdminMessagesScreen() {
  const [messages, setMessages] =
    useState<AdminSupportMessage[]>(supportMessages);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null
  );
  const [isReplyBoxOpen, setIsReplyBoxOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [statusError, setStatusError] = useState("");

  const selectedMessage = useMemo(() => {
    if (!selectedMessageId) {
      return null;
    }

    return messages.find((message) => message.id === selectedMessageId) ?? null;
  }, [messages, selectedMessageId]);

  const handleSelectMessage = (messageId: string) => {
    setSelectedMessageId(messageId);
    setIsReplyBoxOpen(false);
    setStatusError("");

    const message = messages.find((item) => item.id === messageId);
    setReplyText(message?.adminReply ?? "");

    setMessages((prevMessages) =>
      prevMessages.map((messageItem) =>
        messageItem.id === messageId
          ? {
              ...messageItem,
              isSeen: true,
            }
          : messageItem
      )
    );
  };

  const handleToggleStatus = (messageId: string) => {
    const targetMessage = messages.find((message) => message.id === messageId);

    if (!targetMessage) {
      return;
    }

    if (!targetMessage.isSeen && targetMessage.status === "pending") {
      setStatusError(
        "برای تغییر وضعیت به بررسی شده، ابتدا باید پیام را مشاهده کنید."
      );
      return;
    }

    setStatusError("");

    setMessages((prevMessages) =>
      prevMessages.map((message) =>
        message.id === messageId
          ? {
              ...message,
              status: message.status === "reviewed" ? "pending" : "reviewed",
            }
          : message
      )
    );
  };

  const handleOpenReplyBox = () => {
    setReplyText(selectedMessage?.adminReply ?? "");
    setIsReplyBoxOpen(true);
  };

  const handleCloseReplyBox = () => {
    setReplyText(selectedMessage?.adminReply ?? "");
    setIsReplyBoxOpen(false);
  };

  const handleSubmitReply = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedMessage || !replyText.trim()) {
      return;
    }

    setMessages((prevMessages) =>
      prevMessages.map((message) =>
        message.id === selectedMessage.id
          ? {
              ...message,
              adminReply: replyText.trim(),
            }
          : message
      )
    );

    setIsReplyBoxOpen(false);
  };

  return (
    <AdminPanel
      className="relative"
      contentClassName="relative flex h-full flex-col px-3 py-4 sm:px-5 sm:py-5"
    >
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <MessagesTable
          messages={messages}
          selectedMessageId={selectedMessageId}
          statusError={statusError}
          onSelectMessage={handleSelectMessage}
          onToggleStatus={handleToggleStatus}
        />

        {selectedMessage && (
          <MessageDetails
            message={selectedMessage}
            isReplyBoxOpen={isReplyBoxOpen}
            replyText={replyText}
            onReplyTextChange={setReplyText}
            onOpenReplyBox={handleOpenReplyBox}
            onCloseReplyBox={handleCloseReplyBox}
            onSubmitReply={handleSubmitReply}
          />
        )}
      </div>
    </AdminPanel>
  );
}

type MessagesTableProps = {
  messages: AdminSupportMessage[];
  selectedMessageId: string | null;
  statusError: string;
  onSelectMessage: (messageId: string) => void;
  onToggleStatus: (messageId: string) => void;
};

function MessagesTable({
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

type MessageRowProps = {
  message: AdminSupportMessage;
  isSelected: boolean;
  onSelect: () => void;
  onToggleStatus: () => void;
};

function MessageRow({
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
        <StatusBadge
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

type StatusBadgeProps = {
  status: SupportMessageStatus;
  isSeen: boolean;
  onClick: () => void;
};

function StatusBadge({ status, isSeen, onClick }: StatusBadgeProps) {
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

type MessageDetailsProps = {
  message: AdminSupportMessage;
  isReplyBoxOpen: boolean;
  replyText: string;
  onReplyTextChange: (value: string) => void;
  onOpenReplyBox: () => void;
  onCloseReplyBox: () => void;
  onSubmitReply: (event: FormEvent<HTMLFormElement>) => void;
};

function MessageDetails({
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
            <form
              onSubmit={onSubmitReply}
              className="mt-4 w-full max-w-[430px] rounded-md border border-[#FF6A21] bg-[#FFF9F4] p-3"
            >
              <label className="block">
                <span className="mb-2 block text-right text-xs font-medium text-gray-700">
                  پاسخ شما به این پیام
                </span>

                <textarea
                  dir="rtl"
                  value={replyText}
                  onChange={(event) => onReplyTextChange(event.target.value)}
                  rows={4}
                  placeholder="پاسخ خود را بنویسید..."
                  className="w-full resize-none rounded-md border border-orange-100 bg-white px-3 py-2 text-right text-sm leading-7 text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-[#FF6A21]"
                />
              </label>

              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onCloseReplyBox}
                  className="flex h-8 items-center gap-1 rounded-md border border-gray-300 bg-white px-3 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  <X size={14} />
                  انصراف
                </button>

                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className={`flex h-8 items-center gap-1 rounded-md px-3 text-xs font-medium transition ${
                    replyText.trim()
                      ? "bg-[#FF6A21] text-white hover:bg-[#e85f1d]"
                      : "cursor-not-allowed bg-gray-200 text-gray-400"
                  }`}
                >
                  <Send size={14} />
                  ارسال پاسخ
                </button>
              </div>
            </form>
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