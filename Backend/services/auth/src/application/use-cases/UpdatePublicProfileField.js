import { AppError, ForbiddenError, UnauthorizedError } from "../errors/AppError.js";

import { USER_ROLES } from "../../domain/constants/roles.js";
import { AUTH_SCOPES } from "../../domain/constants/authScopes.js";

const PUBLIC_PROFILE_FIELDS = {
  FIRST_NAME: "firstName",
  LAST_NAME: "lastName",
  USERNAME: "username",
  PHOTO_URL: "photoUrl",
  ADDRESS: "address"
};

export class UpdatePublicProfileField {
  constructor({
    userRepository,
    chefAccountRepository,
    tokenService,
    allowedPhotoUrlOrigins = []
  }) {
    this.userRepository = userRepository;
    this.chefAccountRepository = chefAccountRepository;
    this.tokenService = tokenService;
    this.allowedPhotoUrlOrigins = allowedPhotoUrlOrigins;
  }

  async execute({ userId, selectedRole, field, value }) {
    if (!userId) {
      throw new AppError("User id is required", 400, "USER_ID_REQUIRED");
    }

    if (![USER_ROLES.CLIENT, USER_ROLES.CHEF].includes(selectedRole)) {
      throw new AppError("Invalid public role", 400, "INVALID_PUBLIC_ROLE");
    }

    if (!Object.values(PUBLIC_PROFILE_FIELDS).includes(field)) {
      throw new AppError("Invalid profile field", 400, "INVALID_PROFILE_FIELD");
    }

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    if (!user.hasRole(selectedRole)) {
      throw new ForbiddenError("User does not have selected role");
    }

    const normalizedValue = await this.normalizeValue({ user, field, value });

    const updatedUser = await this.userRepository.updateProfileField(
      user.id,
      field,
      normalizedValue
    );

    const roleData = {};

    if (selectedRole === USER_ROLES.CHEF) {
      const chefAccount = await this.chefAccountRepository.findByUserId(user.id);

      if (!chefAccount) {
        throw new ForbiddenError("Chef account not found");
      }

      if (chefAccount.isSuspended()) {
        throw new ForbiddenError("Chef account is suspended");
      }

      roleData.chef = {
        status: chefAccount.status
      };
    }

    const accessTokenPayload = {
      sub: updatedUser.id,
      phone: updatedUser.phone,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      username: updatedUser.username,
      photoUrl: updatedUser.photoUrl,
      address: updatedUser.address,
      roles: updatedUser.roles,
      selectedRole,
      scope: AUTH_SCOPES.PUBLIC,
      tokenVersion: updatedUser.tokenVersion || 0,
      ...roleData
    };

    const accessToken = this.tokenService.signAccessToken(accessTokenPayload);

    return {
      accessToken,
      user: {
        id: updatedUser.id,
        phone: updatedUser.phone,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        username: updatedUser.username,
        photoUrl: updatedUser.photoUrl,
        address: updatedUser.address,
        roles: updatedUser.roles,
        selectedRole,
        tokenVersion: updatedUser.tokenVersion || 0,
        ...roleData
      }
    };
  }

  async normalizeValue({ user, field, value }) {
    if (field === PUBLIC_PROFILE_FIELDS.FIRST_NAME) {
      return this.normalizeName(value, "FIRST_NAME_REQUIRED");
    }

    if (field === PUBLIC_PROFILE_FIELDS.LAST_NAME) {
      return this.normalizeName(value, "LAST_NAME_REQUIRED");
    }

    if (field === PUBLIC_PROFILE_FIELDS.USERNAME) {
      const normalizedUsername = this.normalizeUsername(value);
      const existingUsernameUser =
        await this.userRepository.findByUsername(normalizedUsername);

      if (existingUsernameUser && existingUsernameUser.id !== user.id) {
        throw new AppError(
          "Username is already in use",
          409,
          "USERNAME_ALREADY_IN_USE"
        );
      }

      return normalizedUsername;
    }

    if (field === PUBLIC_PROFILE_FIELDS.PHOTO_URL) {
      return this.normalizePhotoUrl(value);
    }

    return this.normalizeAddress(value);
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

  normalizeAddress(value) {
    const normalizedAddress = String(value || "").trim();

    if (!normalizedAddress) {
      return null;
    }

    if (normalizedAddress.length > 500) {
      throw new AppError(
        "Address must be at most 500 characters",
        400,
        "ADDRESS_TOO_LONG"
      );
    }

    return normalizedAddress;
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

      if (
        this.allowedPhotoUrlOrigins.length > 0 &&
        !this.allowedPhotoUrlOrigins.includes(parsedUrl.origin)
      ) {
        throw new Error("Photo URL origin is not allowed");
      }
    } catch (error) {
      throw new AppError("Photo URL is invalid", 400, "INVALID_PHOTO_URL");
    }

    return normalizedPhotoUrl;
  }
}
