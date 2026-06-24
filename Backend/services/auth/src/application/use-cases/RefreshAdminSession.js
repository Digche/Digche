import { AppError, UnauthorizedError, ForbiddenError } from "../errors/AppError.js";

import { RefreshToken } from "../../domain/entities/RefreshToken.js";

import { TOKEN_OWNER_TYPES } from "../../domain/constants/tokenOwnerTypes.js";
import { AUTH_SCOPES } from "../../domain/constants/authScopes.js";

export class RefreshAdminSession {
  constructor({
    adminUserRepository,
    refreshTokenRepository,
    tokenService,
    refreshTokenExpiresDays
  }) {
    this.adminUserRepository = adminUserRepository;
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
      storedRefreshToken.ownerType !== TOKEN_OWNER_TYPES.ADMIN ||
      storedRefreshToken.scope !== AUTH_SCOPES.ADMIN
    ) {
      throw new UnauthorizedError("Invalid refresh token scope");
    }

    const adminUser =
      await this.adminUserRepository.findById(storedRefreshToken.ownerId);

    if (!adminUser) {
      throw new UnauthorizedError("Admin user not found");
    }

    if (!adminUser.isActive()) {
      throw new ForbiddenError("Admin user is disabled");
    }

    await this.refreshTokenRepository.revoke(storedRefreshToken.id);

    const accessTokenPayload = {
      sub: adminUser.id,
      phone: adminUser.phone,
      firstName: adminUser.firstName,
      lastName: adminUser.lastName,
      username: adminUser.username,
      role: adminUser.role,
      photoUrl: adminUser.photoUrl,
      scope: AUTH_SCOPES.ADMIN,
      isManager: adminUser.isManager()
    };

    const accessToken = this.tokenService.signAccessToken(accessTokenPayload);

    const newRefreshToken = this.tokenService.generateRefreshToken();
    const newRefreshTokenHash =
      this.tokenService.hashRefreshToken(newRefreshToken);

    const expiresAt = new Date(
      Date.now() + this.refreshTokenExpiresDays * 24 * 60 * 60 * 1000
    );

    await this.refreshTokenRepository.create(
      new RefreshToken({
        ownerId: adminUser.id,
        ownerType: TOKEN_OWNER_TYPES.ADMIN,
        scope: AUTH_SCOPES.ADMIN,
        selectedRole: adminUser.role,
        tokenHash: newRefreshTokenHash,
        expiresAt
      })
    );

    return {
      accessToken,
      refreshToken: newRefreshToken,
      admin: {
        id: adminUser.id,
        phone: adminUser.phone,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        username: adminUser.username,
        role: adminUser.role,
        photoUrl: adminUser.photoUrl,
        isManager: adminUser.isManager()
      }
    };
  }
}
