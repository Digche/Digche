# Ticket Service

Simple support ticket service for public users and admins.

## Endpoints

```txt
GET   /tickets/health
POST  /tickets
GET   /tickets
GET   /tickets/{ticketId}
PATCH /tickets/{ticketId}/review
```

Public users with `client` or `chef` selected role can create tickets.
Admins and managers can list, view, and mark tickets as reviewed.

Swagger UI is available at:

```txt
http://localhost:8080/tickets/docs
```
