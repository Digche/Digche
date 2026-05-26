import { DataTypes } from "sequelize";
import { sequelize } from "../sequelize.js";

export const OtpCodeModel = sequelize.define(
  "OtpCode",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    purpose: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    codeHash: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "code_hash"
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
    tableName: "otp_codes",
    underscored: true,
    timestamps: true,
    updatedAt: false,
    indexes: [
      {
        fields: ["phone", "purpose"]
      },
      {
        fields: ["expires_at"]
      }
    ]
  }
);