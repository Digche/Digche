import { AppError, ForbiddenError, UnauthorizedError } from "../errors/AppError.js";

import { RefreshToken } from "../../domain/entities/RefreshToken.js";
import { ADMIN_ROLES } from "../../domain/constants/roles.js";
import { ADMIN_STATUS } from "../../domain/constants/statuses.js";
import { OTP_PURPOSES } from "../../domain/constants/otpPurposes.js";
import { TOKEN_OWNER_TYPES } from "../../domain/constants/tokenOwnerTypes.js";
import { AUTH_SCOPES } from "../../domain/constants/authScopes.js";
import { PhoneNumber } from "../../domain/value-objects/PhoneNumber.js";

export class VerifyAdminPhoneChangeOtp {
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

  async execute({ adminId, newPhone, code }) {
    if (!adminId) {
      throw new AppError("Admin id is required", 400, "ADMIN_ID_REQUIRED");
    }

    if (!code) {
      throw new AppError("OTP code is required", 400, "OTP_CODE_REQUIRED");
    }

    const adminUser = await this.adminUserRepository.findById(adminId);

    if (!adminUser) {
      throw new UnauthorizedError("Admin user not found");
    }

    if (adminUser.status !== ADMIN_STATUS.ACTIVE) {
      throw new ForbiddenError("Manager account is not active");
    }

    if (adminUser.role !== ADMIN_ROLES.MANAGER) {
      throw new ForbiddenError("Only manager can change manager phone");
    }

    const normalizedNewPhone = PhoneNumber.normalize(newPhone);

    if (adminUser.phone === normalizedNewPhone) {
      throw new AppError(
        "New phone must be different from current phone",
        400,
        "SAME_PHONE_NUMBER"
      );
    }

    const existingAdminUser = await this.adminUserRepository.findByPhone(
      normalizedNewPhone
    );

    if (existingAdminUser && existingAdminUser.id !== adminUser.id) {
      throw new AppError(
        "Phone number is already in use",
        409,
        "PHONE_ALREADY_IN_USE"
      );
    }

    const otpCode = await this.otpRepository.findLatestValidByPhoneAndPurpose(
      normalizedNewPhone,
      OTP_PURPOSES.ADMIN_CHANGE_PHONE
    );

    if (!otpCode || !otpCode.canBeUsed()) {
      throw new UnauthorizedError("Invalid or expired OTP code");
    }

    const isCodeValid = await this.otpHasher.compare(code, otpCode.codeHash);

    if (!isCodeValid) {
      throw new UnauthorizedError("Invalid or expired OTP code");
    }

    const updatedAdminUser = await this.adminUserRepository.updatePhone(
      adminUser.id,
      normalizedNewPhone
    );

    await this.otpRepository.consume(otpCode.id);

    await this.refreshTokenRepository.revokeAllForOwner(
      updatedAdminUser.id,
      TOKEN_OWNER_TYPES.ADMIN
    );

    const accessTokenPayload = {
      sub: updatedAdminUser.id,
      phone: updatedAdminUser.phone,
      role: updatedAdminUser.role,
      profileImageUrl: updatedAdminUser.profileImageUrl,
      isManager: updatedAdminUser.role === ADMIN_ROLES.MANAGER,
      scope: AUTH_SCOPES.ADMIN
    };

    const accessToken = this.tokenService.signAccessToken(accessTokenPayload);

    const refreshToken = this.tokenService.generateRefreshToken();
    const refreshTokenHash = this.tokenService.hashRefreshToken(refreshToken);

    const expiresAt = new Date(
      Date.now() + this.refreshTokenExpiresDays * 24 * 60 * 60 * 1000
    );

    await this.refreshTokenRepository.create(
      new RefreshToken({
        ownerId: updatedAdminUser.id,
        ownerType: TOKEN_OWNER_TYPES.ADMIN,
        scope: AUTH_SCOPES.ADMIN,
        selectedRole: updatedAdminUser.role,
        tokenHash: refreshTokenHash,
        expiresAt
      })
    );

    return {
      accessToken,
      refreshToken,
      admin: {
        id: updatedAdminUser.id,
        phone: updatedAdminUser.phone,
        role: updatedAdminUser.role,
        profileImageUrl: updatedAdminUser.profileImageUrl,
        isManager: updatedAdminUser.role === ADMIN_ROLES.MANAGER
      }
    };
  }
}