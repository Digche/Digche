import { describe, expect, it } from "vitest";

import { RefreshAdminSession } from "../../../src/application/use-cases/RefreshAdminSession.js";
import { ADMIN_ROLES } from "../../../src/domain/constants/roles.js";
import { ADMIN_STATUS } from "../../../src/domain/constants/statuses.js";
import { AUTH_SCOPES } from "../../../src/domain/constants/authScopes.js";
import { TOKEN_OWNER_TYPES } from "../../../src/domain/constants/tokenOwnerTypes.js";

import { FakeAdminUserRepository } from "../fakes/FakeAdminUserRepository.js";
import { FakeRefreshTokenRepository } from "../fakes/FakeRefreshTokenRepository.js";
import { FakeTokenService } from "../fakes/FakeTokenService.js";
import { makeRefreshToken } from "../helpers/makeRefreshToken.js";
import { expectAppError } from "../helpers/expectAppError.js";

function makeUseCase({ adminUsers = [], refreshTokens = [] } = {}) {
  const adminUserRepository = new FakeAdminUserRepository({ adminUsers });
  const refreshTokenRepository = new FakeRefreshTokenRepository({ refreshTokens });
  const tokenService = new FakeTokenService();

  const useCase = new RefreshAdminSession({
    adminUserRepository,
    refreshTokenRepository,
    tokenService,
    refreshTokenExpiresDays: 30
  });

  return { useCase, refreshTokenRepository, tokenService };
}

describe("RefreshAdminSession", () => {
  it("rotates a valid admin refresh token", async () => {
    const { useCase, refreshTokenRepository, tokenService } = makeUseCase({
      adminUsers: [
        {
          id: "manager-1",
          phone: "+989121234567",
          role: ADMIN_ROLES.MANAGER,
          status: ADMIN_STATUS.ACTIVE
        }
      ],
      refreshTokens: [
        makeRefreshToken({
          id: "refresh-old",
          ownerId: "manager-1",
          ownerType: TOKEN_OWNER_TYPES.ADMIN,
          scope: AUTH_SCOPES.ADMIN,
          selectedRole: ADMIN_ROLES.MANAGER,
          token: "old-refresh-token"
        })
      ]
    });

    const result = await useCase.execute({ refreshToken: "old-refresh-token" });

    expect(result).toMatchObject({
      accessToken: "access-token-1",
      refreshToken: "refresh-token-1",
      admin: {
        id: "manager-1",
        phone: "+989121234567",
        role: ADMIN_ROLES.MANAGER,
        isManager: true
      }
    });
    expect(refreshTokenRepository.revokedIds).toEqual(["refresh-old"]);
    expect(refreshTokenRepository.createdRefreshTokens[0]).toMatchObject({
      ownerId: "manager-1",
      ownerType: TOKEN_OWNER_TYPES.ADMIN,
      scope: AUTH_SCOPES.ADMIN,
      selectedRole: ADMIN_ROLES.MANAGER,
      tokenHash: "hash:refresh-token-1"
    });
    expect(tokenService.signedPayloads[0]).toMatchObject({
      sub: "manager-1",
      scope: AUTH_SCOPES.ADMIN,
      isManager: true
    });
  });

  it("rejects public-scoped refresh token", async () => {
    const { useCase } = makeUseCase({
      refreshTokens: [
        makeRefreshToken({
          id: "refresh-public",
          ownerId: "user-1",
          ownerType: TOKEN_OWNER_TYPES.USER,
          scope: AUTH_SCOPES.PUBLIC,
          selectedRole: "client",
          token: "public-refresh-token"
        })
      ]
    });

    await expectAppError(useCase.execute({ refreshToken: "public-refresh-token" }), {
      statusCode: 401,
      code: "UNAUTHORIZED"
    });
  });

  it("rejects disabled admin users", async () => {
    const { useCase } = makeUseCase({
      adminUsers: [
        {
          id: "admin-1",
          phone: "+989121234567",
          role: ADMIN_ROLES.ADMIN,
          status: ADMIN_STATUS.DISABLED
        }
      ],
      refreshTokens: [
        makeRefreshToken({
          id: "refresh-old",
          ownerId: "admin-1",
          ownerType: TOKEN_OWNER_TYPES.ADMIN,
          scope: AUTH_SCOPES.ADMIN,
          selectedRole: ADMIN_ROLES.ADMIN,
          token: "old-refresh-token"
        })
      ]
    });

    await expectAppError(useCase.execute({ refreshToken: "old-refresh-token" }), {
      statusCode: 403,
      code: "FORBIDDEN"
    });
  });
});
