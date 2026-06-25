import { AdminUser } from "../../../src/domain/entities/AdminUser.js";
import { ADMIN_STATUS } from "../../../src/domain/constants/statuses.js";

export class FakeAdminUserRepository {
  constructor({ adminUsers = [] } = {}) {
    this.adminUsers = adminUsers.map((adminUser) => this.toAdminUser(adminUser));
    this.createdAdminUsers = [];
    this.updatedPhones = [];
    this.updatedProfileFields = [];
    this.disabledIds = [];
    this.enabledIds = [];
  }

  toAdminUser(adminUser) {
    if (adminUser instanceof AdminUser) {
      return adminUser;
    }

    return new AdminUser(adminUser);
  }

  async findByPhone(phone) {
    return this.adminUsers.find((adminUser) => adminUser.phone === phone) || null;
  }

  async findById(id) {
    return this.adminUsers.find((adminUser) => adminUser.id === id) || null;
  }

  async findByUsername(username) {
    return this.adminUsers.find((adminUser) => adminUser.username === username) || null;
  }

  async create(adminUser) {
    const createdAdminUser = new AdminUser({
      id: adminUser.id || `admin-${this.adminUsers.length + 1}`,
      phone: adminUser.phone,
      firstName: adminUser.firstName,
      lastName: adminUser.lastName,
      username: adminUser.username,
      role: adminUser.role,
      status: adminUser.status,
      profileImageUrl: adminUser.profileImageUrl,
      createdBy: adminUser.createdBy,
      createdAt: adminUser.createdAt || new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: adminUser.updatedAt || new Date("2026-01-01T00:00:00.000Z")
    });

    this.adminUsers.push(createdAdminUser);
    this.createdAdminUsers.push(createdAdminUser);

    return createdAdminUser;
  }

  async list() {
    return [...this.adminUsers];
  }

  async updateProfileField(id, field, value) {
    const adminUser = await this.findById(id);

    if (!adminUser) {
      return null;
    }

    adminUser[field] = value;
    adminUser.updatedAt = new Date("2026-01-05T00:00:00.000Z");
    this.updatedProfileFields.push({ id, field, value });

    return adminUser;
  }

  async updatePhone(id, newPhone) {
    const adminUser = await this.findById(id);

    if (!adminUser) {
      return null;
    }

    adminUser.phone = newPhone;
    adminUser.updatedAt = new Date("2026-01-02T00:00:00.000Z");
    this.updatedPhones.push({ id, newPhone });

    return adminUser;
  }

  async disable(id) {
    const adminUser = await this.findById(id);

    if (!adminUser) {
      return null;
    }

    adminUser.status = ADMIN_STATUS.DISABLED;
    adminUser.updatedAt = new Date("2026-01-03T00:00:00.000Z");
    this.disabledIds.push(id);

    return adminUser;
  }

  async enable(id) {
    const adminUser = await this.findById(id);

    if (!adminUser) {
      return null;
    }

    adminUser.status = ADMIN_STATUS.ACTIVE;
    adminUser.updatedAt = new Date("2026-01-04T00:00:00.000Z");
    this.enabledIds.push(id);

    return adminUser;
  }
}
