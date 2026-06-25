export async function registerChatRoutes({
  app,
  controller,
  webSocketController,
  authMiddleware
}) {
  app.get("/chat/health", controller.health);

  app.get(
    "/chat/conversations",
    {
      preHandler: authMiddleware
    },
    controller.list
  );

  app.post(
    "/chat/conversations",
    {
      preHandler: authMiddleware
    },
    controller.create
  );

  app.get(
    "/chat/conversations/:conversationId/messages",
    {
      preHandler: authMiddleware
    },
    controller.messages
  );

  app.post(
    "/chat/conversations/:conversationId/messages",
    {
      preHandler: authMiddleware
    },
    controller.send
  );

  app.post(
    "/chat/conversations/:conversationId/read",
    {
      preHandler: authMiddleware
    },
    controller.read
  );

  app.get(
    "/chat/ws",
    {
      websocket: true
    },
    webSocketController.handle
  );
}
