import { AppError } from "../errors/AppError.js";
import { CONVERSATION_TYPES } from "../../domain/constants/conversationTypes.js";
import { PARTICIPANT_TYPES } from "../../domain/constants/participantTypes.js";

export class StartConversation {
  constructor({ conversationRepository }) {
    this.conversationRepository = conversationRepository;
  }

  async execute({
    actor,
    participantId,
    participantType,
    participantDisplayName = null,
    title = null,
    type = CONVERSATION_TYPES.DIRECT,
    orderId = null
  }) {
    const targetParticipant = this.normalizeParticipant({
      participantId,
      participantType,
      participantDisplayName
    });

    if (actor.id === targetParticipant.id && actor.type === targetParticipant.type) {
      throw new AppError("Cannot start a conversation with yourself", 400, "CANNOT_CHAT_WITH_SELF");
    }

    if (type === CONVERSATION_TYPES.DIRECT) {
      const existingConversation =
        await this.conversationRepository.findDirectBetweenParticipants(
          { id: actor.id, type: actor.type },
          { id: targetParticipant.id, type: targetParticipant.type }
        );

      if (existingConversation) {
        return {
          conversation: existingConversation,
          created: false
        };
      }
    }

    const conversation = await this.conversationRepository.create({
      type,
      title: this.normalizeOptionalText(title, 150),
      orderId: orderId || null,
      participants: [
        {
          id: actor.id,
          type: actor.type,
          displayName: actor.displayName
        },
        targetParticipant
      ]
    });

    return {
      conversation,
      created: true
    };
  }

  normalizeParticipant({ participantId, participantType, participantDisplayName }) {
    const id = String(participantId || "").trim();
    const type = String(participantType || "").trim();

    if (!id) {
      throw new AppError("Participant id is required", 400, "PARTICIPANT_ID_REQUIRED");
    }

    if (![PARTICIPANT_TYPES.USER, PARTICIPANT_TYPES.ADMIN].includes(type)) {
      throw new AppError("Invalid participant type", 400, "INVALID_PARTICIPANT_TYPE");
    }

    return {
      id,
      type,
      displayName: this.normalizeOptionalText(participantDisplayName, 150)
    };
  }

  normalizeOptionalText(value, maxLength) {
    const normalizedValue = String(value || "").trim();

    if (!normalizedValue) {
      return null;
    }

    if (normalizedValue.length > maxLength) {
      throw new AppError("Text field is too long", 400, "TEXT_TOO_LONG");
    }

    return normalizedValue;
  }
}
