import Fastify from "fastify";
import { WebSocketServer } from "ws";

import { createContainer } from "./container.js";
import { registerChatRoutes } from "./interfaces/http/routes/chatRoutes.js";
import { errorHandler } from "./interfaces/http/middlewares/errorHandler.js";
import { setupSwagger } from "./interfaces/http/swagger.js";

export async function createApp() {
  const app = Fastify({
    logger: true
  });

  const container = createContainer();

  app.addHook("onRequest", async (request, reply) => {
    reply.header("Access-Control-Allow-Origin", "*");
    reply.header("Access-Control-Allow-Headers", "Authorization, Content-Type");
    reply.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    reply.header("X-Content-Type-Options", "nosniff");
    reply.header("X-Frame-Options", "DENY");

    if (request.method === "OPTIONS") {
      return reply.code(204).send();
    }
  });

  setupSwagger(app);

  await registerChatRoutes({
    app,
    controller: container.chatController,
    webSocketController: container.webSocketController,
    authMiddleware: container.authMiddleware
  });

  const webSocketServer = new WebSocketServer({
    noServer: true
  });

  app.server.on("upgrade", (request, socket, head) => {
    const url = new URL(request.url, "http://localhost");

    if (url.pathname !== "/chat/ws") {
      socket.destroy();
      return;
    }

    webSocketServer.handleUpgrade(request, socket, head, (webSocket) => {
      container.webSocketController.handle(webSocket, {
        query: Object.fromEntries(url.searchParams.entries())
      });
    });
  });

  app.setNotFoundHandler((request, reply) => {
    reply.code(404).send({
      error: {
        code: "NOT_FOUND",
        message: "Route not found"
      }
    });
  });

  app.setErrorHandler(errorHandler);

  return app;
}
