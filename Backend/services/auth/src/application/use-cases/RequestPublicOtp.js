import { OtpCode } from "../../domain/entities/OtpCode.js";
import { PhoneNumber } from "../../domain/value-objects/PhoneNumber.js";
import { OTP_PURPOSES } from "../../domain/constants/otpPurposes.js";
import { USER_ROLES } from "../../domain/constants/roles.js";
import { AppError, TooManyRequestsError } from "../errors/AppError.js";

export class RequestPublicOtp {
  constructor({
    otpRepository,
    otpCodeGenerator,
    otpHasher,
    otpSender,
    otpRateLimiter = null,
    otpExpiresMinutes,
    otpRateLimitPerHour,
    otpCooldownSeconds = 60
  }) {
    this.otpRepository = otpRepository;
    this.otpCodeGenerator = otpCodeGenerator;
    this.otpHasher = otpHasher;
    this.otpSender = otpSender;
    this.otpRateLimiter = otpRateLimiter;
    this.otpExpiresMinutes = otpExpiresMinutes;
    this.otpRateLimitPerHour = otpRateLimitPerHour;
    this.otpCooldownSeconds = otpCooldownSeconds;
  }

  async execute({ phone, role }) {
    const normalizedPhone = PhoneNumber.normalize(phone);

    if (!Object.values(USER_ROLES).includes(role)) {
      throw new AppError("Invalid public role", 400, "INVALID_PUBLIC_ROLE");
    }

    await this.enforceRateLimit({
      phone: normalizedPhone,
      purpose: OTP_PURPOSES.PUBLIC_LOGIN
    });

    const code = this.otpCodeGenerator.generate();
    const codeHash = await this.otpHasher.hash(code);

    const expiresAt = new Date(
      Date.now() + this.otpExpiresMinutes * 60 * 1000
    );

    const otpCode = new OtpCode({
      phone: normalizedPhone,
      purpose: OTP_PURPOSES.PUBLIC_LOGIN,
      codeHash,
      expiresAt
    });

    await this.otpRepository.create(otpCode);

    await this.otpSender.send({
      phone: normalizedPhone,
      code,
      purpose: OTP_PURPOSES.PUBLIC_LOGIN
    });

    return {
      phone: normalizedPhone,
      role,
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