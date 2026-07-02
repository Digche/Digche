export class ListTickets {
  constructor({ ticketRepository, ticketProfileHydrator = null }) {
    this.ticketRepository = ticketRepository;
    this.ticketProfileHydrator = ticketProfileHydrator;
  }

  async execute() {
    const tickets = await this.ticketRepository.list();

    return {
      tickets: this.ticketProfileHydrator
        ? await this.ticketProfileHydrator.hydrateTickets(tickets)
        : tickets
    };
  }
}
