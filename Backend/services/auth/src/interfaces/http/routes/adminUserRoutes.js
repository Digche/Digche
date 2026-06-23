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

  router.get(
    "/",
    adminAuthMiddleware,
    requireAdminRole("manager"),
    controller.list
  );

  router.patch(
    "/:id/phone",
    adminAuthMiddleware,
    requireAdminRole("manager"),
    controller.changePhone
  );

  router.patch(
    "/:id/disable",
    adminAuthMiddleware,
    requireAdminRole("manager"),
    controller.disable
  );

  router.patch(
    "/:id/enable",
    adminAuthMiddleware,
    requireAdminRole("manager"),
    controller.enable
  );

  return router;
}
