import { TICKET_STATUSES } from "../constants/ticketStatuses.js";

export class Ticket {
  constructor({
    id = null,
    creatorId,
    creatorRole,
    subject,
    description,
    status = TICKET_STATUSES.UNREVIEWED,
    reviewedAt = null,
    adminReplyText = null,
    repliedByAdminId = null,
    repliedByAdminRole = null,
    repliedAt = null,
    createdAt = null,
    updatedAt = null
  }) {
    if (!creatorId) {
      throw new Error("Ticket creator id is required");
    }

    if (!creatorRole) {
      throw new Error("Ticket creator role is required");
    }

    if (!subject) {
      throw new Error("Ticket subject is required");
    }

    if (!description) {
      throw new Error("Ticket description is required");
    }

    this.id = id;
    this.creatorId = creatorId;
    this.creatorRole = creatorRole;
    this.subject = subject;
    this.description = description;
    this.status = status;
    this.reviewedAt = reviewedAt;
    this.adminReplyText = adminReplyText;
    this.repliedByAdminId = repliedByAdminId;
    this.repliedByAdminRole = repliedByAdminRole;
    this.repliedAt = repliedAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  markReviewed(reviewedAt = new Date()) {
    if (this.status === TICKET_STATUSES.REVIEWED) {
      return false;
    }

    this.status = TICKET_STATUSES.REVIEWED;
    this.reviewedAt = reviewedAt;

    return true;
  }

  reply({ text, adminId, adminRole }, repliedAt = new Date()) {
    if (!text) {
      return false;
    }

    if (!adminId) {
      return false;
    }

    if (!adminRole) {
      return false;
    }

    this.adminReplyText = text;
    this.repliedByAdminId = adminId;
    this.repliedByAdminRole = adminRole;
    this.repliedAt = repliedAt;
    this.status = TICKET_STATUSES.REVIEWED;
    this.reviewedAt = this.reviewedAt || repliedAt;

    return true;
  }

  canTransitionTo(status) {
    if (
      this.status === TICKET_STATUSES.REVIEWED &&
      status === TICKET_STATUSES.UNREVIEWED
    ) {
      return false;
    }

    return Object.values(TICKET_STATUSES).includes(status);
  }
}
