import { AppError, UnauthorizedError } from "../errors/AppError.js";

import { OTP_PURPOSES } from "../../domain/constants/otpPurposes.js";
import { PhoneNumber } from "../../domain/value-objects/PhoneNumber.js";

export class VerifyAdminUserPhoneOtp {
  constructor({
    adminUserRepository,
    otpRepository,
    otpHasher
  }) {
    this.adminUserRepository = adminUserRepository;
    this.otpRepository = otpRepository;
    this.otpHasher = otpHasher;
  }

  async execute({ phone, code }) {
    if (!code) {
      throw new AppError("OTP code is required", 400, "OTP_CODE_REQUIRED");
    }

    const normalizedPhone = PhoneNumber.normalize(phone);

    const existingAdminUser =
      await this.adminUserRepository.findByPhone(normalizedPhone);

    if (existingAdminUser) {
      throw new AppError(
        "Admin user already exists",
        409,
        "ADMIN_ALREADY_EXISTS"
      );
    }

    const otpCode = await this.otpRepository.findLatestValidByPhoneAndPurpose(
      normalizedPhone,
      OTP_PURPOSES.ADMIN_ADD_PHONE
    );

    if (!otpCode || !otpCode.canBeUsed()) {
      throw new UnauthorizedError("Invalid or expired OTP code");
    }

    const isCodeValid = await this.otpHasher.compare(code, otpCode.codeHash);

    if (!isCodeValid) {
      throw new UnauthorizedError("Invalid or expired OTP code");
    }

    const consumed = await this.otpRepository.consume(otpCode.id);

    if (!consumed) {
      throw new UnauthorizedError("Invalid or expired OTP code");
    }

    return {
      verified: true,
      phone: normalizedPhone
    };
  }
}
