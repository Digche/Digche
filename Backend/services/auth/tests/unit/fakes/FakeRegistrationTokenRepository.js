import { RegistrationToken } from "../../../src/domain/entities/RegistrationToken.js";

export class FakeRegistrationTokenRepository {
  constructor({ registrationTokens = [] } = {}) {
    this.registrationTokens = registrationTokens.map((token) =>
      this.toRegistrationToken(token)
    );
    this.createdRegistrationTokens = [];
    this.consumedTokenIds = [];
  }

  toRegistrationToken(registrationToken) {
    if (registrationToken instanceof RegistrationToken) {
      return registrationToken;
    }

    return new RegistrationToken(registrationToken);
  }

  async create(registrationToken) {
    const createdRegistrationToken = this.toRegistrationToken({
      id: registrationToken.id || `registration-${this.registrationTokens.length + 1}`,
      tokenId: registrationToken.tokenId,
      phone: registrationToken.phone,
      role: registrationToken.role,
      flow: registrationToken.flow,
      expiresAt: registrationToken.expiresAt,
      consumedAt: registrationToken.consumedAt,
      createdAt: registrationToken.createdAt || new Date("2026-01-01T00:00:00.000Z")
    });

    this.registrationTokens.push(createdRegistrationToken);
    this.createdRegistrationTokens.push(createdRegistrationToken);

    return createdRegistrationToken;
  }

  async findByTokenId(tokenId) {
    return this.registrationTokens.find((token) => token.tokenId === tokenId) || null;
  }

  async consume(tokenId) {
    const registrationToken = await this.findByTokenId(tokenId);

    if (!registrationToken || registrationToken.consumedAt) {
      return false;
    }

    registrationToken.consumedAt = new Date();
    this.consumedTokenIds.push(tokenId);

    return true;
  }
}
