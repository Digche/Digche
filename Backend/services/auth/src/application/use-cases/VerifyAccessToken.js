import { ForbiddenError, UnauthorizedError } from "../errors/AppError.js";

import { AUTH_SCOPES } from "../../domain/constants/authScopes.js";
import { USER_ROLES } from "../../domain/constants/roles.js";

export class VerifyAccessToken {
  constructor({
    tokenService,
    userRepository,
    adminUserRepository,
    chefAccountRepository
  }) {
    this.tokenService = tokenService;
    this.userRepository = userRepository;
    this.adminUserRepository = adminUserRepository;
    this.chefAccountRepository = chefAccountRepository;
  }

  async execute({ accessToken }) {
    if (!accessToken) {
      throw new UnauthorizedError("Access token is required");
    }

    let payload;

    try {
      payload = this.tokenService.verifyAccessToken(accessToken);
    } catch (error) {
      throw new UnauthorizedError("Invalid or expired access token");
    }

    if (payload.scope === AUTH_SCOPES.PUBLIC) {
      return {
        actor: await this.verifyPublicActor(payload)
      };
    }

    if (payload.scope === AUTH_SCOPES.ADMIN) {
      return {
        actor: await this.verifyAdminActor(payload)
      };
    }

    throw new ForbiddenError("Unsupported access token scope");
  }

  async verifyPublicActor(payload) {
    const user = await this.userRepository.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    if (Number(payload.tokenVersion || 0) !== Number(user.tokenVersion || 0)) {
      throw new UnauthorizedError("Access token has been revoked");
    }

    const selectedRole = payload.selectedRole;

    if (![USER_ROLES.CLIENT, USER_ROLES.CHEF].includes(selectedRole)) {
      throw new ForbiddenError("Invalid selected role");
    }

    if (!user.hasRole(selectedRole)) {
      throw new ForbiddenError("User does not have selected role");
    }

    if (!user.hasCompletedProfile()) {
      throw new ForbiddenError("User profile is not completed");
    }

    let chef = null;

    if (selectedRole === USER_ROLES.CHEF) {
      chef = await this.chefAccountRepository.findByUserId(user.id);

      if (!chef) {
        throw new ForbiddenError("Chef account not found");
      }

      if (chef.isSuspended()) {
        throw new ForbiddenError("Chef account is suspended");
      }
    }

    return {
      id: user.id,
      type: "user",
      scope: AUTH_SCOPES.PUBLIC,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      photoUrl: user.photoUrl,
      address: user.address,
      roles: user.roles,
      selectedRole,
      role: selectedRole,
      tokenVersion: user.tokenVersion || 0,
      displayName: this.displayNameFor(user),
      chef: chef ? { status: chef.status } : null
    };
  }

  async verifyAdminActor(payload) {
    const admin = await this.adminUserRepository.findById(payload.sub);

    if (!admin) {
      throw new UnauthorizedError("Admin user not found");
    }

    if (!admin.isActive()) {
      throw new ForbiddenError("Admin user is disabled");
    }

    if (Number(payload.tokenVersion || 0) !== Number(admin.tokenVersion || 0)) {
      throw new UnauthorizedError("Access token has been revoked");
    }

    return {
      id: admin.id,
      type: "admin",
      scope: AUTH_SCOPES.ADMIN,
      phone: admin.phone,
      firstName: admin.firstName,
      lastName: admin.lastName,
      username: admin.username,
      photoUrl: admin.photoUrl,
      role: admin.role,
      tokenVersion: admin.tokenVersion || 0,
      isManager: admin.isManager(),
      displayName: this.displayNameFor(admin)
    };
  }

  displayNameFor(actor) {
    const fullName = [actor.firstName, actor.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    return fullName || actor.username || actor.phone || null;
  }
}
