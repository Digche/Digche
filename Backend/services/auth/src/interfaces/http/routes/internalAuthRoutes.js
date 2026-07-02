import { Router } from "express";

export function createInternalAuthRoutes(controller, internalAuthMiddleware) {
  const router = Router();

  router.post(
    "/tokens/verify",
    internalAuthMiddleware,
    controller.verifyToken
  );

  router.post(
    "/profiles/resolve",
    internalAuthMiddleware,
    controller.resolveProfiles
  );

  router.get(
    "/users/:userId",
    internalAuthMiddleware,
    controller.getUserProfile
  );

  return router;
}
