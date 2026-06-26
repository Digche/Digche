import { RegistrationToken } from "../../../domain/entities/RegistrationToken.js";
import { RegistrationTokenModel } from "../models/RegistrationTokenModel.js";

export class SequelizeRegistrationTokenRepository {
  async create(registrationToken) {
    const createdRegistrationToken = await RegistrationTokenModel.create({
      tokenId: registrationToken.tokenId,
      phone: registrationToken.phone,
      role: registrationToken.role,
      flow: registrationToken.flow,
      expiresAt: registrationToken.expiresAt,
      consumedAt: registrationToken.consumedAt
    });

    return this.toDomain(createdRegistrationToken);
  }

  async findByTokenId(tokenId) {
    const registrationToken = await RegistrationTokenModel.findOne({
      where: { tokenId }
    });

    if (!registrationToken) {
      return null;
    }

    return this.toDomain(registrationToken);
  }

  async consume(tokenId) {
    const [affectedRows] = await RegistrationTokenModel.update(
      {
        consumedAt: new Date()
      },
      {
        where: {
          tokenId,
          consumedAt: null
        }
      }
    );

    return affectedRows > 0;
  }

  toDomain(registrationTokenModel) {
    return new RegistrationToken({
      id: registrationTokenModel.id,
      tokenId: registrationTokenModel.tokenId,
      phone: registrationTokenModel.phone,
      role: registrationTokenModel.role,
      flow: registrationTokenModel.flow,
      expiresAt: registrationTokenModel.expiresAt,
      consumedAt: registrationTokenModel.consumedAt,
      createdAt: registrationTokenModel.createdAt
    });
  }
}
