import { AppError, ForbiddenError, UnauthorizedError } from "../errors/AppError.js";

import { User } from "../../domain/entities/User.js";
import { ChefAccount } from "../../domain/entities/ChefAccount.js";
import { RefreshToken } from "../../domain/entities/RefreshToken.js";

import { USER_ROLES } from "../../domain/constants/roles.js";
import { CHEF_STATUS } from "../../domain/constants/statuses.js";
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

    let user = await this.userRepository.findByPhone(normalizedPhone);

    if (!user) {
      user = await this.userRepository.create(
        new User({
          phone: normalizedPhone,
          roles: []
        })
      );
    }

    if (!user.hasRole(role)) {
      await this.userRepository.addRole(user.id, role);
      user.roles = [...user.roles, role];
    }

    const roleData = {};

    if (role === USER_ROLES.CHEF) {
      let chefAccount = await this.chefAccountRepository.findByUserId(user.id);

      if (!chefAccount) {
        chefAccount = await this.chefAccountRepository.create(
          new ChefAccount({
            userId: user.id,
            status: CHEF_STATUS.PENDING
          })
        );
      }

      if (chefAccount.isDisabled()) {
        throw new ForbiddenError("Chef account is disabled");
      }

      roleData.chef = {
        status: chefAccount.status
      };
    }

    await this.otpRepository.consume(otpCode.id);

    const accessTokenPayload = {
      sub: user.id,
      phone: user.phone,
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
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        phone: user.phone,
        roles: user.roles,
        selectedRole: role,
        ...roleData
      }
    };
  }
}