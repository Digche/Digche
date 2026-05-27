import { describe, expect, it } from "vitest";

import { RefreshPublicSession } from "../../../src/application/use-cases/RefreshPublicSession.js";
import { USER_ROLES } from "../../../src/domain/constants/roles.js";
import { CHEF_STATUS } from "../../../src/domain/constants/statuses.js";
import { AUTH_SCOPES } from "../../../src/domain/constants/authScopes.js";
import { TOKEN_OWNER_TYPES } from "../../../src/domain/constants/tokenOwnerTypes.js";

import { FakeChefAccountRepository } from "../fakes/FakeChefAccountRepository.js";
import { FakeRefreshTokenRepository } from "../fakes/FakeRefreshTokenRepository.js";
import { FakeTokenService } from "../fakes/FakeTokenService.js";
import { FakeUserRepository } from "../fakes/FakeUserRepository.js";
import { makeRefreshToken } from "../helpers/makeRefreshToken.js";
import { expectAppError } from "../helpers/expectAppError.js";

function makeUseCase({ users = [], chefAccounts = [], refreshTokens = [] } = {}) {
  const userRepository = new FakeUserRepository({ users });
  const chefAccountRepository = new FakeChefAccountRepository({ chefAccounts });
  const refreshTokenRepository = new FakeRefreshTokenRepository({ refreshTokens });
  const tokenService = new FakeTokenService();

  const useCase = new RefreshPublicSession({
    userRepository,
    chefAccountRepository,
    refreshTokenRepository,
    tokenService,
    refreshTokenExpiresDays: 30
  });

  return { useCase, refreshTokenRepository, tokenService };
}

describe("RefreshPublicSession", () => {
  it("rotates a valid client refresh token", async () => {
    const { useCase, refreshTokenRepository, tokenService } = makeUseCase({
      users: [
        {
          id: "user-1",
          phone: "+989121234567",
          roles: [USER_ROLES.CLIENT]
        }
      ],
      refreshTokens: [
        makeRefreshToken({
          id: "refresh-old",
          ownerId: "user-1",
          ownerType: TOKEN_OWNER_TYPES.USER,
          scope: AUTH_SCOPES.PUBLIC,
          selectedRole: USER_ROLES.CLIENT,
          token: "old-refresh-token"
        })
      ]
    });

    const result = await useCase.execute({ refreshToken: "old-refresh-token" });

    expect(result).toMatchObject({
      accessToken: "access-token-1",
      refreshToken: "refresh-token-1",
      user: {
        id: "user-1",
        phone: "+989121234567",
        roles: [USER_ROLES.CLIENT],
        selectedRole: USER_ROLES.CLIENT
      }
    });
    expect(refreshTokenRepository.revokedIds).toEqual(["refresh-old"]);
    expect(refreshTokenRepository.createdRefreshTokens[0]).toMatchObject({
      ownerId: "user-1",
      ownerType: TOKEN_OWNER_TYPES.USER,
      scope: AUTH_SCOPES.PUBLIC,
      selectedRole: USER_ROLES.CLIENT,
      tokenHash: "hash:refresh-token-1"
    });
    expect(tokenService.signedPayloads[0]).toMatchObject({
      sub: "user-1",
      scope: AUTH_SCOPES.PUBLIC,
      selectedRole: USER_ROLES.CLIENT
    });
  });

  it("includes chef status for chef refresh token", async () => {
    const { useCase } = makeUseCase({
      users: [
        {
          id: "user-1",
          phone: "+989121234567",
          roles: [USER_ROLES.CHEF]
        }
      ],
      chefAccounts: [
        {
          id: "chef-1",
          userId: "user-1",
          status: CHEF_STATUS.ACTIVE
        }
      ],
      refreshTokens: [
        makeRefreshToken({
          id: "refresh-old",
          ownerId: "user-1",
          ownerType: TOKEN_OWNER_TYPES.USER,
          scope: AUTH_SCOPES.PUBLIC,
          selectedRole: USER_ROLES.CHEF,
          token: "old-refresh-token"
        })
      ]
    });

    const result = await useCase.execute({ refreshToken: "old-refresh-token" });

    expect(result.user).toMatchObject({
      selectedRole: USER_ROLES.CHEF,
      chef: {
        status: CHEF_STATUS.ACTIVE
      }
    });
  });

  it("rejects admin-scoped refresh token", async () => {
    const { useCase } = makeUseCase({
      refreshTokens: [
        makeRefreshToken({
          id: "refresh-admin",
          ownerId: "admin-1",
          ownerType: TOKEN_OWNER_TYPES.ADMIN,
          scope: AUTH_SCOPES.ADMIN,
          selectedRole: "admin",
          token: "admin-refresh-token"
        })
      ]
    });

    await expectAppError(useCase.execute({ refreshToken: "admin-refresh-token" }), {
      statusCode: 401,
      code: "UNAUTHORIZED"
    });
  });

  it("rejects a refresh token for a role the user no longer has", async () => {
    const { useCase } = makeUseCase({
      users: [
        {
          id: "user-1",
          phone: "+989121234567",
          roles: [USER_ROLES.CLIENT]
        }
      ],
      refreshTokens: [
        makeRefreshToken({
          id: "refresh-old",
          ownerId: "user-1",
          ownerType: TOKEN_OWNER_TYPES.USER,
          scope: AUTH_SCOPES.PUBLIC,
          selectedRole: USER_ROLES.CHEF,
          token: "old-refresh-token"
        })
      ]
    });

    await expectAppError(useCase.execute({ refreshToken: "old-refresh-token" }), {
      statusCode: 403,
      code: "FORBIDDEN"
    });
  });

  it("rejects disabled chef accounts", async () => {
    const { useCase } = makeUseCase({
      users: [
        {
          id: "user-1",
          phone: "+989121234567",
          roles: [USER_ROLES.CHEF]
        }
      ],
      chefAccounts: [
        {
          id: "chef-1",
          userId: "user-1",
          status: CHEF_STATUS.DISABLED
        }
      ],
      refreshTokens: [
        makeRefreshToken({
          id: "refresh-old",
          ownerId: "user-1",
          ownerType: TOKEN_OWNER_TYPES.USER,
          scope: AUTH_SCOPES.PUBLIC,
          selectedRole: USER_ROLES.CHEF,
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
