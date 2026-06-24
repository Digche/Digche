import { ConversationModel } from "./ConversationModel.js";
import { ConversationParticipantModel } from "./ConversationParticipantModel.js";
import { ChatMessageModel } from "./ChatMessageModel.js";

export function initModels() {
  ConversationModel.hasMany(ConversationParticipantModel, {
    foreignKey: "conversationId",
    as: "participants"
  });

  ConversationParticipantModel.belongsTo(ConversationModel, {
    foreignKey: "conversationId",
    as: "conversation"
  });

  ConversationModel.hasMany(ChatMessageModel, {
    foreignKey: "conversationId",
    as: "messages"
  });

  ChatMessageModel.belongsTo(ConversationModel, {
    foreignKey: "conversationId",
    as: "conversation"
  });

  return {
    ConversationModel,
    ConversationParticipantModel,
    ChatMessageModel
  };
}

export {
  ConversationModel,
  ConversationParticipantModel,
  ChatMessageModel
};
