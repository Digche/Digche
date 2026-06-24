export class ChatRealtimeHub {
  constructor() {
    this.connectionSubscriptions = new Map();
    this.conversationConnections = new Map();
  }

  register(connection) {
    this.connectionSubscriptions.set(connection, new Set());

    connection.on("close", () => {
      this.unregister(connection);
    });
  }

  unregister(connection) {
    const subscriptions = this.connectionSubscriptions.get(connection);

    if (subscriptions) {
      for (const conversationId of subscriptions) {
        const connections = this.conversationConnections.get(conversationId);

        if (connections) {
          connections.delete(connection);

          if (connections.size === 0) {
            this.conversationConnections.delete(conversationId);
          }
        }
      }
    }

    this.connectionSubscriptions.delete(connection);
  }

  subscribe(connection, conversationId) {
    if (!this.connectionSubscriptions.has(connection)) {
      this.register(connection);
    }

    this.connectionSubscriptions.get(connection).add(conversationId);

    if (!this.conversationConnections.has(conversationId)) {
      this.conversationConnections.set(conversationId, new Set());
    }

    this.conversationConnections.get(conversationId).add(connection);
  }

  unsubscribe(connection, conversationId) {
    const subscriptions = this.connectionSubscriptions.get(connection);

    if (subscriptions) {
      subscriptions.delete(conversationId);
    }

    const connections = this.conversationConnections.get(conversationId);

    if (connections) {
      connections.delete(connection);

      if (connections.size === 0) {
        this.conversationConnections.delete(conversationId);
      }
    }
  }

  broadcastToConversation(conversationId, event) {
    const connections = this.conversationConnections.get(conversationId);

    if (!connections) {
      return;
    }

    for (const connection of connections) {
      this.send(connection, event);
    }
  }

  send(connection, event) {
    if (connection.readyState !== 1) {
      return;
    }

    connection.send(JSON.stringify(event));
  }
}
