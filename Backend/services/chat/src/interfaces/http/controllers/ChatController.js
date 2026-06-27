export class ChatController {
  constructor({
    listConversations,
    startConversation,
    getConversationMessages,
    sendMessage,
    markConversationRead
  }) {
    this.listConversations = listConversations;
    this.startConversation = startConversation;
    this.getConversationMessages = getConversationMessages;
    this.sendMessage = sendMessage;
    this.markConversationRead = markConversationRead;
  }

  health = async (request, reply) => {
    return reply.send({
      service: "chat-service",
      status: "ok"
    });
  };

  list = async (request, reply) => {
    const result = await this.listConversations.execute({
      actor: request.auth
    });

    return reply.send(result);
  };

  create = async (request, reply) => {
    const body = request.body || {};

    const result = await this.startConversation.execute({
      actor: request.auth,
      participantId: body.participantId || body.participant_id,
      participantType: body.participantType || body.participant_type,
      participantDisplayName:
        body.participantDisplayName || body.participant_display_name,
      title: body.title,
      type: body.type,
      orderId: body.orderId || body.order_id
    });

    return reply.code(result.created ? 201 : 200).send(result);
  };

  messages = async (request, reply) => {
    const result = await this.getConversationMessages.execute({
      actor: request.auth,
      conversationId: request.params.conversationId,
      limit: request.query.limit,
      before: request.query.before
    });

    return reply.send(result);
  };

  send = async (request, reply) => {
    const body = request.body || {};

    const result = await this.sendMessage.execute({
      actor: request.auth,
      conversationId: request.params.conversationId,
      body: body.body,
      clientMessageId: body.clientMessageId || body.client_message_id,
      metadata: body.metadata || null
    });

    return reply.code(201).send(result);
  };

  read = async (request, reply) => {
    const body = request.body || {};

    const result = await this.markConversationRead.execute({
      actor: request.auth,
      conversationId: request.params.conversationId,
      lastReadMessageId: body.lastReadMessageId || body.last_read_message_id || null
    });

    return reply.send(result);
  };
}
