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
    profileImageUrl: {
      type: DataTypes.STRING(2048),
      allowNull: true,
      field: "profile_image_url"
    },
    address: {
      type: DataTypes.STRING(500),
      allowNull: true
    }
  },
  {
    tableName: "users",
    underscored: true,
    timestamps: true
  }
);
