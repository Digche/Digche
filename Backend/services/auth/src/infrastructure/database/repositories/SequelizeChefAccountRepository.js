import { ChefAccount } from "../../../domain/entities/ChefAccount.js";
import { ChefAccountModel } from "../models/ChefAccountModel.js";

export class SequelizeChefAccountRepository {
  async findByUserId(userId) {
    const chefAccount = await ChefAccountModel.findOne({
      where: { userId }
    });

    if (!chefAccount) {
      return null;
    }

    return this.toDomain(chefAccount);
  }

  async create(chefAccount) {
    const createdChefAccount = await ChefAccountModel.create({
      userId: chefAccount.userId,
      status: chefAccount.status
    });

    return this.toDomain(createdChefAccount);
  }

  async updateStatus(userId, status) {
    const chefAccount = await ChefAccountModel.findOne({
      where: { userId }
    });

    if (!chefAccount) {
      return null;
    }

    chefAccount.status = status;

    await chefAccount.save();

    return this.toDomain(chefAccount);
  }

  toDomain(chefAccountModel) {
    return new ChefAccount({
      id: chefAccountModel.id,
      userId: chefAccountModel.userId,
      status: chefAccountModel.status,
      createdAt: chefAccountModel.createdAt,
      updatedAt: chefAccountModel.updatedAt
    });
  }
}