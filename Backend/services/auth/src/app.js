import express from "express";
import cors from "cors";
import helmet from "helmet";

import { createContainer } from "./container.js";
import { createPublicAuthRoutes } from "./interfaces/http/routes/publicAuthRoutes.js";
import { createAdminAuthRoutes } from "./interfaces/http/routes/adminAuthRoutes.js";
import { errorHandler } from "./interfaces/http/middlewares/errorHandler.js";

export function createApp() {
  const app = express();

  const container = createContainer();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.get("/health", (req, res) => {
    res.json({
      service: "auth-service",
      status: "ok"
    });
  });

  app.use("/auth", createPublicAuthRoutes(container.publicAuthController));
  app.use("/admin/auth", createAdminAuthRoutes(container.adminAuthController));

  app.use(errorHandler);

  return app;
}