# Chat Service

Realtime chat service for one-to-one conversations between authenticated users and admins.

## Endpoints

All REST endpoints require an auth-service access token:

```txt
GET  /chat/health
GET  /chat/conversations
POST /chat/conversations
GET  /chat/conversations/{conversationId}/messages
POST /chat/conversations/{conversationId}/messages
POST /chat/conversations/{conversationId}/read
GET  /chat/ws?token=<access-token>
```

Swagger UI is available at:

```txt
http://localhost:8080/chat/docs
```

OpenAPI YAML is available at:

```txt
http://localhost:8080/chat/openapi.yaml
```

## WebSocket Messages

Connect with:

```txt
ws://localhost:8080/chat/ws?token=<access-token>
```

Client events:

```json
{ "type": "subscribe", "conversationId": "uuid" }
{ "type": "message.send", "conversationId": "uuid", "body": "سلام", "clientMessageId": "optional-client-id" }
{ "type": "typing", "conversationId": "uuid", "isTyping": true }
{ "type": "message.read", "conversationId": "uuid" }
```

Server events:

```json
{ "type": "connection.ready", "actor": { "id": "uuid", "type": "user" } }
{ "type": "conversation.subscribed", "conversationId": "uuid" }
{ "type": "message.created", "message": { "id": "uuid", "body": "سلام" } }
{ "type": "message.read", "conversationId": "uuid", "reader": { "id": "uuid", "type": "user" } }
{ "type": "typing", "conversationId": "uuid", "actor": { "id": "uuid", "type": "user" }, "isTyping": true }
```
