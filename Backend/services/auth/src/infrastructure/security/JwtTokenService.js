import crypto from "crypto";
import jwt from "jsonwebtoken";
import { TokenService } from "../../application/services/TokenService.js";

export class JwtTokenService extends TokenService {
  constructor({
    secret,
    accessTokenExpiresIn,
    registrationTokenExpiresIn = "10m",
    refreshTokenBytes = 64
  }) {
    super();

    if (!secret) {
      throw new Error("JWT secret is required");
    }

    this.secret = secret;
    this.accessTokenExpiresIn = accessTokenExpiresIn || "15m";
    this.registrationTokenExpiresIn = registrationTokenExpiresIn;
    this.refreshTokenBytes = refreshTokenBytes;
  }

  signAccessToken(payload) {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.accessTokenExpiresIn
    });
  }

  verifyAccessToken(token) {
    return jwt.verify(token, this.secret);
  }

  signRegistrationToken(payload) {
    return jwt.sign(
      {
        ...payload,
        tokenType: "registration"
      },
      this.secret,
      {
        expiresIn: this.registrationTokenExpiresIn
      }
    );
  }

  verifyRegistrationToken(token) {
    const payload = jwt.verify(token, this.secret);

    if (payload.tokenType !== "registration") {
      throw new Error("Invalid registration token");
    }

    return payload;
  }

  generateRefreshToken() {
    return crypto.randomBytes(this.refreshTokenBytes).toString("hex");
  }

  hashRefreshToken(refreshToken) {
    return crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");
  }

  generateTokenId() {
    return crypto.randomUUID();
  }
}