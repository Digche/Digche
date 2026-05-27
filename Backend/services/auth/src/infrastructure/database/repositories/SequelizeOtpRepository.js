import { Op } from "sequelize";

import { OtpCode } from "../../../domain/entities/OtpCode.js";
import { OtpCodeModel } from "../models/OtpCodeModel.js";

export class SequelizeOtpRepository {
  async create(otpCode) {
    const createdOtpCode = await OtpCodeModel.create({
      phone: otpCode.phone,
      purpose: otpCode.purpose,
      codeHash: otpCode.codeHash,
      expiresAt: otpCode.expiresAt,
      consumedAt: otpCode.consumedAt
    });

    return this.toDomain(createdOtpCode);
  }

  async findLatestValidByPhoneAndPurpose(phone, purpose) {
    const otpCode = await OtpCodeModel.findOne({
      where: {
        phone,
        purpose,
        consumedAt: null,
        expiresAt: {
          [Op.gt]: new Date()
        }
      },
      order: [["createdAt", "DESC"]]
    });

    if (!otpCode) {
      return null;
    }

    return this.toDomain(otpCode);
  }

  async countCreatedInLastHour(phone, purpose) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    return OtpCodeModel.count({
      where: {
        phone,
        purpose,
        createdAt: {
          [Op.gte]: oneHourAgo
        }
      }
    });
  }

  async consume(id) {
    const [affectedRows] = await OtpCodeModel.update(
      {
        consumedAt: new Date()
      },
      {
        where: {
          id,
          consumedAt: null
        }
      }
    );

    return affectedRows > 0;
  }

  toDomain(otpCodeModel) {
    return new OtpCode({
      id: otpCodeModel.id,
      phone: otpCodeModel.phone,
      purpose: otpCodeModel.purpose,
      codeHash: otpCodeModel.codeHash,
      expiresAt: otpCodeModel.expiresAt,
      consumedAt: otpCodeModel.consumedAt,
      createdAt: otpCodeModel.createdAt
    });
  }
}