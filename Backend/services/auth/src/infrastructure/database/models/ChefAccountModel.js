import { DataTypes } from "sequelize";
import { sequelize } from "../sequelize.js";
import { CHEF_STATUS } from "../../../domain/constants/statuses.js";

export const ChefAccountModel = sequelize.define(
  "ChefAccount",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: "users",
        key: "id"
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      field: "user_id"
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: CHEF_STATUS.PENDING
    }
  },
  {
    tableName: "chef_accounts",
    underscored: true,
    timestamps: true
  }
);