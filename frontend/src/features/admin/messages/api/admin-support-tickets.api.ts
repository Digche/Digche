import { adminApiRequest } from "../../auth/services/admin-api-client";

export type AdminTicketRole = "client" | "chef";
export type AdminTicketStatus = "unreviewed" | "reviewed";

export type AdminTicketCreatorProfile = {
  id: string;
  displayName?: string | null;
  photoUrl?: string | null;
  phone?: string | null;
  roles?: AdminTicketRole[] | null;
};

export type AdminSupportTicket = {
  id: string;
  creatorId: string;
  creatorRole: AdminTicketRole;
  creatorProfile?: AdminTicketCreatorProfile | null;
  subject: string;
  description: string;
  status: AdminTicketStatus;
  reviewedAt?: string | null;
  adminReplyText?: string | null;
  repliedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminSupportTicketsResponse = {
  tickets: AdminSupportTicket[];
};

export type AdminSupportTicketResponse = {
  ticket: AdminSupportTicket;
};

export function getAdminSupportTickets() {
  return adminApiRequest<AdminSupportTicketsResponse>("/tickets", {
    method: "GET",
  });
}

export function markAdminSupportTicketReviewed(ticketId: string) {
  return adminApiRequest<AdminSupportTicketResponse>(
    `/tickets/${ticketId}/review`,
    {
      method: "PATCH",
    }
  );
}

export function replyToAdminSupportTicket(input: {
  ticketId: string;
  replyText: string;
}) {
  return adminApiRequest<AdminSupportTicketResponse>(
    `/tickets/${input.ticketId}/reply`,
    {
      method: "POST",
      body: {
        replyText: input.replyText,
      },
    }
  );
}
