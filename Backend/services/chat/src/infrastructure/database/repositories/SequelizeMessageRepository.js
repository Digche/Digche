import { Op } from "sequelize";

import { ChatMessage } from "../../../domain/entities/ChatMessage.js";
import { ChatMessageModel } from "../models/ChatMessageModel.js";

export class SequelizeMessageRepository {
  async create(message) {
    const createdMessage = await ChatMessageModel.create({
      conversationId: message.conversationId,
      senderId: message.senderId,
      senderType: message.senderType,
      body: message.body,
      clientMessageId: message.clientMessageId,
      metadata: message.metadata
    });

    return this.toDomain(createdMessage);
  }

  async listByConversation({ conversationId, limit, before = null }) {
    const where = {
      conversationId
    };

    if (before) {
      where.createdAt = {
        [Op.lt]: before
      };
    }

    const messages = await ChatMessageModel.findAll({
      where,
      order: [["createdAt", "DESC"]],
      limit
    });

    return messages
      .map((message) => this.toDomain(message))
      .reverse();
  }

  async findLatestInConversation(conversationId) {
    const message = await ChatMessageModel.findOne({
      where: {
        conversationId
      },
      order: [["createdAt", "DESC"]]
    });

    if (!message) {
      return null;
    }

    return this.toDomain(message);
  }

  toDomain(messageModel) {
    return new ChatMessage({
      id: messageModel.id,
      conversationId: messageModel.conversationId,
      senderId: messageModel.senderId,
      senderType: messageModel.senderType,
      body: messageModel.body,
      clientMessageId: messageModel.clientMessageId,
      metadata: messageModel.metadata,
      createdAt: messageModel.createdAt
    });
  }
}
