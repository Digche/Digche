import { CONVERSATION_TYPES } from "../constants/conversationTypes.js";

export class Conversation {
  constructor({
    id = null,
    type = CONVERSATION_TYPES.DIRECT,
    title = null,
    orderId = null,
    lastMessageAt = null,
    createdAt = null,
    updatedAt = null
  }) {
    this.id = id;
    this.type = type;
    this.title = title;
    this.orderId = orderId;
    this.lastMessageAt = lastMessageAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
