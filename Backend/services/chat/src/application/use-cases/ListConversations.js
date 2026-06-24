export class ListConversations {
  constructor({ conversationRepository }) {
    this.conversationRepository = conversationRepository;
  }

  async execute({ actor }) {
    const conversations = await this.conversationRepository.listForParticipant({
      participantId: actor.id,
      participantType: actor.type
    });

    return {
      conversations
    };
  }
}
