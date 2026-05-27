import { AdminUser } from "../../../domain/entities/AdminUser.js";
import { AdminUserModel } from "../models/AdminUserModel.js";
import { ADMIN_STATUS } from "../../../domain/constants/statuses.js";

export class SequelizeAdminUserRepository {
  async findByPhone(phone) {
    const adminUser = await AdminUserModel.findOne({
      where: { phone }
    });

    if (!adminUser) {
      return null;
    }

    return this.toDomain(adminUser);
  }

  async findById(id) {
    const adminUser = await AdminUserModel.findByPk(id);

    if (!adminUser) {
      return null;
    }

    return this.toDomain(adminUser);
  }

  async create(adminUser) {
    const createdAdminUser = await AdminUserModel.create({
      phone: adminUser.phone,
      role: adminUser.role,
      status: adminUser.status,
      createdBy: adminUser.createdBy
    });

    return this.toDomain(createdAdminUser);
  }

  async list() {
    const adminUsers = await AdminUserModel.findAll({
      order: [["createdAt", "DESC"]]
    });

    return adminUsers.map((adminUser) => this.toDomain(adminUser));
  }

  async disable(id) {
    const adminUser = await AdminUserModel.findByPk(id);

    if (!adminUser) {
      return null;
    }

    adminUser.status = ADMIN_STATUS.DISABLED;

    await adminUser.save();

    return this.toDomain(adminUser);
  }

  toDomain(adminUserModel) {
    return new AdminUser({
      id: adminUserModel.id,
      phone: adminUserModel.phone,
      role: adminUserModel.role,
      status: adminUserModel.status,
      createdBy: adminUserModel.createdBy,
      createdAt: adminUserModel.createdAt,
      updatedAt: adminUserModel.updatedAt
    });
  }
}