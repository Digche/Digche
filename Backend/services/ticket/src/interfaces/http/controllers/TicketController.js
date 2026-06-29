export class TicketController {
  constructor({
    createTicket,
    listTickets,
    listMyTickets,
    getTicket,
    markTicketReviewed,
    replyToTicket
  }) {
    this.createTicket = createTicket;
    this.listTickets = listTickets;
    this.listMyTickets = listMyTickets;
    this.getTicket = getTicket;
    this.markTicketReviewed = markTicketReviewed;
    this.replyToTicket = replyToTicket;
  }

  health = (req, res) => {
    res.json({
      service: "ticket-service",
      status: "ok"
    });
  };

  create = async (req, res, next) => {
    try {
      const result = await this.createTicket.execute({
        actor: req.auth,
        subject: req.body.subject,
        description: req.body.description
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  list = async (req, res, next) => {
    try {
      const result = await this.listTickets.execute();

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  listMine = async (req, res, next) => {
    try {
      const result = await this.listMyTickets.execute({
        actor: req.auth
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  get = async (req, res, next) => {
    try {
      const result = await this.getTicket.execute({
        ticketId: req.params.ticketId
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  markReviewed = async (req, res, next) => {
    try {
      const result = await this.markTicketReviewed.execute({
        ticketId: req.params.ticketId
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  reply = async (req, res, next) => {
    try {
      const result = await this.replyToTicket.execute({
        actor: req.auth,
        ticketId: req.params.ticketId,
        replyText:
          req.body.replyText ||
          req.body.reply_text ||
          req.body.reply ||
          req.body.text
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
