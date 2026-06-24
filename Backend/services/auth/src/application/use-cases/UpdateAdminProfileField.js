import { AppError, ForbiddenError, UnauthorizedError } from "../errors/AppError.js";

import { AUTH_SCOPES } from "../../domain/constants/authScopes.js";

const ADMIN_PROFILE_FIELDS = {
  FIRST_NAME: "firstName",
  LAST_NAME: "lastName",
  USERNAME: "username",
  PHOTO_URL: "photoUrl"
};

export class UpdateAdminProfileField {
  constructor({
    adminUserRepository,
    tokenService
  }) {
    this.adminUserRepository = adminUserRepository;
    this.tokenService = tokenService;
  }

  async execute({ adminId, field, value }) {
    if (!adminId) {
      throw new AppError("Admin id is required", 400, "ADMIN_ID_REQUIRED");
    }

    if (!Object.values(ADMIN_PROFILE_FIELDS).includes(field)) {
      throw new AppError("Invalid admin profile field", 400, "INVALID_PROFILE_FIELD");
    }

    const adminUser = await this.adminUserRepository.findById(adminId);

    if (!adminUser) {
      throw new UnauthorizedError("Admin user not found");
    }

    if (!adminUser.isActive()) {
      throw new ForbiddenError("Admin user is disabled");
    }

    const normalizedValue = await this.normalizeValue({ adminUser, field, value });

    const updatedAdminUser = await this.adminUserRepository.updateProfileField(
      adminUser.id,
      field,
      normalizedValue
    );

    const accessTokenPayload = {
      sub: updatedAdminUser.id,
      phone: updatedAdminUser.phone,
      firstName: updatedAdminUser.firstName,
      lastName: updatedAdminUser.lastName,
      username: updatedAdminUser.username,
      role: updatedAdminUser.role,
      photoUrl: updatedAdminUser.photoUrl,
      scope: AUTH_SCOPES.ADMIN,
      isManager: updatedAdminUser.isManager()
    };

    const accessToken = this.tokenService.signAccessToken(accessTokenPayload);

    return {
      accessToken,
      admin: {
        id: updatedAdminUser.id,
        phone: updatedAdminUser.phone,
        firstName: updatedAdminUser.firstName,
        lastName: updatedAdminUser.lastName,
        username: updatedAdminUser.username,
        role: updatedAdminUser.role,
        photoUrl: updatedAdminUser.photoUrl,
        isManager: updatedAdminUser.isManager()
      }
    };
  }

  async normalizeValue({ adminUser, field, value }) {
    if (field === ADMIN_PROFILE_FIELDS.FIRST_NAME) {
      return this.normalizeName(value, "FIRST_NAME_REQUIRED");
    }

    if (field === ADMIN_PROFILE_FIELDS.LAST_NAME) {
      return this.normalizeName(value, "LAST_NAME_REQUIRED");
    }

    if (field === ADMIN_PROFILE_FIELDS.PHOTO_URL) {
      return this.normalizePhotoUrl(value);
    }

    const normalizedUsername = this.normalizeUsername(value);
    const existingAdminUser =
      await this.adminUserRepository.findByUsername(normalizedUsername);

    if (existingAdminUser && existingAdminUser.id !== adminUser.id) {
      throw new AppError(
        "Username is already in use",
        409,
        "USERNAME_ALREADY_IN_USE"
      );
    }

    return normalizedUsername;
  }

  normalizePhotoUrl(value) {
    const normalizedPhotoUrl = String(value || "").trim();

    if (!normalizedPhotoUrl) {
      return null;
    }

    if (normalizedPhotoUrl.length > 2048) {
      throw new AppError(
        "Photo URL must be at most 2048 characters",
        400,
        "PHOTO_URL_TOO_LONG"
      );
    }

    try {
      const parsedUrl = new URL(normalizedPhotoUrl);

      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("Invalid protocol");
      }
    } catch (error) {
      throw new AppError("Photo URL is invalid", 400, "INVALID_PHOTO_URL");
    }

    return normalizedPhotoUrl;
  }

  normalizeName(value, errorCode) {
    const normalizedValue = String(value || "").trim();

    if (!normalizedValue) {
      throw new AppError("Name field is required", 400, errorCode);
    }

    if (normalizedValue.length > 100) {
      throw new AppError("Name field is too long", 400, "NAME_TOO_LONG");
    }

    return normalizedValue;
  }

  normalizeUsername(value) {
    const normalizedUsername = String(value || "").trim();

    if (!normalizedUsername) {
      throw new AppError("Username is required", 400, "USERNAME_REQUIRED");
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
