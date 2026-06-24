import { describe, expect, it } from "vitest";

import { VerifyPublicPhoneChangeOtp } from "../../../src/application/use-cases/VerifyPublicPhoneChangeOtp.js";
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

  const useCase = new VerifyPublicPhoneChangeOtp({
    userRepository,
    chefAccountRepository,
    otpRepository,
    refreshTokenRepository,
    otpHasher,
    tokenService,
    refreshTokenExpiresDays: 30
  });

  return { useCase, userRepository, otpRepository, refreshTokenRepository, tokenService };
}

describe("VerifyPublicPhoneChangeOtp", () => {
  it("changes public user phone, revokes previous refresh tokens, and issues new session", async () => {
    const { useCase, userRepository, otpRepository, refreshTokenRepository, tokenService } = makeUseCase({
      users: [
        {
          id: "user-1",
          phone: "+989121111111",
          firstName: "Ali",
          lastName: "Ahmadi",
          username: "ali_ahmadi",
          roles: [USER_ROLES.CLIENT]
        }
      ],
      otps: [
        makeOtpCode({
          id: "otp-1",
          phone: "+989122222222",
          purpose: OTP_PURPOSES.PUBLIC_CHANGE_PHONE,
          code: "123456"
        })
      ]
    });

    const result = await useCase.execute({
      userId: "user-1",
      currentSelectedRole: USER_ROLES.CLIENT,
      newPhone: "09122222222",
      code: "123456"
    });

    expect(result).toMatchObject({
      accessToken: "access-token-1",
      refreshToken: "refresh-token-1",
      user: {
        id: "user-1",
        phone: "+989122222222",
        firstName: "Ali",
        lastName: "Ahmadi",
        username: "ali_ahmadi",
        roles: [USER_ROLES.CLIENT],
        selectedRole: USER_ROLES.CLIENT
      }
    });
    expect(userRepository.updatedPhones).toEqual([
      {
        userId: "user-1",
        newPhone: "+989122222222"
      }
    ]);
    expect(otpRepository.consumedIds).toEqual(["otp-1"]);
    expect(refreshTokenRepository.revokedOwners).toEqual([
      {
        ownerId: "user-1",
        ownerType: TOKEN_OWNER_TYPES.USER
      }
    ]);
    expect(tokenService.signedPayloads[0]).toMatchObject({
      sub: "user-1",
      phone: "+989122222222",
      firstName: "Ali",
      lastName: "Ahmadi",
      username: "ali_ahmadi",
      selectedRole: USER_ROLES.CLIENT,
      scope: AUTH_SCOPES.PUBLIC
    });
  });

  it("keeps chef status when selected role is chef", async () => {
    const { useCase } = makeUseCase({
      users: [
        {
          id: "user-1",
          phone: "+989121111111",
          firstName: "Ali",
          lastName: "Ahmadi",
          username: "ali_ahmadi",
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
      otps: [
        makeOtpCode({
          id: "otp-1",
          phone: "+989122222222",
          purpose: OTP_PURPOSES.PUBLIC_CHANGE_PHONE,
          code: "123456"
        })
      ]
    });

    const result = await useCase.execute({
      userId: "user-1",
      currentSelectedRole: USER_ROLES.CHEF,
      newPhone: "09122222222",
      code: "123456"
    });

    expect(result.user).toMatchObject({
      selectedRole: USER_ROLES.CHEF,
      chef: {
        status: CHEF_STATUS.ACTIVE
      }
    });
  });

  it("rejects wrong OTP code", async () => {
    const { useCase } = makeUseCase({
      users: [
        {
          id: "user-1",
          phone: "+989121111111",
          firstName: "Ali",
          lastName: "Ahmadi",
          username: "ali_ahmadi",
          roles: [USER_ROLES.CLIENT]
        }
      ],
      otps: [
        makeOtpCode({
          id: "otp-1",
          phone: "+989122222222",
          purpose: OTP_PURPOSES.PUBLIC_CHANGE_PHONE,
          code: "123456"
        })
      ]
    });

    await expectAppError(
      useCase.execute({ userId: "user-1", currentSelectedRole: USER_ROLES.CLIENT, newPhone: "09122222222", code: "000000" }),
      {
        statusCode: 401,
        code: "UNAUTHORIZED"
      }
    );
  });

  it("rejects duplicate new phone", async () => {
    const { useCase } = makeUseCase({
      users: [
        {
          id: "user-1",
          phone: "+989121111111",
          firstName: "Ali",
          lastName: "Ahmadi",
          username: "ali_ahmadi",
          roles: [USER_ROLES.CLIENT]
        },
        {
          id: "user-2",
          phone: "+989122222222",
          firstName: "Other",
          lastName: "User",
          username: "other_user",
          roles: [USER_ROLES.CLIENT]
        }
      ]
    });

    await expectAppError(
      useCase.execute({ userId: "user-1", currentSelectedRole: USER_ROLES.CLIENT, newPhone: "09122222222", code: "123456" }),
      {
        statusCode: 409,
        code: "PHONE_ALREADY_IN_USE"
      }
    );
  });
});
