export class TicketController {
  constructor({
    createTicket,
    listTickets,
    getTicket,
    markTicketReviewed
  }) {
    this.createTicket = createTicket;
    this.listTickets = listTickets;
    this.getTicket = getTicket;
    this.markTicketReviewed = markTicketReviewed;
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
}
