import {
  AppError,
  ForbiddenError,
  TooManyRequestsError
} from "../errors/AppError.js";

import { ADMIN_ROLES } from "../../domain/constants/roles.js";
import { ADMIN_STATUS } from "../../domain/constants/statuses.js";
import { OTP_PURPOSES } from "../../domain/constants/otpPurposes.js";
import { OtpCode } from "../../domain/entities/OtpCode.js";
import { PhoneNumber } from "../../domain/value-objects/PhoneNumber.js";

export class RequestAdminPhoneChangeOtp {
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

  async execute({ adminId, newPhone }) {
    if (!adminId) {
      throw new AppError("Admin id is required", 400, "ADMIN_ID_REQUIRED");
    }

    const adminUser = await this.adminUserRepository.findById(adminId);

    if (!adminUser) {
      throw new ForbiddenError("Manager access is required");
    }

    if (adminUser.status !== ADMIN_STATUS.ACTIVE) {
      throw new ForbiddenError("Manager account is not active");
    }

    if (adminUser.role !== ADMIN_ROLES.MANAGER) {
      throw new ForbiddenError("Only manager can change manager phone");
    }

    const normalizedNewPhone = PhoneNumber.normalize(newPhone);

    if (adminUser.phone === normalizedNewPhone) {
      throw new AppError(
        "New phone must be different from current phone",
        400,
        "SAME_PHONE_NUMBER"
      );
    }

    const existingAdminUser = await this.adminUserRepository.findByPhone(
      normalizedNewPhone
    );

    if (existingAdminUser && existingAdminUser.id !== adminUser.id) {
      throw new AppError(
        "Phone number is already in use",
        409,
        "PHONE_ALREADY_IN_USE"
      );
    }

    await this.enforceRateLimit({
      phone: normalizedNewPhone,
      purpose: OTP_PURPOSES.ADMIN_CHANGE_PHONE
    });

    const code = this.otpCodeGenerator.generate();
    const codeHash = await this.otpHasher.hash(code);

    const expiresAt = new Date(
      Date.now() + this.otpExpiresMinutes * 60 * 1000
    );

    const otpCode = new OtpCode({
      phone: normalizedNewPhone,
      purpose: OTP_PURPOSES.ADMIN_CHANGE_PHONE,
      codeHash,
      expiresAt
    });

    await this.otpRepository.create(otpCode);

    await this.otpSender.send({
      phone: normalizedNewPhone,
      code,
      purpose: OTP_PURPOSES.ADMIN_CHANGE_PHONE
    });

    return {
      message: "OTP sent successfully",
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