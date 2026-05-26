export class RefreshTokenRepository {
  async create(refreshToken) {
    throw new Error("RefreshTokenRepository.create is not implemented");
  }

  async findByTokenHash(tokenHash) {
    throw new Error("RefreshTokenRepository.findByTokenHash is not implemented");
  }

  async revoke(id) {
    throw new Error("RefreshTokenRepository.revoke is not implemented");
  }

  async revokeAllForOwner(ownerId, ownerType) {
    throw new Error("RefreshTokenRepository.revokeAllForOwner is not implemented");
  }
}