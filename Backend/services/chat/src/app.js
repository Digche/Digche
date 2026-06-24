import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import websocket from "@fastify/websocket";

import { createContainer } from "./container.js";
import { registerChatRoutes } from "./interfaces/http/routes/chatRoutes.js";
import { errorHandler } from "./interfaces/http/middlewares/errorHandler.js";
import { setupSwagger } from "./interfaces/http/swagger.js";

export async function createApp() {
  const app = Fastify({
    logger: true
  });

  const container = createContainer();

  await app.register(helmet);
  await app.register(cors, {
    origin: true
  });
  await app.register(websocket);

  setupSwagger(app);

  await registerChatRoutes({
    app,
    controller: container.chatController,
    webSocketController: container.webSocketController,
    authMiddleware: container.authMiddleware
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
