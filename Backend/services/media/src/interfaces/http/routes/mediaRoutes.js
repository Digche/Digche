import { Router } from "express";

export function createMediaRoutes({
  controller,
  authMiddleware,
  internalAuthMiddleware
}) {
  const router = Router();

  router.get("/health", controller.health);

  router.post(
    "/profile-photo/presign",
    authMiddleware,
    controller.presignProfilePhoto
  );

  router.post(
    "/dish-images/presign",
    authMiddleware,
    controller.presignDishImage
  );

  router.post(
    "/internal/images/presign",
    internalAuthMiddleware,
    controller.presignInternalImage
  );

  return router;
}
