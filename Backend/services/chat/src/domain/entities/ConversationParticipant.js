export class ConversationParticipant {
  constructor({
    id = null,
    conversationId,
    participantId,
    participantType,
    displayName = null,
    lastReadMessageId = null,
    lastReadAt = null,
    createdAt = null,
    updatedAt = null
  }) {
    if (!conversationId) {
      throw new Error("Conversation id is required");
    }

    if (!participantId) {
      throw new Error("Participant id is required");
    }

    if (!participantType) {
      throw new Error("Participant type is required");
    }

    this.id = id;
    this.conversationId = conversationId;
    this.participantId = participantId;
    this.participantType = participantType;
    this.displayName = displayName;
    this.lastReadMessageId = lastReadMessageId;
    this.lastReadAt = lastReadAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
