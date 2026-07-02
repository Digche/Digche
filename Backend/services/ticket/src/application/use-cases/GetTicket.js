import { AppError, NotFoundError } from "../errors/AppError.js";

export class GetTicket {
  constructor({ ticketRepository, ticketProfileHydrator = null }) {
    this.ticketRepository = ticketRepository;
    this.ticketProfileHydrator = ticketProfileHydrator;
  }

  async execute({ ticketId }) {
    if (!ticketId) {
      throw new AppError("Ticket id is required", 400, "TICKET_ID_REQUIRED");
    }

    const ticket = await this.ticketRepository.findById(ticketId);

    if (!ticket) {
      throw new NotFoundError("Ticket not found");
    }

    return {
      ticket: this.ticketProfileHydrator
        ? await this.ticketProfileHydrator.hydrateTicket(ticket)
        : ticket
    };
  }
}
