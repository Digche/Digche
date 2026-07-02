import {
  AppError,
  TooManyRequestsError
} from "../errors/AppError.js";

import { OTP_PURPOSES } from "../../domain/constants/otpPurposes.js";
import { OtpCode } from "../../domain/entities/OtpCode.js";
import { PhoneNumber } from "../../domain/value-objects/PhoneNumber.js";

export class RequestAdminUserPhoneOtp {
  constructor({
    adminUserRepository,
    otpRepository,
    otpCodeGenerator,
    otpHasher,
    otpSender,
    otpRateLimiter = null,
    otpExpiresMinutes,
    otpRateLimitPerHour,
    otpCooldownSeconds = 60
  }) {
    this.adminUserRepository = adminUserRepository;
    this.otpRepository = otpRepository;
    this.otpCodeGenerator = otpCodeGenerator;
    this.otpHasher = otpHasher;
    this.otpSender = otpSender;
    this.otpRateLimiter = otpRateLimiter;
    this.otpExpiresMinutes = otpExpiresMinutes;
    this.otpRateLimitPerHour = otpRateLimitPerHour;
    this.otpCooldownSeconds = otpCooldownSeconds;
  }

  async execute({ phone }) {
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

    await this.enforceRateLimit({
      phone: normalizedPhone,
      purpose: OTP_PURPOSES.ADMIN_ADD_PHONE
    });

    const code = this.otpCodeGenerator.generate();
    const codeHash = await this.otpHasher.hash(code);

    const expiresAt = new Date(
      Date.now() + this.otpExpiresMinutes * 60 * 1000
    );

    await this.otpRepository.create(
      new OtpCode({
        phone: normalizedPhone,
        purpose: OTP_PURPOSES.ADMIN_ADD_PHONE,
        codeHash,
        expiresAt
      })
    );

    await this.otpSender.send({
      phone: normalizedPhone,
      code,
      purpose: OTP_PURPOSES.ADMIN_ADD_PHONE
    });

    return {
      message: "OTP sent successfully",
      phone: normalizedPhone,
      expiresAt
    };
  }

  async enforceRateLimit({ phone, purpose }) {
    if (this.otpRateLimiter) {
      await this.otpRateLimiter.checkAndIncrement({
        phone,
        purpose,
        maxPerHour: this.otpRateLimitPerHour,
        cooldownSeconds: this.otpCooldownSeconds
      });

      return;
    }

    const recentOtpCount = await this.otpRepository.countCreatedInLastHour(
      phone,
      purpose
    );

    if (recentOtpCount >= this.otpRateLimitPerHour) {
      throw new TooManyRequestsError("OTP request limit exceeded");
    }
  }
}
