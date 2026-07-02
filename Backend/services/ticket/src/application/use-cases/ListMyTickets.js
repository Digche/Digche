import { AppError } from "../errors/AppError.js";

export class ListMyTickets {
  constructor({ ticketRepository, ticketProfileHydrator = null }) {
    this.ticketRepository = ticketRepository;
    this.ticketProfileHydrator = ticketProfileHydrator;
  }

  async execute({ actor }) {
    if (!actor?.id) {
      throw new AppError("Creator id is required", 400, "CREATOR_ID_REQUIRED");
    }

    const tickets = await this.ticketRepository.listByCreatorId(actor.id);

    return {
      tickets: this.ticketProfileHydrator
        ? await this.ticketProfileHydrator.hydrateTickets(tickets)
        : tickets
    };
  }
}
