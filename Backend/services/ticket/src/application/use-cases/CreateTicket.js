import { AppError } from "../errors/AppError.js";
import { Ticket } from "../../domain/entities/Ticket.js";
import { USER_ROLES } from "../../domain/constants/roles.js";

export class CreateTicket {
  constructor({ ticketRepository }) {
    this.ticketRepository = ticketRepository;
  }

  async execute({ actor, subject, description }) {
    if (!actor?.id) {
      throw new AppError("Creator id is required", 400, "CREATOR_ID_REQUIRED");
    }

    if (!Object.values(USER_ROLES).includes(actor.role)) {
      throw new AppError("Invalid creator role", 400, "INVALID_CREATOR_ROLE");
    }

    const ticket = await this.ticketRepository.create(
      new Ticket({
        creatorId: actor.id,
        creatorRole: actor.role,
        subject: this.normalizeText(subject, {
          requiredCode: "SUBJECT_REQUIRED",
          tooLongCode: "SUBJECT_TOO_LONG",
          maxLength: 150
        }),
        description: this.normalizeText(description, {
          requiredCode: "DESCRIPTION_REQUIRED",
          tooLongCode: "DESCRIPTION_TOO_LONG",
          maxLength: 2000
        })
      })
    );

    return {
      ticket
    };
  }

  normalizeText(value, { requiredCode, tooLongCode, maxLength }) {
    const normalizedValue = String(value || "").trim();

    if (!normalizedValue) {
      throw new AppError("Text field is required", 400, requiredCode);
    }

    if (normalizedValue.length > maxLength) {
      throw new AppError("Text field is too long", 400, tooLongCode);
    }

    return normalizedValue;
  }
}
