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
  createdAt?: string;
  updatedAt?: string;
};

export type CreateSupportTicketResponse = {
  ticket: SupportTicket;
};

export function createSupportTicket(input: CreateSupportTicketInput) {
  return apiRequest<CreateSupportTicketResponse>("/tickets", {
    method: "POST",
    auth: true,
    body: input,
  });
}
