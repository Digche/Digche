import { Router } from "express";

export function createAdminAuthRoutes(controller) {
  const router = Router();

  router.get("/health", controller.health);

  router.post("/request-otp", controller.requestOtp);
  router.post("/verify-otp", controller.verifyOtp);

  return router;
}