import express from "express";
import cors from "cors";
import helmet from "helmet";

import { createContainer } from "./container.js";
import { createMediaRoutes } from "./interfaces/http/routes/mediaRoutes.js";
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
    "/media",
    createMediaRoutes({
      controller: container.mediaController,
      authMiddleware: container.authMiddleware,
      internalAuthMiddleware: container.internalAuthMiddleware
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
