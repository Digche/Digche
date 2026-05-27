export class FakeRefreshTokenRepository {
  constructor({ refreshTokens = [] } = {}) {
    this.refreshTokens = [...refreshTokens];
    this.createdRefreshTokens = [];
    this.revokedIds = [];
    this.revokedOwners = [];
  }

  async create(refreshToken) {
    const createdRefreshToken = {
      ...refreshToken,
      id: refreshToken.id || `refresh-${this.refreshTokens.length + this.createdRefreshTokens.length + 1}`
    };

    this.refreshTokens.push(createdRefreshToken);
    this.createdRefreshTokens.push(createdRefreshToken);

    return createdRefreshToken;
  }

  async findByTokenHash(tokenHash) {
    return this.refreshTokens.find((refreshToken) => refreshToken.tokenHash === tokenHash) || null;
  }

  async revoke(id) {
    this.revokedIds.push(id);

    const refreshToken = this.refreshTokens.find((candidate) => candidate.id === id);
    if (refreshToken) {
      refreshToken.revokedAt = new Date();
    }
  }

  async revokeAllForOwner(ownerId, ownerType) {
    this.revokedOwners.push({ ownerId, ownerType });

    for (const refreshToken of this.refreshTokens) {
      if (refreshToken.ownerId === ownerId && refreshToken.ownerType === ownerType && !refreshToken.revokedAt) {
        refreshToken.revokedAt = new Date();
        this.revokedIds.push(refreshToken.id);
      }
    }
  }
}
