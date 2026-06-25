export class ChatRealtimeHub {
  constructor() {
    this.connectionSubscriptions = new Map();
    this.conversationConnections = new Map();
    this.connectionActors = new Map();
    this.actorConnections = new Map();
  }

  register(connection) {
    this.connectionSubscriptions.set(connection, new Set());

    if (connection.auth) {
      const actorKey = this.actorKey(connection.auth);
      this.connectionActors.set(connection, connection.auth);

      if (!this.actorConnections.has(actorKey)) {
        this.actorConnections.set(actorKey, new Set());
      }

      this.actorConnections.get(actorKey).add(connection);
    }

    connection.on("close", () => {
      this.unregister(connection);
    });
  }

  unregister(connection) {
    const subscriptions = this.connectionSubscriptions.get(connection);
    const actor = this.connectionActors.get(connection);

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
    this.connectionActors.delete(connection);

    if (actor) {
      const actorKey = this.actorKey(actor);
      const actorConnections = this.actorConnections.get(actorKey);

      if (actorConnections) {
        actorConnections.delete(connection);

        if (actorConnections.size === 0) {
          this.actorConnections.delete(actorKey);

          if (subscriptions) {
            for (const conversationId of subscriptions) {
              this.broadcastToConversation(conversationId, {
                type: "presence.changed",
                actor: {
                  id: actor.id,
                  type: actor.type,
                  displayName: actor.displayName
                },
                isOnline: false
              });
            }
          }
        }
      }
    }
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

    if (connection.auth) {
      this.broadcastToConversation(conversationId, {
        type: "presence.changed",
        actor: {
          id: connection.auth.id,
          type: connection.auth.type,
          displayName: connection.auth.displayName
        },
        isOnline: true
      });
    }
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

  isActorOnline({ id, type }) {
    return this.actorConnections.has(this.actorKey({ id, type }));
  }

  actorKey(actor) {
    return `${actor.type}:${actor.id}`;
  }
}
