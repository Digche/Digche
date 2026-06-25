import { AppError, NotFoundError } from "../errors/AppError.js";
import { CHEF_STATUS } from "../../domain/constants/statuses.js";
import { TOKEN_OWNER_TYPES } from "../../domain/constants/tokenOwnerTypes.js";
import { USER_ROLES } from "../../domain/constants/roles.js";

export class SuspendChef {
  constructor({ chefAccountRepository, refreshTokenRepository }) {
    this.chefAccountRepository = chefAccountRepository;
    this.refreshTokenRepository = refreshTokenRepository;
  }

  async execute({ userId }) {
    if (!userId) {
      throw new AppError("Chef user id is required", 400, "CHEF_USER_ID_REQUIRED");
    }

    const chefAccount = await this.chefAccountRepository.findByUserId(userId);

    if (!chefAccount) {
      throw new NotFoundError("Chef account not found");
    }

    const suspendedChefAccount = await this.chefAccountRepository.updateStatus(
      userId,
      CHEF_STATUS.SUSPENDED
    );

    await this.refreshTokenRepository.revokeAllForOwnerAndSelectedRole(
      userId,
      TOKEN_OWNER_TYPES.USER,
      USER_ROLES.CHEF
    );

    return {
      chef: {
        id: suspendedChefAccount.id,
        userId: suspendedChefAccount.userId,
        status: suspendedChefAccount.status,
        createdAt: suspendedChefAccount.createdAt,
        updatedAt: suspendedChefAccount.updatedAt
      }
    };
  }
}
