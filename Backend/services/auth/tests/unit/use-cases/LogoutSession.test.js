import { describe, expect, it } from "vitest";

import { LogoutSession } from "../../../src/application/use-cases/LogoutSession.js";
import { AUTH_SCOPES } from "../../../src/domain/constants/authScopes.js";
import { TOKEN_OWNER_TYPES } from "../../../src/domain/constants/tokenOwnerTypes.js";

import { FakeRefreshTokenRepository } from "../fakes/FakeRefreshTokenRepository.js";
import { FakeTokenService } from "../fakes/FakeTokenService.js";
import { makeRefreshToken } from "../helpers/makeRefreshToken.js";
import { expectAppError } from "../helpers/expectAppError.js";

function makeUseCase({ refreshTokens = [] } = {}) {
  const refreshTokenRepository = new FakeRefreshTokenRepository({ refreshTokens });
  const tokenService = new FakeTokenService();
  const useCase = new LogoutSession({ refreshTokenRepository, tokenService });

  return { useCase, refreshTokenRepository };
}

describe("LogoutSession", () => {
  it("revokes existing refresh token", async () => {
    const { useCase, refreshTokenRepository } = makeUseCase({
      refreshTokens: [
        makeRefreshToken({
          id: "refresh-1",
          ownerId: "user-1",
          ownerType: TOKEN_OWNER_TYPES.USER,
          scope: AUTH_SCOPES.PUBLIC,
          selectedRole: "client",
          token: "refresh-token"
        })
      ]
    });

    const result = await useCase.execute({ refreshToken: "refresh-token" });

    expect(result).toEqual({ success: true });
    expect(refreshTokenRepository.revokedIds).toEqual(["refresh-1"]);
  });

  it("returns success when refresh token is already unknown", async () => {
    const { useCase, refreshTokenRepository } = makeUseCase();

    const result = await useCase.execute({ refreshToken: "missing-refresh-token" });

    expect(result).toEqual({ success: true });
    expect(refreshTokenRepository.revokedIds).toEqual([]);
  });

  it("requires refresh token", async () => {
    const { useCase } = makeUseCase();

    await expectAppError(useCase.execute({}), {
      statusCode: 400,
      code: "REFRESH_TOKEN_REQUIRED"
    });
  });
});
