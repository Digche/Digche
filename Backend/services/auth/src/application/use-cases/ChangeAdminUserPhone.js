import { AppError, NotFoundError } from "../errors/AppError.js";

import { ADMIN_ROLES } from "../../domain/constants/roles.js";
import { TOKEN_OWNER_TYPES } from "../../domain/constants/tokenOwnerTypes.js";
import { PhoneNumber } from "../../domain/value-objects/PhoneNumber.js";

export class ChangeAdminUserPhone {
  constructor({
    adminUserRepository,
    refreshTokenRepository
  }) {
    this.adminUserRepository = adminUserRepository;
    this.refreshTokenRepository = refreshTokenRepository;
  }

  async execute({ adminId, newPhone, requestedBy }) {
    if (!adminId) {
      throw new AppError("Admin id is required", 400, "ADMIN_ID_REQUIRED");
    }

    if (!requestedBy) {
      throw new AppError("Requester admin id is required", 400, "REQUESTER_REQUIRED");
    }

    if (adminId === requestedBy) {
      throw new AppError(
        "Manager cannot change its own phone from this endpoint",
        400,
        "CANNOT_CHANGE_SELF_PHONE"
      );
    }

    const normalizedNewPhone = PhoneNumber.normalize(newPhone);

    const adminUser = await this.adminUserRepository.findById(adminId);

    if (!adminUser) {
      throw new NotFoundError("Admin user not found");
    }

    if (adminUser.role === ADMIN_ROLES.MANAGER) {
      throw new AppError(
        "Manager phone cannot be changed from this endpoint",
        400,
        "CANNOT_CHANGE_MANAGER_PHONE"
      );
    }

    if (adminUser.phone === normalizedNewPhone) {
      throw new AppError(
        "New phone must be different from current phone",
        400,
        "SAME_PHONE_NUMBER"
      );
    }

    const existingAdminUser =
      await this.adminUserRepository.findByPhone(normalizedNewPhone);

    if (existingAdminUser && existingAdminUser.id !== adminId) {
      throw new AppError(
        "Phone number is already in use",
        409,
        "PHONE_ALREADY_IN_USE"
      );
    }

    await this.adminUserRepository.updatePhone(adminId, normalizedNewPhone);

    const updatedAdminUser =
      await this.adminUserRepository.incrementTokenVersion(adminId);

    await this.refreshTokenRepository.revokeAllForOwner(
      updatedAdminUser.id,
      TOKEN_OWNER_TYPES.ADMIN
    );

    return {
      admin: {
        id: updatedAdminUser.id,
        phone: updatedAdminUser.phone,
        firstName: updatedAdminUser.firstName,
        lastName: updatedAdminUser.lastName,
        username: updatedAdminUser.username,
        role: updatedAdminUser.role,
        status: updatedAdminUser.status,
        photoUrl: updatedAdminUser.photoUrl,
        createdBy: updatedAdminUser.createdBy,
        updatedAt: updatedAdminUser.updatedAt
      }
    };
  }
}
