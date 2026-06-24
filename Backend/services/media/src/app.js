import express from "express";
import cors from "cors";
import helmet from "helmet";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { createContainer } from "./container.js";
import { createMediaRoutes } from "./interfaces/http/routes/mediaRoutes.js";
import { errorHandler } from "./interfaces/http/middlewares/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const possibleOpenApiPaths = [
  path.resolve(__dirname, "../../../docs/api/media.openapi.yaml"),
  "/docs/api/media.openapi.yaml"
];

export function createApp() {
  const app = express();
  const container = createContainer();
  const openApiPath = possibleOpenApiPaths.find((candidatePath) =>
    fs.existsSync(candidatePath)
  );

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  if (openApiPath) {
    app.get("/media/openapi.yaml", (req, res) => {
      res.sendFile(openApiPath);
    });
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
