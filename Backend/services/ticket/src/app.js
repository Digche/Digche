import express from "express";
import cors from "cors";
import helmet from "helmet";

import { createContainer } from "./container.js";
import { createTicketRoutes } from "./interfaces/http/routes/ticketRoutes.js";
import { errorHandler } from "./interfaces/http/middlewares/errorHandler.js";
import { setupSwagger } from "./interfaces/http/swagger.js";

export function createApp() {
  const app = express();
  const container = createContainer();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  setupSwagger(app);

  app.use(
    "/tickets",
    createTicketRoutes({
      controller: container.ticketController,
      publicAuthMiddleware: container.publicAuthMiddleware,
      adminAuthMiddleware: container.adminAuthMiddleware
    })
  );

  app.use((req, res) => {
    res.status(404).json({
      error: {
        code: "NOT_FOUND",
        message: "Route not found"
      }
    });
  });

  app.use(errorHandler);

  return app;
}
