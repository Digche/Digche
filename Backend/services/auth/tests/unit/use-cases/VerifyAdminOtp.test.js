import { describe, expect, it } from "vitest";

import { VerifyAdminOtp } from "../../../src/application/use-cases/VerifyAdminOtp.js";
import { ADMIN_ROLES } from "../../../src/domain/constants/roles.js";
import { ADMIN_STATUS } from "../../../src/domain/constants/statuses.js";
import { OTP_PURPOSES } from "../../../src/domain/constants/otpPurposes.js";
import { AUTH_SCOPES } from "../../../src/domain/constants/authScopes.js";
import { TOKEN_OWNER_TYPES } from "../../../src/domain/constants/tokenOwnerTypes.js";

import { FakeAdminUserRepository } from "../fakes/FakeAdminUserRepository.js";
import { FakeOtpHasher } from "../fakes/FakeOtpHasher.js";
import { FakeOtpRepository } from "../fakes/FakeOtpRepository.js";
import { FakeRefreshTokenRepository } from "../fakes/FakeRefreshTokenRepository.js";
import { FakeTokenService } from "../fakes/FakeTokenService.js";
import { makeOtpCode } from "../helpers/makeOtpCode.js";
import { expectAppError } from "../helpers/expectAppError.js";

function makeUseCase({ adminUsers = [], otps = [] } = {}) {
  const adminUserRepository = new FakeAdminUserRepository({ adminUsers });
  const otpRepository = new FakeOtpRepository({ otps });
  const refreshTokenRepository = new FakeRefreshTokenRepository();
  const otpHasher = new FakeOtpHasher();
  const tokenService = new FakeTokenService();

  const useCase = new VerifyAdminOtp({
    adminUserRepository,
    otpRepository,
    refreshTokenRepository,
    otpHasher,
    tokenService,
    refreshTokenExpiresDays: 30
  });

  return { useCase, otpRepository, refreshTokenRepository, tokenService };
}

describe("VerifyAdminOtp", () => {
  it("verifies OTP, consumes it, and creates admin session", async () => {
    const { useCase, otpRepository, refreshTokenRepository, tokenService } = makeUseCase({
      adminUsers: [
        {
          id: "manager-1",
          phone: "+989121234567",
          role: ADMIN_ROLES.MANAGER,
          status: ADMIN_STATUS.ACTIVE
        }
      ],
      otps: [
        makeOtpCode({
          id: "otp-1",
          phone: "+989121234567",
          purpose: OTP_PURPOSES.ADMIN_LOGIN,
          code: "123456"
        })
      ]
    });

    const result = await useCase.execute({ phone: "09121234567", code: "123456" });

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
    expect(otpRepository.consumedIds).toEqual(["otp-1"]);
    expect(tokenService.signedPayloads[0]).toMatchObject({
      sub: "manager-1",
      phone: "+989121234567",
      role: ADMIN_ROLES.MANAGER,
      scope: AUTH_SCOPES.ADMIN,
      isManager: true
    });
    expect(refreshTokenRepository.createdRefreshTokens[0]).toMatchObject({
      ownerId: "manager-1",
      ownerType: TOKEN_OWNER_TYPES.ADMIN,
      scope: AUTH_SCOPES.ADMIN,
      selectedRole: ADMIN_ROLES.MANAGER,
      tokenHash: "hash:refresh-token-1"
    });
  });

  it("rejects missing OTP code", async () => {
    const { useCase } = makeUseCase();

    await expectAppError(useCase.execute({ phone: "09121234567" }), {
      statusCode: 400,
      code: "OTP_CODE_REQUIRED"
    });
  });

  it("rejects invalid OTP code", async () => {
    const { useCase } = makeUseCase({
      adminUsers: [
        {
          id: "admin-1",
          phone: "+989121234567",
          role: ADMIN_ROLES.ADMIN,
          status: ADMIN_STATUS.ACTIVE
        }
      ],
      otps: [
        makeOtpCode({
          id: "otp-1",
          phone: "+989121234567",
          purpose: OTP_PURPOSES.ADMIN_LOGIN,
          code: "123456"
        })
      ]
    });

    await expectAppError(useCase.execute({ phone: "09121234567", code: "000000" }), {
      statusCode: 401,
      code: "UNAUTHORIZED"
    });
  });

  it("rejects disabled admins", async () => {
    const { useCase } = makeUseCase({
      adminUsers: [
        {
          id: "admin-1",
          phone: "+989121234567",
          role: ADMIN_ROLES.ADMIN,
          status: ADMIN_STATUS.DISABLED
        }
      ]
    });

    await expectAppError(useCase.execute({ phone: "09121234567", code: "123456" }), {
      statusCode: 403,
      code: "FORBIDDEN"
    });
  });
});
