import { env } from "./config/env.js";

import { SequelizeTicketRepository } from "./infrastructure/database/repositories/SequelizeTicketRepository.js";
import { AuthTokenClient } from "./infrastructure/http/AuthTokenClient.js";
import { CreateTicket } from "./application/use-cases/CreateTicket.js";
import { ListTickets } from "./application/use-cases/ListTickets.js";
import { GetTicket } from "./application/use-cases/GetTicket.js";
import { MarkTicketReviewed } from "./application/use-cases/MarkTicketReviewed.js";
import { TicketController } from "./interfaces/http/controllers/TicketController.js";
import {
  createAdminAuthMiddleware,
  createPublicAuthMiddleware
} from "./interfaces/http/middlewares/authMiddleware.js";

export function createContainer() {
  const ticketRepository = new SequelizeTicketRepository();
  const authTokenClient = new AuthTokenClient({
    baseUrl: env.auth.internalBaseUrl,
    internalApiKey: env.auth.internalApiKey,
    timeoutMs: env.auth.tokenVerifyTimeoutMs
  });

  const createTicket = new CreateTicket({
    ticketRepository
  });

  const listTickets = new ListTickets({
    ticketRepository
  });

  const getTicket = new GetTicket({
    ticketRepository
  });

  const markTicketReviewed = new MarkTicketReviewed({
    ticketRepository
  });

  const ticketController = new TicketController({
    createTicket,
    listTickets,
    getTicket,
    markTicketReviewed
  });

  return {
    ticketController,
    publicAuthMiddleware: createPublicAuthMiddleware({
      authTokenClient
    }),
    adminAuthMiddleware: createAdminAuthMiddleware({
      authTokenClient
    })
  };
}
