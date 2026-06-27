import { ChefAccount } from "../../../domain/entities/ChefAccount.js";
import { ChefAccountModel } from "../models/ChefAccountModel.js";
import { UserModel } from "../models/UserModel.js";
import { UserRoleModel } from "../models/UserRoleModel.js";

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

  async listDetailed() {
    const chefAccounts = await ChefAccountModel.findAll({
      include: [
        {
          model: UserModel,
          as: "user",
          include: [
            {
              model: UserRoleModel,
              as: "roles"
            }
          ]
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    return chefAccounts.map((chefAccount) => this.toDetailedObject(chefAccount));
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

  toDetailedObject(chefAccountModel) {
    const user = chefAccountModel.user;

    return {
      id: chefAccountModel.id,
      userId: chefAccountModel.userId,
      status: chefAccountModel.status,
      createdAt: chefAccountModel.createdAt,
      updatedAt: chefAccountModel.updatedAt,
      user: user
        ? {
            id: user.id,
            phone: user.phone,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            photoUrl: user.photoUrl,
            address: user.address,
            roles: user.roles ? user.roles.map((userRole) => userRole.role) : [],
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          }
        : null
    };
  }
}
