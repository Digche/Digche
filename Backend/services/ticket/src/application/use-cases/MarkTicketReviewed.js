import { AppError, NotFoundError } from "../errors/AppError.js";

export class MarkTicketReviewed {
  constructor({ ticketRepository, ticketProfileHydrator = null }) {
    this.ticketRepository = ticketRepository;
    this.ticketProfileHydrator = ticketProfileHydrator;
  }

  async execute({ ticketId }) {
    if (!ticketId) {
      throw new AppError("Ticket id is required", 400, "TICKET_ID_REQUIRED");
    }

    const existingTicket = await this.ticketRepository.findById(ticketId);

    if (!existingTicket) {
      throw new NotFoundError("Ticket not found");
    }

    existingTicket.markReviewed();

    const ticket = await this.ticketRepository.markReviewed(ticketId);

    return {
      ticket: this.ticketProfileHydrator
        ? await this.ticketProfileHydrator.hydrateTicket(ticket)
        : ticket
    };
  }
}
