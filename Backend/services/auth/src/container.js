import { env } from "./config/env.js";

import { RequestPublicOtp } from "./application/use-cases/RequestPublicOtp.js";
import { VerifyPublicOtp } from "./application/use-cases/VerifyPublicOtp.js";
import { RequestAdminOtp } from "./application/use-cases/RequestAdminOtp.js";
import { VerifyAdminOtp } from "./application/use-cases/VerifyAdminOtp.js";
import { RefreshPublicSession } from "./application/use-cases/RefreshPublicSession.js";
import { RefreshAdminSession } from "./application/use-cases/RefreshAdminSession.js";
import { LogoutSession } from "./application/use-cases/LogoutSession.js";

import { SequelizeUserRepository } from "./infrastructure/database/repositories/SequelizeUserRepository.js";
import { SequelizeChefAccountRepository } from "./infrastructure/database/repositories/SequelizeChefAccountRepository.js";
import { SequelizeAdminUserRepository } from "./infrastructure/database/repositories/SequelizeAdminUserRepository.js";
import { SequelizeOtpRepository } from "./infrastructure/database/repositories/SequelizeOtpRepository.js";
import { SequelizeRefreshTokenRepository } from "./infrastructure/database/repositories/SequelizeRefreshTokenRepository.js";

import { CryptoOtpCodeGenerator } from "./infrastructure/otp/CryptoOtpCodeGenerator.js";
import { BcryptOtpHasher } from "./infrastructure/otp/BcryptOtpHasher.js";
import { DevOtpSender } from "./infrastructure/otp/DevOtpSender.js";
import { JwtTokenService } from "./infrastructure/security/JwtTokenService.js";

import { PublicAuthController } from "./interfaces/http/controllers/PublicAuthController.js";
import { AdminAuthController } from "./interfaces/http/controllers/AdminAuthController.js";

import { createPublicAuthMiddleware } from "./interfaces/http/middlewares/publicAuthMiddleware.js";
import { createAdminAuthMiddleware } from "./interfaces/http/middlewares/adminAuthMiddleware.js";

export function createContainer() {
  const userRepository = new SequelizeUserRepository();
  const chefAccountRepository = new SequelizeChefAccountRepository();
  const adminUserRepository = new SequelizeAdminUserRepository();
  const otpRepository = new SequelizeOtpRepository();
  const refreshTokenRepository = new SequelizeRefreshTokenRepository();

  const otpCodeGenerator = new CryptoOtpCodeGenerator();
  const otpHasher = new BcryptOtpHasher();
  const otpSender = new DevOtpSender();

  const tokenService = new JwtTokenService({
    secret: env.jwt.secret,
    accessTokenExpiresIn: env.jwt.accessTokenExpiresIn
  });

  const publicAuthMiddleware = createPublicAuthMiddleware({
    tokenService
  });

  const adminAuthMiddleware = createAdminAuthMiddleware({
    tokenService
  });

  const requestPublicOtp = new RequestPublicOtp({
    otpRepository,
    otpCodeGenerator,
    otpHasher,
    otpSender,
    otpExpiresMinutes: env.otp.expiresMinutes,
    otpRateLimitPerHour: env.otp.rateLimitPerHour
  });

  const verifyPublicOtp = new VerifyPublicOtp({
    userRepository,
    chefAccountRepository,
    otpRepository,
    refreshTokenRepository,
    otpHasher,
    tokenService,
    refreshTokenExpiresDays: env.jwt.refreshTokenExpiresDays
  });

  const requestAdminOtp = new RequestAdminOtp({
    adminUserRepository,
    otpRepository,
    otpCodeGenerator,
    otpHasher,
    otpSender,
    otpExpiresMinutes: env.otp.expiresMinutes,
    otpRateLimitPerHour: env.otp.rateLimitPerHour
  });

  const verifyAdminOtp = new VerifyAdminOtp({
    adminUserRepository,
    otpRepository,
    refreshTokenRepository,
    otpHasher,
    tokenService,
    refreshTokenExpiresDays: env.jwt.refreshTokenExpiresDays
  });

  const refreshPublicSession = new RefreshPublicSession({
    userRepository,
    chefAccountRepository,
    refreshTokenRepository,
    tokenService,
    refreshTokenExpiresDays: env.jwt.refreshTokenExpiresDays
  });

  const refreshAdminSession = new RefreshAdminSession({
    adminUserRepository,
    refreshTokenRepository,
    tokenService,
    refreshTokenExpiresDays: env.jwt.refreshTokenExpiresDays
  });

  const logoutSession = new LogoutSession({
    refreshTokenRepository,
    tokenService
  });

  const publicAuthController = new PublicAuthController({
    requestPublicOtp,
    verifyPublicOtp,
    refreshPublicSession,
    logoutSession
  });

  const adminAuthController = new AdminAuthController({
    requestAdminOtp,
    verifyAdminOtp,
    refreshAdminSession,
    logoutSession
  });

  return {
    publicAuthController,
    adminAuthController,
    publicAuthMiddleware,
    adminAuthMiddleware
  };
}