import express from "express";
import cors from "cors";
import helmet from "helmet";

import { createContainer } from "./container.js";
import { createPublicAuthRoutes } from "./interfaces/http/routes/publicAuthRoutes.js";
import { createAdminAuthRoutes } from "./interfaces/http/routes/adminAuthRoutes.js";
import { createAdminUserRoutes } from "./interfaces/http/routes/adminUserRoutes.js";
import { createChefAdminRoutes } from "./interfaces/http/routes/chefAdminRoutes.js";
import { createInternalAuthRoutes } from "./interfaces/http/routes/internalAuthRoutes.js";
import { requestLogger } from "./interfaces/http/middlewares/requestLogger.js";
import { errorHandler } from "./interfaces/http/middlewares/errorHandler.js";
import { setupSwagger } from "./interfaces/http/swagger.js";

export function createApp() {
  const app = express();

  const container = createContainer();

  app.use(helmet());
  app.use(cors());
  app.use(requestLogger);
  app.use(express.json());

  setupSwagger(app);

  app.get("/health", (req, res) => {
    res.json({
      service: "auth-service",
      status: "ok"
    });
  });

  app.use(
    "/auth",
    createPublicAuthRoutes(
      container.publicAuthController,
      container.publicAuthMiddleware
    )
  );

  app.use(
    "/admin/auth",
    createAdminAuthRoutes(
      container.adminAuthController,
      container.adminAuthMiddleware
    )
  );

  app.use(
    "/admin/admin-users",
    createAdminUserRoutes(
      container.adminUserController,
      container.adminAuthMiddleware
    )
  );

  app.use(
    "/admin/chefs",
    createChefAdminRoutes(
      container.chefAdminController,
      container.adminAuthMiddleware
    )
  );

  app.use(
    "/internal/auth",
    createInternalAuthRoutes(
      container.internalAuthController,
      container.internalAuthMiddleware
    )
  );

  app.use(errorHandler);

  return app;
}
