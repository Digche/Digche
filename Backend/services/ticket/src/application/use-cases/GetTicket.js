import { AppError, NotFoundError } from "../errors/AppError.js";

export class GetTicket {
  constructor({ ticketRepository }) {
    this.ticketRepository = ticketRepository;
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
      ticket
    };
  }
}
