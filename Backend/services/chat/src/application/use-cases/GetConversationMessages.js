import { AppError, ForbiddenError } from "../errors/AppError.js";

export class GetConversationMessages {
  constructor({
    conversationRepository,
    messageRepository,
    defaultLimit,
    maxLimit
  }) {
    this.conversationRepository = conversationRepository;
    this.messageRepository = messageRepository;
    this.defaultLimit = defaultLimit;
    this.maxLimit = maxLimit;
  }

  async execute({ actor, conversationId, limit = null, before = null }) {
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

    const messages = await this.messageRepository.listByConversation({
      conversationId,
      limit: this.normalizeLimit(limit),
      before: this.normalizeBefore(before)
    });

    return {
      messages
    };
  }

  normalizeLimit(limit) {
    if (limit === null || limit === undefined || limit === "") {
      return this.defaultLimit;
    }

    const normalizedLimit = Number(limit);

    if (!Number.isInteger(normalizedLimit) || normalizedLimit < 1) {
      throw new AppError("Invalid history limit", 400, "INVALID_LIMIT");
    }

    return Math.min(normalizedLimit, this.maxLimit);
  }

  normalizeBefore(before) {
    if (!before) {
      return null;
    }

    const date = new Date(before);

    if (Number.isNaN(date.getTime())) {
      throw new AppError("Invalid before cursor", 400, "INVALID_BEFORE_CURSOR");
    }

    return date;
  }
}
