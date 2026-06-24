import { AppError, ForbiddenError } from "../errors/AppError.js";

export class MarkConversationRead {
  constructor({
    conversationRepository,
    messageRepository
  }) {
    this.conversationRepository = conversationRepository;
    this.messageRepository = messageRepository;
  }

  async execute({ actor, conversationId, lastReadMessageId = null }) {
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

    let resolvedLastReadMessageId = lastReadMessageId;

    if (!resolvedLastReadMessageId) {
      const latestMessage =
        await this.messageRepository.findLatestInConversation(conversationId);

      resolvedLastReadMessageId = latestMessage?.id || null;
    }

    const readState = await this.conversationRepository.markRead({
      conversationId,
      participantId: actor.id,
      participantType: actor.type,
      lastReadMessageId: resolvedLastReadMessageId
    });

    return {
      readState
    };
  }
}
