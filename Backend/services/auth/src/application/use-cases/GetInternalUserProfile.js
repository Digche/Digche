import { AppError, NotFoundError } from "../errors/AppError.js";
import { USER_ROLES } from "../../domain/constants/roles.js";

export class GetInternalUserProfile {
  constructor({
    userRepository,
    chefAccountRepository
  }) {
    this.userRepository = userRepository;
    this.chefAccountRepository = chefAccountRepository;
  }

  async execute({ userId }) {
    const normalizedUserId = String(userId || "").trim();

    if (!normalizedUserId) {
      throw new AppError("User id is required", 400, "USER_ID_REQUIRED");
    }

    const user = await this.userRepository.findById(normalizedUserId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    let chef = null;

    if (user.hasRole(USER_ROLES.CHEF)) {
      const chefAccount =
        await this.chefAccountRepository.findByUserId(user.id);

      chef = chefAccount
        ? {
            id: chefAccount.id,
            userId: chefAccount.userId,
            status: chefAccount.status,
            createdAt: chefAccount.createdAt,
            updatedAt: chefAccount.updatedAt
          }
        : null;
    }

    return {
      user: {
        id: user.id,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        displayName: this.displayNameFor(user),
        photoUrl: user.photoUrl,
        address: user.address,
        roles: user.roles,
        hasCompletedProfile: user.hasCompletedProfile(),
        tokenVersion: user.tokenVersion || 0,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        ...(chef ? { chef } : {})
      }
    };
  }

  displayNameFor(user) {
    const fullName = [user.firstName, user.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    return fullName || user.username || user.phone || null;
  }
}
