import { OtpCode } from "../../domain/entities/OtpCode.js";
import { PhoneNumber } from "../../domain/value-objects/PhoneNumber.js";
import { OTP_PURPOSES } from "../../domain/constants/otpPurposes.js";
import {
  ForbiddenError,
  TooManyRequestsError
} from "../errors/AppError.js";

export class RequestAdminOtp {
  constructor({
    adminUserRepository,
    otpRepository,
    otpCodeGenerator,
    otpHasher,
    otpSender,
    otpExpiresMinutes,
    otpRateLimitPerHour
  }) {
    this.adminUserRepository = adminUserRepository;
    this.otpRepository = otpRepository;
    this.otpCodeGenerator = otpCodeGenerator;
    this.otpHasher = otpHasher;
    this.otpSender = otpSender;
    this.otpExpiresMinutes = otpExpiresMinutes;
    this.otpRateLimitPerHour = otpRateLimitPerHour;
  }

  async execute({ phone }) {
    const normalizedPhone = PhoneNumber.normalize(phone);

    const adminUser =
      await this.adminUserRepository.findByPhone(normalizedPhone);

    if (!adminUser || !adminUser.isActive()) {
      throw new ForbiddenError("You are not allowed to access admin panel");
    }

    const recentOtpCount =
      await this.otpRepository.countCreatedInLastHour(
        normalizedPhone,
        OTP_PURPOSES.ADMIN_LOGIN
      );

    if (recentOtpCount >= this.otpRateLimitPerHour) {
      throw new TooManyRequestsError("OTP request limit exceeded");
    }

    const code = this.otpCodeGenerator.generate();
    const codeHash = await this.otpHasher.hash(code);

    const expiresAt = new Date(
      Date.now() + this.otpExpiresMinutes * 60 * 1000
    );

    const otpCode = new OtpCode({
      phone: normalizedPhone,
      purpose: OTP_PURPOSES.ADMIN_LOGIN,
      codeHash,
      expiresAt
    });

    await this.otpRepository.create(otpCode);

    await this.otpSender.send({
      phone: normalizedPhone,
      code,
      purpose: OTP_PURPOSES.ADMIN_LOGIN
    });

    return {
      phone: normalizedPhone,
      expiresAt
    };
  }
}