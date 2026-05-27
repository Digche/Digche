import { describe, expect, it } from "vitest";

import { RequestAdminPhoneChangeOtp } from "../../../src/application/use-cases/RequestAdminPhoneChangeOtp.js";
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
  const otpCodeGenerator = new FakeOtpCodeGenerator("222333");
  const otpHasher = new FakeOtpHasher();
  const otpSender = new FakeOtpSender();

  const useCase = new RequestAdminPhoneChangeOtp({
    adminUserRepository,
    otpRepository,
    otpCodeGenerator,
    otpHasher,
    otpSender,
    otpExpiresMinutes: 2,
    otpRateLimitPerHour: 3
  });

  return { useCase, otpRepository, otpSender };
}

describe("RequestAdminPhoneChangeOtp", () => {
  it("sends OTP to the manager new phone", async () => {
    const { useCase, otpRepository, otpSender } = makeUseCase({
      adminUsers: [
        {
          id: "manager-1",
          phone: "+989121111111",
          role: ADMIN_ROLES.MANAGER,
          status: ADMIN_STATUS.ACTIVE
        }
      ]
    });

    const result = await useCase.execute({ adminId: "manager-1", newPhone: "09122222222" });

    expect(result).toMatchObject({
      message: "OTP sent successfully",
      newPhone: "+989122222222"
    });
    expect(otpRepository.createdOtps[0]).toMatchObject({
      phone: "+989122222222",
      purpose: OTP_PURPOSES.ADMIN_CHANGE_PHONE,
      codeHash: "hashed:222333"
    });
    expect(otpSender.sentMessages).toEqual([
      {
        phone: "+989122222222",
        code: "222333",
        purpose: OTP_PURPOSES.ADMIN_CHANGE_PHONE
      }
    ]);
  });

  it("allows only managers to request manager phone change OTP", async () => {
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

    await expectAppError(useCase.execute({ adminId: "admin-1", newPhone: "09122222222" }), {
      statusCode: 403,
      code: "FORBIDDEN"
    });
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

    await expectAppError(useCase.execute({ adminId: "manager-1", newPhone: "09122222222" }), {
      statusCode: 409,
      code: "PHONE_ALREADY_IN_USE"
    });
  });

  it("enforces OTP rate limit for the new phone", async () => {
    const { useCase } = makeUseCase({
      adminUsers: [
        {
          id: "manager-1",
          phone: "+989121111111",
          role: ADMIN_ROLES.MANAGER,
          status: ADMIN_STATUS.ACTIVE
        }
      ],
      recentCounts: {
        "+989122222222:admin_change_phone": 3
      }
    });

    await expectAppError(useCase.execute({ adminId: "manager-1", newPhone: "09122222222" }), {
      statusCode: 429,
      code: "TOO_MANY_REQUESTS"
    });
  });
});
