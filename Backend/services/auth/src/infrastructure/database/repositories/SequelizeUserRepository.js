import { User } from "../../../domain/entities/User.js";
import { UserModel } from "../models/UserModel.js";
import { UserRoleModel } from "../models/UserRoleModel.js";

export class SequelizeUserRepository {
  async findByPhone(phone) {
    const user = await UserModel.findOne({
      where: { phone },
      include: [
        {
          model: UserRoleModel,
          as: "roles"
        }
      ]
    });

    if (!user) {
      return null;
    }

    return this.toDomain(user);
  }

  async findById(id) {
    const user = await UserModel.findByPk(id, {
      include: [
        {
          model: UserRoleModel,
          as: "roles"
        }
      ]
    });

    if (!user) {
      return null;
    }

    return this.toDomain(user);
  }

  async create(user) {
    const createdUser = await UserModel.create({
      phone: user.phone
    });

    return new User({
      id: createdUser.id,
      phone: createdUser.phone,
      roles: [],
      createdAt: createdUser.createdAt,
      updatedAt: createdUser.updatedAt
    });
  }

  async addRole(userId, role) {
    await UserRoleModel.findOrCreate({
      where: {
        userId,
        role
      },
      defaults: {
        userId,
        role
      }
    });

    return true;
  }

  toDomain(userModel) {
    const roles = userModel.roles
      ? userModel.roles.map((userRole) => userRole.role)
      : [];

    return new User({
      id: userModel.id,
      phone: userModel.phone,
      roles,
      createdAt: userModel.createdAt,
      updatedAt: userModel.updatedAt
    });
  }
}