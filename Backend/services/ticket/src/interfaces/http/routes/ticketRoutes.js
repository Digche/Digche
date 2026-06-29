import { Router } from "express";

export function createTicketRoutes({
  controller,
  publicAuthMiddleware,
  adminAuthMiddleware
}) {
  const router = Router();

  router.get("/health", controller.health);

  router.post("/", publicAuthMiddleware, controller.create);
  router.get("/me", publicAuthMiddleware, controller.listMine);

  router.get("/", adminAuthMiddleware, controller.list);
  router.get("/:ticketId", adminAuthMiddleware, controller.get);

  router.patch(
    "/:ticketId/review",
    adminAuthMiddleware,
    controller.markReviewed
  );

  router.post(
    "/:ticketId/reply",
    adminAuthMiddleware,
    controller.reply
  );

  return router;
}
