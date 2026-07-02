export class TicketProfileHydrator {
  constructor({ authProfileClient }) {
    this.authProfileClient = authProfileClient;
  }

  async hydrateTickets(tickets) {
    if (!Array.isArray(tickets) || tickets.length === 0) {
      return tickets;
    }

    const participants = this.uniqueCreators(tickets);
    let profiles = [];

    try {
      profiles = await this.authProfileClient.resolveProfiles(participants);
    } catch {
      profiles = [];
    }

    const profileMap = new Map(
      profiles.map((profile) => [`${profile.type}:${profile.id}`, profile])
    );

    return tickets.map((ticket) => this.hydrateTicketWithMap(ticket, profileMap));
  }

  async hydrateTicket(ticket) {
    const [hydratedTicket] = await this.hydrateTickets(ticket ? [ticket] : []);

    return hydratedTicket || ticket;
  }

  hydrateTicketWithMap(ticket, profileMap) {
    const profile = profileMap.get(`user:${ticket.creatorId}`);

    return {
      ...ticket,
      creatorProfile: profile
        ? {
            id: profile.id,
            displayName: profile.displayName,
            photoUrl: profile.photoUrl,
            phone: profile.phone,
            roles: profile.roles
          }
        : null
    };
  }

  uniqueCreators(tickets) {
    const seen = new Set();
    const participants = [];

    for (const ticket of tickets) {
      const creatorId = String(ticket?.creatorId || "").trim();

      if (!creatorId || seen.has(creatorId)) {
        continue;
      }

      seen.add(creatorId);
      participants.push({
        id: creatorId,
        type: "user"
      });
    }

    return participants;
  }
}
