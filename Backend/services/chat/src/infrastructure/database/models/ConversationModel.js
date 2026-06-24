import { DataTypes } from "sequelize";
import { sequelize } from "../sequelize.js";
import { CONVERSATION_TYPES } from "../../../domain/constants/conversationTypes.js";

export const ConversationModel = sequelize.define(
  "ChatConversation",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: CONVERSATION_TYPES.DIRECT
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "order_id"
    },
    lastMessageAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "last_message_at"
    }
  },
  {
    tableName: "chat_conversations",
    underscored: true,
    timestamps: true
  }
);
