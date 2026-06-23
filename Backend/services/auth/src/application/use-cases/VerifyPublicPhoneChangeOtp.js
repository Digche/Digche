import { AppError, UnauthorizedError } from "../errors/AppError.js";

import { RefreshToken } from "../../domain/entities/RefreshToken.js";

import { USER_ROLES } from "../../domain/constants/roles.js";
import { OTP_PURPOSES } from "../../domain/constants/otpPurposes.js";
import { TOKEN_OWNER_TYPES } from "../../domain/constants/tokenOwnerTypes.js";
import { AUTH_SCOPES } from "../../domain/constants/authScopes.js";
import { PhoneNumber } from "../../domain/value-objects/PhoneNumber.js";

export class VerifyPublicPhoneChangeOtp {
  constructor({
    userRepository,
    chefAccountRepository,
    otpRepository,
    refreshTokenRepository,
    otpHasher,
    tokenService,
    refreshTokenExpiresDays
  }) {
    this.userRepository = userRepository;
    this.chefAccountRepository = chefAccountRepository;
    this.otpRepository = otpRepository;
    this.refreshTokenRepository = refreshTokenRepository;
    this.otpHasher = otpHasher;
    this.tokenService = tokenService;
    this.refreshTokenExpiresDays = refreshTokenExpiresDays;
  }

  async execute({ userId, currentSelectedRole, newPhone, code }) {
    if (!userId) {
      throw new AppError("User id is required", 400, "USER_ID_REQUIRED");
    }

    if (!currentSelectedRole) {
      throw new AppError(
        "Selected role is required",
        400,
        "SELECTED_ROLE_REQUIRED"
      );
    }

    if (!code) {
      throw new AppError("OTP code is required", 400, "OTP_CODE_REQUIRED");
    }

    const normalizedNewPhone = PhoneNumber.normalize(newPhone);

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    if (!user.hasRole(currentSelectedRole)) {
      throw new UnauthorizedError("User does not have selected role");
    }

    const existingUser = await this.userRepository.findByPhone(normalizedNewPhone);

    if (existingUser && existingUser.id !== userId) {
      throw new AppError(
        "Phone number is already in use",
        409,
        "PHONE_ALREADY_IN_USE"
      );
    }

    const otpCode = await this.otpRepository.findLatestValidByPhoneAndPurpose(
      normalizedNewPhone,
      OTP_PURPOSES.PUBLIC_CHANGE_PHONE
    );

    if (!otpCode || !otpCode.canBeUsed()) {
      throw new UnauthorizedError("Invalid or expired OTP code");
    }

    const isCodeValid = await this.otpHasher.compare(code, otpCode.codeHash);

    if (!isCodeValid) {
      throw new UnauthorizedError("Invalid or expired OTP code");
    }

    const updatedUser = await this.userRepository.updatePhone(
      userId,
      normalizedNewPhone
    );

    await this.otpRepository.consume(otpCode.id);

    await this.refreshTokenRepository.revokeAllForOwner(
      updatedUser.id,
      TOKEN_OWNER_TYPES.USER
    );

    const roleData = {};

    if (currentSelectedRole === USER_ROLES.CHEF) {
      const chefAccount = await this.chefAccountRepository.findByUserId(userId);

      if (chefAccount) {
        roleData.chef = {
          status: chefAccount.status
        };
      }
    }

    const accessTokenPayload = {
      sub: updatedUser.id,
      phone: updatedUser.phone,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      username: updatedUser.username,
      profileImageUrl: updatedUser.profileImageUrl,
      address: updatedUser.address,
      roles: updatedUser.roles,
      selectedRole: currentSelectedRole,
      scope: AUTH_SCOPES.PUBLIC,
      ...roleData
    };

    const accessToken = this.tokenService.signAccessToken(accessTokenPayload);

    const refreshToken = this.tokenService.generateRefreshToken();
    const refreshTokenHash = this.tokenService.hashRefreshToken(refreshToken);

    const expiresAt = new Date(
      Date.now() + this.refreshTokenExpiresDays * 24 * 60 * 60 * 1000
    );

    await this.refreshTokenRepository.create(
      new RefreshToken({
        ownerId: updatedUser.id,
        ownerType: TOKEN_OWNER_TYPES.USER,
        scope: AUTH_SCOPES.PUBLIC,
        selectedRole: currentSelectedRole,
        tokenHash: refreshTokenHash,
        expiresAt
      })
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: updatedUser.id,
        phone: updatedUser.phone,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        username: updatedUser.username,
        profileImageUrl: updatedUser.profileImageUrl,
        address: updatedUser.address,
        roles: updatedUser.roles,
        selectedRole: currentSelectedRole,
        ...roleData
      }
    };
  }
}
