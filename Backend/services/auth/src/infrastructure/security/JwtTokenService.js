import crypto from "crypto";
import jwt from "jsonwebtoken";
import { TokenService } from "../../application/services/TokenService.js";

export class JwtTokenService extends TokenService {
  constructor({
    secret,
    accessTokenExpiresIn,
    refreshTokenBytes = 64
  }) {
    super();

    if (!secret) {
      throw new Error("JWT secret is required");
    }

    this.secret = secret;
    this.accessTokenExpiresIn = accessTokenExpiresIn || "15m";
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

  generateRefreshToken() {
    return crypto.randomBytes(this.refreshTokenBytes).toString("hex");
  }

  hashRefreshToken(refreshToken) {
    return crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");
  }
}