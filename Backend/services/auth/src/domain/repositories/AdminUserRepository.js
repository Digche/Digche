export class AdminUserRepository {
  async findByPhone(phone) {
    throw new Error("AdminUserRepository.findByPhone is not implemented");
  }

  async findById(id) {
    throw new Error("AdminUserRepository.findById is not implemented");
  }

  async findByUsername(username) {
    throw new Error("AdminUserRepository.findByUsername is not implemented");
  }

  async updateProfileField(id, field, value) {
    throw new Error("AdminUserRepository.updateProfileField is not implemented");
  }

  async create(adminUser) {
    throw new Error("AdminUserRepository.create is not implemented");
  }

  async list() {
    throw new Error("AdminUserRepository.list is not implemented");
  }

  async updatePhone(id, newPhone) {
    throw new Error("AdminUserRepository.updatePhone is not implemented");
  }

  async disable(id) {
    throw new Error("AdminUserRepository.disable is not implemented");
  }

  async enable(id) {
    throw new Error("AdminUserRepository.enable is not implemented");
  }

  async incrementTokenVersion(id) {
    throw new Error("AdminUserRepository.incrementTokenVersion is not implemented");
  }
}
