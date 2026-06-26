import { describe, expect, it } from "vitest";

import { VerifyPublicOtp } from "../../../src/application/use-cases/VerifyPublicOtp.js";
import { USER_ROLES } from "../../../src/domain/constants/roles.js";
import { CHEF_STATUS } from "../../../src/domain/constants/statuses.js";
import { OTP_PURPOSES } from "../../../src/domain/constants/otpPurposes.js";
import { AUTH_SCOPES } from "../../../src/domain/constants/authScopes.js";
import { TOKEN_OWNER_TYPES } from "../../../src/domain/constants/tokenOwnerTypes.js";
import { PUBLIC_AUTH_FLOWS } from "../../../src/domain/constants/authFlows.js";

import { FakeChefAccountRepository } from "../fakes/FakeChefAccountRepository.js";
import { FakeOtpHasher } from "../fakes/FakeOtpHasher.js";
import { FakeOtpRepository } from "../fakes/FakeOtpRepository.js";
import { FakeRefreshTokenRepository } from "../fakes/FakeRefreshTokenRepository.js";
import { FakeRegistrationTokenRepository } from "../fakes/FakeRegistrationTokenRepository.js";
import { FakeTokenService } from "../fakes/FakeTokenService.js";
import { FakeUserRepository } from "../fakes/FakeUserRepository.js";
import { makeOtpCode } from "../helpers/makeOtpCode.js";
import { expectAppError } from "../helpers/expectAppError.js";

function makeUseCase({ users = [], chefAccounts = [], otps = [] } = {}) {
  const userRepository = new FakeUserRepository({ users });
  const chefAccountRepository = new FakeChefAccountRepository({ chefAccounts });
  const otpRepository = new FakeOtpRepository({ otps });
  const refreshTokenRepository = new FakeRefreshTokenRepository();
  const registrationTokenRepository = new FakeRegistrationTokenRepository();
  const otpHasher = new FakeOtpHasher();
  const tokenService = new FakeTokenService();

  const useCase = new VerifyPublicOtp({
    userRepository,
    chefAccountRepository,
    otpRepository,
    refreshTokenRepository,
    registrationTokenRepository,
    otpHasher,
    tokenService,
    refreshTokenExpiresDays: 7,
    registrationTokenExpiresMinutes: 10
  });

  return {
    useCase,
    userRepository,
    otpRepository,
    registrationTokenRepository,
    refreshTokenRepository,
    tokenService
  };
}

describe("VerifyPublicOtp", () => {
  it("returns registration token for a new phone and does not create user", async () => {
    const { useCase, userRepository, otpRepository, tokenService } = makeUseCase({
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
      role: USER_ROLES.CLIENT,
      flow: PUBLIC_AUTH_FLOWS.REGISTER
    });

    expect(result).toMatchObject({
      requiresRegistration: true,
      registrationToken: "registration-token-1",
      phone: "+989121234567",
      role: USER_ROLES.CLIENT
    });
    expect(userRepository.createdUsers).toHaveLength(0);
    expect(otpRepository.consumedIds).toEqual(["otp-1"]);
    expect(tokenService.signedRegistrationPayloads[0]).toMatchObject({
      phone: "+989121234567",
      role: USER_ROLES.CLIENT,
      flow: PUBLIC_AUTH_FLOWS.REGISTER,
      scope: "public_registration",
      jti: "token-id-1"
    });
  });

  it("returns registration token when existing user does not have selected role", async () => {
    const { useCase } = makeUseCase({
      users: [
        {
          id: "user-1",
          phone: "+989121234567",
          firstName: "Ali",
          lastName: "Ahmadi",
          username: "ali_ahmadi",
          roles: [USER_ROLES.CLIENT]
        }
      ],
      otps: [
        makeOtpCode({ phone: "+989121234567", purpose: OTP_PURPOSES.PUBLIC_LOGIN })
      ]
    });

    const result = await useCase.execute({
      phone: "09121234567",
      code: "123456",
      role: USER_ROLES.CHEF,
      flow: PUBLIC_AUTH_FLOWS.REGISTER
    });

    expect(result).toMatchObject({
      requiresRegistration: true,
      registrationToken: "registration-token-1",
      role: USER_ROLES.CHEF
    });
  });

  it("returns registration token when existing user profile is incomplete", async () => {
    const { useCase } = makeUseCase({
      users: [
        {
          id: "user-1",
          phone: "+989121234567",
          roles: [USER_ROLES.CLIENT]
        }
      ],
      otps: [
        makeOtpCode({ phone: "+989121234567", purpose: OTP_PURPOSES.PUBLIC_LOGIN })
      ]
    });

    const result = await useCase.execute({
      phone: "09121234567",
      code: "123456",
      role: USER_ROLES.CLIENT,
      flow: PUBLIC_AUTH_FLOWS.REGISTER
    });

    expect(result.requiresRegistration).toBe(true);
  });

  it("creates a session for existing client with completed profile", async () => {
    const { useCase, refreshTokenRepository, tokenService } = makeUseCase({
      users: [
        {
          id: "user-1",
          phone: "+989121234567",
          firstName: "Ali",
          lastName: "Ahmadi",
          username: "ali_ahmadi",
          roles: [USER_ROLES.CLIENT]
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

    const result = await useCase.execute({
      phone: "09121234567",
      code: "123456",
      role: USER_ROLES.CLIENT,
      flow: PUBLIC_AUTH_FLOWS.LOGIN
    });

    expect(result).toMatchObject({
      requiresRegistration: false,
      accessToken: "access-token-1",
      refreshToken: "refresh-token-1",
      user: {
        id: "user-1",
        phone: "+989121234567",
        firstName: "Ali",
        lastName: "Ahmadi",
        username: "ali_ahmadi",
        roles: [USER_ROLES.CLIENT],
        selectedRole: USER_ROLES.CLIENT
      }
    });
    expect(tokenService.signedPayloads[0]).toMatchObject({
      sub: "user-1",
      phone: "+989121234567",
      firstName: "Ali",
      lastName: "Ahmadi",
      username: "ali_ahmadi",
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

  it("includes chef status for existing chef with completed profile", async () => {
    const { useCase } = makeUseCase({
      users: [
        {
          id: "user-1",
          phone: "+989121234567",
          firstName: "Sara",
          lastName: "Chef",
          username: "sara_chef",
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
        makeOtpCode({ phone: "+989121234567", purpose: OTP_PURPOSES.PUBLIC_LOGIN })
      ]
    });

    const result = await useCase.execute({
      phone: "09121234567",
      code: "123456",
      role: USER_ROLES.CHEF,
      flow: PUBLIC_AUTH_FLOWS.LOGIN
    });

    expect(result.user).toMatchObject({
      selectedRole: USER_ROLES.CHEF,
      chef: {
        status: CHEF_STATUS.ACTIVE
      }
    });
  });

  it("rejects suspended chef account", async () => {
    const { useCase } = makeUseCase({
      users: [
        {
          id: "user-1",
          phone: "+989121234567",
          firstName: "Sara",
          lastName: "Chef",
          username: "sara_chef",
          roles: [USER_ROLES.CHEF]
        }
      ],
      chefAccounts: [
        {
          id: "chef-1",
          userId: "user-1",
          status: CHEF_STATUS.SUSPENDED
        }
      ],
      otps: [
        makeOtpCode({ phone: "+989121234567", purpose: OTP_PURPOSES.PUBLIC_LOGIN })
      ]
    });

    await expectAppError(
      useCase.execute({
        phone: "09121234567",
        code: "123456",
        role: USER_ROLES.CHEF,
        flow: PUBLIC_AUTH_FLOWS.LOGIN
      }),
      {
        statusCode: 403,
        code: "FORBIDDEN"
      }
    );
  });

  it("rejects invalid public role and wrong OTP code", async () => {
    const { useCase } = makeUseCase({
      otps: [
        makeOtpCode({ phone: "+989121234567", purpose: OTP_PURPOSES.PUBLIC_LOGIN })
      ]
    });

    await expectAppError(
      useCase.execute({
        phone: "09121234567",
        code: "123456",
        role: "admin",
        flow: PUBLIC_AUTH_FLOWS.LOGIN
      }),
      {
        statusCode: 400,
        code: "INVALID_PUBLIC_ROLE"
      }
    );

    await expectAppError(
      useCase.execute({
        phone: "09121234567",
        code: "000000",
        role: USER_ROLES.CLIENT,
        flow: PUBLIC_AUTH_FLOWS.LOGIN
      }),
      {
        statusCode: 401,
        code: "UNAUTHORIZED"
      }
    );
  });
});
