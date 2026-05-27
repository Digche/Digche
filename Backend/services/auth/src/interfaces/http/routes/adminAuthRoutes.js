import { Router } from "express";

export function createAdminAuthRoutes(controller, adminAuthMiddleware) {
  const router = Router();

  router.get("/health", controller.health);

  router.post("/request-otp", controller.requestOtp);
  router.post("/verify-otp", controller.verifyOtp);

  router.post("/refresh", controller.refresh);
  router.post("/logout", controller.logout);

  router.get("/me", adminAuthMiddleware, controller.me);

  return router;
}