import { describe, expect, it } from "vitest";

import { RequestPublicPhoneChangeOtp } from "../../../src/application/use-cases/RequestPublicPhoneChangeOtp.js";
import { USER_ROLES } from "../../../src/domain/constants/roles.js";
import { OTP_PURPOSES } from "../../../src/domain/constants/otpPurposes.js";

import { FakeOtpCodeGenerator } from "../fakes/FakeOtpCodeGenerator.js";
import { FakeOtpHasher } from "../fakes/FakeOtpHasher.js";
import { FakeOtpRepository } from "../fakes/FakeOtpRepository.js";
import { FakeOtpSender } from "../fakes/FakeOtpSender.js";
import { FakeUserRepository } from "../fakes/FakeUserRepository.js";
import { expectAppError } from "../helpers/expectAppError.js";

function makeUseCase({ users = [], recentCounts = {} } = {}) {
  const userRepository = new FakeUserRepository({ users });
  const otpRepository = new FakeOtpRepository({ recentCounts });
  const otpCodeGenerator = new FakeOtpCodeGenerator("111222");
  const otpHasher = new FakeOtpHasher();
  const otpSender = new FakeOtpSender();

  const useCase = new RequestPublicPhoneChangeOtp({
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

describe("RequestPublicPhoneChangeOtp", () => {
  it("sends OTP to the new phone", async () => {
    const { useCase, otpRepository, otpSender } = makeUseCase({
      users: [
        {
          id: "user-1",
          phone: "+989121111111",
          roles: [USER_ROLES.CLIENT]
        }
      ]
    });

    const result = await useCase.execute({
      userId: "user-1",
      currentPhone: "+989121111111",
      newPhone: "09122222222"
    });

    expect(result).toMatchObject({
      newPhone: "+989122222222"
    });
    expect(otpRepository.createdOtps[0]).toMatchObject({
      phone: "+989122222222",
      purpose: OTP_PURPOSES.PUBLIC_CHANGE_PHONE,
      codeHash: "hashed:111222"
    });
    expect(otpSender.sentMessages).toEqual([
      {
        phone: "+989122222222",
        code: "111222",
        purpose: OTP_PURPOSES.PUBLIC_CHANGE_PHONE
      }
    ]);
  });

  it("rejects same current and new phone", async () => {
    const { useCase } = makeUseCase();

    await expectAppError(
      useCase.execute({ userId: "user-1", currentPhone: "09121234567", newPhone: "+989121234567" }),
      {
        statusCode: 400,
        code: "SAME_PHONE_NUMBER"
      }
    );
  });

  it("rejects a new phone already used by another user", async () => {
    const { useCase } = makeUseCase({
      users: [
        {
          id: "user-2",
          phone: "+989122222222",
          roles: [USER_ROLES.CLIENT]
        }
      ]
    });

    await expectAppError(
      useCase.execute({ userId: "user-1", currentPhone: "09121111111", newPhone: "09122222222" }),
      {
        statusCode: 409,
        code: "PHONE_ALREADY_IN_USE"
      }
    );
  });

  it("enforces OTP rate limit for the new phone", async () => {
    const { useCase } = makeUseCase({
      recentCounts: {
        "+989122222222:public_change_phone": 3
      }
    });

    await expectAppError(
      useCase.execute({ userId: "user-1", currentPhone: "09121111111", newPhone: "09122222222" }),
      {
        statusCode: 429,
        code: "TOO_MANY_REQUESTS"
      }
    );
  });
});
