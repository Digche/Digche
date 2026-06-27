import { DataTypes } from "sequelize";
import { sequelize } from "../sequelize.js";

export const ChatMessageModel = sequelize.define(
  "ChatMessage",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    conversationId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "conversation_id"
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "sender_id"
    },
    senderType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: "sender_type"
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    clientMessageId: {
      type: DataTypes.STRING(120),
      allowNull: true,
      field: "client_message_id"
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true
    }
  },
  {
    tableName: "chat_messages",
    underscored: true,
    timestamps: true
  }
);
