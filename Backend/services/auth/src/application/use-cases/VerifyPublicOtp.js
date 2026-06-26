import { AppError, ForbiddenError, UnauthorizedError } from "../errors/AppError.js";

import { RefreshToken } from "../../domain/entities/RefreshToken.js";
import { RegistrationToken } from "../../domain/entities/RegistrationToken.js";

import { USER_ROLES } from "../../domain/constants/roles.js";
import { OTP_PURPOSES } from "../../domain/constants/otpPurposes.js";
import { TOKEN_OWNER_TYPES } from "../../domain/constants/tokenOwnerTypes.js";
import { AUTH_SCOPES } from "../../domain/constants/authScopes.js";
import { PUBLIC_AUTH_FLOWS } from "../../domain/constants/authFlows.js";
import { REGISTRATION_MODES } from "../../domain/constants/registrationModes.js";
import { PhoneNumber } from "../../domain/value-objects/PhoneNumber.js";

export class VerifyPublicOtp {
  constructor({
    userRepository,
    chefAccountRepository,
    otpRepository,
    refreshTokenRepository,
    registrationTokenRepository,
    otpHasher,
    tokenService,
    refreshTokenExpiresDays,
    registrationTokenExpiresMinutes = 10
  }) {
    this.userRepository = userRepository;
    this.chefAccountRepository = chefAccountRepository;
    this.otpRepository = otpRepository;
    this.refreshTokenRepository = refreshTokenRepository;
    this.registrationTokenRepository = registrationTokenRepository;
    this.otpHasher = otpHasher;
    this.tokenService = tokenService;
    this.refreshTokenExpiresDays = refreshTokenExpiresDays;
    this.registrationTokenExpiresMinutes = registrationTokenExpiresMinutes;
  }

  async execute({ phone, code, role, flow }) {
    const normalizedPhone = PhoneNumber.normalize(phone);
    const normalizedFlow = this.normalizeFlow(flow);

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

    const consumed = await this.otpRepository.consume(otpCode.id);

    if (!consumed) {
      throw new UnauthorizedError("Invalid or expired OTP code");
    }

    const user = await this.userRepository.findByPhone(normalizedPhone);

    if (
      normalizedFlow === PUBLIC_AUTH_FLOWS.REGISTER &&
      user &&
      user.hasRole(role) &&
      user.hasCompletedProfile()
    ) {
      throw new AppError(
        "Public account already exists for this phone and role",
        409,
        "PUBLIC_ACCOUNT_ALREADY_EXISTS"
      );
    }

    if (
      normalizedFlow === PUBLIC_AUTH_FLOWS.REGISTER &&
      user &&
      user.hasCompletedProfile() &&
      !user.hasRole(role)
    ) {
      return await this.createRegistrationRequiredResponse({
        phone: normalizedPhone,
        role,
        flow: normalizedFlow,
        registrationMode: REGISTRATION_MODES.ADD_ROLE,
        existingUser: this.toExistingUserResponse(user)
      });
    }

    if (!user || !user.hasRole(role) || !user.hasCompletedProfile()) {
      return await this.createRegistrationRequiredResponse({
        phone: normalizedPhone,
        role,
        flow: normalizedFlow,
        registrationMode: REGISTRATION_MODES.COMPLETE_PROFILE
      });
    }

    const roleData = {};

    if (role === USER_ROLES.CHEF) {
      const chefAccount = await this.chefAccountRepository.findByUserId(user.id);

      if (!chefAccount) {
        return await this.createRegistrationRequiredResponse({
          phone: normalizedPhone,
          role,
          flow: normalizedFlow,
          registrationMode: REGISTRATION_MODES.COMPLETE_PROFILE
        });
      }

      if (chefAccount.isSuspended()) {
        throw new ForbiddenError("Chef account is suspended");
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
      photoUrl: user.photoUrl,
      address: user.address,
      roles: user.roles,
      selectedRole: role,
      scope: AUTH_SCOPES.PUBLIC,
      tokenVersion: user.tokenVersion || 0,
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
      flow: normalizedFlow,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        photoUrl: user.photoUrl,
        address: user.address,
        roles: user.roles,
        selectedRole: role,
        tokenVersion: user.tokenVersion || 0,
        ...roleData
      }
    };
  }

  async createRegistrationRequiredResponse({
    phone,
    role,
    flow,
    registrationMode,
    existingUser = null
  }) {
    const tokenId = this.tokenService.generateTokenId();

    const registrationToken = this.tokenService.signRegistrationToken({
      phone,
      role,
      flow,
      registrationMode,
      scope: "public_registration",
      jti: tokenId
    });

    await this.registrationTokenRepository.create(
      new RegistrationToken({
        tokenId,
        phone,
        role,
        flow,
        expiresAt: new Date(
          Date.now() + this.registrationTokenExpiresMinutes * 60 * 1000
        )
      })
    );

    return {
      requiresRegistration: true,
      registrationMode,
      registrationToken,
      phone,
      role,
      flow,
      ...(existingUser ? { existingUser } : {})
    };
  }

  toExistingUserResponse(user) {
    return {
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      roles: user.roles
    };
  }

  normalizeFlow(flow) {
    const normalizedFlow = String(flow || "").trim();

    if (!Object.values(PUBLIC_AUTH_FLOWS).includes(normalizedFlow)) {
      throw new AppError(
        "Invalid public auth flow",
        400,
        "INVALID_PUBLIC_AUTH_FLOW"
      );
    }

    return normalizedFlow;
  }
}
