# Ticket Service

Simple support ticket service for public users and admins.

## Endpoints

```txt
GET   /tickets/health
POST  /tickets
GET   /tickets/me
GET   /tickets
GET   /tickets/{ticketId}
PATCH /tickets/{ticketId}/review
POST  /tickets/{ticketId}/reply
```

Public users with `client` or `chef` selected role can create tickets.
Public users can list only their own tickets with `GET /tickets/me`.
Admins and managers can list, view, mark tickets as reviewed, and add a text reply.

Swagger UI is available at:

```txt
http://localhost:8080/tickets/docs
```
