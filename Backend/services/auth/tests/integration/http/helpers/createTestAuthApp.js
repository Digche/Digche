import express from "express";

import { AdminAuthController } from "../../../../src/interfaces/http/controllers/AdminAuthController.js";
import { AdminUserController } from "../../../../src/interfaces/http/controllers/AdminUserController.js";
import { PublicAuthController } from "../../../../src/interfaces/http/controllers/PublicAuthController.js";

import { createAdminAuthRoutes } from "../../../../src/interfaces/http/routes/adminAuthRoutes.js";
import { createAdminUserRoutes } from "../../../../src/interfaces/http/routes/adminUserRoutes.js";
import { createPublicAuthRoutes } from "../../../../src/interfaces/http/routes/publicAuthRoutes.js";

import { createAdminAuthMiddleware } from "../../../../src/interfaces/http/middlewares/adminAuthMiddleware.js";
import { createPublicAuthMiddleware } from "../../../../src/interfaces/http/middlewares/publicAuthMiddleware.js";
import { errorHandler } from "../../../../src/interfaces/http/middlewares/errorHandler.js";

import { RequestAdminOtp } from "../../../../src/application/use-cases/RequestAdminOtp.js";
import { VerifyAdminOtp } from "../../../../src/application/use-cases/VerifyAdminOtp.js";
import { RefreshAdminSession } from "../../../../src/application/use-cases/RefreshAdminSession.js";
import { RequestAdminPhoneChangeOtp } from "../../../../src/application/use-cases/RequestAdminPhoneChangeOtp.js";
import { VerifyAdminPhoneChangeOtp } from "../../../../src/application/use-cases/VerifyAdminPhoneChangeOtp.js";
import { UpdateAdminProfileField } from "../../../../src/application/use-cases/UpdateAdminProfileField.js";

import { AddAdminUser } from "../../../../src/application/use-cases/AddAdminUser.js";
import { ListAdminUsers } from "../../../../src/application/use-cases/ListAdminUsers.js";
import { DisableAdminUser } from "../../../../src/application/use-cases/DisableAdminUser.js";
import { EnableAdminUser } from "../../../../src/application/use-cases/EnableAdminUser.js";
import { ChangeAdminUserPhone } from "../../../../src/application/use-cases/ChangeAdminUserPhone.js";

import { RequestPublicOtp } from "../../../../src/application/use-cases/RequestPublicOtp.js";
import { VerifyPublicOtp } from "../../../../src/application/use-cases/VerifyPublicOtp.js";
import { CompletePublicRegistration } from "../../../../src/application/use-cases/CompletePublicRegistration.js";
import { RefreshPublicSession } from "../../../../src/application/use-cases/RefreshPublicSession.js";
import { RequestPublicPhoneChangeOtp } from "../../../../src/application/use-cases/RequestPublicPhoneChangeOtp.js";
import { VerifyPublicPhoneChangeOtp } from "../../../../src/application/use-cases/VerifyPublicPhoneChangeOtp.js";
import { UpdatePublicProfileField } from "../../../../src/application/use-cases/UpdatePublicProfileField.js";
import { LogoutSession } from "../../../../src/application/use-cases/LogoutSession.js";

import { FakeAdminUserRepository } from "../../../unit/fakes/FakeAdminUserRepository.js";
import { FakeChefAccountRepository } from "../../../unit/fakes/FakeChefAccountRepository.js";
import { FakeOtpCodeGenerator } from "../../../unit/fakes/FakeOtpCodeGenerator.js";
import { FakeOtpHasher } from "../../../unit/fakes/FakeOtpHasher.js";
import { FakeOtpRepository } from "../../../unit/fakes/FakeOtpRepository.js";
import { FakeOtpSender } from "../../../unit/fakes/FakeOtpSender.js";
import { FakeRefreshTokenRepository } from "../../../unit/fakes/FakeRefreshTokenRepository.js";
import { FakeTokenService } from "../../../unit/fakes/FakeTokenService.js";
import { FakeUserRepository } from "../../../unit/fakes/FakeUserRepository.js";

export function createBaseTestContext(overrides = {}) {
  const context = {
    userRepository: overrides.userRepository || new FakeUserRepository({ users: overrides.users || [] }),
    chefAccountRepository: overrides.chefAccountRepository || new FakeChefAccountRepository({ chefAccounts: overrides.chefAccounts || [] }),
    adminUserRepository: overrides.adminUserRepository || new FakeAdminUserRepository({ adminUsers: overrides.adminUsers || [] }),
    otpRepository: overrides.otpRepository || new FakeOtpRepository({ otps: overrides.otps || [], recentCounts: overrides.recentCounts || {} }),
    refreshTokenRepository: overrides.refreshTokenRepository || new FakeRefreshTokenRepository({ refreshTokens: overrides.refreshTokens || [] }),
    otpCodeGenerator: overrides.otpCodeGenerator || new FakeOtpCodeGenerator(overrides.otpCode || "123456"),
    otpHasher: overrides.otpHasher || new FakeOtpHasher(),
    otpSender: overrides.otpSender || new FakeOtpSender(),
    tokenService: overrides.tokenService || new FakeTokenService(),
    otpExpiresMinutes: overrides.otpExpiresMinutes || 2,
    otpRateLimitPerHour: overrides.otpRateLimitPerHour || 5,
    refreshTokenExpiresDays: overrides.refreshTokenExpiresDays || 30
  };

  return context;
}

export function createHttpTestApp(context) {
  const app = express();

  app.use(express.json());

  const adminAuthMiddleware = createAdminAuthMiddleware({
    tokenService: context.tokenService
  });

  const publicAuthMiddleware = createPublicAuthMiddleware({
    tokenService: context.tokenService
  });

  const logoutSession = new LogoutSession({
    refreshTokenRepository: context.refreshTokenRepository,
    tokenService: context.tokenService
  });

  const refreshAdminSession = new RefreshAdminSession({
    adminUserRepository: context.adminUserRepository,
    refreshTokenRepository: context.refreshTokenRepository,
    tokenService: context.tokenService,
    refreshTokenExpiresDays: context.refreshTokenExpiresDays
  });

  const refreshPublicSession = new RefreshPublicSession({
    userRepository: context.userRepository,
    chefAccountRepository: context.chefAccountRepository,
    refreshTokenRepository: context.refreshTokenRepository,
    tokenService: context.tokenService,
    refreshTokenExpiresDays: context.refreshTokenExpiresDays
  });

  const adminAuthController = new AdminAuthController({
    requestAdminOtp: new RequestAdminOtp({
      adminUserRepository: context.adminUserRepository,
      otpRepository: context.otpRepository,
      otpCodeGenerator: context.otpCodeGenerator,
      otpHasher: context.otpHasher,
      otpSender: context.otpSender,
      otpExpiresMinutes: context.otpExpiresMinutes,
      otpRateLimitPerHour: context.otpRateLimitPerHour
    }),
    verifyAdminOtp: new VerifyAdminOtp({
      adminUserRepository: context.adminUserRepository,
      otpRepository: context.otpRepository,
      refreshTokenRepository: context.refreshTokenRepository,
      otpHasher: context.otpHasher,
      tokenService: context.tokenService,
      refreshTokenExpiresDays: context.refreshTokenExpiresDays
    }),
    refreshAdminSession,
    logoutSession,
    updateAdminProfileField: new UpdateAdminProfileField({
      adminUserRepository: context.adminUserRepository,
      tokenService: context.tokenService
    }),
    requestAdminPhoneChangeOtp: new RequestAdminPhoneChangeOtp({
      adminUserRepository: context.adminUserRepository,
      otpRepository: context.otpRepository,
      otpCodeGenerator: context.otpCodeGenerator,
      otpHasher: context.otpHasher,
      otpSender: context.otpSender,
      otpExpiresMinutes: context.otpExpiresMinutes,
      otpRateLimitPerHour: context.otpRateLimitPerHour
    }),
    verifyAdminPhoneChangeOtp: new VerifyAdminPhoneChangeOtp({
      adminUserRepository: context.adminUserRepository,
      otpRepository: context.otpRepository,
      refreshTokenRepository: context.refreshTokenRepository,
      otpHasher: context.otpHasher,
      tokenService: context.tokenService,
      refreshTokenExpiresDays: context.refreshTokenExpiresDays
    })
  });

  const adminUserController = new AdminUserController({
    addAdminUser: new AddAdminUser({
      adminUserRepository: context.adminUserRepository
    }),
    listAdminUsers: new ListAdminUsers({
      adminUserRepository: context.adminUserRepository
    }),
    disableAdminUser: new DisableAdminUser({
      adminUserRepository: context.adminUserRepository
    }),
    enableAdminUser: new EnableAdminUser({
      adminUserRepository: context.adminUserRepository
    }),
    changeAdminUserPhone: new ChangeAdminUserPhone({
      adminUserRepository: context.adminUserRepository,
      refreshTokenRepository: context.refreshTokenRepository
    })
  });

  const publicAuthController = new PublicAuthController({
    requestPublicOtp: new RequestPublicOtp({
      userRepository: context.userRepository,
      otpRepository: context.otpRepository,
      otpCodeGenerator: context.otpCodeGenerator,
      otpHasher: context.otpHasher,
      otpSender: context.otpSender,
      otpExpiresMinutes: context.otpExpiresMinutes,
      otpRateLimitPerHour: context.otpRateLimitPerHour
    }),
    verifyPublicOtp: new VerifyPublicOtp({
      userRepository: context.userRepository,
      chefAccountRepository: context.chefAccountRepository,
      otpRepository: context.otpRepository,
      refreshTokenRepository: context.refreshTokenRepository,
      otpHasher: context.otpHasher,
      tokenService: context.tokenService,
      refreshTokenExpiresDays: context.refreshTokenExpiresDays
    }),
    completePublicRegistration: new CompletePublicRegistration({
      userRepository: context.userRepository,
      chefAccountRepository: context.chefAccountRepository,
      refreshTokenRepository: context.refreshTokenRepository,
      tokenService: context.tokenService,
      refreshTokenExpiresDays: context.refreshTokenExpiresDays
    }),
    refreshPublicSession,
    logoutSession,
    updatePublicProfileField: new UpdatePublicProfileField({
      userRepository: context.userRepository,
      chefAccountRepository: context.chefAccountRepository,
      tokenService: context.tokenService
    }),
    requestPublicPhoneChangeOtp: new RequestPublicPhoneChangeOtp({
      userRepository: context.userRepository,
      otpRepository: context.otpRepository,
      otpCodeGenerator: context.otpCodeGenerator,
      otpHasher: context.otpHasher,
      otpSender: context.otpSender,
      otpExpiresMinutes: context.otpExpiresMinutes,
      otpRateLimitPerHour: context.otpRateLimitPerHour
    }),
    verifyPublicPhoneChangeOtp: new VerifyPublicPhoneChangeOtp({
      userRepository: context.userRepository,
      chefAccountRepository: context.chefAccountRepository,
      otpRepository: context.otpRepository,
      refreshTokenRepository: context.refreshTokenRepository,
      otpHasher: context.otpHasher,
      tokenService: context.tokenService,
      refreshTokenExpiresDays: context.refreshTokenExpiresDays
    })
  });

  app.use("/admin/auth", createAdminAuthRoutes(adminAuthController, adminAuthMiddleware));
  app.use("/admin/admin-users", createAdminUserRoutes(adminUserController, adminAuthMiddleware));
  app.use("/auth", createPublicAuthRoutes(publicAuthController, publicAuthMiddleware));

  app.use(errorHandler);

  return app;
}

export function registerAdminAccessToken(context, token, overrides = {}) {
  context.tokenService.registerAccessToken(token, {
    sub: overrides.sub || "manager-1",
    phone: overrides.phone || "+989120000000",
    firstName: overrides.firstName ?? null,
    lastName: overrides.lastName ?? null,
    username: overrides.username ?? null,
    role: overrides.role || "manager",
    photoUrl: overrides.photoUrl ?? null,
    isManager: overrides.isManager ?? overrides.role !== "admin",
    scope: "admin"
  });

  return token;
}

export function registerPublicAccessToken(context, token, overrides = {}) {
  context.tokenService.registerAccessToken(token, {
    sub: overrides.sub || "user-1",
    phone: overrides.phone || "+989121234567",
    firstName: overrides.firstName || "Ali",
    lastName: overrides.lastName || "Ahmadi",
    username: overrides.username || "ali_ahmadi",
    photoUrl: overrides.photoUrl ?? null,
    address: overrides.address ?? null,
    roles: overrides.roles || ["client"],
    selectedRole: overrides.selectedRole || "client",
    chef: overrides.chef || null,
    scope: "public"
  });

  return token;
}
