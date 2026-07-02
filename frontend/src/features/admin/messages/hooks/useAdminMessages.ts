"use client";

import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { AdminSupportMessage } from "../../types/admin.types";
import {
  getAdminSupportTickets,
  markAdminSupportTicketReviewed,
  replyToAdminSupportTicket,
  type AdminSupportTicket,
} from "../api/admin-support-tickets.api";

export function useAdminMessages() {
  const [messages, setMessages] = useState<AdminSupportMessage[]>([]);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [isReplyBoxOpen, setIsReplyBoxOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [statusError, setStatusError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const loadMessages = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const response = await getAdminSupportTickets();
      const mappedMessages = (response.tickets ?? []).map(mapTicketToMessage);

      setMessages(mappedMessages);

      setSelectedMessageId((currentId) => {
        if (currentId && mappedMessages.some((message) => message.id === currentId)) {
          return currentId;
        }

        return mappedMessages[0]?.id ?? null;
      });
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "دریافت پیام‌های پشتیبانی ناموفق بود."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

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

  const toggleMessageStatus = async (messageId: string) => {
    const targetMessage = messages.find((message) => message.id === messageId);

    if (!targetMessage || isUpdatingStatus) {
      return;
    }

    if (!targetMessage.isSeen && targetMessage.status === "pending") {
      setStatusError(
        "برای تغییر وضعیت به بررسی شده، ابتدا باید پیام را مشاهده کنید."
      );
      return;
    }

    if (targetMessage.status === "reviewed") {
      setStatusError("این پیام قبلاً بررسی شده است.");
      return;
    }

    setStatusError("");
    setIsUpdatingStatus(true);

    try {
      const response = await markAdminSupportTicketReviewed(messageId);
      const updatedMessage = mapTicketToMessage(response.ticket, {
        isSeen: true,
      });

      setMessages((prevMessages) =>
        prevMessages.map((message) =>
          message.id === messageId ? updatedMessage : message
        )
      );
    } catch (error) {
      setStatusError(
        error instanceof Error
          ? error.message
          : "تغییر وضعیت پیام ناموفق بود."
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const openReplyBox = () => {
    setReplyText(selectedMessage?.adminReply ?? "");
    setIsReplyBoxOpen(true);
  };

  const closeReplyBox = () => {
    setReplyText(selectedMessage?.adminReply ?? "");
    setIsReplyBoxOpen(false);
  };

  const submitReply = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedMessage || !replyText.trim() || isSubmittingReply) {
      return;
    }

    const normalizedReplyText = replyText.trim();

    setIsSubmittingReply(true);
    setStatusError("");

    try {
      const response = await replyToAdminSupportTicket({
        ticketId: selectedMessage.id,
        replyText: normalizedReplyText,
      });

      const updatedMessage = mapTicketToMessage(response.ticket, {
        isSeen: true,
      });

      setMessages((prevMessages) =>
        prevMessages.map((message) =>
          message.id === selectedMessage.id ? updatedMessage : message
        )
      );

      setReplyText(normalizedReplyText);
      setIsReplyBoxOpen(false);
    } catch (error) {
      setStatusError(
        error instanceof Error ? error.message : "ارسال پاسخ ناموفق بود."
      );
    } finally {
      setIsSubmittingReply(false);
    }
  };

  return {
    messages,
    selectedMessage,
    selectedMessageId,
    isReplyBoxOpen,
    replyText,
    statusError,
    loadError,
    isLoading,
    isSubmittingReply,
    isUpdatingStatus,
    setReplyText,
    selectMessage,
    toggleMessageStatus,
    openReplyBox,
    closeReplyBox,
    submitReply,
    refetchMessages: loadMessages,
  };
}

function mapTicketToMessage(
  ticket: AdminSupportTicket,
  options: { isSeen?: boolean } = {}
): AdminSupportMessage {
  const isChef = ticket.creatorRole === "chef";
  const role = isChef ? "آشپز" : "مشتری";
  const shortId = ticket.creatorId ? ticket.creatorId.slice(0, 8) : "ناشناس";

  return {
    id: ticket.id,
    userFullName: `${role} ${shortId}`,
    userAvatar: isChef ? "/images/chef.webp" : "/images/customer-avatar.webp",
    role,
    subject: ticket.subject,
    date: formatDate(ticket.createdAt),
    status: ticket.status === "reviewed" ? "reviewed" : "pending",
    isSeen: options.isSeen ?? ticket.status === "reviewed",
    message: ticket.description,
    time: formatTime(ticket.createdAt),
    adminReply: ticket.adminReplyText || undefined,
  };
}

function formatDate(value?: string) {
  if (!value) {
    return "تاریخ نامشخص";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "تاریخ نامشخص";
  }

  const today = new Date();
  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  if (isToday) {
    return "امروز";
  }

  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatTime(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
