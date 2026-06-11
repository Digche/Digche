import { AppError, TooManyRequestsError } from "../errors/AppError.js";

import { OtpCode } from "../../domain/entities/OtpCode.js";
import { OTP_PURPOSES } from "../../domain/constants/otpPurposes.js";
import { PhoneNumber } from "../../domain/value-objects/PhoneNumber.js";

export class RequestPublicPhoneChangeOtp {
  constructor({
    userRepository,
    otpRepository,
    otpCodeGenerator,
    otpHasher,
    otpSender,
    otpRateLimiter = null,
    otpExpiresMinutes,
    otpRateLimitPerHour,
    otpCooldownSeconds = 60
  }) {
    this.userRepository = userRepository;
    this.otpRepository = otpRepository;
    this.otpCodeGenerator = otpCodeGenerator;
    this.otpHasher = otpHasher;
    this.otpSender = otpSender;
    this.otpRateLimiter = otpRateLimiter;
    this.otpExpiresMinutes = otpExpiresMinutes;
    this.otpRateLimitPerHour = otpRateLimitPerHour;
    this.otpCooldownSeconds = otpCooldownSeconds;
  }

  async execute({ userId, currentPhone, newPhone }) {
    if (!userId) {
      throw new AppError("User id is required", 400, "USER_ID_REQUIRED");
    }

    const normalizedCurrentPhone = PhoneNumber.normalize(currentPhone);
    const normalizedNewPhone = PhoneNumber.normalize(newPhone);

    if (normalizedCurrentPhone === normalizedNewPhone) {
      throw new AppError(
        "New phone must be different from current phone",
        400,
        "SAME_PHONE_NUMBER"
      );
    }

    const existingUser = await this.userRepository.findByPhone(
      normalizedNewPhone
    );

    if (existingUser && existingUser.id !== userId) {
      throw new AppError(
        "Phone number is already in use",
        409,
        "PHONE_ALREADY_IN_USE"
      );
    }

    await this.enforceRateLimit({
      phone: normalizedNewPhone,
      purpose: OTP_PURPOSES.PUBLIC_CHANGE_PHONE
    });

    const code = this.otpCodeGenerator.generate();
    const codeHash = await this.otpHasher.hash(code);

    const expiresAt = new Date(
      Date.now() + this.otpExpiresMinutes * 60 * 1000
    );

    const otpCode = new OtpCode({
      phone: normalizedNewPhone,
      purpose: OTP_PURPOSES.PUBLIC_CHANGE_PHONE,
      codeHash,
      expiresAt
    });

    await this.otpRepository.create(otpCode);

    await this.otpSender.send({
      phone: normalizedNewPhone,
      code,
      purpose: OTP_PURPOSES.PUBLIC_CHANGE_PHONE
    });

    return {
      newPhone: normalizedNewPhone,
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