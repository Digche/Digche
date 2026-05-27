import { User } from "../../../src/domain/entities/User.js";

export class FakeUserRepository {
  constructor({ users = [] } = {}) {
    this.users = users.map((user) => this.toUser(user));
    this.createdUsers = [];
    this.addedRoles = [];
    this.updatedPhones = [];
  }

  toUser(user) {
    if (user instanceof User) {
      return user;
    }

    return new User(user);
  }

  async findByPhone(phone) {
    return this.users.find((user) => user.phone === phone) || null;
  }

  async findById(id) {
    return this.users.find((user) => user.id === id) || null;
  }

  async create(user) {
    const createdUser = new User({
      id: user.id || `user-${this.users.length + 1}`,
      phone: user.phone,
      roles: user.roles || [],
      createdAt: user.createdAt || new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: user.updatedAt || new Date("2026-01-01T00:00:00.000Z")
    });

    this.users.push(createdUser);
    this.createdUsers.push(createdUser);

    return createdUser;
  }

  async addRole(userId, role) {
    // Real repository persists the role but does not mutate the already loaded domain entity.
    // The use-case updates its in-memory user.roles after this call.
    this.addedRoles.push({ userId, role });
  }

  async updatePhone(userId, newPhone) {
    const user = await this.findById(userId);

    if (!user) {
      return null;
    }

    user.phone = newPhone;
    user.updatedAt = new Date("2026-01-02T00:00:00.000Z");
    this.updatedPhones.push({ userId, newPhone });

    return user;
  }
}
