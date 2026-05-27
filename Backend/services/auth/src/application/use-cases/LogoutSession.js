import { AppError } from "../errors/AppError.js";

export class LogoutSession {
  constructor({
    refreshTokenRepository,
    tokenService
  }) {
    this.refreshTokenRepository = refreshTokenRepository;
    this.tokenService = tokenService;
  }

  async execute({ refreshToken }) {
    if (!refreshToken) {
      throw new AppError("Refresh token is required", 400, "REFRESH_TOKEN_REQUIRED");
    }

    const refreshTokenHash = this.tokenService.hashRefreshToken(refreshToken);

    const storedRefreshToken =
      await this.refreshTokenRepository.findByTokenHash(refreshTokenHash);

    if (!storedRefreshToken) {
      return {
        success: true
      };
    }

    await this.refreshTokenRepository.revoke(storedRefreshToken.id);

    return {
      success: true
    };
  }
}