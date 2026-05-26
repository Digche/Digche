export class OtpCode {
  constructor({
    id = null,
    phone,
    purpose,
    codeHash,
    expiresAt,
    consumedAt = null,
    createdAt = null
  }) {
    if (!phone) {
      throw new Error("OTP phone is required");
    }

    if (!purpose) {
      throw new Error("OTP purpose is required");
    }

    if (!codeHash) {
      throw new Error("OTP code hash is required");
    }

    if (!expiresAt) {
      throw new Error("OTP expiration time is required");
    }

    this.id = id;
    this.phone = phone;
    this.purpose = purpose;
    this.codeHash = codeHash;
    this.expiresAt = expiresAt;
    this.consumedAt = consumedAt;
    this.createdAt = createdAt;
  }

  isExpired(now = new Date()) {
    return now > this.expiresAt;
  }

  isConsumed() {
    return Boolean(this.consumedAt);
  }

  canBeUsed(now = new Date()) {
    return !this.isConsumed() && !this.isExpired(now);
  }
}