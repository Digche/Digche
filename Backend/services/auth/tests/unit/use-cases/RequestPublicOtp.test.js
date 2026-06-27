import { describe, expect, it } from "vitest";

import { RequestPublicOtp } from "../../../src/application/use-cases/RequestPublicOtp.js";
import { USER_ROLES } from "../../../src/domain/constants/roles.js";
import { OTP_PURPOSES } from "../../../src/domain/constants/otpPurposes.js";
import { PUBLIC_AUTH_FLOWS } from "../../../src/domain/constants/authFlows.js";

import { FakeOtpCodeGenerator } from "../fakes/FakeOtpCodeGenerator.js";
import { FakeOtpHasher } from "../fakes/FakeOtpHasher.js";
import { FakeOtpRepository } from "../fakes/FakeOtpRepository.js";
import { FakeOtpSender } from "../fakes/FakeOtpSender.js";
import { FakeUserRepository } from "../fakes/FakeUserRepository.js";
import { expectAppError } from "../helpers/expectAppError.js";

function makeUseCase({ recentCounts = {}, users = [] } = {}) {
  const userRepository = new FakeUserRepository({ users });
  const otpRepository = new FakeOtpRepository({ recentCounts });
  const otpCodeGenerator = new FakeOtpCodeGenerator("123456");
  const otpHasher = new FakeOtpHasher();
  const otpSender = new FakeOtpSender();

  const useCase = new RequestPublicOtp({
    userRepository,
    otpRepository,
    otpCodeGenerator,
    otpHasher,
    otpSender,
    otpExpiresMinutes: 2,
    otpRateLimitPerHour: 3
  });

  return { useCase, otpRepository, otpSender };
}

describe("RequestPublicOtp", () => {
  it("sends public login OTP for the selected role", async () => {
    const { useCase, otpRepository, otpSender } = makeUseCase({
      users: [
        {
          id: "user-1",
          phone: "+989121234567",
          firstName: "Ali",
          lastName: "Ahmadi",
          username: "ali_ahmadi",
          roles: [USER_ROLES.CLIENT]
        }
      ]
    });

    const result = await useCase.execute({
      phone: "09121234567",
      role: USER_ROLES.CLIENT,
      flow: PUBLIC_AUTH_FLOWS.LOGIN
    });

    expect(result).toMatchObject({
      phone: "+989121234567",
      role: USER_ROLES.CLIENT,
      flow: PUBLIC_AUTH_FLOWS.LOGIN
    });
    expect(result.expiresAt).toBeInstanceOf(Date);
    expect(otpRepository.createdOtps[0]).toMatchObject({
      phone: "+989121234567",
      purpose: OTP_PURPOSES.PUBLIC_LOGIN,
      codeHash: "hashed:123456"
    });
    expect(otpSender.sentMessages).toEqual([
      {
        phone: "+989121234567",
        code: "123456",
        purpose: OTP_PURPOSES.PUBLIC_LOGIN
      }
    ]);
  });

  it("rejects login OTP when public account does not exist", async () => {
    const { useCase } = makeUseCase();

    await expectAppError(
      useCase.execute({
        phone: "09121234567",
        role: USER_ROLES.CLIENT,
        flow: PUBLIC_AUTH_FLOWS.LOGIN
      }),
      {
        statusCode: 404,
        code: "NOT_FOUND"
      }
    );
  });

  it("rejects missing or invalid public role", async () => {
    const { useCase } = makeUseCase();

    await expectAppError(
      useCase.execute({ phone: "09121234567", flow: PUBLIC_AUTH_FLOWS.LOGIN }),
      {
      statusCode: 400,
      code: "INVALID_PUBLIC_ROLE"
      }
    );

    await expectAppError(
      useCase.execute({
        phone: "09121234567",
        role: "admin",
        flow: PUBLIC_AUTH_FLOWS.LOGIN
      }),
      {
        statusCode: 400,
        code: "INVALID_PUBLIC_ROLE"
      }
    );
  });

  it("enforces hourly OTP rate limit", async () => {
    const { useCase } = makeUseCase({
      recentCounts: {
        "+989121234567:public_login": 3
      }
    });

    await expectAppError(
      useCase.execute({
        phone: "09121234567",
        role: USER_ROLES.CHEF,
        flow: PUBLIC_AUTH_FLOWS.LOGIN
      }),
      {
        statusCode: 429,
        code: "TOO_MANY_REQUESTS"
      }
    );
  });

  it("rejects duplicate phone and role at register request time", async () => {
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
      ]
    });

    await expectAppError(
      useCase.execute({
        phone: "09121234567",
        role: USER_ROLES.CLIENT,
        flow: PUBLIC_AUTH_FLOWS.REGISTER
      }),
      {
        statusCode: 409,
        code: "PUBLIC_ACCOUNT_ALREADY_EXISTS"
      }
    );
  });
});
