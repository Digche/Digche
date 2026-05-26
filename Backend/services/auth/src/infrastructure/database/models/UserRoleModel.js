import { DataTypes } from "sequelize";
import { sequelize } from "../sequelize.js";

export const UserRoleModel = sequelize.define(
  "UserRole",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "user_id"
    },
    role: {
      type: DataTypes.STRING(50),
      allowNull: false
    }
  },
  {
    tableName: "user_roles",
    underscored: true,
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["user_id", "role"]
      }
    ]
  }
);