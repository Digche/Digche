import { AppError, NotFoundError } from "../errors/AppError.js";
import { ADMIN_ROLES } from "../../domain/constants/roles.js";

export class DisableAdminUser {
  constructor({ adminUserRepository }) {
    this.adminUserRepository = adminUserRepository;
  }

  async execute({ adminId, requestedBy }) {
    if (!adminId) {
      throw new AppError("Admin id is required", 400, "ADMIN_ID_REQUIRED");
    }

    if (!requestedBy) {
      throw new AppError("Requester admin id is required", 400, "REQUESTER_REQUIRED");
    }

    if (adminId === requestedBy) {
      throw new AppError("Manager cannot disable itself", 400, "CANNOT_DISABLE_SELF");
    }

    const adminUser = await this.adminUserRepository.findById(adminId);

    if (!adminUser) {
      throw new NotFoundError("Admin user not found");
    }

    if (adminUser.role === ADMIN_ROLES.MANAGER) {
      throw new AppError("Manager cannot be disabled from this endpoint", 400, "CANNOT_DISABLE_MANAGER");
    }

    const disabledAdminUser = await this.adminUserRepository.disable(adminId);

    return {
      admin: {
        id: disabledAdminUser.id,
        phone: disabledAdminUser.phone,
        role: disabledAdminUser.role,
        status: disabledAdminUser.status,
        createdBy: disabledAdminUser.createdBy,
        updatedAt: disabledAdminUser.updatedAt
      }
    };
  }
}