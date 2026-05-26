export class OtpRepository {
  async create(otpCode) {
    throw new Error("OtpRepository.create is not implemented");
  }

  async findLatestValidByPhoneAndPurpose(phone, purpose) {
    throw new Error("OtpRepository.findLatestValidByPhoneAndPurpose is not implemented");
  }

  async countCreatedInLastHour(phone, purpose) {
    throw new Error("OtpRepository.countCreatedInLastHour is not implemented");
  }

  async consume(id) {
    throw new Error("OtpRepository.consume is not implemented");
  }
}