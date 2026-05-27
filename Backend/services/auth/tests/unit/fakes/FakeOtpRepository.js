export class FakeOtpRepository {
  constructor({ otps = [], recentCounts = {} } = {}) {
    this.otps = [...otps];
    this.recentCounts = { ...recentCounts };
    this.createdOtps = [];
    this.consumedIds = [];
  }

  key(phone, purpose) {
    return `${phone}:${purpose}`;
  }

  setRecentCount(phone, purpose, count) {
    this.recentCounts[this.key(phone, purpose)] = count;
  }

  async create(otpCode) {
    otpCode.id = otpCode.id || `otp-${this.otps.length + this.createdOtps.length + 1}`;

    this.otps.push(otpCode);
    this.createdOtps.push(otpCode);

    return otpCode;
  }

  async findLatestValidByPhoneAndPurpose(phone, purpose) {
    return [...this.otps]
      .reverse()
      .find((otpCode) => otpCode.phone === phone && otpCode.purpose === purpose) || null;
  }

  async countCreatedInLastHour(phone, purpose) {
    return this.recentCounts[this.key(phone, purpose)] || 0;
  }

  async consume(id) {
    this.consumedIds.push(id);

    const otpCode = this.otps.find((candidate) => candidate.id === id);
    if (otpCode) {
      otpCode.consumedAt = new Date();
    }
  }
}
