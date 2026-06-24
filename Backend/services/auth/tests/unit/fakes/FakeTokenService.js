export class FakeTokenService {
  constructor() {
    this.signedPayloads = [];
    this.signedRegistrationPayloads = [];
    this.refreshTokenCounter = 0;
    this.tokenIdCounter = 0;
    this.accessTokensByValue = new Map();
    this.registrationTokensByValue = new Map();
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

  signRegistrationToken(payload) {
    this.signedRegistrationPayloads.push(payload);
    const token = `registration-token-${this.signedRegistrationPayloads.length}`;
    this.registrationTokensByValue.set(token, {
      ...payload,
      tokenType: "registration"
    });
    return token;
  }

  verifyRegistrationToken(token) {
    if (token === "expired-registration-token" || token === "invalid-registration-token") {
      throw new Error("Invalid registration token");
    }

    if (!this.registrationTokensByValue.has(token)) {
      throw new Error("Invalid registration token");
    }

    return this.registrationTokensByValue.get(token);
  }

  generateRefreshToken() {
    this.refreshTokenCounter += 1;
    return `refresh-token-${this.refreshTokenCounter}`;
  }

  hashRefreshToken(refreshToken) {
    return `hash:${refreshToken}`;
  }

  generateTokenId() {
    this.tokenIdCounter += 1;
    return `token-id-${this.tokenIdCounter}`;
  }

  registerAccessToken(token, payload) {
    this.accessTokensByValue.set(token, payload);
  }

  registerRegistrationToken(token, payload) {
    this.registrationTokensByValue.set(token, {
      ...payload,
      tokenType: "registration"
    });
  }
}
