import { DataTypes } from "sequelize";
import { sequelize } from "../sequelize.js";
import { ADMIN_ROLES } from "../../../domain/constants/roles.js";
import { ADMIN_STATUS } from "../../../domain/constants/statuses.js";

export const AdminUserModel = sequelize.define(
  "AdminUser",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: "first_name"
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: "last_name"
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true
    },
    role: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: ADMIN_ROLES.ADMIN
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: ADMIN_STATUS.ACTIVE
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "created_by"
    },
    photoUrl: {
      type: DataTypes.STRING(2048),
      allowNull: true,
      field: "photo_url"
    },
    tokenVersion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "token_version"
    }
  },
  {
    tableName: "admin_users",
    underscored: true,
    timestamps: true
  }
);
