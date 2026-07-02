import { apiRequest } from "@/shared/api/api-client";

export type CreateSupportTicketInput = {
  subject: string;
  description: string;
};

export type SupportTicket = {
  id?: string;
  creatorId?: string;
  creatorRole?: "client" | "chef";
  subject: string;
  description: string;
  status?: "unreviewed" | "reviewed";
  reviewedAt?: string | null;
  adminReplyText?: string | null;
  repliedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateSupportTicketResponse = {
  ticket: SupportTicket;
};

export type MySupportTicketsResponse = {
  tickets: SupportTicket[];
};

export function createSupportTicket(input: CreateSupportTicketInput) {
  return apiRequest<CreateSupportTicketResponse>("/tickets", {
    method: "POST",
    auth: true,
    body: input,
  });
}

export function getMySupportTickets() {
  return apiRequest<MySupportTicketsResponse>("/tickets/me", {
    method: "GET",
    auth: true,
  });
}
