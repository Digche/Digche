export class ListAdminUsers {
  constructor({ adminUserRepository }) {
    this.adminUserRepository = adminUserRepository;
  }

  async execute() {
    const adminUsers = await this.adminUserRepository.list();

    return {
      admins: adminUsers.map((adminUser) => ({
        id: adminUser.id,
        phone: adminUser.phone,
        role: adminUser.role,
        status: adminUser.status,
        createdBy: adminUser.createdBy,
        createdAt: adminUser.createdAt,
        updatedAt: adminUser.updatedAt
      }))
    };
  }
}