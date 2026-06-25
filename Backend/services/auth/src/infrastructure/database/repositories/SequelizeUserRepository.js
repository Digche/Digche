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

  async findByUsername(username) {
    const user = await UserModel.findOne({
      where: { username },
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

  async updateProfileField(userId, field, value) {
    const user = await UserModel.findByPk(userId, {
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

    user[field] = value;

    await user.save();

    return this.toDomain(user);
  }

  async create(user) {
    const createdUser = await UserModel.create({
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      photoUrl: user.photoUrl,
      address: user.address
    });

    return new User({
      id: createdUser.id,
      phone: createdUser.phone,
      firstName: createdUser.firstName,
      lastName: createdUser.lastName,
      username: createdUser.username,
      photoUrl: createdUser.photoUrl,
      address: createdUser.address,
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

  async completeProfile(userId, { firstName, lastName, username }) {
    const user = await UserModel.findByPk(userId, {
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

    user.firstName = firstName;
    user.lastName = lastName;
    user.username = username;

    await user.save();

    return this.toDomain(user);
  }

  async updatePhone(userId, newPhone) {
    const user = await UserModel.findByPk(userId, {
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

    user.phone = newPhone;

    await user.save();

    return this.toDomain(user);
  }

  toDomain(userModel) {
    const roles = userModel.roles
      ? userModel.roles.map((userRole) => userRole.role)
      : [];

    return new User({
      id: userModel.id,
      phone: userModel.phone,
      firstName: userModel.firstName,
      lastName: userModel.lastName,
      username: userModel.username,
      photoUrl: userModel.photoUrl,
      address: userModel.address,
      roles,
      createdAt: userModel.createdAt,
      updatedAt: userModel.updatedAt
    });
  }
}
