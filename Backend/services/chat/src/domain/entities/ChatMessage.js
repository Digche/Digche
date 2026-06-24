export class ChatMessage {
  constructor({
    id = null,
    conversationId,
    senderId,
    senderType,
    body,
    clientMessageId = null,
    metadata = null,
    createdAt = null
  }) {
    if (!conversationId) {
      throw new Error("Conversation id is required");
    }

    if (!senderId) {
      throw new Error("Sender id is required");
    }

    if (!senderType) {
      throw new Error("Sender type is required");
    }

    if (!body) {
      throw new Error("Message body is required");
    }

    this.id = id;
    this.conversationId = conversationId;
    this.senderId = senderId;
    this.senderType = senderType;
    this.body = body;
    this.clientMessageId = clientMessageId;
    this.metadata = metadata;
    this.createdAt = createdAt;
  }
}
