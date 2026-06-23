import { OtpRateLimiter } from "../../application/services/OtpRateLimiter.js";
import { TooManyRequestsError } from "../../application/errors/AppError.js";

export class CacheOtpRateLimiter extends OtpRateLimiter {
  constructor({ cacheService }) {
    super();

    this.cacheService = cacheService;
  }

  async checkAndIncrement({
    phone,
    purpose,
    maxPerHour,
    cooldownSeconds
  }) {
    const safePhone = this.normalizePhoneForKey(phone);

    const cooldownKey = `otp:cooldown:${purpose}:${safePhone}`;
    const hourlyKey = `otp:hourly:${purpose}:${safePhone}`;

    const isInCooldown = await this.cacheService.exists(cooldownKey);

    if (isInCooldown) {
      const remainingSeconds = await this.cacheService.ttl(cooldownKey);

      throw new TooManyRequestsError(
        `Please wait ${remainingSeconds} seconds before requesting another OTP`
      );
    }

    const requestCount = await this.cacheService.increment(hourlyKey, 60 * 60);

    if (requestCount > maxPerHour) {
      throw new TooManyRequestsError("OTP request limit exceeded");
    }

    await this.cacheService.set(cooldownKey, true, cooldownSeconds);

    return {
      allowed: true,
      requestCount
    };
  }

  normalizePhoneForKey(phone) {
    return String(phone).replace(/[^0-9]/g, "");
  }
}