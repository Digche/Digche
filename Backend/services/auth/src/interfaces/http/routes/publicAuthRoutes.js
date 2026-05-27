import { Router } from "express";

export function createPublicAuthRoutes(controller) {
  const router = Router();

  router.get("/health", controller.health);

  router.post("/request-otp", controller.requestOtp);
  router.post("/verify-otp", controller.verifyOtp);

  router.post("/refresh", controller.refresh);
  router.post("/logout", controller.logout);

  return router;
}