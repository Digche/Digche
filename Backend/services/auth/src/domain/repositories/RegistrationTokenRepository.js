export class RegistrationTokenRepository {
  async create(registrationToken) {
    throw new Error("RegistrationTokenRepository.create is not implemented");
  }

  async findByTokenId(tokenId) {
    throw new Error("RegistrationTokenRepository.findByTokenId is not implemented");
  }

  async consume(tokenId) {
    throw new Error("RegistrationTokenRepository.consume is not implemented");
  }
}
