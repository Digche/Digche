import { AppError, NotFoundError } from "../errors/AppError.js";
import { ADMIN_ROLES } from "../../domain/constants/roles.js";

export class EnableAdminUser {
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
      throw new AppError("Manager cannot enable itself", 400, "CANNOT_ENABLE_SELF");
    }

    const adminUser = await this.adminUserRepository.findById(adminId);

    if (!adminUser) {
      throw new NotFoundError("Admin user not found");
    }

    if (adminUser.role === ADMIN_ROLES.MANAGER) {
      throw new AppError("Manager cannot be enabled from this endpoint", 400, "CANNOT_ENABLE_MANAGER");
    }

    const enabledAdminUser = await this.adminUserRepository.enable(adminId);

    return {
      admin: {
        id: enabledAdminUser.id,
        phone: enabledAdminUser.phone,
        firstName: enabledAdminUser.firstName,
        lastName: enabledAdminUser.lastName,
        username: enabledAdminUser.username,
        role: enabledAdminUser.role,
        status: enabledAdminUser.status,
        photoUrl: enabledAdminUser.photoUrl,
        createdBy: enabledAdminUser.createdBy,
        updatedAt: enabledAdminUser.updatedAt
      }
    };
  }
}
