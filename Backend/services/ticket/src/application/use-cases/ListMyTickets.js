import { AppError } from "../errors/AppError.js";

export class ListMyTickets {
  constructor({ ticketRepository }) {
    this.ticketRepository = ticketRepository;
  }

  async execute({ actor }) {
    if (!actor?.id) {
      throw new AppError("Creator id is required", 400, "CREATOR_ID_REQUIRED");
    }

    return {
      tickets: await this.ticketRepository.listByCreatorId(actor.id)
    };
  }
}
