import { ChatMessage } from "../../domain/entities/ChatMessage.js";
import { AppError, ForbiddenError } from "../errors/AppError.js";

export class SendMessage {
  constructor({
    conversationRepository,
    messageRepository,
    messageMaxLength
  }) {
    this.conversationRepository = conversationRepository;
    this.messageRepository = messageRepository;
    this.messageMaxLength = messageMaxLength;
  }

  async execute({
    actor,
    conversationId,
    body,
    clientMessageId = null,
    metadata = null
  }) {
    if (!conversationId) {
      throw new AppError("Conversation id is required", 400, "CONVERSATION_ID_REQUIRED");
    }

    const isParticipant = await this.conversationRepository.isParticipant({
      conversationId,
      participantId: actor.id,
      participantType: actor.type
    });

    if (!isParticipant) {
      throw new ForbiddenError("You are not a participant in this conversation");
    }

    const normalizedBody = this.normalizeBody(body);

    const message = await this.messageRepository.create(
      new ChatMessage({
        conversationId,
        senderId: actor.id,
        senderType: actor.type,
        body: normalizedBody,
        clientMessageId: this.normalizeClientMessageId(clientMessageId),
        metadata
      })
    );

    await this.conversationRepository.touchLastMessage(
      conversationId,
      message.createdAt || new Date()
    );

    return {
      message
    };
  }

  normalizeBody(body) {
    const normalizedBody = String(body || "").trim();

    if (!normalizedBody) {
      throw new AppError("Message body is required", 400, "MESSAGE_BODY_REQUIRED");
    }

    if (normalizedBody.length > this.messageMaxLength) {
      throw new AppError("Message body is too long", 400, "MESSAGE_BODY_TOO_LONG");
    }

    return normalizedBody;
  }

  normalizeClientMessageId(clientMessageId) {
    const normalizedClientMessageId = String(clientMessageId || "").trim();

    if (!normalizedClientMessageId) {
      return null;
    }

    if (normalizedClientMessageId.length > 120) {
      throw new AppError("Client message id is too long", 400, "CLIENT_MESSAGE_ID_TOO_LONG");
    }

    return normalizedClientMessageId;
  }
}
