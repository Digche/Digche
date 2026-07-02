import { env } from "./config/env.js";

import { SequelizeTicketRepository } from "./infrastructure/database/repositories/SequelizeTicketRepository.js";
import { AuthTokenClient } from "./infrastructure/http/AuthTokenClient.js";
import { AuthProfileClient } from "./infrastructure/http/AuthProfileClient.js";
import { TicketProfileHydrator } from "./application/services/TicketProfileHydrator.js";
import { CreateTicket } from "./application/use-cases/CreateTicket.js";
import { ListTickets } from "./application/use-cases/ListTickets.js";
import { ListMyTickets } from "./application/use-cases/ListMyTickets.js";
import { GetTicket } from "./application/use-cases/GetTicket.js";
import { MarkTicketReviewed } from "./application/use-cases/MarkTicketReviewed.js";
import { ReplyToTicket } from "./application/use-cases/ReplyToTicket.js";
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
  const authProfileClient = new AuthProfileClient({
    baseUrl: env.auth.internalBaseUrl,
    internalApiKey: env.auth.internalApiKey,
    timeoutMs: env.auth.tokenVerifyTimeoutMs
  });
  const ticketProfileHydrator = new TicketProfileHydrator({
    authProfileClient
  });

  const createTicket = new CreateTicket({
    ticketRepository
  });

  const listTickets = new ListTickets({
    ticketRepository,
    ticketProfileHydrator
  });

  const listMyTickets = new ListMyTickets({
    ticketRepository,
    ticketProfileHydrator
  });

  const getTicket = new GetTicket({
    ticketRepository,
    ticketProfileHydrator
  });

  const markTicketReviewed = new MarkTicketReviewed({
    ticketRepository,
    ticketProfileHydrator
  });

  const replyToTicket = new ReplyToTicket({
    ticketRepository,
    ticketProfileHydrator
  });

  const ticketController = new TicketController({
    createTicket,
    listTickets,
    listMyTickets,
    getTicket,
    markTicketReviewed,
    replyToTicket
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
