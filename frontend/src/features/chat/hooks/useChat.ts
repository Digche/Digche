"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getChatMessages,
  listChatConversations,
  markChatConversationRead,
  sendChatMessage,
  startChatConversation,
} from "../services/chat-api";
import type {
  ChatActor,
  ChatConversation,
  ChatMessage,
  StartChatConversationInput,
} from "../types/chat.types";

type UseChatOptions = {
  accessToken: string | null;
  currentActor: ChatActor | null;
  initialConversationId?: string | null;
  startConversation?: StartChatConversationInput | null;
};

function sortMessages(messages: ChatMessage[]) {
  return [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

function mergeMessages(current: ChatMessage[], incoming: ChatMessage[]) {
  const map = new Map<string, ChatMessage>();

  [...current, ...incoming].forEach((message) => {
    const key =
      message.id ||
      message.clientMessageId ||
      `${message.senderId}-${message.createdAt}`;
    map.set(key, message);
  });

  return sortMessages([...map.values()]);
}

function upsertConversation(list: ChatConversation[], conversation: ChatConversation) {
  const exists = list.some((item) => item.id === conversation.id);
  const next = exists
    ? list.map((item) => (item.id === conversation.id ? { ...item, ...conversation } : item))
    : [conversation, ...list];

  return [...next].sort((a, b) => {
    const left = a.lastMessageAt || a.updatedAt || a.createdAt;
    const right = b.lastMessageAt || b.updatedAt || b.createdAt;
    return new Date(right).getTime() - new Date(left).getTime();
  });
}

export function useChat({
  accessToken,
  currentActor,
  initialConversationId = null,
  startConversation: startConversationInput = null,
}: UseChatOptions) {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    initialConversationId
  );
  const [messagesByConversation, setMessagesByConversation] = useState<
    Record<string, ChatMessage[]>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const bootedAccessTokenRef = useRef<string | null>(null);
  const bootedStartConversationRef = useRef(false);
  const selectedConversationIdRef = useRef<string | null>(selectedConversationId);

  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

  const selectedConversation =
    conversations.find((conversation) => conversation.id === selectedConversationId) ?? null;

  const selectedMessages = selectedConversationId
    ? messagesByConversation[selectedConversationId] ?? []
    : [];

  const refreshConversations = useCallback(
    async (options: { silent?: boolean } = {}) => {
      if (!accessToken) return [];

      if (!options.silent) {
        setIsLoading(true);
        setErrorMessage("");
      }

      try {
        const response = await listChatConversations(accessToken);
        setConversations(response.conversations);
        return response.conversations;
      } catch (error) {
        if (!options.silent) {
          setErrorMessage(
            error instanceof Error ? error.message : "خطای دریافت گفتگوها رخ داد."
          );
        }

        return [];
      } finally {
        if (!options.silent) {
          setIsLoading(false);
        }
      }
    },
    [accessToken]
  );

  const loadMessages = useCallback(
    async (conversationId: string, options: { silent?: boolean } = {}) => {
      if (!accessToken) return [];

      if (!options.silent) {
        setIsMessagesLoading(true);
        setErrorMessage("");
      }

      try {
        const response = await getChatMessages(accessToken, conversationId, {
          limit: 50,
        });

        setMessagesByConversation((prev) => ({
          ...prev,
          [conversationId]: mergeMessages(prev[conversationId] ?? [], response.messages),
        }));

        const lastMessage = response.messages[response.messages.length - 1];

        if (lastMessage) {
          void markChatConversationRead(accessToken, conversationId, lastMessage.id).catch(
            () => undefined
          );
        }

        return response.messages;
      } catch (error) {
        if (!options.silent) {
          setErrorMessage(
            error instanceof Error ? error.message : "خطای دریافت پیام‌ها رخ داد."
          );
        }

        return [];
      } finally {
        if (!options.silent) {
          setIsMessagesLoading(false);
        }
      }
    },
    [accessToken]
  );

  const selectConversation = useCallback(
    async (conversationId: string) => {
      setSelectedConversationId(conversationId);
      selectedConversationIdRef.current = conversationId;
      await loadMessages(conversationId);
    },
    [loadMessages]
  );

  useEffect(() => {
    if (!accessToken || !currentActor) {
      setConversations([]);
      setSelectedConversationId(null);
      setMessagesByConversation({});
      bootedAccessTokenRef.current = null;
      return;
    }

    if (bootedAccessTokenRef.current === accessToken) {
      return;
    }

    bootedAccessTokenRef.current = accessToken;

    let cancelled = false;

    async function boot() {
      if (startConversationInput && !bootedStartConversationRef.current) {
        bootedStartConversationRef.current = true;

        try {
          setIsLoading(true);
          const response = await startChatConversation(accessToken!, startConversationInput);

          if (cancelled) return;

          setConversations((prev) => upsertConversation(prev, response.conversation));
          setSelectedConversationId(response.conversation.id);
          selectedConversationIdRef.current = response.conversation.id;
          await loadMessages(response.conversation.id);
          return;
        } catch (error) {
          if (!cancelled) {
            setErrorMessage(error instanceof Error ? error.message : "شروع گفتگو ناموفق بود.");
          }
        } finally {
          if (!cancelled) setIsLoading(false);
        }
      }

      const loadedConversations = await refreshConversations();

      if (cancelled) return;

      const nextConversationId =
        initialConversationId || loadedConversations[0]?.id || null;

      if (nextConversationId) {
        setSelectedConversationId(nextConversationId);
        selectedConversationIdRef.current = nextConversationId;
        await loadMessages(nextConversationId);
      }
    }

    void boot();

    return () => {
      cancelled = true;
    };
  }, [
    accessToken,
    currentActor,
    initialConversationId,
    loadMessages,
    refreshConversations,
    startConversationInput,
  ]);

  useEffect(() => {
    if (!accessToken || !currentActor) {
      return;
    }

    const timer = window.setInterval(() => {
      void refreshConversations({ silent: true });

      const conversationId = selectedConversationIdRef.current;

      if (conversationId) {
        void loadMessages(conversationId, { silent: true });
      }
    }, 2500);

    return () => {
      window.clearInterval(timer);
    };
  }, [accessToken, currentActor, loadMessages, refreshConversations]);

  const sendMessage = useCallback(
    async (body: string) => {
      const normalizedBody = body.trim();

      if (!accessToken || !selectedConversationId || !normalizedBody) {
        return null;
      }

      setIsSending(true);
      setErrorMessage("");

      try {
        const response = await sendChatMessage(accessToken, selectedConversationId, {
          body: normalizedBody,
          clientMessageId:
            typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : `${Date.now()}`,
        });

        setMessagesByConversation((prev) => ({
          ...prev,
          [selectedConversationId]: mergeMessages(prev[selectedConversationId] ?? [], [
            response.message,
          ]),
        }));

        void refreshConversations({ silent: true });

        return response.message;
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "ارسال پیام ناموفق بود.");
        return null;
      } finally {
        setIsSending(false);
      }
    },
    [accessToken, refreshConversations, selectedConversationId]
  );

  const isMine = useCallback(
    (message: ChatMessage) =>
      Boolean(
        currentActor &&
          message.senderId === currentActor.id &&
          message.senderType === currentActor.type
      ),
    [currentActor]
  );

  return {
    conversations,
    selectedConversation,
    selectedConversationId,
    selectedMessages,
    isLoading,
    isMessagesLoading,
    isSending,
    errorMessage,
    refreshConversations,
    selectConversation,
    sendMessage,
    isMine,
  };
}
