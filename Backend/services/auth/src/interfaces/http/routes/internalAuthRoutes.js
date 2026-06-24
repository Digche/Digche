import { Router } from "express";

export function createInternalAuthRoutes(controller, internalAuthMiddleware) {
  const router = Router();

  router.post(
    "/profiles/resolve",
    internalAuthMiddleware,
    controller.resolveProfiles
  );

  return router;
}
