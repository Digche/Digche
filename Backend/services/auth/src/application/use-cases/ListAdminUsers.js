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
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        username: adminUser.username,
        role: adminUser.role,
        status: adminUser.status,
        photoUrl: adminUser.photoUrl,
        createdBy: adminUser.createdBy,
        createdAt: adminUser.createdAt,
        updatedAt: adminUser.updatedAt
      }))
    };
  }
}
