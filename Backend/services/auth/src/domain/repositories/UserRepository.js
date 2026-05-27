export class UserRepository {
  async findByPhone(phone) {
    throw new Error("UserRepository.findByPhone is not implemented");
  }

  async findById(id) {
    throw new Error("UserRepository.findById is not implemented");
  }

  async create(user) {
    throw new Error("UserRepository.create is not implemented");
  }

  async addRole(userId, role) {
    throw new Error("UserRepository.addRole is not implemented");
  }

  async updatePhone(userId, newPhone) {
    throw new Error("UserRepository.updatePhone is not implemented");
  }
}