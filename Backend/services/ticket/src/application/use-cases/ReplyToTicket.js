import { AppError, NotFoundError } from "../errors/AppError.js";
import { ADMIN_ROLES } from "../../domain/constants/roles.js";

export class ReplyToTicket {
  constructor({ ticketRepository }) {
    this.ticketRepository = ticketRepository;
  }

  async execute({ actor, ticketId, replyText }) {
    if (!ticketId) {
      throw new AppError("Ticket id is required", 400, "TICKET_ID_REQUIRED");
    }

    if (!actor?.id) {
      throw new AppError("Admin id is required", 400, "ADMIN_ID_REQUIRED");
    }

    if (!Object.values(ADMIN_ROLES).includes(actor.role)) {
      throw new AppError("Invalid admin role", 400, "INVALID_ADMIN_ROLE");
    }

    const normalizedReplyText = this.normalizeReplyText(replyText);
    const existingTicket = await this.ticketRepository.findById(ticketId);

    if (!existingTicket) {
      throw new NotFoundError("Ticket not found");
    }

    existingTicket.reply({
      text: normalizedReplyText,
      adminId: actor.id,
      adminRole: actor.role
    });

    const ticket = await this.ticketRepository.replyToTicket(ticketId, {
      replyText: normalizedReplyText,
      adminId: actor.id,
      adminRole: actor.role
    });

    if (!ticket) {
      throw new NotFoundError("Ticket not found");
    }

    return {
      ticket
    };
  }

  normalizeReplyText(value) {
    const normalizedValue = String(value || "").trim();

    if (!normalizedValue) {
      throw new AppError("Reply text is required", 400, "REPLY_TEXT_REQUIRED");
    }

    if (normalizedValue.length > 2000) {
      throw new AppError("Reply text is too long", 400, "REPLY_TEXT_TOO_LONG");
    }

    return normalizedValue;
  }
}
