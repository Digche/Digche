export class ListConversations {
  constructor({
    conversationRepository,
    profileHydrator
  }) {
    this.conversationRepository = conversationRepository;
    this.profileHydrator = profileHydrator;
  }

  async execute({ actor }) {
    const conversations = await this.conversationRepository.listForParticipant({
      participantId: actor.id,
      participantType: actor.type
    });

    return {
      conversations: await this.profileHydrator.hydrateConversations(conversations)
    };
  }
}
