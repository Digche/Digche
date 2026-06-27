"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { supportMessages } from "../../data/support-messages";
import type { AdminSupportMessage } from "../../types/admin.types";

export function useAdminMessages() {
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

  const selectMessage = (messageId: string) => {
    const message = messages.find((item) => item.id === messageId);

    setSelectedMessageId(messageId);
    setIsReplyBoxOpen(false);
    setStatusError("");
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

  const toggleMessageStatus = (messageId: string) => {
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

  const openReplyBox = () => {
    setReplyText(selectedMessage?.adminReply ?? "");
    setIsReplyBoxOpen(true);
  };

  const closeReplyBox = () => {
    setReplyText(selectedMessage?.adminReply ?? "");
    setIsReplyBoxOpen(false);
  };

  const submitReply = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedMessage || !replyText.trim()) {
      return;
    }

    const normalizedReplyText = replyText.trim();

    setMessages((prevMessages) =>
      prevMessages.map((message) =>
        message.id === selectedMessage.id
          ? {
              ...message,
              adminReply: normalizedReplyText,
            }
          : message
      )
    );

    setReplyText(normalizedReplyText);
    setIsReplyBoxOpen(false);
  };

  return {
    messages,
    selectedMessage,
    selectedMessageId,
    isReplyBoxOpen,
    replyText,
    statusError,
    setReplyText,
    selectMessage,
    toggleMessageStatus,
    openReplyBox,
    closeReplyBox,
    submitReply,
  };
}
