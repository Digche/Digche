export class FakeTokenService {
  constructor() {
    this.signedPayloads = [];
    this.refreshTokenCounter = 0;
    this.accessTokensByValue = new Map();
  }

  signAccessToken(payload) {
    this.signedPayloads.push(payload);
    const token = `access-token-${this.signedPayloads.length}`;
    this.accessTokensByValue.set(token, payload);
    return token;
  }

  verifyAccessToken(token) {
    if (token === "expired-token") {
      const error = new Error("jwt expired");
      error.name = "TokenExpiredError";
      throw error;
    }

    if (token === "invalid-token") {
      const error = new Error("invalid token");
      error.name = "JsonWebTokenError";
      throw error;
    }

    if (!this.accessTokensByValue.has(token)) {
      const error = new Error("invalid token");
      error.name = "JsonWebTokenError";
      throw error;
    }

    return this.accessTokensByValue.get(token);
  }

  generateRefreshToken() {
    this.refreshTokenCounter += 1;
    return `refresh-token-${this.refreshTokenCounter}`;
  }

  hashRefreshToken(refreshToken) {
    return `hash:${refreshToken}`;
  }

  registerAccessToken(token, payload) {
    this.accessTokensByValue.set(token, payload);
  }
}
