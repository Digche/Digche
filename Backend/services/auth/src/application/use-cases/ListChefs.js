export class ListChefs {
  constructor({ chefAccountRepository }) {
    this.chefAccountRepository = chefAccountRepository;
  }

  async execute() {
    const chefs = await this.chefAccountRepository.listDetailed();

    return {
      chefs: chefs.map((chef) => this.toResponse(chef))
    };
  }

  toResponse(chef) {
    return {
      id: chef.id,
      userId: chef.userId,
      status: chef.status,
      createdAt: chef.createdAt,
      updatedAt: chef.updatedAt,
      user: chef.user
        ? {
            id: chef.user.id,
            phone: chef.user.phone,
            firstName: chef.user.firstName,
            lastName: chef.user.lastName,
            username: chef.user.username,
            photoUrl: chef.user.photoUrl,
            address: chef.user.address,
            roles: chef.user.roles,
            createdAt: chef.user.createdAt,
            updatedAt: chef.user.updatedAt
          }
        : null
    };
  }
}
