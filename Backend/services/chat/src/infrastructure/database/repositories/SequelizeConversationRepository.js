import { Op } from "sequelize";

import { Conversation } from "../../../domain/entities/Conversation.js";
import { ConversationParticipant } from "../../../domain/entities/ConversationParticipant.js";
import { CONVERSATION_TYPES } from "../../../domain/constants/conversationTypes.js";
import { ConversationModel } from "../models/ConversationModel.js";
import { ConversationParticipantModel } from "../models/ConversationParticipantModel.js";
import { ChatMessageModel } from "../models/ChatMessageModel.js";

export class SequelizeConversationRepository {
  async create({
    type = CONVERSATION_TYPES.DIRECT,
    title = null,
    orderId = null,
    participants
  }) {
    const conversation = await ConversationModel.create(
      {
        type,
        title,
        orderId
      }
    );

    await ConversationParticipantModel.bulkCreate(
      participants.map((participant) => ({
        conversationId: conversation.id,
        participantId: participant.id,
        participantType: participant.type,
        displayName: participant.displayName || null
      }))
    );

    return this.findById(conversation.id);
  }

  async findById(id) {
    const conversation = await ConversationModel.findByPk(id, {
      include: [
        {
          model: ConversationParticipantModel,
          as: "participants"
        }
      ]
    });

    if (!conversation) {
      return null;
    }

    return this.toConversationResponse(conversation);
  }

  async findDirectBetweenParticipants(firstParticipant, secondParticipant) {
    const firstRows = await ConversationParticipantModel.findAll({
      where: {
        participantId: firstParticipant.id,
        participantType: firstParticipant.type
      },
      attributes: ["conversationId"]
    });

    const conversationIds = firstRows.map((row) => row.conversationId);

    if (conversationIds.length === 0) {
      return null;
    }

    const match = await ConversationParticipantModel.findOne({
      where: {
        conversationId: {
          [Op.in]: conversationIds
        },
        participantId: secondParticipant.id,
        participantType: secondParticipant.type
      },
      include: [
        {
          model: ConversationModel,
          as: "conversation",
          where: {
            type: CONVERSATION_TYPES.DIRECT
          },
          include: [
            {
              model: ConversationParticipantModel,
              as: "participants"
            }
          ]
        }
      ]
    });

    if (!match) {
      return null;
    }

    return this.toConversationResponse(match.conversation);
  }

  async listForParticipant({ participantId, participantType }) {
    const participantRows = await ConversationParticipantModel.findAll({
      where: {
        participantId,
        participantType
      },
      include: [
        {
          model: ConversationModel,
          as: "conversation",
          include: [
            {
              model: ConversationParticipantModel,
              as: "participants"
            },
            {
              model: ChatMessageModel,
              as: "messages",
              separate: true,
              limit: 1,
              order: [["createdAt", "DESC"]]
            }
          ]
        }
      ],
      order: [[{ model: ConversationModel, as: "conversation" }, "lastMessageAt", "DESC"]]
    });

    const conversations = participantRows
      .map((row) => row.conversation)
      .filter(Boolean)
      .map((conversation) => this.toConversationResponse(conversation));

    for (const conversation of conversations) {
      const currentParticipant = conversation.participants.find(
        (participant) =>
          participant.participantId === participantId &&
          participant.participantType === participantType
      );

      conversation.unreadCount = await this.countUnreadMessages({
        conversationId: conversation.id,
        participantId,
        participantType,
        lastReadAt: currentParticipant?.lastReadAt || null
      });
    }

    return conversations;
  }

  async isParticipant({ conversationId, participantId, participantType }) {
    const count = await ConversationParticipantModel.count({
      where: {
        conversationId,
        participantId,
        participantType
      }
    });

    return count > 0;
  }

  async touchLastMessage(conversationId, lastMessageAt = new Date()) {
    const [affectedRows] = await ConversationModel.update(
      {
        lastMessageAt
      },
      {
        where: {
          id: conversationId
        }
      }
    );

    return affectedRows > 0;
  }

  async markRead({
    conversationId,
    participantId,
    participantType,
    lastReadMessageId,
    lastReadAt = new Date()
  }) {
    const participant = await ConversationParticipantModel.findOne({
      where: {
        conversationId,
        participantId,
        participantType
      }
    });

    if (!participant) {
      return null;
    }

    participant.lastReadMessageId = lastReadMessageId || participant.lastReadMessageId;
    participant.lastReadAt = lastReadAt;

    await participant.save();

    return this.toParticipant(participant);
  }

  async countUnreadMessages({
    conversationId,
    participantId,
    participantType,
    lastReadAt
  }) {
    const where = {
      conversationId,
      [Op.not]: {
        senderId: participantId,
        senderType: participantType
      }
    };

    if (lastReadAt) {
      where.createdAt = {
        [Op.gt]: lastReadAt
      };
    }

    return ChatMessageModel.count({ where });
  }

  toConversationResponse(conversationModel) {
    const participants = conversationModel.participants
      ? conversationModel.participants.map((participant) =>
          this.toParticipant(participant)
        )
      : [];

    const lastMessage =
      conversationModel.messages && conversationModel.messages[0]
        ? this.toMessageSummary(conversationModel.messages[0])
        : null;

    const conversation = new Conversation({
      id: conversationModel.id,
      type: conversationModel.type,
      title: conversationModel.title,
      orderId: conversationModel.orderId,
      lastMessageAt: conversationModel.lastMessageAt,
      createdAt: conversationModel.createdAt,
      updatedAt: conversationModel.updatedAt
    });

    return {
      ...conversation,
      participants,
      lastMessage
    };
  }

  toParticipant(participantModel) {
    return new ConversationParticipant({
      id: participantModel.id,
      conversationId: participantModel.conversationId,
      participantId: participantModel.participantId,
      participantType: participantModel.participantType,
      displayName: participantModel.displayName,
      lastReadMessageId: participantModel.lastReadMessageId,
      lastReadAt: participantModel.lastReadAt,
      createdAt: participantModel.createdAt,
      updatedAt: participantModel.updatedAt
    });
  }

  toMessageSummary(messageModel) {
    return {
      id: messageModel.id,
      conversationId: messageModel.conversationId,
      senderId: messageModel.senderId,
      senderType: messageModel.senderType,
      body: messageModel.body,
      clientMessageId: messageModel.clientMessageId,
      metadata: messageModel.metadata,
      createdAt: messageModel.createdAt
    };
  }
}
