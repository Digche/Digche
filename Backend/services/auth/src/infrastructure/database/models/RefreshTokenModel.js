import { DataTypes } from "sequelize";
import { sequelize } from "../sequelize.js";

export const RefreshTokenModel = sequelize.define(
  "RefreshToken",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "owner_id"
    },
    ownerType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: "owner_type"
    },
    tokenHash: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: "token_hash"
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "expires_at"
    },
    revokedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "revoked_at"
    }
  },
  {
    tableName: "refresh_tokens",
    underscored: true,
    timestamps: true,
    updatedAt: false,
    indexes: [
      {
        fields: ["owner_id", "owner_type"]
      },
      {
        fields: ["token_hash"]
      }
    ]
  }
);