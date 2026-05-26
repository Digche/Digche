import { UserModel } from "./UserModel.js";
import { UserRoleModel } from "./UserRoleModel.js";
import { ChefAccountModel } from "./ChefAccountModel.js";
import { AdminUserModel } from "./AdminUserModel.js";
import { OtpCodeModel } from "./OtpCodeModel.js";
import { RefreshTokenModel } from "./RefreshTokenModel.js";

export function initModels() {
  UserModel.hasMany(UserRoleModel, {
    foreignKey: "userId",
    as: "roles"
  });

  UserRoleModel.belongsTo(UserModel, {
    foreignKey: "userId",
    as: "user"
  });

  UserModel.hasOne(ChefAccountModel, {
    foreignKey: "userId",
    as: "chefAccount"
  });

  ChefAccountModel.belongsTo(UserModel, {
    foreignKey: "userId",
    as: "user"
  });

  AdminUserModel.belongsTo(AdminUserModel, {
    foreignKey: "createdBy",
    as: "creator"
  });

  return {
    UserModel,
    UserRoleModel,
    ChefAccountModel,
    AdminUserModel,
    OtpCodeModel,
    RefreshTokenModel
  };
}

export {
  UserModel,
  UserRoleModel,
  ChefAccountModel,
  AdminUserModel,
  OtpCodeModel,
  RefreshTokenModel
};