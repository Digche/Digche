import { AppError, NotFoundError } from "../errors/AppError.js";
import { CHEF_STATUS } from "../../domain/constants/statuses.js";

export class ActivateChef {
  constructor({ chefAccountRepository }) {
    this.chefAccountRepository = chefAccountRepository;
  }

  async execute({ userId }) {
    if (!userId) {
      throw new AppError("Chef user id is required", 400, "CHEF_USER_ID_REQUIRED");
    }

    const chefAccount = await this.chefAccountRepository.findByUserId(userId);

    if (!chefAccount) {
      throw new NotFoundError("Chef account not found");
    }

    const activeChefAccount = await this.chefAccountRepository.updateStatus(
      userId,
      CHEF_STATUS.ACTIVE
    );

    return {
      chef: {
        id: activeChefAccount.id,
        userId: activeChefAccount.userId,
        status: activeChefAccount.status,
        createdAt: activeChefAccount.createdAt,
        updatedAt: activeChefAccount.updatedAt
      }
    };
  }
}
