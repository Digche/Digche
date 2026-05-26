import express from "express";
import cors from "cors";
import helmet from "helmet";

import publicAuthRoutes from "./interfaces/http/routes/publicAuthRoutes.js";
import adminAuthRoutes from "./interfaces/http/routes/adminAuthRoutes.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.get("/health", (req, res) => {
    res.json({
      service: "auth-service",
      status: "ok"
    });
  });

  app.use("/auth", publicAuthRoutes);
  app.use("/admin/auth", adminAuthRoutes);

  return app;
}