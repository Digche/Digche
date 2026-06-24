import { env } from "./config/env.js";

import { SequelizeConversationRepository } from "./infrastructure/database/repositories/SequelizeConversationRepository.js";
import { SequelizeMessageRepository } from "./infrastructure/database/repositories/SequelizeMessageRepository.js";
import { ChatRealtimeHub } from "./infrastructure/realtime/ChatRealtimeHub.js";

import { StartConversation } from "./application/use-cases/StartConversation.js";
import { ListConversations } from "./application/use-cases/ListConversations.js";
import { GetConversationMessages } from "./application/use-cases/GetConversationMessages.js";
import { SendMessage } from "./application/use-cases/SendMessage.js";
import { MarkConversationRead } from "./application/use-cases/MarkConversationRead.js";

import { ChatController } from "./interfaces/http/controllers/ChatController.js";
import { ChatWebSocketController } from "./interfaces/http/controllers/ChatWebSocketController.js";
import { createAuthMiddleware } from "./interfaces/http/middlewares/authMiddleware.js";

export function createContainer() {
  const conversationRepository = new SequelizeConversationRepository();
  const messageRepository = new SequelizeMessageRepository();
  const realtimeHub = new ChatRealtimeHub();

  const startConversation = new StartConversation({
    conversationRepository
  });

  const listConversations = new ListConversations({
    conversationRepository
  });

  const getConversationMessages = new GetConversationMessages({
    conversationRepository,
    messageRepository,
    defaultLimit: env.chat.historyDefaultLimit,
    maxLimit: env.chat.historyMaxLimit
  });

  const sendMessage = new SendMessage({
    conversationRepository,
    messageRepository,
    messageMaxLength: env.chat.messageMaxLength
  });

  const markConversationRead = new MarkConversationRead({
    conversationRepository,
    messageRepository
  });

  const chatController = new ChatController({
    listConversations,
    startConversation,
    getConversationMessages,
    sendMessage,
    markConversationRead
  });

  const webSocketController = new ChatWebSocketController({
    jwtSecret: env.jwt.secret,
    realtimeHub,
    conversationRepository,
    sendMessage,
    markConversationRead
  });

  return {
    chatController,
    webSocketController,
    authMiddleware: createAuthMiddleware({
      jwtSecret: env.jwt.secret
    })
  };
}
