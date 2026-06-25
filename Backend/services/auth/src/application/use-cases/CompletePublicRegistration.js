import { AppError, ForbiddenError, UnauthorizedError } from "../errors/AppError.js";

import { User } from "../../domain/entities/User.js";
import { ChefAccount } from "../../domain/entities/ChefAccount.js";
import { RefreshToken } from "../../domain/entities/RefreshToken.js";

import { USER_ROLES } from "../../domain/constants/roles.js";
import { CHEF_STATUS } from "../../domain/constants/statuses.js";
import { TOKEN_OWNER_TYPES } from "../../domain/constants/tokenOwnerTypes.js";
import { AUTH_SCOPES } from "../../domain/constants/authScopes.js";
import { PUBLIC_AUTH_FLOWS } from "../../domain/constants/authFlows.js";
import { PhoneNumber } from "../../domain/value-objects/PhoneNumber.js";

export class CompletePublicRegistration {
  constructor({
    userRepository,
    chefAccountRepository,
    refreshTokenRepository,
    tokenService,
    refreshTokenExpiresDays
  }) {
    this.userRepository = userRepository;
    this.chefAccountRepository = chefAccountRepository;
    this.refreshTokenRepository = refreshTokenRepository;
    this.tokenService = tokenService;
    this.refreshTokenExpiresDays = refreshTokenExpiresDays;
  }

  async execute({
    registrationToken,
    firstName,
    lastName,
    username
  }) {
    if (!registrationToken) {
      throw new AppError(
        "Registration token is required",
        400,
        "REGISTRATION_TOKEN_REQUIRED"
      );
    }

    const normalizedFirstName = this.normalizeName(
      firstName,
      "FIRST_NAME_REQUIRED"
    );

    const normalizedLastName = this.normalizeName(
      lastName,
      "LAST_NAME_REQUIRED"
    );

    const normalizedUsername = this.normalizeUsername(username);

    let registrationPayload;

    try {
      registrationPayload =
        this.tokenService.verifyRegistrationToken(registrationToken);
    } catch (error) {
      throw new UnauthorizedError("Invalid or expired registration token");
    }

    if (registrationPayload.scope !== "public_registration") {
      throw new UnauthorizedError("Invalid registration token");
    }

    const normalizedPhone = PhoneNumber.normalize(registrationPayload.phone);
    const role = registrationPayload.role;
    const flow = this.normalizeFlow(registrationPayload.flow);

    if (![USER_ROLES.CLIENT, USER_ROLES.CHEF].includes(role)) {
      throw new AppError("Invalid public role", 400, "INVALID_PUBLIC_ROLE");
    }

    let user = await this.userRepository.findByPhone(normalizedPhone);

    if (user && user.hasRole(role) && user.hasCompletedProfile()) {
      throw new AppError(
        "Public account already exists for this phone and role",
        409,
        "PUBLIC_ACCOUNT_ALREADY_EXISTS"
      );
    }

    const existingUsernameUser =
      await this.userRepository.findByUsername(normalizedUsername);

    if (existingUsernameUser && (!user || existingUsernameUser.id !== user.id)) {
      throw new AppError(
        "Username is already in use",
        409,
        "USERNAME_ALREADY_IN_USE"
      );
    }

    if (!user) {
      user = await this.userRepository.create(
        new User({
          phone: normalizedPhone,
          firstName: normalizedFirstName,
          lastName: normalizedLastName,
          username: normalizedUsername,
          address: null,
          roles: []
        })
      );
    } else if (user.hasCompletedProfile()) {
      if (user.username !== normalizedUsername) {
        throw new AppError(
          "User already has completed profile",
          409,
          "USER_PROFILE_ALREADY_COMPLETED"
        );
      }
    } else {
      user = await this.userRepository.completeProfile(user.id, {
        firstName: normalizedFirstName,
        lastName: normalizedLastName,
        username: normalizedUsername
      });
    }

    if (!user.hasRole(role)) {
      await this.userRepository.addRole(user.id, role);
      user.roles = [...user.roles, role];
    }

    const roleData = {};

    if (role === USER_ROLES.CHEF) {
      let chefAccount = await this.chefAccountRepository.findByUserId(user.id);

      if (!chefAccount) {
        chefAccount = await this.chefAccountRepository.create(
          new ChefAccount({
            userId: user.id,
            status: CHEF_STATUS.ACTIVE
          })
        );
      }

      if (chefAccount.isDisabled()) {
        throw new ForbiddenError("Chef account is disabled");
      }

      roleData.chef = {
        status: chefAccount.status
      };
    }

    const accessTokenPayload = {
      sub: user.id,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      profileImageUrl: user.profileImageUrl,
      address: user.address,
      roles: user.roles,
      selectedRole: role,
      scope: AUTH_SCOPES.PUBLIC,
      ...roleData
    };

    const accessToken = this.tokenService.signAccessToken(accessTokenPayload);

    const refreshToken = this.tokenService.generateRefreshToken();
    const refreshTokenHash = this.tokenService.hashRefreshToken(refreshToken);

    const expiresAt = new Date(
      Date.now() + this.refreshTokenExpiresDays * 24 * 60 * 60 * 1000
    );

    await this.refreshTokenRepository.create(
      new RefreshToken({
        ownerId: user.id,
        ownerType: TOKEN_OWNER_TYPES.USER,
        scope: AUTH_SCOPES.PUBLIC,
        selectedRole: role,
        tokenHash: refreshTokenHash,
        expiresAt
      })
    );

    return {
      requiresRegistration: false,
      flow,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        profileImageUrl: user.profileImageUrl,
        address: user.address,
        roles: user.roles,
        selectedRole: role,
        ...roleData
      }
    };
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

  normalizeFlow(flow) {
    const normalizedFlow = String(flow || "").trim();

    if (!Object.values(PUBLIC_AUTH_FLOWS).includes(normalizedFlow)) {
      throw new AppError(
        "Invalid public auth flow",
        400,
        "INVALID_PUBLIC_AUTH_FLOW"
      );
    }

    return normalizedFlow;
  }
}
