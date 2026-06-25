import { Router } from "express";
import { requireAdminRole } from "../middlewares/requireAdminRole.js";

export function createChefAdminRoutes(controller, adminAuthMiddleware) {
  const router = Router();

  router.get(
    "/",
    adminAuthMiddleware,
    requireAdminRole("admin", "manager"),
    controller.list
  );

  router.patch(
    "/:userId/suspend",
    adminAuthMiddleware,
    requireAdminRole("admin", "manager"),
    controller.suspend
  );

  router.patch(
    "/:userId/activate",
    adminAuthMiddleware,
    requireAdminRole("admin", "manager"),
    controller.activate
  );

  return router;
}
