import { OtpCode } from "../../domain/entities/OtpCode.js";
import { PhoneNumber } from "../../domain/value-objects/PhoneNumber.js";
import { OTP_PURPOSES } from "../../domain/constants/otpPurposes.js";
import { USER_ROLES } from "../../domain/constants/roles.js";
import { PUBLIC_AUTH_FLOWS } from "../../domain/constants/authFlows.js";
import { AppError, TooManyRequestsError } from "../errors/AppError.js";

export class RequestPublicOtp {
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

  async execute({ phone, role, flow }) {
    const normalizedPhone = PhoneNumber.normalize(phone);
    const normalizedFlow = this.normalizeFlow(flow);

    if (!Object.values(USER_ROLES).includes(role)) {
      throw new AppError("Invalid public role", 400, "INVALID_PUBLIC_ROLE");
    }

    await this.ensureRegistrationIsAllowed({
      phone: normalizedPhone,
      role,
      flow: normalizedFlow
    });

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
      flow: normalizedFlow,
      expiresAt
    };
  }

  async ensureRegistrationIsAllowed({ phone, role, flow }) {
    if (flow !== PUBLIC_AUTH_FLOWS.REGISTER) {
      return;
    }

    const user = await this.userRepository.findByPhone(phone);

    if (!user) {
      return;
    }

    if (user.hasRole(role) && user.hasCompletedProfile()) {
      throw new AppError(
        "Public account already exists for this phone and role",
        409,
        "PUBLIC_ACCOUNT_ALREADY_EXISTS"
      );
    }
  }

  normalizeFlow(flow) {
    const normalizedFlow = String(flow || "").trim();

    if (!Object.values(PUBLIC_AUTH_FLOWS).includes(normalizedFlow)) {
      throw new AppError(
        "Invalid public auth flow",
        400,
        "INVALID_PUBLIC_AUTH_FLOW"
      );
    }

    return normalizedFlow;
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