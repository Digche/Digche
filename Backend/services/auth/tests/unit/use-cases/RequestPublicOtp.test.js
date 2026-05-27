import { describe, expect, it } from "vitest";

import { RequestPublicOtp } from "../../../src/application/use-cases/RequestPublicOtp.js";
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
  it("sends public login OTP", async () => {
    const { useCase, otpRepository, otpSender } = makeUseCase();

    const result = await useCase.execute({ phone: "09121234567" });

    expect(result.phone).toBe("+989121234567");
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

  it("enforces hourly OTP rate limit", async () => {
    const { useCase } = makeUseCase({
      recentCounts: {
        "+989121234567:public_login": 3
      }
    });

    await expectAppError(useCase.execute({ phone: "09121234567" }), {
      statusCode: 429,
      code: "TOO_MANY_REQUESTS"
    });
  });
});
