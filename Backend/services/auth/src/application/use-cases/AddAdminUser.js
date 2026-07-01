import { AppError } from "../errors/AppError.js";

import { AdminUser } from "../../domain/entities/AdminUser.js";
import { ADMIN_ROLES } from "../../domain/constants/roles.js";
import { ADMIN_STATUS } from "../../domain/constants/statuses.js";
import { PhoneNumber } from "../../domain/value-objects/PhoneNumber.js";

export class AddAdminUser {
  constructor({ adminUserRepository }) {
    this.adminUserRepository = adminUserRepository;
  }

  async execute({
    phone,
    firstName = null,
    lastName = null,
    username = null,
    createdBy
  }) {
    const normalizedPhone = PhoneNumber.normalize(phone);
    const normalizedFirstName = this.normalizeOptionalName(firstName);
    const normalizedLastName = this.normalizeOptionalName(lastName);
    const normalizedUsername = this.normalizeOptionalUsername(username);

    if (!createdBy) {
      throw new AppError("Creator admin id is required", 400, "CREATOR_REQUIRED");
    }

    const existingAdminUser =
      await this.adminUserRepository.findByPhone(normalizedPhone);

    if (existingAdminUser) {
      throw new AppError("Admin user already exists", 409, "ADMIN_ALREADY_EXISTS");
    }

    if (normalizedUsername) {
      const existingAdminUsername =
        await this.adminUserRepository.findByUsername(normalizedUsername);

      if (existingAdminUsername) {
        throw new AppError(
          "Username is already in use",
          409,
          "USERNAME_ALREADY_IN_USE"
        );
      }
    }

    const adminUser = await this.adminUserRepository.create(
      new AdminUser({
        phone: normalizedPhone,
        firstName: normalizedFirstName,
        lastName: normalizedLastName,
        username: normalizedUsername,
        role: ADMIN_ROLES.ADMIN,
        status: ADMIN_STATUS.ACTIVE,
        photoUrl: null,
        createdBy
      })
    );

    return {
      admin: {
        id: adminUser.id,
        phone: adminUser.phone,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        username: adminUser.username,
        role: adminUser.role,
        status: adminUser.status,
        photoUrl: adminUser.photoUrl,
        createdBy: adminUser.createdBy
      }
    };
  }

  normalizeOptionalName(value) {
    const normalizedValue = String(value || "").trim();

    if (!normalizedValue) {
      return null;
    }

    if (normalizedValue.length > 100) {
      throw new AppError("Name field is too long", 400, "NAME_TOO_LONG");
    }

    return normalizedValue;
  }

  normalizeOptionalUsername(value) {
    const normalizedUsername = String(value || "").trim();

    if (!normalizedUsername) {
      return null;
    }

    if (normalizedUsername.length < 3) {
      throw new AppError(
        "Username must be at least 3 characters",
        400,
        "USERNAME_TOO_SHORT"
      );
    }

    if (normalizedUsername.length > 50) {
      throw new AppError(
        "Username must be at most 50 characters",
        400,
        "USERNAME_TOO_LONG"
      );
    }

    if (!/^[a-zA-Z0-9_]+$/.test(normalizedUsername)) {
      throw new AppError(
        "Username can only contain letters, numbers and underscore",
        400,
        "INVALID_USERNAME"
      );
    }

    return normalizedUsername;
  }
}
