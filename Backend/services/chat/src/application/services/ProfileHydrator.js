export class ProfileHydrator {
  constructor({
    authProfileClient,
    presenceProvider = null
  }) {
    this.authProfileClient = authProfileClient;
    this.presenceProvider = presenceProvider;
  }

  async hydrateConversations(conversations) {
    if (!conversations.length) {
      return conversations;
    }

    const participants = this.uniqueParticipants(conversations);
    let profiles = [];

    try {
      profiles = await this.authProfileClient.resolveProfiles(participants);
    } catch (error) {
      profiles = [];
    }

    const profileMap = new Map(
      profiles.map((profile) => [`${profile.type}:${profile.id}`, profile])
    );

    return conversations.map((conversation) => ({
      ...conversation,
      participants: conversation.participants.map((participant) => {
        const profile = profileMap.get(
          `${participant.participantType}:${participant.participantId}`
        );

        return {
          ...participant,
          displayName:
            profile?.displayName || participant.displayName || null,
          photoUrl: profile?.photoUrl || null,
          phone: profile?.phone || null,
          role: profile?.role || null,
          roles: profile?.roles || null,
          isOnline: this.presenceProvider
            ? this.presenceProvider.isActorOnline({
                id: participant.participantId,
                type: participant.participantType
              })
            : false
        };
      })
    }));
  }

  uniqueParticipants(conversations) {
    const seen = new Set();
    const participants = [];

    for (const conversation of conversations) {
      for (const participant of conversation.participants || []) {
        const key = `${participant.participantType}:${participant.participantId}`;

        if (seen.has(key)) {
          continue;
        }

        seen.add(key);
        participants.push({
          id: participant.participantId,
          type: participant.participantType
        });
      }
    }

    return participants;
  }
}
