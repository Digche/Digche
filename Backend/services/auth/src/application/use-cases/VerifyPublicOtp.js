import { AppError, ForbiddenError, UnauthorizedError } from "../errors/AppError.js";

import { RefreshToken } from "../../domain/entities/RefreshToken.js";

import { USER_ROLES } from "../../domain/constants/roles.js";
import { OTP_PURPOSES } from "../../domain/constants/otpPurposes.js";
import { TOKEN_OWNER_TYPES } from "../../domain/constants/tokenOwnerTypes.js";
import { AUTH_SCOPES } from "../../domain/constants/authScopes.js";
import { PhoneNumber } from "../../domain/value-objects/PhoneNumber.js";

export class VerifyPublicOtp {
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

  async execute({ phone, code, role }) {
    const normalizedPhone = PhoneNumber.normalize(phone);

    if (!code) {
      throw new AppError("OTP code is required", 400, "OTP_CODE_REQUIRED");
    }

    if (![USER_ROLES.CLIENT, USER_ROLES.CHEF].includes(role)) {
      throw new AppError("Invalid public role", 400, "INVALID_PUBLIC_ROLE");
    }

    const otpCode = await this.otpRepository.findLatestValidByPhoneAndPurpose(
      normalizedPhone,
      OTP_PURPOSES.PUBLIC_LOGIN
    );

    if (!otpCode || !otpCode.canBeUsed()) {
      throw new UnauthorizedError("Invalid or expired OTP code");
    }

    const isCodeValid = await this.otpHasher.compare(code, otpCode.codeHash);

    if (!isCodeValid) {
      throw new UnauthorizedError("Invalid or expired OTP code");
    }

    await this.otpRepository.consume(otpCode.id);

    const user = await this.userRepository.findByPhone(normalizedPhone);

    if (!user || !user.hasRole(role) || !user.hasCompletedProfile()) {
      return this.createRegistrationRequiredResponse({
        phone: normalizedPhone,
        role
      });
    }

    const roleData = {};

    if (role === USER_ROLES.CHEF) {
      const chefAccount = await this.chefAccountRepository.findByUserId(user.id);

      if (!chefAccount) {
        return this.createRegistrationRequiredResponse({
          phone: normalizedPhone,
          role
        });
      }

      if (chefAccount.isDisabled()) {
        throw new ForbiddenError("Chef account is disabled");
      }

      roleData.chef = {
        status: chefAccount.status
      };
    }

    const accessTokenPayload = {
      sub: user.id,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      roles: user.roles,
      selectedRole: role,
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
        ownerId: user.id,
        ownerType: TOKEN_OWNER_TYPES.USER,
        scope: AUTH_SCOPES.PUBLIC,
        selectedRole: role,
        tokenHash: refreshTokenHash,
        expiresAt
      })
    );

    return {
      requiresRegistration: false,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        roles: user.roles,
        selectedRole: role,
        ...roleData
      }
    };
  }

  createRegistrationRequiredResponse({ phone, role }) {
    const registrationToken = this.tokenService.signRegistrationToken({
      phone,
      role,
      scope: "public_registration",
      jti: this.tokenService.generateTokenId()
    });

    return {
      requiresRegistration: true,
      registrationToken,
      phone,
      role
    };
  }
}