import { describe, expect, it } from "vitest";

import { RequestPublicOtp } from "../../../src/application/use-cases/RequestPublicOtp.js";
import { USER_ROLES } from "../../../src/domain/constants/roles.js";
import { OTP_PURPOSES } from "../../../src/domain/constants/otpPurposes.js";

import { FakeOtpCodeGenerator } from "../fakes/FakeOtpCodeGenerator.js";
import { FakeOtpHasher } from "../fakes/FakeOtpHasher.js";
import { FakeOtpRepository } from "../fakes/FakeOtpRepository.js";
import { FakeOtpSender } from "../fakes/FakeOtpSender.js";
import { expectAppError } from "../helpers/expectAppError.js";

function makeUseCase({ recentCounts = {} } = {}) {
  const otpRepository = new FakeOtpRepository({ recentCounts });
  const otpCodeGenerator = new FakeOtpCodeGenerator("123456");
  const otpHasher = new FakeOtpHasher();
  const otpSender = new FakeOtpSender();

  const useCase = new RequestPublicOtp({
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
    const { useCase, otpRepository, otpSender } = makeUseCase();

    const result = await useCase.execute({
      phone: "09121234567",
      role: USER_ROLES.CLIENT
    });

    expect(result).toMatchObject({
      phone: "+989121234567",
      role: USER_ROLES.CLIENT
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

  it("rejects missing or invalid public role", async () => {
    const { useCase } = makeUseCase();

    await expectAppError(useCase.execute({ phone: "09121234567" }), {
      statusCode: 400,
      code: "INVALID_PUBLIC_ROLE"
    });

    await expectAppError(useCase.execute({ phone: "09121234567", role: "admin" }), {
      statusCode: 400,
      code: "INVALID_PUBLIC_ROLE"
    });
  });

  it("enforces hourly OTP rate limit", async () => {
    const { useCase } = makeUseCase({
      recentCounts: {
        "+989121234567:public_login": 3
      }
    });

    await expectAppError(useCase.execute({ phone: "09121234567", role: USER_ROLES.CHEF }), {
      statusCode: 429,
      code: "TOO_MANY_REQUESTS"
    });
  });
});
