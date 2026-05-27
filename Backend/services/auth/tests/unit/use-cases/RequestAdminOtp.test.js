import { describe, expect, it } from "vitest";

import { RequestAdminOtp } from "../../../src/application/use-cases/RequestAdminOtp.js";
import { ADMIN_ROLES } from "../../../src/domain/constants/roles.js";
import { ADMIN_STATUS } from "../../../src/domain/constants/statuses.js";
import { OTP_PURPOSES } from "../../../src/domain/constants/otpPurposes.js";

import { FakeAdminUserRepository } from "../fakes/FakeAdminUserRepository.js";
import { FakeOtpCodeGenerator } from "../fakes/FakeOtpCodeGenerator.js";
import { FakeOtpHasher } from "../fakes/FakeOtpHasher.js";
import { FakeOtpRepository } from "../fakes/FakeOtpRepository.js";
import { FakeOtpSender } from "../fakes/FakeOtpSender.js";
import { expectAppError } from "../helpers/expectAppError.js";

function makeUseCase({ adminUsers = [], recentCounts = {} } = {}) {
  const adminUserRepository = new FakeAdminUserRepository({ adminUsers });
  const otpRepository = new FakeOtpRepository({ recentCounts });
  const otpCodeGenerator = new FakeOtpCodeGenerator("654321");
  const otpHasher = new FakeOtpHasher();
  const otpSender = new FakeOtpSender();

  const useCase = new RequestAdminOtp({
    adminUserRepository,
    otpRepository,
    otpCodeGenerator,
    otpHasher,
    otpSender,
    otpExpiresMinutes: 2,
    otpRateLimitPerHour: 3
  });

  return { useCase, adminUserRepository, otpRepository, otpSender };
}

describe("RequestAdminOtp", () => {
  it("sends OTP to an active admin user", async () => {
    const { useCase, otpRepository, otpSender } = makeUseCase({
      adminUsers: [
        {
          id: "admin-1",
          phone: "+989121234567",
          role: ADMIN_ROLES.ADMIN,
          status: ADMIN_STATUS.ACTIVE
        }
      ]
    });

    const result = await useCase.execute({ phone: "09121234567" });

    expect(result.phone).toBe("+989121234567");
    expect(result.expiresAt).toBeInstanceOf(Date);
    expect(otpRepository.createdOtps).toHaveLength(1);
    expect(otpRepository.createdOtps[0].purpose).toBe(OTP_PURPOSES.ADMIN_LOGIN);
    expect(otpRepository.createdOtps[0].codeHash).toBe("hashed:654321");
    expect(otpSender.sentMessages).toEqual([
      {
        phone: "+989121234567",
        code: "654321",
        purpose: OTP_PURPOSES.ADMIN_LOGIN
      }
    ]);
  });

  it("blocks phone numbers that are not in admin_users", async () => {
    const { useCase } = makeUseCase();

    await expectAppError(useCase.execute({ phone: "09121234567" }), {
      statusCode: 403,
      code: "FORBIDDEN"
    });
  });

  it("blocks disabled admin users", async () => {
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

    await expectAppError(useCase.execute({ phone: "09121234567" }), {
      statusCode: 403,
      code: "FORBIDDEN"
    });
  });

  it("enforces hourly OTP rate limit", async () => {
    const { useCase } = makeUseCase({
      adminUsers: [
        {
          id: "admin-1",
          phone: "+989121234567",
          role: ADMIN_ROLES.MANAGER,
          status: ADMIN_STATUS.ACTIVE
        }
      ],
      recentCounts: {
        "+989121234567:admin_login": 3
      }
    });

    await expectAppError(useCase.execute({ phone: "09121234567" }), {
      statusCode: 429,
      code: "TOO_MANY_REQUESTS"
    });
  });
});
