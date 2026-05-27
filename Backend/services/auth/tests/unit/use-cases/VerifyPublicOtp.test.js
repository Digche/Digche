import { describe, expect, it } from "vitest";

import { VerifyPublicOtp } from "../../../src/application/use-cases/VerifyPublicOtp.js";
import { USER_ROLES } from "../../../src/domain/constants/roles.js";
import { CHEF_STATUS } from "../../../src/domain/constants/statuses.js";
import { OTP_PURPOSES } from "../../../src/domain/constants/otpPurposes.js";
import { AUTH_SCOPES } from "../../../src/domain/constants/authScopes.js";
import { TOKEN_OWNER_TYPES } from "../../../src/domain/constants/tokenOwnerTypes.js";

import { FakeChefAccountRepository } from "../fakes/FakeChefAccountRepository.js";
import { FakeOtpHasher } from "../fakes/FakeOtpHasher.js";
import { FakeOtpRepository } from "../fakes/FakeOtpRepository.js";
import { FakeRefreshTokenRepository } from "../fakes/FakeRefreshTokenRepository.js";
import { FakeTokenService } from "../fakes/FakeTokenService.js";
import { FakeUserRepository } from "../fakes/FakeUserRepository.js";
import { makeOtpCode } from "../helpers/makeOtpCode.js";
import { expectAppError } from "../helpers/expectAppError.js";

function makeUseCase({ users = [], chefAccounts = [], otps = [] } = {}) {
  const userRepository = new FakeUserRepository({ users });
  const chefAccountRepository = new FakeChefAccountRepository({ chefAccounts });
  const otpRepository = new FakeOtpRepository({ otps });
  const refreshTokenRepository = new FakeRefreshTokenRepository();
  const otpHasher = new FakeOtpHasher();
  const tokenService = new FakeTokenService();

  const useCase = new VerifyPublicOtp({
    userRepository,
    chefAccountRepository,
    otpRepository,
    refreshTokenRepository,
    otpHasher,
    tokenService,
    refreshTokenExpiresDays: 30
  });

  return {
    useCase,
    userRepository,
    chefAccountRepository,
    otpRepository,
    refreshTokenRepository,
    tokenService
  };
}

describe("VerifyPublicOtp", () => {
  it("creates a new client user and session", async () => {
    const { useCase, userRepository, otpRepository, refreshTokenRepository, tokenService } = makeUseCase({
      otps: [
        makeOtpCode({
          id: "otp-1",
          phone: "+989121234567",
          purpose: OTP_PURPOSES.PUBLIC_LOGIN,
          code: "123456"
        })
      ]
    });

    const result = await useCase.execute({
      phone: "09121234567",
      code: "123456",
      role: USER_ROLES.CLIENT
    });

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
    expect(userRepository.createdUsers).toHaveLength(1);
    expect(userRepository.addedRoles).toEqual([
      {
        userId: "user-1",
        role: USER_ROLES.CLIENT
      }
    ]);
    expect(otpRepository.consumedIds).toEqual(["otp-1"]);
    expect(tokenService.signedPayloads[0]).toMatchObject({
      sub: "user-1",
      phone: "+989121234567",
      roles: [USER_ROLES.CLIENT],
      selectedRole: USER_ROLES.CLIENT,
      scope: AUTH_SCOPES.PUBLIC
    });
    expect(refreshTokenRepository.createdRefreshTokens[0]).toMatchObject({
      ownerId: "user-1",
      ownerType: TOKEN_OWNER_TYPES.USER,
      scope: AUTH_SCOPES.PUBLIC,
      selectedRole: USER_ROLES.CLIENT,
      tokenHash: "hash:refresh-token-1"
    });
  });

  it("creates a pending chef account for chef login", async () => {
    const { useCase, chefAccountRepository } = makeUseCase({
      otps: [
        makeOtpCode({
          id: "otp-1",
          phone: "+989121234567",
          purpose: OTP_PURPOSES.PUBLIC_LOGIN,
          code: "123456"
        })
      ]
    });

    const result = await useCase.execute({
      phone: "09121234567",
      code: "123456",
      role: USER_ROLES.CHEF
    });

    expect(result.user).toMatchObject({
      roles: [USER_ROLES.CHEF],
      selectedRole: USER_ROLES.CHEF,
      chef: {
        status: CHEF_STATUS.PENDING
      }
    });
    expect(chefAccountRepository.createdChefAccounts).toHaveLength(1);
    expect(chefAccountRepository.createdChefAccounts[0]).toMatchObject({
      userId: "user-1",
      status: CHEF_STATUS.PENDING
    });
  });

  it("rejects disabled chef account", async () => {
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
      otps: [
        makeOtpCode({
          id: "otp-1",
          phone: "+989121234567",
          purpose: OTP_PURPOSES.PUBLIC_LOGIN,
          code: "123456"
        })
      ]
    });

    await expectAppError(
      useCase.execute({ phone: "09121234567", code: "123456", role: USER_ROLES.CHEF }),
      {
        statusCode: 403,
        code: "FORBIDDEN"
      }
    );
  });

  it("rejects invalid public role", async () => {
    const { useCase } = makeUseCase();

    await expectAppError(useCase.execute({ phone: "09121234567", code: "123456", role: "admin" }), {
      statusCode: 400,
      code: "INVALID_PUBLIC_ROLE"
    });
  });

  it("rejects wrong OTP code", async () => {
    const { useCase } = makeUseCase({
      otps: [
        makeOtpCode({
          id: "otp-1",
          phone: "+989121234567",
          purpose: OTP_PURPOSES.PUBLIC_LOGIN,
          code: "123456"
        })
      ]
    });

    await expectAppError(useCase.execute({ phone: "09121234567", code: "000000", role: USER_ROLES.CLIENT }), {
      statusCode: 401,
      code: "UNAUTHORIZED"
    });
  });
});
