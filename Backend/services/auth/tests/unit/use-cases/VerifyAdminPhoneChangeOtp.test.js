import { describe, expect, it } from "vitest";

import { VerifyAdminPhoneChangeOtp } from "../../../src/application/use-cases/VerifyAdminPhoneChangeOtp.js";
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

  const useCase = new VerifyAdminPhoneChangeOtp({
    adminUserRepository,
    otpRepository,
    refreshTokenRepository,
    otpHasher,
    tokenService,
    refreshTokenExpiresDays: 30
  });

  return { useCase, adminUserRepository, otpRepository, refreshTokenRepository, tokenService };
}

describe("VerifyAdminPhoneChangeOtp", () => {
  it("changes manager phone, revokes previous refresh tokens, and issues new session", async () => {
    const { useCase, adminUserRepository, otpRepository, refreshTokenRepository, tokenService } = makeUseCase({
      adminUsers: [
        {
          id: "manager-1",
          phone: "+989121111111",
          role: ADMIN_ROLES.MANAGER,
          status: ADMIN_STATUS.ACTIVE
        }
      ],
      otps: [
        makeOtpCode({
          id: "otp-1",
          phone: "+989122222222",
          purpose: OTP_PURPOSES.ADMIN_CHANGE_PHONE,
          code: "123456"
        })
      ]
    });

    const result = await useCase.execute({
      adminId: "manager-1",
      newPhone: "09122222222",
      code: "123456"
    });

    expect(result).toMatchObject({
      accessToken: "access-token-1",
      refreshToken: "refresh-token-1",
      admin: {
        id: "manager-1",
        phone: "+989122222222",
        role: ADMIN_ROLES.MANAGER,
        isManager: true
      }
    });
    expect(adminUserRepository.updatedPhones).toEqual([
      {
        id: "manager-1",
        newPhone: "+989122222222"
      }
    ]);
    expect(otpRepository.consumedIds).toEqual(["otp-1"]);
    expect(refreshTokenRepository.revokedOwners).toEqual([
      {
        ownerId: "manager-1",
        ownerType: TOKEN_OWNER_TYPES.ADMIN
      }
    ]);
    expect(tokenService.signedPayloads[0]).toMatchObject({
      sub: "manager-1",
      phone: "+989122222222",
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

  it("rejects wrong OTP code", async () => {
    const { useCase } = makeUseCase({
      adminUsers: [
        {
          id: "manager-1",
          phone: "+989121111111",
          role: ADMIN_ROLES.MANAGER,
          status: ADMIN_STATUS.ACTIVE
        }
      ],
      otps: [
        makeOtpCode({
          id: "otp-1",
          phone: "+989122222222",
          purpose: OTP_PURPOSES.ADMIN_CHANGE_PHONE,
          code: "123456"
        })
      ]
    });

    await expectAppError(
      useCase.execute({ adminId: "manager-1", newPhone: "09122222222", code: "000000" }),
      {
        statusCode: 401,
        code: "UNAUTHORIZED"
      }
    );
  });

  it("allows only managers to verify manager phone change", async () => {
    const { useCase } = makeUseCase({
      adminUsers: [
        {
          id: "admin-1",
          phone: "+989121111111",
          role: ADMIN_ROLES.ADMIN,
          status: ADMIN_STATUS.ACTIVE
        }
      ]
    });

    await expectAppError(
      useCase.execute({ adminId: "admin-1", newPhone: "09122222222", code: "123456" }),
      {
        statusCode: 403,
        code: "FORBIDDEN"
      }
    );
  });

  it("rejects duplicate admin phone numbers", async () => {
    const { useCase } = makeUseCase({
      adminUsers: [
        {
          id: "manager-1",
          phone: "+989121111111",
          role: ADMIN_ROLES.MANAGER,
          status: ADMIN_STATUS.ACTIVE
        },
        {
          id: "admin-1",
          phone: "+989122222222",
          role: ADMIN_ROLES.ADMIN,
          status: ADMIN_STATUS.ACTIVE
        }
      ]
    });

    await expectAppError(
      useCase.execute({ adminId: "manager-1", newPhone: "09122222222", code: "123456" }),
      {
        statusCode: 409,
        code: "PHONE_ALREADY_IN_USE"
      }
    );
  });
});
