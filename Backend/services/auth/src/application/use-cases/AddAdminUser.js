import { AppError } from "../errors/AppError.js";

import { AdminUser } from "../../domain/entities/AdminUser.js";
import { ADMIN_ROLES } from "../../domain/constants/roles.js";
import { ADMIN_STATUS } from "../../domain/constants/statuses.js";
import { PhoneNumber } from "../../domain/value-objects/PhoneNumber.js";

export class AddAdminUser {
  constructor({ adminUserRepository }) {
    this.adminUserRepository = adminUserRepository;
  }

  async execute({ phone, createdBy }) {
    const normalizedPhone = PhoneNumber.normalize(phone);

    if (!createdBy) {
      throw new AppError("Creator admin id is required", 400, "CREATOR_REQUIRED");
    }

    const existingAdminUser =
      await this.adminUserRepository.findByPhone(normalizedPhone);

    if (existingAdminUser) {
      throw new AppError("Admin user already exists", 409, "ADMIN_ALREADY_EXISTS");
    }

    const adminUser = await this.adminUserRepository.create(
      new AdminUser({
        phone: normalizedPhone,
        role: ADMIN_ROLES.ADMIN,
        status: ADMIN_STATUS.ACTIVE,
        createdBy
      })
    );

    return {
      admin: {
        id: adminUser.id,
        phone: adminUser.phone,
        role: adminUser.role,
        status: adminUser.status,
        createdBy: adminUser.createdBy
      }
    };
  }
}