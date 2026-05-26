export class RefreshToken {
  constructor({
    id = null,
    ownerId,
    ownerType,
    tokenHash,
    expiresAt,
    revokedAt = null,
    createdAt = null
  }) {
    if (!ownerId) {
      throw new Error("RefreshToken ownerId is required");
    }

    if (!ownerType) {
      throw new Error("RefreshToken ownerType is required");
    }

    if (!tokenHash) {
      throw new Error("RefreshToken tokenHash is required");
    }

    if (!expiresAt) {
      throw new Error("RefreshToken expiresAt is required");
    }

    this.id = id;
    this.ownerId = ownerId;
    this.ownerType = ownerType;
    this.tokenHash = tokenHash;
    this.expiresAt = expiresAt;
    this.revokedAt = revokedAt;
    this.createdAt = createdAt;
  }

  isExpired(now = new Date()) {
    return now > this.expiresAt;
  }

  isRevoked() {
    return Boolean(this.revokedAt);
  }

  canBeUsed(now = new Date()) {
    return !this.isExpired(now) && !this.isRevoked();
  }
}