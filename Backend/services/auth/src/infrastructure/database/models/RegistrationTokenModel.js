import { DataTypes } from "sequelize";
import { sequelize } from "../sequelize.js";

export const RegistrationTokenModel = sequelize.define(
  "RegistrationToken",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    tokenId: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      field: "token_id"
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    role: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    flow: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "expires_at"
    },
    consumedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "consumed_at"
    }
  },
  {
    tableName: "registration_tokens",
    underscored: true,
    timestamps: true,
    updatedAt: false,
    indexes: [
      {
        fields: ["token_id"]
      },
      {
        fields: ["phone", "role"]
      },
      {
        fields: ["expires_at"]
      }
    ]
  }
);
