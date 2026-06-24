import { DataTypes } from "sequelize";
import { sequelize } from "../sequelize.js";

export const ConversationParticipantModel = sequelize.define(
  "ChatParticipant",
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
    participantId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "participant_id"
    },
    participantType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: "participant_type"
    },
    displayName: {
      type: DataTypes.STRING(150),
      allowNull: true,
      field: "display_name"
    },
    lastReadMessageId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "last_read_message_id"
    },
    lastReadAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "last_read_at"
    }
  },
  {
    tableName: "chat_participants",
    underscored: true,
    timestamps: true
  }
);
