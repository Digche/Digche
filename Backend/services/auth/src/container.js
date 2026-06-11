import { env } from "./config/env.js";

import { RequestPublicOtp } from "./application/use-cases/RequestPublicOtp.js";
import { VerifyPublicOtp } from "./application/use-cases/VerifyPublicOtp.js";
import { RequestAdminOtp } from "./application/use-cases/RequestAdminOtp.js";
import { VerifyAdminOtp } from "./application/use-cases/VerifyAdminOtp.js";
import { RefreshPublicSession } from "./application/use-cases/RefreshPublicSession.js";
import { RefreshAdminSession } from "./application/use-cases/RefreshAdminSession.js";
import { LogoutSession } from "./application/use-cases/LogoutSession.js";
import { AddAdminUser } from "./application/use-cases/AddAdminUser.js";
import { ListAdminUsers } from "./application/use-cases/ListAdminUsers.js";
import { DisableAdminUser } from "./application/use-cases/DisableAdminUser.js";
import { RequestPublicPhoneChangeOtp } from "./application/use-cases/RequestPublicPhoneChangeOtp.js";
import { VerifyPublicPhoneChangeOtp } from "./application/use-cases/VerifyPublicPhoneChangeOtp.js";
import { ChangeAdminUserPhone } from "./application/use-cases/ChangeAdminUserPhone.js";
import { RequestAdminPhoneChangeOtp } from "./application/use-cases/RequestAdminPhoneChangeOtp.js";
import { VerifyAdminPhoneChangeOtp } from "./application/use-cases/VerifyAdminPhoneChangeOtp.js";

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
import { AdminUserController } from "./interfaces/http/controllers/AdminUserController.js";

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
    accessTokenExpiresIn: env.jwt.accessTokenExpiresIn,
    registrationTokenExpiresIn: env.jwt.registrationTokenExpiresIn
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

  const requestPublicPhoneChangeOtp = new RequestPublicPhoneChangeOtp({
    userRepository,
    otpRepository,
    otpCodeGenerator,
    otpHasher,
    otpSender,
    otpExpiresMinutes: env.otp.expiresMinutes,
    otpRateLimitPerHour: env.otp.rateLimitPerHour
  });

  const verifyPublicPhoneChangeOtp = new VerifyPublicPhoneChangeOtp({
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

  const requestAdminPhoneChangeOtp = new RequestAdminPhoneChangeOtp({
    adminUserRepository,
    otpRepository,
    otpCodeGenerator,
    otpHasher,
    otpSender,
    otpExpiresMinutes: env.otp.expiresMinutes,
    otpRateLimitPerHour: env.otp.rateLimitPerHour
  });

  const verifyAdminPhoneChangeOtp = new VerifyAdminPhoneChangeOtp({
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

  const addAdminUser = new AddAdminUser({
    adminUserRepository
  });

  const listAdminUsers = new ListAdminUsers({
    adminUserRepository
  });

  const disableAdminUser = new DisableAdminUser({
    adminUserRepository
  });

  const changeAdminUserPhone = new ChangeAdminUserPhone({
    adminUserRepository,
    refreshTokenRepository
  });

  const publicAuthController = new PublicAuthController({
    requestPublicOtp,
    verifyPublicOtp,
    refreshPublicSession,
    logoutSession,
    requestPublicPhoneChangeOtp,
    verifyPublicPhoneChangeOtp
  });

  const adminAuthController = new AdminAuthController({
    requestAdminOtp,
    verifyAdminOtp,
    refreshAdminSession,
    logoutSession,
    requestAdminPhoneChangeOtp,
    verifyAdminPhoneChangeOtp
  });

  const adminUserController = new AdminUserController({
    addAdminUser,
    listAdminUsers,
    disableAdminUser,
    changeAdminUserPhone
  });

  return {
    publicAuthController,
    adminAuthController,
    adminUserController,
    publicAuthMiddleware,
    adminAuthMiddleware
  };
}