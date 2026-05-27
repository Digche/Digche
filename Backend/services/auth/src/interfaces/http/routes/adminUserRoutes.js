import { Router } from "express";
import { requireAdminRole } from "../middlewares/requireAdminRole.js";

export function createAdminUserRoutes(controller, adminAuthMiddleware) {
  const router = Router();

  router.post(
    "/",
    adminAuthMiddleware,
    requireAdminRole("manager"),
    controller.add
  );

  return router;
}