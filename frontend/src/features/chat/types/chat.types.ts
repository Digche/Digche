export type ChatParticipantType = "user" | "admin";
export type ChatConversationType = "direct" | "support" | "order";
export type ChatSocketStatus = "idle" | "connecting" | "open" | "closed" | "error";
export type ChatDeliveryStatus = "sending" | "sent" | "failed" | "seen";

export type ChatParticipant = {
  id: string;
  conversationId: string;
  participantId: string;
  participantType: ChatParticipantType;
  displayName: string | null;
  photoUrl?: string | null;
  phone?: string | null;
  role?: string | null;
  roles?: string[] | null;
  isOnline?: boolean;
  lastReadMessageId?: string | null;
  lastReadAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: ChatParticipantType;
  body: string;
  clientMessageId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
};

export type ChatUiMessage = ChatMessage & {
  deliveryStatus?: ChatDeliveryStatus;
  isOptimistic?: boolean;
};

export type ChatConversation = {
  id: string;
  type: ChatConversationType;
  title: string | null;
  orderId: string | null;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
  participants: ChatParticipant[];
  lastMessage?: ChatMessage | null;
  unreadCount?: number;
};

export type StartChatConversationInput = {
  participantId: string;
  participantType: ChatParticipantType;
  participantDisplayName?: string | null;
  title?: string | null;
  type?: ChatConversationType;
  orderId?: string | null;
};

export type ChatActor = {
  id: string;
  type: ChatParticipantType;
};


export type ChatSearchUser = {
  id: string;
  username: string | null;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  phone?: string | null;
  photoUrl?: string | null;
};
