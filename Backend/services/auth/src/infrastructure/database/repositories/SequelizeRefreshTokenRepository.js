import { RefreshToken } from "../../../domain/entities/RefreshToken.js";
import { RefreshTokenModel } from "../models/RefreshTokenModel.js";

export class SequelizeRefreshTokenRepository {
  async create(refreshToken) {
    const createdRefreshToken = await RefreshTokenModel.create({
      ownerId: refreshToken.ownerId,
      ownerType: refreshToken.ownerType,
      scope: refreshToken.scope,
      selectedRole: refreshToken.selectedRole,
      tokenHash: refreshToken.tokenHash,
      expiresAt: refreshToken.expiresAt,
      revokedAt: refreshToken.revokedAt
    });

    return this.toDomain(createdRefreshToken);
  }

  async findByTokenHash(tokenHash) {
    const refreshToken = await RefreshTokenModel.findOne({
      where: { tokenHash }
    });

    if (!refreshToken) {
      return null;
    }

    return this.toDomain(refreshToken);
  }

  async revoke(id) {
    const [affectedRows] = await RefreshTokenModel.update(
      {
        revokedAt: new Date()
      },
      {
        where: {
          id,
          revokedAt: null
        }
      }
    );

    return affectedRows > 0;
  }

  async revokeAllForOwner(ownerId, ownerType) {
    const [affectedRows] = await RefreshTokenModel.update(
      {
        revokedAt: new Date()
      },
      {
        where: {
          ownerId,
          ownerType,
          revokedAt: null
        }
      }
    );

    return affectedRows;
  }

  toDomain(refreshTokenModel) {
    return new RefreshToken({
      id: refreshTokenModel.id,
      ownerId: refreshTokenModel.ownerId,
      ownerType: refreshTokenModel.ownerType,
      scope: refreshTokenModel.scope,
      selectedRole: refreshTokenModel.selectedRole,
      tokenHash: refreshTokenModel.tokenHash,
      expiresAt: refreshTokenModel.expiresAt,
      revokedAt: refreshTokenModel.revokedAt,
      createdAt: refreshTokenModel.createdAt
    });
  }
}