import { Router } from "express";
import { requireAdminRole } from "../middlewares/requireAdminRole.js";

export function createAdminAuthRoutes(controller, adminAuthMiddleware) {
  const router = Router();

  router.get("/health", controller.health);

  router.post("/request-otp", controller.requestOtp);
  router.post("/verify-otp", controller.verifyOtp);

  router.post("/refresh", controller.refresh);
  router.post("/logout", controller.logout);

  router.get("/me", adminAuthMiddleware, controller.me);

  router.patch("/me/first-name", adminAuthMiddleware, controller.updateFirstName);
  router.patch("/me/last-name", adminAuthMiddleware, controller.updateLastName);
  router.patch("/me/username", adminAuthMiddleware, controller.updateUsername);

  router.post(
    "/change-phone/request-otp",
    adminAuthMiddleware,
    requireAdminRole("manager"),
    controller.requestPhoneChangeOtp
  );

  router.post(
    "/change-phone/verify",
    adminAuthMiddleware,
    requireAdminRole("manager"),
    controller.verifyPhoneChange
  );

  return router;
}
