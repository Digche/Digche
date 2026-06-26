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
    photoUrl: {
      type: DataTypes.STRING(2048),
      allowNull: true,
      field: "photo_url"
    },
    address: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    tokenVersion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "token_version"
    }
  },
  {
    tableName: "users",
    underscored: true,
    timestamps: true
  }
);
