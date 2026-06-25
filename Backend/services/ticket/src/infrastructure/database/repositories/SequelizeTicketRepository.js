import { Ticket } from "../../../domain/entities/Ticket.js";
import { TICKET_STATUSES } from "../../../domain/constants/ticketStatuses.js";
import { TicketModel } from "../models/TicketModel.js";

export class SequelizeTicketRepository {
  async create(ticket) {
    const createdTicket = await TicketModel.create({
      creatorId: ticket.creatorId,
      creatorRole: ticket.creatorRole,
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status,
      reviewedAt: ticket.reviewedAt
    });

    return this.toDomain(createdTicket);
  }

  async list() {
    const tickets = await TicketModel.findAll({
      order: [["createdAt", "DESC"]]
    });

    return tickets.map((ticket) => this.toDomain(ticket));
  }

  async findById(id) {
    const ticket = await TicketModel.findByPk(id);

    if (!ticket) {
      return null;
    }

    return this.toDomain(ticket);
  }

  async markReviewed(id) {
    const ticket = await TicketModel.findByPk(id);

    if (!ticket) {
      return null;
    }

    if (ticket.status !== TICKET_STATUSES.REVIEWED) {
      ticket.status = TICKET_STATUSES.REVIEWED;
      ticket.reviewedAt = new Date();
      await ticket.save();
    }

    return this.toDomain(ticket);
  }

  toDomain(ticketModel) {
    return new Ticket({
      id: ticketModel.id,
      creatorId: ticketModel.creatorId,
      creatorRole: ticketModel.creatorRole,
      subject: ticketModel.subject,
      description: ticketModel.description,
      status: ticketModel.status,
      reviewedAt: ticketModel.reviewedAt,
      createdAt: ticketModel.createdAt,
      updatedAt: ticketModel.updatedAt
    });
  }
}
