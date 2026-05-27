import { Router } from "express";

export function createPublicAuthRoutes(controller, publicAuthMiddleware) {
  const router = Router();

  router.get("/health", controller.health);

  router.post("/request-otp", controller.requestOtp);
  router.post("/verify-otp", controller.verifyOtp);

  router.post("/refresh", controller.refresh);
  router.post("/logout", controller.logout);

  router.get("/me", publicAuthMiddleware, controller.me);

  return router;
}