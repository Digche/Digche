import { DataTypes } from "sequelize";
import { sequelize } from "../sequelize.js";

export const UserModel = sequelize.define(
  "User",
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
    }
  },
  {
    tableName: "users",
    underscored: true,
    timestamps: true
  }
);