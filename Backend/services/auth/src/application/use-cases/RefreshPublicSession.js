import { AppError, ForbiddenError, UnauthorizedError } from "../errors/AppError.js";

import { RefreshToken } from "../../domain/entities/RefreshToken.js";

import { USER_ROLES } from "../../domain/constants/roles.js";
import { TOKEN_OWNER_TYPES } from "../../domain/constants/tokenOwnerTypes.js";
import { AUTH_SCOPES } from "../../domain/constants/authScopes.js";

export class RefreshPublicSession {
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

  async execute({ refreshToken }) {
    if (!refreshToken) {
      throw new AppError("Refresh token is required", 400, "REFRESH_TOKEN_REQUIRED");
    }

    const refreshTokenHash = this.tokenService.hashRefreshToken(refreshToken);

    const storedRefreshToken =
      await this.refreshTokenRepository.findByTokenHash(refreshTokenHash);

    if (!storedRefreshToken || !storedRefreshToken.canBeUsed()) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    if (
      storedRefreshToken.ownerType !== TOKEN_OWNER_TYPES.USER ||
      storedRefreshToken.scope !== AUTH_SCOPES.PUBLIC
    ) {
      throw new UnauthorizedError("Invalid refresh token scope");
    }

    const selectedRole = storedRefreshToken.selectedRole;

    if (![USER_ROLES.CLIENT, USER_ROLES.CHEF].includes(selectedRole)) {
      throw new UnauthorizedError("Invalid refresh token role");
    }

    const user = await this.userRepository.findById(storedRefreshToken.ownerId);

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    if (!user.hasRole(selectedRole)) {
      throw new ForbiddenError("User does not have selected role");
    }

    if (!user.hasCompletedProfile()) {
      throw new ForbiddenError("User profile is not completed");
    }

    const roleData = {};

    if (selectedRole === USER_ROLES.CHEF) {
      const chefAccount = await this.chefAccountRepository.findByUserId(user.id);

      if (!chefAccount) {
        throw new ForbiddenError("Chef account not found");
      }

      if (chefAccount.isDisabled()) {
        throw new ForbiddenError("Chef account is disabled");
      }

      roleData.chef = {
        status: chefAccount.status
      };
    }

    await this.refreshTokenRepository.revoke(storedRefreshToken.id);

    const newAccessTokenPayload = {
      sub: user.id,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      roles: user.roles,
      selectedRole,
      scope: AUTH_SCOPES.PUBLIC,
      ...roleData
    };

    const accessToken =
      this.tokenService.signAccessToken(newAccessTokenPayload);

    const newRefreshToken = this.tokenService.generateRefreshToken();
    const newRefreshTokenHash =
      this.tokenService.hashRefreshToken(newRefreshToken);

    const expiresAt = new Date(
      Date.now() + this.refreshTokenExpiresDays * 24 * 60 * 60 * 1000
    );

    await this.refreshTokenRepository.create(
      new RefreshToken({
        ownerId: user.id,
        ownerType: TOKEN_OWNER_TYPES.USER,
        scope: AUTH_SCOPES.PUBLIC,
        selectedRole,
        tokenHash: newRefreshTokenHash,
        expiresAt
      })
    );

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        roles: user.roles,
        selectedRole,
        ...roleData
      }
    };
  }
}