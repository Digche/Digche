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
    }
  },
  {
    tableName: "admin_users",
    underscored: true,
    timestamps: true
  }
);