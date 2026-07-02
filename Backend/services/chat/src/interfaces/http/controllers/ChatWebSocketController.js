import { verifyChatAccessToken } from "../middlewares/authMiddleware.js";

export class ChatWebSocketController {
  constructor({
    authTokenClient,
    realtimeHub,
    conversationRepository,
    sendMessage,
    markConversationRead
  }) {
    this.authTokenClient = authTokenClient;
    this.realtimeHub = realtimeHub;
    this.conversationRepository = conversationRepository;
    this.sendMessage = sendMessage;
    this.markConversationRead = markConversationRead;
  }

  handle = async (connectionOrSocket, request) => {
    const socket = connectionOrSocket.socket || connectionOrSocket;
    const token = request.query?.token;

    let actor;

    try {
      actor = verifyChatAccessToken({
        token,
        authTokenClient: this.authTokenClient
      });
      actor = await actor;
    } catch (error) {
      socket.close(1008, "Unauthorized");
      return;
    }

    socket.auth = actor;
    this.realtimeHub.register(socket);
    this.realtimeHub.send(socket, {
      type: "connection.ready",
      actor: {
        id: actor.id,
        type: actor.type,
        displayName: actor.displayName
      }
    });

    socket.on("message", async (rawMessage) => {
      await this.handleMessage(socket, rawMessage);
    });
  };

  async handleMessage(socket, rawMessage) {
    let payload;

    try {
      payload = JSON.parse(rawMessage.toString());
    } catch (error) {
      return this.sendError(socket, "INVALID_JSON", "WebSocket message must be JSON");
    }

    try {
      if (payload.type === "subscribe") {
        return this.subscribe(socket, payload);
      }

      if (payload.type === "unsubscribe") {
        this.realtimeHub.unsubscribe(socket, payload.conversationId);
        return this.realtimeHub.send(socket, {
          type: "conversation.unsubscribed",
          conversationId: payload.conversationId
        });
      }

      if (payload.type === "message.send") {
        return this.sendChatMessage(socket, payload);
      }

      if (payload.type === "message.read") {
        return this.markRead(socket, payload);
      }

      if (payload.type === "typing") {
        return this.broadcastTyping(socket, payload);
      }

      return this.sendError(socket, "UNKNOWN_EVENT_TYPE", "Unknown WebSocket event type");
    } catch (error) {
      return this.sendError(
        socket,
        error.code || "WEBSOCKET_ERROR",
        error.message || "WebSocket error"
      );
    }
  }

  async subscribe(socket, payload) {
    await this.ensureParticipant(socket, payload.conversationId);

    this.realtimeHub.subscribe(socket, payload.conversationId);
    this.realtimeHub.send(socket, {
      type: "conversation.subscribed",
      conversationId: payload.conversationId
    });
  }

  async sendChatMessage(socket, payload) {
    const result = await this.sendMessage.execute({
      actor: socket.auth,
      conversationId: payload.conversationId,
      body: payload.body,
      clientMessageId: payload.clientMessageId || payload.client_message_id,
      metadata: payload.metadata || null
    });

    this.realtimeHub.subscribe(socket, payload.conversationId);
    this.realtimeHub.broadcastToConversation(payload.conversationId, {
      type: "message.created",
      message: result.message
    });
  }

  async markRead(socket, payload) {
    const result = await this.markConversationRead.execute({
      actor: socket.auth,
      conversationId: payload.conversationId,
      lastReadMessageId: payload.lastReadMessageId || payload.last_read_message_id || null
    });

    this.realtimeHub.broadcastToConversation(payload.conversationId, {
      type: "message.read",
      conversationId: payload.conversationId,
      reader: {
        id: socket.auth.id,
        type: socket.auth.type
      },
      readState: result.readState
    });
  }

  async broadcastTyping(socket, payload) {
    await this.ensureParticipant(socket, payload.conversationId);

    this.realtimeHub.broadcastToConversation(payload.conversationId, {
      type: "typing",
      conversationId: payload.conversationId,
      actor: {
        id: socket.auth.id,
        type: socket.auth.type,
        displayName: socket.auth.displayName
      },
      isTyping: Boolean(payload.isTyping)
    });
  }

  async ensureParticipant(socket, conversationId) {
    const isParticipant = await this.conversationRepository.isParticipant({
      conversationId,
      participantId: socket.auth.id,
      participantType: socket.auth.type
    });

    if (!isParticipant) {
      const error = new Error("You are not a participant in this conversation");
      error.code = "FORBIDDEN";
      throw error;
    }
  }

  sendError(socket, code, message) {
    this.realtimeHub.send(socket, {
      type: "error",
      error: {
        code,
        message
      }
    });
  }
}
