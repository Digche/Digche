import express from "express";
import cors from "cors";
import helmet from "helmet";

import { createContainer } from "./container.js";
import { createMediaRoutes } from "./interfaces/http/routes/mediaRoutes.js";
import { errorHandler } from "./interfaces/http/middlewares/errorHandler.js";
import { setupSwagger } from "./interfaces/http/swagger.js";
import { env } from "./config/env.js";

export function createApp() {
  const app = express();
  const container = createContainer();

  app.use(helmet());
  app.use(cors(createCorsOptions(env.cors.allowedOrigins)));
  app.use(express.json());

  if (env.docs.enabled) {
    setupSwagger(app);
  }

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

function createCorsOptions(allowedOrigins) {
  return {
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    }
  };
}
