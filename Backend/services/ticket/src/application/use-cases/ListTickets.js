export class ListTickets {
  constructor({ ticketRepository }) {
    this.ticketRepository = ticketRepository;
  }

  async execute() {
    return {
      tickets: await this.ticketRepository.list()
    };
  }
}
