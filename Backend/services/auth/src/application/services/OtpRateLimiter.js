export class OtpRateLimiter {
  async checkAndIncrement({
    phone,
    purpose,
    maxPerHour,
    cooldownSeconds
  }) {
    throw new Error("OtpRateLimiter.checkAndIncrement is not implemented");
  }
}