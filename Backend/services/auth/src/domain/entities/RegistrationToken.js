export class RegistrationToken {
  constructor({
    id = null,
    tokenId,
    phone,
    role,
    flow,
    expiresAt,
    consumedAt = null,
    createdAt = null
  }) {
    if (!tokenId) {
      throw new Error("RegistrationToken tokenId is required");
    }

    if (!phone) {
      throw new Error("RegistrationToken phone is required");
    }

    if (!role) {
      throw new Error("RegistrationToken role is required");
    }

    if (!flow) {
      throw new Error("RegistrationToken flow is required");
    }

    if (!expiresAt) {
      throw new Error("RegistrationToken expiresAt is required");
    }

    this.id = id;
    this.tokenId = tokenId;
    this.phone = phone;
    this.role = role;
    this.flow = flow;
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
    return !this.isExpired(now) && !this.isConsumed();
  }
}
