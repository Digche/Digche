import { ForbiddenError, UnauthorizedError, AppError } from "../errors/AppError.js";

import { RefreshToken } from "../../domain/entities/RefreshToken.js";

import { OTP_PURPOSES } from "../../domain/constants/otpPurposes.js";
import { TOKEN_OWNER_TYPES } from "../../domain/constants/tokenOwnerTypes.js";
import { AUTH_SCOPES } from "../../domain/constants/authScopes.js";
import { PhoneNumber } from "../../domain/value-objects/PhoneNumber.js";

export class VerifyAdminOtp {
  constructor({
    adminUserRepository,
    otpRepository,
    refreshTokenRepository,
    otpHasher,
    tokenService,
    refreshTokenExpiresDays
  }) {
    this.adminUserRepository = adminUserRepository;
    this.otpRepository = otpRepository;
    this.refreshTokenRepository = refreshTokenRepository;
    this.otpHasher = otpHasher;
    this.tokenService = tokenService;
    this.refreshTokenExpiresDays = refreshTokenExpiresDays;
  }

  async execute({ phone, code }) {
    const normalizedPhone = PhoneNumber.normalize(phone);

    if (!code) {
      throw new AppError("OTP code is required", 400, "OTP_CODE_REQUIRED");
    }

    const adminUser = await this.adminUserRepository.findByPhone(normalizedPhone);

    if (!adminUser || !adminUser.isActive()) {
      throw new ForbiddenError("You are not allowed to access admin panel");
    }

    const otpCode = await this.otpRepository.findLatestValidByPhoneAndPurpose(
      normalizedPhone,
      OTP_PURPOSES.ADMIN_LOGIN
    );

    if (!otpCode || !otpCode.canBeUsed()) {
      throw new UnauthorizedError("Invalid or expired OTP code");
    }

    const isCodeValid = await this.otpHasher.compare(code, otpCode.codeHash);

    if (!isCodeValid) {
      throw new UnauthorizedError("Invalid or expired OTP code");
    }

    await this.otpRepository.consume(otpCode.id);

    const accessTokenPayload = {
      sub: adminUser.id,
      phone: adminUser.phone,
      role: adminUser.role,
      scope: AUTH_SCOPES.ADMIN,
      isManager: adminUser.isManager()
    };

    const accessToken = this.tokenService.signAccessToken(accessTokenPayload);

    const refreshToken = this.tokenService.generateRefreshToken();
    const refreshTokenHash = this.tokenService.hashRefreshToken(refreshToken);

    const expiresAt = new Date(
      Date.now() + this.refreshTokenExpiresDays * 24 * 60 * 60 * 1000
    );

    await this.refreshTokenRepository.create(
      new RefreshToken({
        ownerId: adminUser.id,
        ownerType: TOKEN_OWNER_TYPES.ADMIN,
        scope: AUTH_SCOPES.ADMIN,
        selectedRole: adminUser.role,
        tokenHash: refreshTokenHash,
        expiresAt
      })
    );

    return {
      accessToken,
      refreshToken,
      admin: {
        id: adminUser.id,
        phone: adminUser.phone,
        role: adminUser.role,
        isManager: adminUser.isManager()
      }
    };
  }
}